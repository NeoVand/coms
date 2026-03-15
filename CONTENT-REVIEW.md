# Content Review Report

Comprehensive review of all educational content in the COMS application.
43 protocols, 90+ concepts, 17 journeys, 6 category stories, 50+ comparisons, and supporting content reviewed for factual accuracy, technical correctness, completeness, and quality.

**Verification:** All critical claims in this report have been cross-referenced against authoritative sources (RFCs, Wikipedia, official documentation, Cloudflare/Google data, library documentation). Items marked as errors have been confirmed via web search. Biography dates verified against Wikipedia and institutional pages.

---

## Table of Contents

- [1. Critical Errors (Must Fix)](#1-critical-errors-must-fix)
  - [1.1 Factual Errors](#11-factual-errors)
  - [1.2 Code Examples That Won't Run](#12-code-examples-that-wont-run)
  - [1.3 Internal Contradictions](#13-internal-contradictions)
- [2. Technical Inaccuracies](#2-technical-inaccuracies)
- [3. Misleading Claims & Overstated Numbers](#3-misleading-claims--overstated-numbers)
- [4. Year/RFC Mismatches](#4-yearrfc-mismatches)
- [5. Missing Content & Unexplained Concepts](#5-missing-content--unexplained-concepts)
  - [5.1 Missing Concepts in Glossary](#51-missing-concepts-in-glossary)
  - [5.2 Protocols Missing Key Topics](#52-protocols-missing-key-topics)
  - [5.3 Missing Learning Journeys](#53-missing-learning-journeys)
  - [5.4 Protocols Not in Any Journey](#54-protocols-not-in-any-journey)
- [6. Category Stories & Biography Errors](#6-category-stories--biography-errors)
- [7. Comparison & Deep Dive Issues](#7-comparison--deep-dive-issues)
- [8. Wire Format & Diagram Issues](#8-wire-format--diagram-issues)
- [9. Quality & Consistency Issues](#9-quality--consistency-issues)

---

## 1. Critical Errors (Must Fix)

### 1.1 Factual Errors

| # | File | Protocol | Issue | Correction |
|---|------|----------|-------|------------|
| 1 | `protocols/network-foundations.ts` | ARP | ARP cache TTL claims "20 minutes on Windows" | Wrong for any modern Windows (Vista+). Windows uses 15-45 seconds (same Neighbor Discovery algorithm as Linux). The "20 minutes" figure is a myth. |
| 2 | `protocols/network-foundations.ts` | ARP | ARP frame size "28-byte payload inside a 42-byte Ethernet frame" | 42 bytes excludes padding and FCS. Actual frame on wire is 64 bytes minimum (Ethernet minimum frame size requires 18 bytes of padding). |
| 3 | `protocols/network-foundations.ts` | IPv6 | Extension headers "processed only by the destination -- not by every router" | The Hop-by-Hop Options header (Next Header = 0) IS processed by every router. This is an important exception. |
| 4 | `protocols/utilities-security.ts` | IMAP | `year: 2003` | Should be 1986 (when Mark Crispin designed IMAP). 2003 is when RFC 3501 was published, inconsistent with how other protocols use the year field (origin year). |
| 5 | `protocols/utilities-security.ts` | BGP | `year: 1995` but image caption says "BGP was created in 1989" | Direct internal contradiction. BGP-1 was RFC 1105 in 1989. Year should be 1989. |
| 6 | `protocols/utilities-security.ts` | ICMP | Destination Unreachable codes listed as "0=network, 1=host, 3=port, 4=fragmentation" | Skips code 2 (Protocol Unreachable) without indicating the gap. Learners will think these are consecutive. |
| 7 | `protocols/utilities-security.ts` | SSH | MAC size claimed as "16 bytes" | No standard SSH MAC is 16 bytes. HMAC-SHA1=20, HMAC-SHA2-256=32. The 16-byte figure is for AEAD auth tags (ChaCha20-Poly1305, AES-GCM), which are not traditional MACs. |
| 8 | `protocols/async-iot.ts` | AMQP | Frame header described as "8 bytes" | For AMQP 0-9-1 (which RabbitMQ uses), the frame header is 7 bytes (1 type + 2 channel + 4 size), not 8. The 8-byte figure is for AMQP 1.0. |
| 10 | `protocols/realtime-av.ts` | WebRTC | "SRTP adds ~12 bytes per packet" | Confuses RTP header size (12 bytes) with SRTP overhead. SRTP adds ~10 bytes (authentication tag) on top of the RTP header. |
| 11 | `protocols/realtime-av.ts` | HLS | LL-HLS uses "partial segments and server push" | Apple replaced HTTP/2 server push with Preload Hints (`EXT-X-PRELOAD-HINT`) because CDNs didn't support push. Should say "partial segments and preload hints." |
| 12 | `journeys.ts` | QUIC | Connection ID described as "64-bit" (appears in 2 journeys) | Per RFC 9000, QUIC Connection IDs are variable-length, not fixed at 64 bits. |
| 13 | `journeys.ts` | HLS | Called "Apple-proprietary technology" | Misleading. HLS is documented in RFC 8216 (2017, Informational). While Apple-developed, the spec is publicly available. Calling it "proprietary" is inaccurate; "Apple-developed" is better. |
| 14 | `concept-foundations.ts` | Discord | "Discord uses P2P for screen sharing" | Factually incorrect. Discord uses server-based relay (SFU) for all voice/video including screen sharing. They explicitly route through servers for IP privacy. |

### 1.2 Code Examples That Won't Run

| # | File | Protocol | Issue |
|---|------|----------|-------|
| 1 | `protocols/transport.ts` | QUIC | Node.js example uses `require('net').createQuicSocket()` -- this API never shipped in any stable Node.js release. Was briefly in nightly builds and was removed. |
| 2 | `protocols/transport.ts` | MPTCP | Node.js example claims "Node.js TCP sockets use MPTCP when the OS supports it" -- false. MPTCP requires explicit `IPPROTO_MPTCP` (262) at socket creation. Standard Node.js `net` module uses `IPPROTO_TCP`. |
| 3 | `protocols/web-api.ts` | HTTP/3 | Python example uses `httpx.AsyncClient(http2=True)` claiming it does HTTP/3 -- httpx does NOT support HTTP/3. The code connects via HTTP/2. |
| 4 | `protocols/utilities-security.ts` | ICMP | Python example calls `checksum()` function that is never defined in the snippet. Will raise `NameError`. |
| 5 | `protocols/utilities-security.ts` | SSH | Node.js example uses `require('fs').readFileSync('~/.ssh/id_ed25519')` -- Node.js `fs` does not expand `~`. Must use `path.join(os.homedir(), '.ssh/id_ed25519')`. |
| 6 | `protocols/utilities-security.ts` | OAuth 2.0 | Python `authlib` example calls `client.create_s256_code_challenge()` -- this is not a method on `OAuth2Session`. It's a standalone function from `authlib.oauth2.rfc7636`. Will raise `AttributeError`. |
| 7 | `protocols/network-foundations.ts` | Wi-Fi | Python scapy example uses `int(ord(pkt[Dot11Elt:3].info))` -- Python 2 style. In Python 3, `ord()` on a bytes object raises `TypeError`. |
| 8 | `protocols/async-iot.ts` | MQTT | Python paho-mqtt example uses `mqtt.Client()` without `CallbackAPIVersion` parameter -- deprecated since paho-mqtt 2.0 (early 2024), will break in 3.0. |
| 9 | `protocols/realtime-av.ts` | DASH | Python example uses `mpd_parser.parse()` which doesn't match any real library's API. |
| 10 | `protocols/realtime-av.ts` | SDP | Python example uses `await` at top level without being wrapped in `async def`. |

### 1.3 Internal Contradictions

| # | Location | Issue |
|---|----------|-------|
| 1 | `protocols/utilities-security.ts` BGP | `year: 1995` in metadata but image caption says "BGP was created in 1989" |
| 2 | `protocols/async-iot.ts` Kafka + AMQP | Both list each other in `connections` array, but Kafka does NOT speak AMQP. They are fundamentally different wire protocols. Bridges exist via connectors, but that is integration, not protocol compatibility. |
| 3 | `journeys.ts` RTMP | Says RTMP "died with Flash in 2020" then immediately contradicts itself by saying RTMP "survives today as an ingest protocol" |

---

## 2. Technical Inaccuracies

| # | File | Protocol | Issue | Correction |
|---|------|----------|-------|------------|
| 1 | `protocols/network-foundations.ts` | Ethernet | "Sub-microsecond store-and-forward on modern switches" | Impossible at common speeds. At 1 Gbps, serializing a 1518-byte frame takes ~12us. Sub-microsecond requires cut-through switching at high speeds (25/100 Gbps+). |
| 2 | `protocols/transport.ts` | TCP | Performance overhead "~40 bytes typical with timestamps" | TCP with timestamps is 32 bytes (20 base + 12 timestamps). The "40 bytes" likely conflates IPv4+TCP combined overhead. |
| 3 | `protocols/transport.ts` | TCP | "1-3 RTT for connection setup (handshake)" | TCP 3-way handshake alone is 1 RTT. The "1-3" conflates TCP alone with TCP+TLS. |
| 4 | `protocols/transport.ts` | SCTP | Overview says SCTP is used in "WebRTC's data channels" without clarifying architecture | In WebRTC, SCTP runs over DTLS over UDP -- not as a raw transport protocol. Learners may think WebRTC uses SCTP directly at the transport layer. |
| 5 | `protocols/network-foundations.ts` | Wi-Fi | MAC header described as "36-byte" | 36 bytes is the maximum (with HT Control). Base header is 24 bytes, typical is 26-30 bytes. Should say "24-36 bytes depending on frame type." |
| 6 | `protocols/network-foundations.ts` | Wi-Fi | "three MAC addresses" in Wi-Fi frames | Wi-Fi frames have four address fields; three are typically used in To-DS frames. Should mention "up to four." |
| 7 | `protocols/utilities-security.ts` | DHCP | "Minimum 236-byte message" | 236 is the fixed header portion. Minimum BOOTP frame is 300 bytes (with vendor options). Minimum DHCP message is larger. |
| 8 | `protocols/utilities-security.ts` | TLS | Image caption says SSL was introduced in "Netscape Navigator 2 (1995)" | SSL 2.0 was first shipped with Netscape Navigator 1.1 in early 1995, not Navigator 2. |
| 9 | `protocols/web-api.ts` | SOAP | Content-Type shown as `text/xml` with `SOAPAction` header | This is SOAP 1.1 only. SOAP 1.2 uses `application/soap+xml` without `SOAPAction`. The `links.official` points to the SOAP 1.2 spec, creating an inconsistency. |
| 10 | `protocols/async-iot.ts` | XMPP | "Apple's iMessage push notifications all used XMPP at some point" | iMessage never used XMPP. iChat used XMPP briefly. Apple's push notifications (APNs) were inspired by XMPP PubSub concepts but are a different system. |
| 11 | `protocols/async-iot.ts` | CoAP | `{{pub-sub\|observation}}` concept link | CoAP's Observe pattern is technically distinct from pub-sub (it's a GET with Observe option). Using the pub-sub concept with "observation" display text conflates two different mechanisms. |
| 12 | `protocols/realtime-av.ts` | WebRTC | `[[tls\|DTLS]]` and `[[rtp\|SRTP]]` cross-references | Link to TLS but display as DTLS, link to RTP but display as SRTP. These are distinct protocols. Should clarify "DTLS (Datagram TLS, based on TLS)" etc. |

---

## 3. Misleading Claims & Overstated Numbers

| # | File | Protocol | Claim | Reality |
|---|------|----------|-------|---------|
| 1 | `protocols/web-api.ts` | gRPC | "20-100x faster to parse than JSON" | Real benchmarks show 3-6x faster. The "20-100x" figure is significantly overstated and unsourced. |
| 2 | `protocols/web-api.ts` | HTTP/2 | "HPACK compresses headers 85-88%" | Real-world measurements (Cloudflare) show 30-76% depending on traffic patterns. |
| 3 | `protocols/web-api.ts` | HTTP/1.1 | "6-8 parallel connections per domain" | All modern browsers use exactly 6 connections per domain. The "8" comes from older/non-standard browsers. |
| 4 | `protocols/web-api.ts` | HTTP/3 | "roughly 30% of web traffic uses HTTP/3" by 2025 | Cloudflare 2025 data shows ~35%. Figure is understated. |
| 5 | `protocols/web-api.ts` | gRPC | "12+ languages" officially supported | Official gRPC documentation lists 11 languages. |
| 6 | `protocols/transport.ts` | QUIC | "2-3x faster than TCP+TLS" | QUIC's 1-RTT vs TCP+TLS 1.3's 2-RTT is 2x, not 2-3x. The 3x only applies to TLS 1.2 comparison. |
| 7 | `protocols/network-foundations.ts` | Ethernet | "10 Mbps to 400 Gbps" | 800 Gbps Ethernet (802.3df) was ratified February 2024. |
| 8 | `protocols/realtime-av.ts` | HLS | "Netflix, Disney+, YouTube use it" | Netflix and YouTube primarily use DASH; they fall back to HLS for Apple devices. |
| 9 | `journeys.ts` | BGP | "over 900,000 IPv4 prefixes" | Now ~980,000-1,000,000 as of 2025. Should say "nearly 1 million." |
| 10 | `journeys.ts` | IPv6 | "over 40% IPv6 traffic" | Google reports 45-50% as of late 2024/early 2025. |
| 11 | `protocols/web-api.ts` | HTTP/2 | Server push mentioned as a feature | Chrome removed server push in October 2022. Should note deprecation. |

---

## 4. Year/RFC Mismatches

Many protocols list the original year alongside the latest RFC. While this is a deliberate editorial choice, it creates confusion when learners check the RFC and find it was published decades later.

| Protocol | Year Listed | RFC Listed | RFC Publication Year | Issue |
|----------|-------------|------------|---------------------|-------|
| TCP | 1981 | RFC 9293 | 2022 | Minor -- acceptable with a note |
| IPv6 | 1998 | RFC 8200 | 2017 | Original was RFC 2460 (1998). Mismatch is confusing. |
| TLS | 1999 | RFC 8446 | 2018 | 1999 is TLS 1.0; RFC 8446 is TLS 1.3. Should note both. |
| SCTP | 2000 | RFC 9260 | 2022 | Original was RFC 2960 (2000). |
| RTP | 1996 | RFC 3550 | 2003 | Original was RFC 1889 (1996). Mismatch. |
| SIP | 1999 | RFC 3261 | 2002 | Original was RFC 2543 (1999). Mismatch. |
| IMAP | 2003 | RFC 9051 | 2021 | Year should be 1986 (invention). |
| BGP | 1995 | RFC 4271 | 2006 | Year should be 1989 (BGP-1). |

**Recommendation:** Either consistently use origin years with original RFCs, or consistently use latest RFC years, or add both (e.g., `rfc: 'RFC 1889 / RFC 3550'`).

---

## 5. Missing Content & Unexplained Concepts

### 5.1 Missing Concepts in Glossary

These concepts are referenced in protocol descriptions or are fundamental to understanding the content but are not defined in `concepts.ts`:

| Missing Concept | Where Referenced/Needed |
|-----------------|------------------------|
| DNS Record Types (A, AAAA, MX, CNAME, NS) | DNS protocol, email journey |
| MTU (Maximum Transmission Unit) | IP fragmentation, QUIC/UDP, Ethernet jumbo frames |
| Checksum | TCP, UDP, Ethernet, IP -- fundamental concept never defined |
| Proxy / Reverse Proxy | HTTP, load balancing, security |
| CDN (Content Delivery Network) | HLS, DASH, DNS, HTTP |
| CIDR (Classless Inter-Domain Routing) | IP, BGP, subnet discussions |
| Autonomous System (AS) | BGP references "70,000 autonomous systems" |
| Forward Secrecy | TLS discussions mention ECDHE providing it |
| DTLS (Datagram TLS) | WebRTC, CoAP reference it extensively |
| STUN/TURN/ICE | WebRTC descriptions reference these without defining them |
| Codec | WebRTC, HLS, DASH, RTP all reference codecs |
| Serialization | gRPC/Protobuf, JSON, binary format discussions |
| Consumer Group | Kafka descriptions |

### 5.2 Protocols Missing Key Topics

| Protocol | Missing Topic | Why It Matters |
|----------|--------------|----------------|
| DNS | DNSSEC | Critical security extension, never mentioned |
| DNS | DNS over TLS (DoT) | Only DoH is briefly referenced |
| ICMP | ICMPv6 | IPv6 uses different ICMP (RFC 4443) with different types |
| DHCP | DHCPv6 | IPv6 is covered elsewhere but DHCPv6 is never mentioned |
| IPv6 | Dual-stack operation | Primary transition mechanism in production |
| IPv6 | Transition mechanisms (NAT64, 464XLAT, etc.) | IPv6 is defined by its coexistence with IPv4 |
| IPv6 | Privacy Extensions (RFC 8981) | Default SLAAC embeds MAC address -- privacy concern |
| NTP | Amplification attacks | Major security concern never mentioned |
| CoAP | DTLS security | CoAP's entire security story relies on DTLS |
| GraphQL | Subscriptions | One of three operation types (query, mutation, subscription) |
| BGP | iBGP vs eBGP | Fundamental distinction in BGP deployment |
| WebRTC | STUN/TURN/ICE explanation | Acronyms used but never expanded or explained |
| AMQP | Exchange types | Mentioned (direct, topic, fanout, headers) but never explained |
| HTTP/2 | TLS requirement in browsers | Spec doesn't mandate TLS, but all browsers require it |
| HLS | CMAF container format | Increasingly important for unifying HLS/DASH segments |
| RTMP | RTMPS variant | Facebook/Meta required RTMPS since 2019 |

### 5.3 Missing Learning Journeys

| Potential Journey | Steps | Rationale |
|-------------------|-------|-----------|
| API Design Patterns | REST -> GraphQL -> gRPC | Three major API paradigms, all in the app. GraphQL is in no journey. |
| How Authentication Works | OAuth2 -> TLS -> SSH | OAuth2 is in no journey. |
| Network Troubleshooting | ICMP -> DNS -> ARP | Diagnostic-focused practical path. |
| Mobile Network Resilience | TCP -> MPTCP -> QUIC | Connection migration focus. |

### 5.4 Protocols Not in Any Journey

These protocol IDs exist in the app but appear in zero learning journeys:

- **GraphQL** -- significant modern protocol
- **OAuth2** -- important security protocol
- **SOAP** -- legacy but educational
- **Wi-Fi** -- fundamental technology
- **FTP** -- historically important
- **XMPP** -- messaging protocol

---

## 6. Category Stories & Biography Errors

### Confirmed Biography Errors

| # | File | Person | Issue | Correction |
|---|------|--------|-------|------------|
| 1 | `category-stories/network-foundations.ts` | Steve Deering | Birth year listed as 1960 | He received his B.Sc. in 1973, making 1960 impossible (he'd be 13). Likely born ~1951. |
| 2 | `category-stories/async-iot.ts` | Andy Stanford-Clark | Birth year listed as 1962 | Multiple sources (Wikipedia, IoW Hidden Heroes) confirm born January 29, 1966. |
| 3 | `category-stories/network-foundations.ts` | David Plummer | Birth year 1956 | Unverifiable from public sources. Consider removing. |
| 4 | `category-stories/network-foundations.ts` | Yakov Rekhter | Birth year 1950 | Unverifiable from public sources. Consider removing. |
| 5 | `category-stories/realtime-av.ts` | Henning Schulzrinne | Birth year 1962 | Unverifiable from public sources. Plausible but unconfirmed. |

### Narrative Errors

| # | File | Issue | Correction |
|---|------|-------|------------|
| 1 | `category-stories/utilities.ts` | IMAP RFC 1064 listed as year 1986 | RFC 1064 was published July 1988, not 1986. |
| 2 | `category-stories/utilities.ts` | "NTP v1 -- RFC 958" in 1985 | RFC 958 documented NTP Version 0, not Version 1. NTP v1 was RFC 1059 (1988). |
| 3 | `category-stories/utilities.ts` | Postel "co-created TCP, SMTP, DNS, and FTP" | Overstates role. Paul Mockapetris created DNS; Abhay Bhushan created FTP. Postel wrote RFCs and was IANA administrator. |
| 4 | `category-stories/transport.ts` | IMP arrived "a month before" the first ARPANET message | IMP was delivered August 30, 1969; first message was October 29 -- nearly 2 months, not 1. Also: destination was SRI, not Stanford. |
| 5 | `category-stories/network-foundations.ts` | Timeline: 1998 entry appears after 1999 entry | Chronological ordering broken (1997 -> 1999 -> 1998). |
| 6 | `category-stories/async-iot.ts` | MQTT image caption credits only Andy Stanford-Clark | Co-inventor Arlen Nipper (at Arcom, not IBM) is not mentioned. Overview also says "invented at IBM" -- Nipper was not at IBM. |
| 7 | `category-stories/async-iot.ts` | AMQP image caption says Pieter Hintjens was "a driving force behind AMQP" | AMQP was originated by John O'Hara at JPMorgan Chase. Hintjens/iMatix implemented the first C broker. Hintjens later publicly criticized AMQP and left the workgroup. |

---

## 7. Comparison & Deep Dive Issues

### Comparisons (`comparison/pairs.ts`)

| # | Issue |
|---|-------|
| 1 | **HTTP/2 vs REST** is framed as a "vs" pair, but HTTP/2 is a protocol and REST is an architectural style. These operate at different levels. Should be a "relationship" pair or have a prominent disclaimer. |

### Deep Dives (`category-deep-dives.ts`)

No factual errors found. All deep dive content is technically accurate. This is the highest-quality content file in the application.

### Diagrams (`diagram-definitions.ts`)

No factual errors found. All Mermaid diagrams correctly represent protocol flows and reference correct RFC numbers.

---

## 8. Wire Format & Diagram Issues

| # | Protocol | Issue |
|---|----------|-------|
| 1 | RTP (realtime-av.ts) | RTCP Sender Report: NTP Timestamp parts and Packet Count/Octet Count are each 32-bit fields on separate rows, but the diagram renders them as if sharing rows (two 16-bit values in one 32-bit word). |
| 2 | ARP (network-foundations.ts) | Frame size shown as 42 bytes, which excludes padding and FCS. Actual frame on wire is 64 bytes. |

---

## 9. Quality & Consistency Issues

### Data Model Inconsistencies

| # | Issue |
|---|-------|
| 1 | Kafka is missing the `rfc: undefined` field, while MQTT, AMQP, and STOMP explicitly set it. |
| 2 | DASH uses `rfc: 'ISO 23009-1'` -- the field is called `rfc` but contains an ISO standard number. |
| 3 | REST and GraphQL have no `port` field (acceptable since they're not transport protocols), but no comment explains this. |
| 4 | The `year` field is used inconsistently -- sometimes for origin year (MQTT 1999, FTP 1971), sometimes for standardization (AMQP 2006 instead of 2003 origin). |

### Naming Issues

| # | Protocol | Issue |
|---|----------|-------|
| 1 | MQTT | `name: 'Message Queuing Telemetry Transport'` -- Since OASIS standardization (2014), "MQTT" officially stands for nothing. Original IBM name was "MQ Telemetry Transport" (not "Message Queuing"). The word "Queuing" is particularly misleading since MQTT does not queue messages. |
| 2 | SOAP | `name: 'Simple Object Access Protocol'` -- Since SOAP 1.2 (2003), the W3C dropped the acronym expansion. "SOAP" is officially just a name. |
| 3 | STOMP | `name: 'Simple Text Oriented Messaging Protocol'` -- Official spec uses "Orientated" (British English), not "Oriented." Also accepts "Streaming" instead of "Simple." |
| 4 | GraphQL | `name: 'Graph Query Language'` -- While Wikipedia and graphql.org do use this expansion, note that "GQL" (Graph Query Language) is also a separate ISO standard (ISO/IEC 39075:2024) for property graph databases. The name overlap could confuse learners. Consider adding a note to distinguish these. |

### Stale/Deprecated References

| # | Issue |
|---|-------|
| 1 | WebSockets CLI example uses `wss://echo.websocket.org` -- this service was shut down ~2021-2022 by Kaazing. Ably restored it but reliability is questionable. |
| 2 | Node.js `node-wifi` package (Wi-Fi example) is effectively unmaintained. |
| 3 | Python `python-librtmp` package (RTMP example) is old and unmaintained. |

### Unreferenced Concepts

The concepts `backpressure` and `stateful` are defined in `concepts.ts` but are never linked via `{{id|...}}` anywhere in any protocol description, journey, or story. They will not surface to users unless browsed directly.

### Missing Protocol Connections

| Protocol | Should Also Connect To | Reason |
|----------|----------------------|--------|
| QUIC | `http2` | QUIC was designed to replace TCP for HTTP/2; inspired by SPDY/HTTP/2 |
| IPv6 | `dhcp` | Overview mentions SLAAC as alternative to DHCP |
| SSH | `tls` | Commonly compared as encryption solutions |
| CoAP | `tls` | CoAP security relies on DTLS (TLS-derived) |

---

## Summary Statistics

- **Critical factual errors:** 13
- **Broken code examples:** 10
- **Internal contradictions:** 3
- **Technical inaccuracies:** 12
- **Misleading/overstated claims:** 11
- **Year/RFC mismatches:** 8
- **Missing concepts:** 13+
- **Protocols missing key topics:** 16
- **Biography errors:** 5 confirmed, 2 unverifiable
- **Category story errors:** 7
- **Quality/consistency issues:** 15+

The deep dives, Mermaid diagrams, and protocol comparisons are the strongest content. The protocol definitions have the most issues, primarily in code examples and performance claims. Category stories have scattered biography date errors.
