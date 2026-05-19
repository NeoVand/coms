# Term densification audit

Generated: 2026-05-09T16:14:35.917Z

- Files scanned: **73**
- Distinct RFC numbers mentioned but **not in registry**: **0**
- Distinct pioneers mentioned without `[[pioneer:…]]` wrap: **17** (of 20 catalogued)
- Distinct concepts mentioned without `{{…}}` wrap: **108** (of 224 catalogued)

## 1. RFCs mentioned in prose but missing from the registry

Add these to `src/lib/data/rfcs.ts`. Sorted by how many files mention them.

| RFC | Files | Sample mention |
|---|---:|---|

## 2. Pioneers named without `[[pioneer:…]]`

Each row is the first unwrapped mention in a file. Apply once per section, not every occurrence.

| Pioneer | Files |
|---|---:|
| Vint Cerf | 6 |
| Van Jacobson | 4 |
| Jon Postel | 4 |
| Henning Schulzrinne | 3 |
| Tim Berners-Lee | 3 |
| Roy Fielding | 3 |
| Paul Mockapetris | 2 |
| Ian Hickson | 2 |
| David L. Mills | 1 |
| Bob Metcalfe | 1 |
| Yakov Rekhter | 1 |
| Steve Deering | 1 |
| Bob Kahn | 1 |
| Jim Roskind | 1 |
| Eric Rescorla | 1 |
| Taher Elgamal | 1 |
| Mike Belshe | 1 |

### Per-file pioneer hits

**`src/lib/data/book/parts/layer-2-3.ts`**
- L202:20 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _eriment.', attribution: 'Vint Cerf, Linux.conf.au 2011' },_

**`src/lib/data/book/parts/realtime-av.ts`**
- L147:15 — `[[pioneer:henning-schulzrinne|Henning Schulzrinne]]`  · _'SIP and SDP', synopsis: 'Henning Schulzrinne wrote three protocols that ca_

**`src/lib/data/book/parts/story-of-the-internet.ts`**
- L228:14 — `[[pioneer:tim-berners-lee|Tim Berners-Lee]]`  · _Web_Server.jpg', alt: 'Tim Berners-Lee\'s NeXTcube — the world\'s fi_
- L118:52 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _to 40 bps in 400 yards — and Van Jacobson\'s six-algorithm fix.', sl_

**`src/lib/data/book/parts/utilities-security.ts`**
- L212:20 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _ry 2024.', attribution: 'Vint Cerf, Internet History list obitua_
- L21:67 — `[[pioneer:paul-mockapetris|Paul Mockapetris]]`  · _uted phone book — designed by Paul Mockapetris in 1983.", slots: [ {_
- L211:13 — `[[pioneer:david-mills|David L. Mills]]`  · _nd: 'pull-quote', text: 'David L. Mills — "Father Time" of the Intern_

**`src/lib/data/category-stories/network-foundations.ts`**
- L74:13 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _jpg' }, { name: 'Vint Cerf', years: '1943–', t_
- L144:8 — `[[pioneer:jon-postel|Jon Postel]]`  · _92', description: 'Jon Postel defines the Internet Control_
- L64:13 — `[[pioneer:bob-metcalfe|Bob Metcalfe]]`  · _people: [ { name: 'Bob Metcalfe', years: '1946–', t_
- L100:13 — `[[pioneer:yakov-rekhter|Yakov Rekhter]]`  · _us.' }, { name: 'Yakov Rekhter', years: 'c. 1950–',_
- L108:13 — `[[pioneer:steve-deering|Steve Deering]]`  · _et.' }, { name: 'Steve Deering', years: '1951–', t_

**`src/lib/data/category-stories/realtime-av.ts`**
- L35:13 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _jpg' }, { name: 'Van Jacobson', years: '1950\u2013',_
- L25:13 — `[[pioneer:henning-schulzrinne|Henning Schulzrinne]]`  · _people: [ { name: 'Henning Schulzrinne', years: 'c. 1962\u2013'_

**`src/lib/data/category-stories/transport.ts`**
- L25:13 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _people: [ { name: 'Vint Cerf', years: '1943\u2013',_
- L35:13 — `[[pioneer:bob-kahn|Bob Kahn]]`  · _jpg' }, { name: 'Bob Kahn', years: '1938\u2013',_
- L45:13 — `[[pioneer:jon-postel|Jon Postel]]`  · _jpg' }, { name: 'Jon Postel', years: '1943\u20131998_
- L193:13 — `[[pioneer:jim-roskind|Jim Roskind]]`  · _people: [ { name: 'Jim Roskind', years: '1960s\u2013',_

**`src/lib/data/category-stories/utilities.ts`**
- L303:219 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _en he died in 1998 at age 55, Vint Cerf wrote RFC 2468 as a memorial._
- L25:13 — `[[pioneer:jon-postel|Jon Postel]]`  · _es." }, { name: 'Jon Postel', years: '1943–1998',_
- L71:8 — `[[pioneer:paul-mockapetris|Paul Mockapetris]]`  · _83', description: 'Paul Mockapetris invents the Domain Name Syste_
- L281:13 — `[[pioneer:eric-rescorla|Eric Rescorla]]`  · _et.' }, { name: 'Eric Rescorla', years: '', title:_
- L193:8 — `[[pioneer:taher-elgamal|Taher Elgamal]]`  · _pe', description: 'Taher Elgamal leads the creation of Secure_

**`src/lib/data/category-stories/web-api.ts`**
- L17:36 — `[[pioneer:tim-berners-lee|Tim Berners-Lee]]`  · _t: 'The NeXT computer used by Tim Berners-Lee at CERN, the world\'s first w_
- L37:13 — `[[pioneer:roy-fielding|Roy Fielding]]`  · _jpg' }, { name: 'Roy Fielding', years: '1965\u2013',_
- L129:13 — `[[pioneer:mike-belshe|Mike Belshe]]`  · _people: [ { name: 'Mike Belshe', years: '', title:_
- L245:13 — `[[pioneer:ian-hickson|Ian Hickson]]`  · _ns." }, { name: 'Ian Hickson', years: '1976\u2013',_

**`src/lib/data/concept-foundations.ts`**
- L72:14 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _people: [ { name: 'Vint Cerf', years: '1943 –',_
- L82:14 — `[[pioneer:jon-postel|Jon Postel]]`  · _' }, { name: 'Jon Postel', years: '1943 – 1998',_
- L479:11 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _-Van_Jacobson.jpg', alt: 'Van Jacobson — co-author of the 1988 paper_

**`src/lib/data/diagram-definitions.ts`**
- L464:49 — `[[pioneer:roy-fielding|Roy Fielding]]`  · _resentational State Transfer (Roy Fielding, 2000). Resources are URLs; *_

**`src/lib/data/journeys.ts`**
- L317:56 — `[[pioneer:tim-berners-lee|Tim Berners-Lee]]`  · _ades of HTTP evolution — from Tim Berners-Lee\'s hypertext to QUIC-powered_
- L792:7 — `[[pioneer:roy-fielding|Roy Fielding]]`  · _tion', description: 'Roy Fielding\'s 2000 dissertation defined_

**`src/lib/data/outages.ts`**
- L335:85 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _ight — and the six algorithms Van Jacobson published in 1988 to keep it_

**`src/lib/data/protocols/rtp.ts`**
- L167:9 — `[[pioneer:henning-schulzrinne|Henning Schulzrinne]]`  · _287838924022%29.jpg', alt: 'Henning Schulzrinne, co-creator of RTP, speaking_

**`src/lib/data/protocols/sse.ts`**
- L128:9 — `[[pioneer:ian-hickson|Ian Hickson]]`  · _ting_Day_Three.jpeg', alt: 'Ian Hickson at a CSS Working Group meetin_

## 3. Concepts in `concepts.ts` mentioned without `{{…}}`

Editorial rule: wrap on first appearance per section, not every time. `low` priority terms are common English words and should only be wrapped where the technical sense is the focus.

| Term | Files |
|---|---:|
| Protocol | 72 |
| Latency | 57 |
| Port | 50 |
| Packet | 31 |
| Handshake | 23 |
| Stream | 19 |
| Frame | 18 |
| Payload | 14 |
| Segment | 14 |
| Encryption | 13 |
| Bandwidth | 13 |
| Checksum | 12 |
| Congestion Control | 11 |
| Hop | 11 |
| Signaling | 11 |
| Multicast | 10 |
| Certificate | 8 |
| Broadcast | 8 |
| Topic | 8 |
| Default Gateway | 8 |
| Stateless | 7 |
| IP Address | 7 |
| Fragmentation | 7 |
| CUBIC | 7 |
| Datagram | 7 |
| Multiplexing | 7 |
| HPACK | 7 |
| Codec | 7 |
| Sequence Number | 7 |
| Head-of-Line Blocking | 6 |
| MAC Address | 6 |
| Request-Response | 6 |
| Encapsulation | 5 |
| Firewall | 5 |
| Full-Duplex | 5 |
| Keep-Alive | 5 |
| Retransmission | 5 |
| Subnet | 5 |
| Routing Table | 5 |
| Three-Way Handshake | 5 |
| Socket | 5 |
| Private Key | 4 |
| Bufferbloat | 4 |
| DNSSEC | 4 |
| Binary Framing | 4 |
| Server Push | 4 |
| Jitter | 4 |
| Flow Control | 4 |
| Message Broker | 4 |
| Serialization | 4 |
| Unicast | 4 |
| Access Token | 4 |
| Port Forwarding | 4 |
| Connection Migration | 4 |
| TLS Handshake | 3 |
| DNS Resolution | 3 |
| Adaptive Bitrate Streaming | 3 |
| Connectionless | 3 |
| Anycast | 3 |
| Cookie | 3 |
| _…48 more_ | |

### Per-file concept hits (high priority)

**`src/lib/data/book/chapters.ts`** — 2 term(s)
- L38 — `{{encapsulation|Encapsulation}}`  · _MACs, and ports.', packets: 'Encapsulation in pictures — frames inside p_
- L42 — `{{encryption|encryption}}`  · _each makes easy or hard.', 'encryption-basics': "What HTTPS actually_

**`src/lib/data/book/parts/async-iot.ts`** — 5 term(s)
- L56 — `{{latency|latency}}`  · _team — to drop perceived send latency from seconds to "hundreds of_
- L212 — `{{handshake|handshake}}`  · _700+ bytes for a DTLS 1.3 ECC handshake**. For battery-powered device_
- L166 — `{{stateless|stateless}}`  · _imary storage. Brokers become stateless cache servers; the log lives_
- L212 — `{{forward-secrecy|forward secrecy}}`  · _full mutual authentication + forward secrecy in **three messages totalling_
- L212 — `{{payload|payload}}`  · _E (RFC 8613)** wraps the CoAP payload in COSE_Encrypt0/AES-CCM and_

**`src/lib/data/book/parts/famous-outages.ts`** — 7 term(s)
- L158 — `{{ip-address|IP address}}`  · _echanism trusted **the source IP address** of an incoming connection a_
- L272 — `{{handshake|handshake}}`  · _cryptographic metadata** (TLS handshake fingerprints, certificate cha_
- L272 — `{{certificate|certificate}}`  · _(TLS handshake fingerprints, certificate chains, SNI hostnames) reveal_
- L158 — `{{private-key|private key}}`  · _rsonate someone without their private key.' }, { typ_
- L272 — `{{tls-handshake|TLS handshake}}`  · _, **cryptographic metadata** (TLS handshake fingerprints, certificate cha_
- L272 — `{{ech|ECH (Encrypted Client Hello)}}`  · _f cipher. This is part of why ECH (Encrypted Client Hello) is a current TLS frontier.'_
- L272 — `{{bgp-hijack|BGP hijack}}`  · _text: 'A natural reaction to BGP hijack incidents is "but the data is_

**`src/lib/data/book/parts/frontier.ts`** — 5 term(s)
- L83 — `{{latency|latency}}`  · _sis: 'Sub-millisecond queuing latency for cooperating flows — Comca_
- L87 — `{{congestion-control|congestion control}}`  · _e', text: 'For 35 years, congestion control on the internet has been loss_
- L170 — `{{nat64|NAT64}}`  · _(RFC 8781)** to advertise the NAT64 prefix, and **464XLAT (RFC 68_
- L95 — `{{bufferbloat|Bufferbloat}}`  · _', title: 'The Problem Bufferbloat Created', text: `The m_
- L170 — `{{four-six-four-xlat|464XLAT}}`  · _rtise the NAT64 prefix, and **464XLAT (RFC 6877)** CLAT for clients_

**`src/lib/data/book/parts/layer-2-3.ts`** — 4 term(s)
- L342 — `{{firewall|firewall}}`  · _title: 'Dropping ICMP at the firewall is partially refusing to impl_
- L155 — `{{checksum|checksum}}`  · _t', title: 'ARP has no checksum and no authentication',_
- L139 — `{{hop|hop}}`  · _acket finds the next physical hop — STD 37 has not been obsolet_
- L114 — `{{fragmentation|fragmentation}}`  · _), **FragAttacks** (May 2021, fragmentation/aggregation), **Framing Frame_

**`src/lib/data/book/parts/patterns-failures.ts`** — 6 term(s)
- L107 — `{{latency|Latency}}`  · _title: 'Bufferbloat — Latency Without Loss', text: `_
- L28 — `{{handshake|handshake}}`  · _ote', text: 'Knowing the handshake pattern means you understand_
- L159 — `{{congestion-control|Congestion Control}}`  · _ory', title: 'A History of Congestion Control', synopsis: 'Tahoe → Reno_
- L145 — `{{mtu-black-hole|MTU black hole}}`  · _s is bufferbloat" or "this is MTU black hole," the fix is mechanical.'_
- L160 — `{{cubic|CUBIC}}`  · _synopsis: 'Tahoe → Reno → CUBIC → BBR → L4S, in one sitting.'_
- L88 — `{{bufferbloat|Bufferbloat}}`  · _ure Modes', synopsis: 'Bufferbloat, ossification, head-of-line,_

**`src/lib/data/book/parts/realtime-av.ts`** — 3 term(s)
- L4 — `{{latency|latency}}`  · _Protocols that prioritise low latency over perfect delivery — * vo_
- L232 — `{{broadcast|broadcast}}`  · _etflix stream, every Apple TV broadcast — still starts every playlist_
- L151 — `{{hop|hop}}`  · _`sips:` URI scheme means TLS hop-by-hop only, NOT end-to-end l_

**`src/lib/data/book/parts/story-of-the-internet.ts`** — 1 term(s)
- L245 — `{{bufferbloat|bufferbloat}}`  · _] }, { id: 'mobile-and-bufferbloat', title: 'The Mobile and B_

**`src/lib/data/book/parts/transport.ts`** — 1 term(s)
- L23 — `{{congestion-control|congestion control}}`  · _byte streams, four decades of congestion control.', slots: [ { kin_

**`src/lib/data/book/parts/utilities-security.ts`** — 3 term(s)
- L25 — `{{checksum|checksum}}`  · _uote', text: 'DNS has no checksum at the application layer — it_
- L47 — `{{dnssec|DNSSEC}}`  · _e Kaminsky Moment, And Modern DNSSEC', text: `**Dan Kaminsk_
- L103 — `{{session-resumption|session resumption}}`  · _ion_id is non-empty** (faking session resumption). Both sides send a no-op **C_

**`src/lib/data/book/parts/web-api.ts`** — 7 term(s)
- L294 — `{{bandwidth|bandwidth}}`  · _bile clients with constrained bandwidth** (the protobuf runtime is he_
- L59 — `{{multiplexing|multiplexing}}`  · _e\'s SPDY experiment proposed multiplexing many requests over a single c_
- L41 — `{{stateless|Stateless}}`  · _title: 'Text on the Wire, Stateless Semantics, Persistent Connect_
- L85 — `{{hpack|HPACK}}`  · _is: 'Binary framing, streams, HPACK — and the security saga that_
- L59 — `{{binary-framing|binary framing}}`  · _ver a single connection, with binary framing. SPDY became the seed of HTTP_
- L113 — `{{server-push|Server Push}}`  · _pe: 'callout', title: 'Server Push is gone', text: 'HTTP/_
- L358 — `{{webtransport|WebTransport}}`  · _: 'narrative', title: 'WebTransport, and the Transport Future',_

**`src/lib/data/categories.ts`** — 1 term(s)
- L46 — `{{latency|latency}}`  · _eal-time. They prioritize low latency over perfect delivery — a dro_

**`src/lib/data/category-deep-dives.ts`** — 15 term(s)
- L152 — `{{latency|latency}}`  · _orithms like BBR that measure latency instead of waiting for loss.'_
- L354 — `{{jitter|Jitter}}`  · _'realtime-av', tagline: 'Jitter buffers, error correction, ad_
- L249 — `{{handshake|handshake}}`  · _ol invocation. The three-step handshake establishes capabilities befo_
- L101 — `{{flow-control|flow control}}`  · _ongestion control algorithms, flow control mechanics, and the subtle eng_
- L101 — `{{congestion-control|Congestion control}}`  · _: 'transport', tagline: 'Congestion control algorithms, flow control mech_
- L431 — `{{certificate|Certificate}}`  · _rrative', title: 'PKI and Certificate Chains', text: `The {{pki_
- L303 — `{{broker|Message Broker}}`  · _type: 'diagram', title: 'Message Broker Architecture Patterns', c_
- L427 — `{{dns-resolution|DNS resolution}}`  · _cryptographic primitives, and DNS resolution mechanics.', sections: [_
- L354 — `{{codec|codec}}`  · _correction, adaptive bitrate, codec negotiation, and the engineer_
- L213 — `{{hpack|HPACK}}`  · _ype: 'narrative', title: 'HPACK and QPACK Compression', t_
- L378 — `{{adaptive-bitrate|Adaptive Bitrate Streaming}}`  · _type: 'diagram', title: 'Adaptive Bitrate Streaming Flow', caption: `How adap_
- L118 — `{{cubic|CUBIC}}`  · _ndow Growth: Tahoe vs Reno vs CUBIC vs BBR', caption: `How di_
- L151 — `{{bufferbloat|Bufferbloat}}`  · _e: 'callout', title: 'The Bufferbloat Problem', text: 'Oversize_
- L288 — `{{exactly-once-delivery|exactly-once delivery}}`  · _antics, broker architectures, exactly-once delivery, and event sourcing patterns_
- L156 — `{{tcp-fast-open|TCP Fast Open}}`  · _ype: 'narrative', title: 'TCP Fast Open', text: `Standard [[tcp\|T_

**`src/lib/data/category-stories/async-iot.ts`** — 3 term(s)
- L97 — `{{broker|message broker}}`  · _the most popular open-source message broker.", protocolId: 'amqp'_
- L190 — `{{topic|topic}}`  · _age expiry, reason codes, and topic aliases. MQTT grows up.',_
- L248 — `{{serialization|serialization}}`  · _ed CBOR, the efficient binary serialization format used throughout the Io_

**`src/lib/data/category-stories/network-foundations.ts`** — 5 term(s)
- L227 — `{{encapsulation|Encapsulation}}`  · _e: 'The Journey of a Packet — Encapsulation in Action', definition: `g_
- L338 — `{{checksum|checksum}}`  · _are fixed at 40 bytes with no checksum (upper layers handle integrit_
- L113 — `{{multicast|multicast}}`  · _multicast}}. Also invented IP multicast itself, fundamentally changin_
- L151 — `{{broadcast|broadcast}}`  · _olution problem with a simple broadcast-and-reply mechanism.', p_
- L297 — `{{payload|payload}}`  · _nally source) and encrypt the payload — reflecting the complexity o_

**`src/lib/data/category-stories/realtime-av.ts`** — 3 term(s)
- L166 — `{{codec|codec}}`  · _ve bitrate principle but with codec flexibility and industry-wide_
- L113 — `{{multicast|multicast}}`  · _eator of SIP. Her research on multicast conferences laid groundwork f_
- L97 — `{{signaling|Signaling}}`  · _e: 'pioneers', title: 'The Signaling Architects', people: [_

**`src/lib/data/category-stories/transport.ts`** — 2 term(s)
- L198 — `{{head-of-line-blocking|head-of-line blocking}}`  · _d multiplexed streams without head-of-line blocking.", imagePath: 'htt_
- L216 — `{{signaling|signaling}}`  · _transport, enabling telephony signaling networks to transition from l_

**`src/lib/data/category-stories/utilities.ts`** — 1 term(s)
- L253 — `{{encryption|encryption}}`  · _e browser that introduced SSL encryption to the web', caption:_

**`src/lib/data/category-stories/web-api.ts`** — 3 term(s)
- L183 — `{{multiplexing|multiplexing}}`  · _ary-framing\|binary framing}}, multiplexing, {{server-push\|server push}},_
- L169 — `{{full-duplex|Full-duplex}}`  · _55', description: 'Full-duplex communication arrives in brow_
- L141 — `{{hpack|HPACK}}`  · _title: 'Co-creator of SPDY & HPACK', org: 'Google', co_

**`src/lib/data/comparison/pairs.ts`** — 58 term(s)
- L1272 — `{{ip-address|IP address}}`  · _ses [[udp\|UDP]] for automatic IP address assignment, since clients can_
- L1913 — `{{mac-address|MAC address}}`  · _cache for the destination\'s MAC address. On a cache miss, it broadcas_
- L43 — `{{bandwidth|bandwidth}}`  · _Throughput', left: 'Aggregate bandwidth of all paths', right: 'Limite_
- L14 — `{{latency|latency}}`  · _rives in order at the cost of latency; [[udp\|UDP]] prioritizes spee_
- L16 — `{{handshake|handshake}}`  · _: 'Connection-oriented (3-way handshake)', right: 'Connectionless (fi_
- L16 — `{{connection-oriented|Connection-oriented}}`  · _t: 'Connection model', left: 'Connection-oriented (3-way handshake)', right: 'C_
- L16 — `{{connectionless|Connectionless}}`  · _d (3-way handshake)', right: 'Connectionless (fire-and-forget)' }, { as_
- L1314 — `{{encapsulation|encapsulation}}`  · _aries, and multi-homing. This encapsulation is how [[webrtc\|WebRTC]] data_
- L20 — `{{flow-control|flow control}}`  · _erhead', left: 'Higher (ACKs, flow control, congestion)', right: 'Minima_
- L1468 — `{{congestion-control|congestion control}}`  · _provides multiplexed streams, congestion control, and connection migration ove_
- L67 — `{{multiplexing|Multiplexing}}`  · _boundaries)' }, { aspect: 'Multiplexing', left: 'Multiple independent_
- L67 — `{{head-of-line-blocking|head-of-line blocking}}`  · _eams', right: 'Single stream (head-of-line blocking)' }, { aspect: 'Redundancy_
- L1141 — `{{keep-alive|keep-alive}}`  · _d for subsequent requests via keep-alive. Each request-response pair i_
- L17 — `{{retransmission|retransmission}}`  · _ft: 'Guaranteed delivery with retransmission', right: 'Best-effort, no ret_
- L317 — `{{stateless|stateless}}`  · _: '[[rest\|REST]] follows a stateless request-response model ideal_
- L319 — `{{stateful|Stateful}}`  · _est is independent)', right: 'Stateful (persistent connection)' },_
- L89 — `{{encryption|encryption}}`  · _eliability, multiplexing, and encryption on top of [[udp\|UDP]] to repl_
- L669 — `{{certificate|Certificate}}`  · _t changing its protocol', 'Certificate-based trust via public CAs (L_
- L1469 — `{{cipher-suite|cipher suite}}`  · _andshake, key derivation, and cipher suite negotiation within [[quic\|QUI_
- L2000 — `{{http-method|HTTP method}}`  · _dy. Unlike [[rest\|REST]], the HTTP method is always POST and the URL is_
- L171 — `{{request-response|Request-response}}`  · _streaming natively', right: 'Request-response only (streaming via workaroun_
- L798 — `{{content-negotiation|content negotiation}}`  · _ant to leverage HTTP caching, content negotiation, and standard methods', 'P_
- L395 — `{{broker|message broker}}`  · _amqp\|AMQP]] is a feature-rich message broker protocol for enterprise messa_
- L398 — `{{topic|topic}}`  · _', right: 'Binary with simple topic-based pub/sub' }, { aspect_
- L591 — `{{firewall|firewall}}`  · _cial)', 'NAT traversal and firewall friendliness are critical'_
- _…33 more in this file_

**`src/lib/data/concept-foundations.ts`** — 23 term(s)
- L394 — `{{ip-address|IP address}}`  · _. Multiple services share one IP address; the port disambiguates.'_
- L266 — `{{mac-address|MAC address}}`  · _t-field structure of a 48-bit MAC address — 24-bit OUI + 24-bit NIC, wi_
- L625 — `{{bandwidth|bandwidth}}`  · _iscovery or trust**, with the bandwidth-heavy data plane being peer-t_
- L525 — `{{latency|latency}}`  · _m. Buffers stay nearly empty, latency stays near base RTT, and thro_
- L37 — `{{handshake|handshake}}`  · _png', alt: 'TCP three-way handshake sequence diagram — client SYN_
- L563 — `{{connectionless|connectionless}}`  · _rnet+IP for AI/HPC scale-out: connectionless, multipath with intelligent p_
- L297 — `{{encapsulation|Encapsulation}}`  · _packets', title: 'Packets & Encapsulation', sections: [ { type_
- L481 — `{{congestion-avoidance|Congestion Avoidance}}`  · _o-author with Mike Karels of "Congestion Avoidance and Control" (SIGCOMM \'88) —_
- L563 — `{{retransmission|retransmission}}`  · _y, packet-trimming, selective retransmission. The principle Jacobson artic_
- L401 — `{{sequence-number|sequence number}}`  · _a process. Below them: 32-bit sequence number, 32-bit ACK number, header le_
- L770 — `{{stateful|Stateful}}`  · _thod, parameters, a result. **Stateful sessions** like [[tcp\|TCP]]:_
- L645 — `{{encryption|encryption}}`  · _ers."` } ] }, { id: 'encryption-basics', title: 'Encryption_
- L693 — `{{certificate|certificate}}`  · _iate CA, which signs the leaf certificate.', caption: 'The X.5_
- L671 — `{{public-key|public key}}`  · _ncrypts with the recipient\'s public key; recipient decrypts with thei_
- L671 — `{{private-key|private key}}`  · _decrypts with their matching private key.', caption: '{{publi_
- L438 — `{{header|HTTP header}}`  · _the **PROXY protocol** or an HTTP header like \`X-Forwarded-For\`.'_
- L399 — `{{checksum|checksum}}`  · _e/ACK numbers, flags, window, checksum.', caption: 'The TCP_
- L266 — `{{multicast|multicast}}`  · _24-bit OUI + 24-bit NIC, with multicast and locally-administered flag_
- L37 — `{{three-way-handshake|three-way handshake}}`  · _shake.svg.png', alt: 'TCP three-way handshake sequence diagram — client SYN_
- L125 — `{{payload|payload}}`  · _each layer wraps the previous payload with its own header — {{encap_
- L506 — `{{cubic|CUBIC}}`  · _ype: 'narrative', title: 'CUBIC: A Curve That Scales', te_
- L423 — `{{time-wait|TIME_WAIT}}`  · _e: 'callout', title: 'Why TIME_WAIT lives for 60 seconds', te_
- L524 — `{{pacing|Pacing}}`  · _e: 'callout', title: 'Why Pacing Matters', text: 'Classic_

**`src/lib/data/diagram-definitions.ts`** — 45 term(s)
- L949 — `{{ip-address|IP address}}`  · _ce into a network, it gets an IP address, gateway, DNS, and subnet mas_
- L1146 — `{{mac-address|MAC address}}`  · _. A **switch** learns which **MAC address** lives on which port by watc_
- L203 — `{{bandwidth|bandwidth}}`  · _when nothing changed — saves bandwidth on repeat visits. **Compressi_
- L169 — `{{latency|latency}}`  · _OS heuristics (signal, cost, latency).', 6: '**`MP_JOIN`** open_
- L696 — `{{jitter|jitter}}`  · _out-of-order) and to **smooth jitter** (variable arrival times). C_
- L44 — `{{handshake|handshake}}`  · _Control Protocol. A three-way handshake opens the connection, **`seq`_
- L82 — `{{flow-control|flow control}}`  · _ACKs, no sequence numbers, no flow control, no congestion control. The h_
- L82 — `{{congestion-control|congestion control}}`  · _numbers, no flow control, no congestion control. The header is just src/dst p_
- L204 — `{{multiplexing|multiplexing}}`  · _ale. **HTTP/2** fixed this by multiplexing all requests as numbered stre_
- L109 — `{{head-of-line-blocking|head-of-line blocking}}`  · _*every* stream behind it — **head-of-line blocking** at the transport layer.',_
- L200 — `{{keep-alive|keep-alive}}`  · _ake** on every fetch. Without keep-alive, each resource would need a b_
- L55 — `{{retransmission|retransmission}}`  · _iable**. Missing ACKs trigger retransmission, and out-of-order bytes are r_
- L47 — `{{sequence-number|sequence number}}`  · _client picks a random initial sequence number (here `100`) and sends it. Th_
- L53 — `{{sliding-window|sliding window}}`  · _or individual ACKs — TCP\'s **sliding window** lets multiple segments be i_
- L197 — `{{idempotent|idempotent}}`  · _rver-side side effects) and **idempotent** (calling twice = calling on_
- L135 — `{{stateless|stateless}}`  · _with **INIT-ACK** carrying a stateless **cookie** — a signed token._
- L102 — `{{encryption|encryption}}`  · _rnet Connections. Transport + encryption fused into one handshake. Ind_
- L107 — `{{certificate|Certificate}}`  · _.', 3: 'Server sends its **Certificate** and a `Finished` message —_
- L902 — `{{private-key|private key}}`  · _e transcript with the cert\'s private key — proves the server actually_
- L104 — `{{tls-handshake|TLS handshake}}`  · _: 'Where TCP needs a separate TLS handshake on top, **QUIC merges them**_
- L282 — `{{status-code|HTTP status code}}`  · _ching Protocols`** = the only HTTP status code most people see for WebSocket_
- L728 — `{{request-response|request-response}}`  · _the 200 was received. SIP is request-response *except* for INVITE, which us_
- L495 — `{{topic|topic}}`  · _broker** routes messages by **topic** — publishers and subscriber_
- L1029 — `{{firewall|firewall}}`  · _edates NAT and causes endless firewall headaches today (RFC 959).',_
- L949 — `{{subnet|subnet}}`  · _IP address, gateway, DNS, and subnet mask without manual config. T_
- _…20 more in this file_

**`src/lib/data/frontier.ts`** — 6 term(s)
- L125 — `{{latency|latency}}`  · _: 'Sub-millisecond queuing latency on a residential ISP — L4S go_
- L218 — `{{connectionless|connectionless}}`  · _n spec for AI/HPC scale-out — connectionless, multipath, packet-trimming —_
- L104 — `{{congestion-control|congestion control}}`  · _ner: "Google's model-based congestion control replaced CUBIC for google.com_
- L41 — `{{topic|topic}}`  · _: string; oneLiner: string; topic: FrontierTopic; status: Fron_
- L104 — `{{cubic|CUBIC}}`  · _d congestion control replaced CUBIC for google.com and YouTube tr_
- L24 — `{{observability|observability}}`  · _\| 'web' \| 'datacenter' \| 'observability' \| 'ai-agents' \| 'standards_

**`src/lib/data/journeys.ts`** — 56 term(s)
- L71 — `{{ip-address|IP address}}`  · _our application only knows an IP address. Something has to bridge the_
- L71 — `{{mac-address|MAC address}}`  · _net frame needs a destination MAC address — but your application only k_
- L257 — `{{bandwidth|bandwidth}}`  · _s simultaneously to aggregate bandwidth?' }, { protocolId:_
- L40 — `{{latency|latency}}`  · _r. It costs one round trip of latency, but without it every applica_
- L471 — `{{jitter|jitter}}`  · _er reports on packet loss and jitter help the sender adapt its bit_
- L38 — `{{handshake|Handshake}}`  · _colId: 'tcp', title: 'TCP Handshake', description: 'The_
- L40 — `{{flow-control|flow control}}`  · _o negotiates window sizes for flow control, ensuring neither side overwh_
- L120 — `{{congestion-control|congestion control}}`  · _ything that goes missing. Its congestion control algorithms (Reno, CUBIC, BBR)_
- L134 — `{{multiplexing|multiplexing}}`  · _tly influenced QUIC\'s stream multiplexing design.' } ] }, { id_
- L120 — `{{head-of-line-blocking|head-of-line blocking}}`  · _e, acknowledgment delays, and head-of-line blocking (one lost packet stalls every_
- L325 — `{{keep-alive|keep-alive}}`  · _and get a web page back. The keep-alive header lets a single TCP conn_
- L113 — `{{retransmission|retransmission}}`  · _tter than waiting 200ms for a retransmission that arrives too late to disp_
- L471 — `{{sequence-number|sequence number}}`  · _ckets arrive out of order), a sequence number (for detecting lost packets),_
- L91 — `{{sliding-window|sliding window}}`  · _t-of-order arrivals, and uses sliding window flow control to prevent a fas_
- L224 — `{{stateless|Stateless}}`  · _e routers), introduces SLAAC (Stateless Address Auto-Configuration) s_
- L41 — `{{encryption|encryption}}`  · _in plaintext. The data needs encryption...' }, { protocolId_
- L47 — `{{certificate|certificate}}`  · _lished. The server presents a certificate proving it really is google.c_
- L47 — `{{cipher-suite|cipher suite}}`  · _nd both sides negotiate which cipher suite to use. They then perform a k_
- L645 — `{{public-key|public key}}`  · _y stays on your machine, your public key is placed on every server you_
- L156 — `{{private-key|private key}}`  · _p hosts without exposing your private key. It became the universal tool_
- L54 — `{{request-response|request-response}}`  · _ML document body. This single request-response cycle is the fundamental unit_
- L399 — `{{topic|topic}}`  · _r broadcasting to all queues, topic exchanges for pattern-based r_
- L217 — `{{nat|NAT (Network Address Translation)}}`  · _exhaustion became inevitable. NAT (Network Address Translation) bought time by hiding entire_
- L41 — `{{firewall|firewall}}`  · _fee shop router, a government firewall) can read every byte in plain_
- L31 — `{{dns-resolution|DNS Resolution}}`  · _rotocolId: 'dns', title: 'DNS Resolution', description: 'Befo_
- _…31 more in this file_

**`src/lib/data/outages.ts`** — 8 term(s)
- L380 — `{{congestion-control|Congestion Control}}`  · _5681', label: 'RFC 5681 — TCP Congestion Control' } ] }, { id: 'centuryl_
- L368 — `{{congestion-avoidance|Congestion Avoidance}}`  · _. Their 1988 SIGCOMM paper — *Congestion Avoidance and Control* — introduced six_
- L350 — `{{retransmission|retransmission}}`  · _description: "BSD TCP's retransmission timer fires aggressively when_
- L161 — `{{routing-table|routing table}}`  · _-aggregated the entire global routing table into /24s and re-originated t_
- L368 — `{{slow-start|slow start}}`  · _algorithms in one document: **slow start**, **AIMD congestion avoidanc_
- L333 — `{{hop|hop}}`  · _scale: 'NSFNET — three-IMP-hop path between Lawrence Berkele_
- L370 — `{{cubic|CUBIC}}`  · _orithm (Reno, NewReno, Vegas, CUBIC, Compound, BBR v1/v2/v3, Prag_
- L195 — `{{peering|peering}}`  · _thout prefix filters at every peering point, a single broken router_

**`src/lib/data/protocols/a2a.ts`** — 1 term(s)
- L164 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'HTTP round-trip latency_

**`src/lib/data/protocols/amqp.ts`** — 2 term(s)
- L158 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup is heav_
- L31 — `{{routing-key|routing key}}`  · _essages to an exchange with a routing key. The exchange copies the mess_

**`src/lib/data/protocols/arp.ts`** — 8 term(s)
- L31 — `{{ip-address|IP address}}`  · _evice that owns the requested IP address responds with a {{unicast\|uni_
- L21 — `{{mac-address|MAC address}}`  · _ry exists, it uses the cached MAC address immediately and skips the res_
- L169 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single broadcast + unica_
- L46 — `{{gateway|Default gateway}}`  · _resses on local networks', "Default gateway resolution — finding the rout_
- L29 — `{{unicast|Unicast}}`  · _segment.' }, { title: 'Unicast ARP reply', description:_
- L24 — `{{broadcast|Broadcast}}`  · _process.' }, { title: 'Broadcast ARP request', description:_
- L173 — `{{payload|payload}}`  · _, overhead: '28-byte ARP payload inside a 42-byte Ethernet hea_
- L46 — `{{default-gateway|Default gateway}}`  · _resses on local networks', "Default gateway resolution — finding the rout_

**`src/lib/data/protocols/bgp.ts`** — 4 term(s)
- L148 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Session setup: seconds (_
- L195 — `{{routing-table|routing table}}`  · _runs BGP with the full global routing table on every border router. Memor_
- L54 — `{{anycast|anycast}}`  · _ontent delivery network (CDN) anycast routing' ], codeExample: {_
- L52 — `{{peering|peering}}`  · _)', 'Cloud provider network peering (AWS, Google, Azure edge netw_

**`src/lib/data/protocols/coap.ts`** — 4 term(s)
- L159 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'No connection setup (UDP) —_
- L23 — `{{handshake|handshake}}`  · _"CoAP runs over UDP — no TCP handshake needed. Messages are tiny bin_
- L28 — `{{content-negotiation|Content negotiation}}`  · _TTP. URIs identify resources. Content negotiation works via options (like HTTP_
- L38 — `{{multicast|multicast}}`  · _all their resources. Supports multicast discovery — find all temperat_

**`src/lib/data/protocols/dash.ts`** — 3 term(s)
- L32 — `{{bandwidth|bandwidth}}`  · _lity level based on estimated bandwidth.' }, { title: 'Adaptiv_
- L178 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Standard: 10-30 seconds._
- L192 — `{{adaptive-bitrate|adaptive bitrate streaming}}`  · _ASH (2012), the open-standard adaptive bitrate streaming protocol that dynamically adj_

**`src/lib/data/protocols/dhcp.ts`** — 5 term(s)
- L23 — `{{ip-address|IP address}}`  · _he entire network: "I need an IP address." It has no IP yet, so it use_
- L181 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Full DORA cycle: ~100-500ms_
- L195 — `{{handshake|handshake}}`  · _ms the lease). This four-step handshake happens every time a device j_
- L28 — `{{subnet|subnet}}`  · _d with an offered IP address, subnet mask, gateway, DNS servers, a_
- L21 — `{{broadcast|broadcast}}`  · _s: [ { title: 'DISCOVER (broadcast)', description: 'New d_

**`src/lib/data/protocols/dns.ts`** — 6 term(s)
- L167 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Cached: <1ms. Uncached:_
- L179 — `{{dns-resolution|DNS resolution}}`  · _t: 'Diagram showing iterative DNS resolution: client queries recursive res_
- L218 — `{{anycast|anycast}}`  · _The original public resolver, anycast across Google\'s edge network_
- L194 — `{{dnssec|DNSSEC}}`  · _{ date: '2024', title: 'DNSSEC validation reaches 38%', d_
- L45 — `{{load-balancing|Load balancing}}`  · _ds for SPF, DKIM, DMARC)', 'Load balancing (multiple A records, GeoDNS)'_
- L46 — `{{service-discovery|Service discovery}}`  · _tiple A records, GeoDNS)', 'Service discovery in microservices' ], codeEx_

**`src/lib/data/protocols/ethernet.ts`** — 4 term(s)
- L32 — `{{mac-address|MAC address}}`  · _ion: 'Switches maintain a MAC address table mapping each MAC to a p_
- L145 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-microsecond latency_
- L160 — `{{checksum|checksum}}`  · _er what's inside, and the FCS checksum catches transmission errors."_
- L22 — `{{payload|payload}}`  · _te EtherType (identifying the payload protocol), the payload itself_

**`src/lib/data/protocols/ftp.ts`** — 2 term(s)
- L148 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup + transfer_
- L161 — `{{firewall|firewall}}`  · _. Passive mode solved the NAT/firewall problems that plagued FTP's o_

**`src/lib/data/protocols/graphql.ts`** — 3 term(s)
- L40 — `{{bandwidth|bandwidth}}`  · _Mobile applications (minimize bandwidth)', 'Complex dashboard UIs w_
- L133 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single HTTP round trip for_
- L134 — `{{payload|payload}}`  · _ut: 'No over-fetching reduces payload size; but complex queries can_

**`src/lib/data/protocols/grpc.ts`** — 3 term(s)
- L119 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'HTTP/2 connection reuse + b_
- L31 — `{{serialization|serialization}}`  · _local functions. gRPC handles serialization, HTTP/2 framing, and transpor_
- L44 — `{{service-mesh|service mesh}}`  · _uage support)', 'Kubernetes service mesh communication' ], codeExamp_

**`src/lib/data/protocols/hls.ts`** — 2 term(s)
- L26 — `{{bandwidth|bandwidth}}`  · _s the right level for current bandwidth.' }, { title: 'Segment_
- L153 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Standard: 10-30 seconds._

**`src/lib/data/protocols/http1.ts`** — 2 term(s)
- L108 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT per {{request-resp_
- L132 — `{{keep-alive|keep-alive}}`  · _tent connections, showing how keep-alive reduces round trips', capti_

**`src/lib/data/protocols/http2.ts`** — 4 term(s)
- L113 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same connection setup as_
- L126 — `{{multiplexing|multiplexing}}`  · _uests, pipelining, and HTTP/2 multiplexing over a single connection',_
- L117 — `{{hpack|HPACK}}`  · _rhead waste', overhead: 'HPACK compresses headers by 30-76%_
- L26 — `{{binary-framing|Binary framing}}`  · _es, etc.' }, { title: 'Binary framing', description: 'All co_

**`src/lib/data/protocols/http3.ts`** — 6 term(s)
- L42 — `{{latency|latency}}`  · _-first applications', 'High-latency networks (satellite, remote a_
- L19 — `{{handshake|handshake}}`  · _tWorks: [ { title: 'QUIC handshake (1 RTT)', description:_
- L11 — `{{head-of-line-blocking|head-of-line blocking}}`  · _QUIC — faster connections, no head-of-line blocking, built-in encryption.', over_
- L11 — `{{encryption|encryption}}`  · _ad-of-line blocking, built-in encryption.', overview: `HTTP/3 is the_
- L34 — `{{connection-migration|Connection migration}}`  · _others.' }, { title: 'Connection migration', description: "If the_
- L154 — `{{webtransport|WebTransport}}`  · _{ date: '2024', title: 'WebTransport API ships in Chrome', desc_

**`src/lib/data/protocols/icmp.ts`** — 8 term(s)
- L50 — `{{latency|latency}}`  · _ping)', 'Path discovery and latency measurement (traceroute/trace_
- L25 — `{{sequence-number|Sequence number}}`  · _h an Identifier (session ID), Sequence number, and optional data payload. N_
- L52 — `{{path-mtu-discovery|Path MTU Discovery}}`  · _shooting and diagnostics', 'Path MTU Discovery (Packet Too Big messages)',_
- L181 — `{{checksum|Checksum}}`  · _byte ICMP header (Type, Code, Checksum, Id, Seq) encapsulated in IP._
- L53 — `{{signaling|signaling}}`  · _Too Big messages)', 'Router signaling and redirect optimization' ]_
- L25 — `{{payload|payload}}`  · _nce number, and optional data payload. No TCP or UDP — just IP + IC_
- L40 — `{{hop|hop}}`  · _(1, 2, 3...) to discover each hop." }, { title: 'Redirec_
- L35 — `{{fragmentation|Fragmentation}}`  · _chable, 3=Port Unreachable, 4=Fragmentation Needed.' }, { title: '_

**`src/lib/data/protocols/imap.ts`** — 1 term(s)
- L148 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'LOGIN + SELECT: ~200ms._

**`src/lib/data/protocols/ip.ts`** — 10 term(s)
- L173 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Per-hop forwarding: 1-10_
- L48 — `{{encapsulation|encapsulation}}`  · _', 'VPN tunneling (IP-in-IP encapsulation)', 'Multicast delivery for_
- L50 — `{{qos|Quality of Service (QoS)}}`  · _ng and service discovery', 'Quality of Service (QoS) via DSCP/ToS header fields'_
- L27 — `{{subnet|subnet}}`  · _{{subnet\|subnet}} (using its subnet mask). If yes, it uses [[arp\|_
- L32 — `{{checksum|checksum}}`  · _by 1, recalculates the header checksum, and forwards the packet out_
- L49 — `{{multicast|Multicast}}`  · _(IP-in-IP encapsulation)', 'Multicast delivery for streaming and se_
- L174 — `{{hop|hop}}`  · _ormance: { latency: 'Per-hop forwarding: 1-10 \u00b5s in h_
- L35 — `{{fragmentation|Fragmentation}}`  · _works).' }, { title: 'Fragmentation if needed', description:_
- L99 — `{{loopback|loopback}}`  · _\`\${addr.internal ? '(loopback)' : '(external)'}\` );_
- L49 — `{{service-discovery|service discovery}}`  · _st delivery for streaming and service discovery', 'Quality of Service (QoS)_

**`src/lib/data/protocols/ipv6.ts`** — 6 term(s)
- L168 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as IPv4 for most pa_
- L44 — `{{stateless|Stateless}}`  · _ticast).' }, { title: 'Stateless autoconfiguration (SLAAC)',_
- L169 — `{{checksum|checksum}}`  · _— no NAT traversal, no header checksum computation at each hop, and_
- L41 — `{{multicast|multicast}}`  · _addresses via solicited-node multicast).' }, { title: 'Statel_
- L36 — `{{hop|Hop}}`  · _ter. The one exception is the Hop-by-Hop Options header (Next H_
- L171 — `{{fragmentation|fragmentation}}`  · _ksum recalculation, no router fragmentation, and fixed header size enable_

**`src/lib/data/protocols/json-rpc.ts`** — 1 term(s)
- L158 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as the underlying t_

**`src/lib/data/protocols/kafka.ts`** — 2 term(s)
- L186 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'End-to-end: 2-10ms typical._
- L27 — `{{topic|topic}}`  · _'Producer batches records by topic-partition, compresses the bat_

**`src/lib/data/protocols/mcp.ts`** — 2 term(s)
- L150 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'stdio transport has near_
- L25 — `{{handshake|handshake}}`  · _}, { title: 'Initialize handshake', description: 'The cl_

**`src/lib/data/protocols/mptcp.ts`** — 4 term(s)
- L47 — `{{bandwidth|Bandwidth}}`  · _and Music on iOS devices', 'Bandwidth aggregation across multiple I_
- L36 — `{{latency|latency}}`  · _h chunk — round-robin, lowest-latency-first, or redundant. This is_
- L19 — `{{handshake|handshake}}`  · _rks: [ { title: 'Initial handshake with MP_CAPABLE', descript_
- L31 — `{{sequence-number|Sequence Number}}`  · _ence numbers. A separate Data Sequence Number (DSN) ensures correct orderin_

**`src/lib/data/protocols/mqtt.ts`** — 4 term(s)
- L154 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-second for QoS 0; 1-2 R_
- L36 — `{{handshake|handshake}}`  · _least-once). QoS 2: four-step handshake (exactly-once). Choose based_
- L21 — `{{keep-alive|keep-alive}}`  · _ify a client ID, credentials, keep-alive interval, and a "last will" m_
- L26 — `{{topic|topic}}`  · _on: 'Client subscribes to topic patterns like "home/+/tempera_

**`src/lib/data/protocols/ntp.ts`** — 3 term(s)
- L154 — `{{bandwidth|bandwidth}}`  · _: 64-1024 seconds. Negligible bandwidth.', overhead: '48-byte packe_
- L153 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single UDP round trip. Sync_
- L46 — `{{certificate|Certificate}}`  · _atory time requirements)', 'Certificate validity and expiration check_

**`src/lib/data/protocols/oauth2.ts`** — 2 term(s)
- L221 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Authorization flow: 1-3_
- L37 — `{{access-token|access token}}`  · _the PKCE proof and returns an access token (short-lived) and a refresh t_

**`src/lib/data/protocols/quic.ts`** — 5 term(s)
- L150 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for new connection_
- L20 — `{{handshake|handshake}}`  · _rks: [ { title: 'Initial handshake (1 RTT)', description:_
- L12 — `{{multiplexing|multiplexing}}`  · _with built-in encryption and multiplexing — the future of the web.', o_
- L12 — `{{encryption|encryption}}`  · _based transport with built-in encryption and multiplexing — the future_
- L35 — `{{connection-migration|Connection migration}}`  · _others." }, { title: 'Connection migration', description: 'Connec_

**`src/lib/data/protocols/rest.ts`** — 5 term(s)
- L139 — `{{client-server|client-server model}}`  · _.png', alt: 'Diagram of the client-server model showing multiple clients comm_
- L115 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Per-request (no persistent_
- L25 — `{{idempotent|idempotent}}`  · _d semantics — GET is safe and idempotent, DELETE is idempotent but not_
- L28 — `{{stateless|Stateless}}`  · _ot safe.' }, { title: 'Stateless requests', description:_
- L35 — `{{status-code|HTTP status code}}`  · _ption: 'Server returns an HTTP status code (200 OK, 201 Created, 404 Not_

**`src/lib/data/protocols/rtmp.ts`** — 3 term(s)
- L47 — `{{latency|latency}}`  · _-server transmission', 'Low-latency live broadcasts and gaming st_
- L19 — `{{handshake|handshake}}`  · _ItWorks: [ { title: 'TCP handshake + RTMP handshake', descrip_
- L69 — `{{hop|hop}}`  · _: 'RTMP is the standard first hop for live streaming — from enc_

**`src/lib/data/protocols/rtp.ts`** — 6 term(s)
- L155 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'No connection setup (UDP)._
- L31 — `{{jitter|jitter}}`  · _t loss and reorder packets. A jitter buffer smooths out timing var_
- L26 — `{{sequence-number|sequence number}}`  · _ckets, each with a timestamp, sequence number, and payload type. Packets ar_
- L36 — `{{codec|codec}}`  · _uses this to adjust bitrate, codec, or error correction.' } ]_
- L21 — `{{signaling|signaling}}`  · _sion setup — that's done by a signaling protocol (SIP, WebRTC's SDP)._
- L26 — `{{payload|payload}}`  · _mestamp, sequence number, and payload type. Packets are sent over U_

**`src/lib/data/protocols/sctp.ts`** — 6 term(s)
- L147 — `{{latency|latency}}`  · _} ] }, performance: { latency: '2 RTT for connection setup_
- L19 — `{{handshake|handshake}}`  · _Works: [ { title: '4-way handshake', description: "SCTP u_
- L26 — `{{head-of-line-blocking|head-of-line blocking}}`  · _sn't block stream 2 — solving head-of-line blocking." }, { title: 'Multi-h_
- L40 — `{{signaling|signaling}}`  · _} ], useCases: [ 'Telecom signaling (SS7 over IP, Diameter)', '_
- L21 — `{{syn-flood|SYN flood}}`  · _HO, COOKIE-ACK) that prevents SYN flood attacks by design — no server_
- L21 — `{{cookie|COOKIE}}`  · _ep handshake (INIT, INIT-ACK, COOKIE-ECHO, COOKIE-ACK) that preven_

**`src/lib/data/protocols/sdp.ts`** — 6 term(s)
- L31 — `{{bandwidth|bandwidth}}`  · _edentials, DTLS fingerprints, bandwidth limits, and direction (sendre_
- L177 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'SDP itself adds no latency_
- L26 — `{{codec|codec}}`  · _number, and list of supported codec payload types.' }, { t_
- L48 — `{{multicast|Multicast}}`  · _g session initialization', 'Multicast session announcements (SAP)',_
- L177 — `{{signaling|signaling}}`  · _no latency — exchanged during signaling, before media flows.', thro_
- L26 — `{{payload|payload}}`  · _, and list of supported codec payload types.' }, { title: 'A_

**`src/lib/data/protocols/sip.ts`** — 3 term(s)
- L167 — `{{bandwidth|bandwidth}}`  · _; the media (RTP) carries the bandwidth load', overhead: 'Text-base_
- L166 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Call setup: 1-3 seconds (IN_
- L179 — `{{signaling|signaling}}`  · _ller acknowledges. After this signaling dance, RTP media flows direct_

**`src/lib/data/protocols/smtp.ts`** — 2 term(s)
- L146 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Seconds to minutes (store a_
- L11 — `{{hop|hop}}`  · _internet — store and forward, hop by hop.', overview: `SMTP is_

**`src/lib/data/protocols/soap.ts`** — 3 term(s)
- L127 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as HTTP — one reque_
- L27 — `{{header|HTTP header}}`  · _nd parameters. The SOAPAction HTTP header is set to identify the target_
- L128 — `{{request-response|request-response}}`  · _tency: 'Same as HTTP — one request-response round trip. XML parsing adds_

**`src/lib/data/protocols/sse.ts`** — 2 term(s)
- L117 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-second (persistent conn_
- L26 — `{{payload|payload}}`  · _ds: "event:" (type), "data:" (payload), "id:" (last event ID), and_

**`src/lib/data/protocols/ssh.ts`** — 5 term(s)
- L175 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1-2 RTTs for connection + k_
- L26 — `{{encryption|encryption}}`  · _'Client and server negotiate encryption using Diffie-Hellman or simil_
- L36 — `{{public-key|public key}}`  · _'Client authenticates via public key (preferred), password, or oth_
- L187 — `{{payload|payload}}`  · _acket length, padding length, payload, padding, and MAC fields',_
- L43 — `{{port-forwarding|Port forwarding}}`  · _ile transfer (SCP, SFTP)', 'Port forwarding and tunneling', 'Automated_

**`src/lib/data/protocols/stomp.ts`** — 3 term(s)
- L173 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Similar to the underlying b_
- L184 — `{{broker|message broker}}`  · _337%29.jpg', alt: 'RabbitMQ message broker presentation at a developer c_
- L26 — `{{topic|topic}}`  · _ibes to a destination (like a topic or queue). Each subscription_

**`src/lib/data/protocols/tcp.ts`** — 11 term(s)
- L208 — `{{bandwidth|bandwidth}}`  · _~40% throughput jump for high-bandwidth servers without any applicati_
- L157 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for TCP handshake_
- L67 — `{{handshake|handshake}}`  · _inimal TCP server — the 3-way handshake happens automatically inside_
- L228 — `{{congestion-control|congestion control}}`  · _IC}} has been the default TCP congestion control on Linux since 2006. Most lar_
- L26 — `{{sequence-number|sequence number}}`  · _, acknowledging the client\'s sequence number and proposing its own. "Yes,_
- L111 — `{{three-way-handshake|Three-Way Handshake}}`  · _tions: [ { title: 'Three-Way Handshake', code: `Client → Serve_
- L276 — `{{ephemeral-port|Ephemeral port}}`  · _apps.' }, { title: 'Ephemeral port exhaustion', text: 'On a_
- L226 — `{{cubic|CUBIC}}`  · _g: 'Linux kernel', scale: 'CUBIC default since 2.6.19', des_
- L183 — `{{time-wait|TIME_WAIT}}`  · _CLOSED through ESTABLISHED to TIME_WAIT', caption: 'The TCP stat_
- L215 — `{{nonce|Nonce}}`  · _-ecn) reallocates the old ECN-Nonce bit to deliver more than one_
- L272 — `{{delayed-ack|Delayed ACK}}`  · _s: [ { title: 'Nagle + Delayed ACK = 200ms latency', text: '_

**`src/lib/data/protocols/tls.ts`** — 7 term(s)
- L168 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'TLS 1.3: 1 RTT for new conn_
- L67 — `{{handshake|handshake}}`  · _connection starts with a TLS handshake — you can inspect certificate_
- L276 — `{{idempotent|idempotent}}`  · _ould refuse 0-RTT for any non-idempotent method.' }, { title_
- L42 — `{{encryption|encryption}}`  · _API communication', 'Email encryption (SMTPS, IMAPS)', 'VPN tunne_
- L24 — `{{certificate|Certificate}}`  · _{ title: 'ServerHello + Certificate', description: 'Server_
- L67 — `{{tls-handshake|TLS handshake}}`  · _TTPS connection starts with a TLS handshake — you can inspect certificate_
- L220 — `{{ech|ECH (Encrypted Client Hello)}}`  · _date: '2024-09', title: 'ECH (Encrypted Client Hello) progresses', description:_

**`src/lib/data/protocols/udp.ts`** — 6 term(s)
- L141 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Zero connection setup; sing_
- L19 — `{{handshake|handshake}}`  · _wItWorks: [ { title: 'No handshake', description: 'Unlike_
- L142 — `{{congestion-control|congestion control}}`  · _-response', throughput: 'No congestion control — can send as fast as the net_
- L141 — `{{request-response|request-response}}`  · _nection setup; single RTT for request-response', throughput: 'No congestio_
- L203 — `{{checksum|checksum}}`  · _header format, length field, checksum, and a paragraph of prose — f_
- L222 — `{{fragmentation|Fragmentation}}`  · _own.' }, { title: 'Fragmentation = unreliable delivery', t_

**`src/lib/data/protocols/webrtc.ts`** — 5 term(s)
- L156 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup: 2-5 secon_
- L29 — `{{handshake|handshake}}`  · _er.' }, { title: 'DTLS handshake', description: 'Once a_
- L31 — `{{encryption|encryption}}`  · _a DTLS handshake to establish encryption keys. All subsequent media is_
- L19 — `{{signaling|Signaling}}`  · _howItWorks: [ { title: 'Signaling', description: 'Peers_
- L36 — `{{srtp|SRTP (Secure RTP)}}`  · _n: 'Audio/video flows via SRTP (Secure RTP) directly between peers. Data_

**`src/lib/data/protocols/websockets.ts`** — 3 term(s)
- L112 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 HTTP round trip for up_
- L100 — `{{handshake|Handshake}}`  · _{ title: 'Upgrade Handshake', code: `GET /chat HTTP_
- L11 — `{{full-duplex|Full-duplex}}`  · _rfc: 'RFC 6455', oneLiner: 'Full-duplex, persistent connection — serv_

**`src/lib/data/protocols/wifi.ts`** — 5 term(s)
- L162 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1-5 ms typical for local ac_
- L30 — `{{handshake|handshake}}`  · _s.' }, { title: '4-way handshake (WPA2/WPA3)', description:_
- L12 — `{{encryption|encryption}}`  · _ernet without the cable, plus encryption and airtime management.', ov_
- L37 — `{{unicast|unicast}}`  · _with the session keys. Every unicast frame must be acknowledged by_
- L22 — `{{broadcast|broadcast}}`  · _scription: 'Access points broadcast beacon frames every ~100 ms a_

**`src/lib/data/protocols/xmpp.ts`** — 3 term(s)
- L195 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Near-instant over persis_
- L42 — `{{encryption|encryption}}`  · _, message carbons, end-to-end encryption (OMEMO), and more.' } ],_
- L32 — `{{request-response|request-response}}`  · _us, and <iq> (info/query) for request-response interactions.' }, { ti_

