# Term densification audit

Generated: 2026-05-19T06:21:47.372Z

- Files scanned: **86**
- Distinct RFC numbers mentioned but **not in registry**: **20**
- Distinct pioneers mentioned without `[[pioneer:…]]` wrap: **30** (of 63 catalogued)
- Distinct concepts mentioned without `{{…}}` wrap: **134** (of 362 catalogued)

## 1. RFCs mentioned in prose but missing from the registry

Add these to `src/lib/data/rfcs.ts`. Sorted by how many files mention them.

| RFC | Files | Sample mention |
|---|---:|---|
| RFC 1631 | 1 | ion, ([[rfc:1918\|RFC 1918]] + RFC 1631) — the middlebox that bought |
| RFC 8899 | 1 | ocols must implement PLPMTUD (RFC 8899)." }, { title: 'IPs |
| RFC 1827 | 1 | rtly thereafter contribute to RFC 1827 (ESP).' }, { title: 'F |
| RFC 7619 | 1 | perating networks (null-auth, RFC 7619)' ], codeExample: { langu |
| RFC 8229 | 1 | rvive Wi-Fi-to-LTE handoff. **RFC 8229 (IKE/ESP over [[tcp\|TCP]])** |
| RFC 9347 | 1 | date: '2023-08', title: 'RFC 9347 — IP-TFS (Traffic Flow Securi |
| RFC 4120 | 1 | port: 88, year: 1988, rfc: 'RFC 4120', oneLiner: 'The three-hea |
| RFC 6761 | 1 | iction over ICANN', text: 'RFC 6761 (February 2013) uses {{iana\|I |
| RFC 9665 | 1 | date: '2025-06', title: 'RFC 9665 — SRP (Service Registration P |
| RFC 3264 | 1 | ]), [[sdp\|SDP]] offer/answer (RFC 3264), and **every** revision of { |
| RFC 4577 | 1 | ', 'MPLS-VPN PE-CE peering (RFC 4577)', 'Mid-tier ISP IGP (tier- |
| RFC 5709 | 1 | C}}-SHA-256** authentication (RFC 5709 for v2, RFC 7166 Authenticati |
| RFC 7166 | 1 | hentication (RFC 5709 for v2, RFC 7166 Authentication Trailer for v3 |
| RFC 7938 | 1 | erlay where pure-[[bgp\|BGP]] (RFC 7938) is unjustified', 'SD-WAN o |
| RFC 8405 | 1 | hem out at `MaxAge = 3600 s`. RFC 8405 SPF back-off (INITIAL/SHORT_W |
| RFC 8665 | 1 | ler for v3). Segment Routing (RFC 8665/8666) and SRv6 (RFC 9513) rid |
| RFC 9355 | 1 | r sub-second loss detection — RFC 9355 Strict-Mode requires BFD up b |
| RFC 9513 | 1 | ing (RFC 8665/8666) and SRv6 (RFC 9513) ride on top via Opaque LSAs; |
| RFC 9667 | 1 | { date: '2024', title: 'RFC 9667 — Dynamic Flooding on Dense G |
| RFC 8922 | 1 | — that\'s not good enough."* RFC 8922 (2020) mentions WireGuard for |

## 2. Pioneers named without `[[pioneer:…]]`

Each row is the first unwrapped mention in a file. Apply once per section, not every occurrence.

| Pioneer | Files |
|---|---:|
| Vint Cerf | 5 |
| Jon Postel | 4 |
| Van Jacobson | 4 |
| Tim Berners-Lee | 2 |
| Henning Schulzrinne | 2 |
| Jonathan Rosenberg | 2 |
| Justin Uberti | 2 |
| Roy Fielding | 2 |
| Ian Hickson | 2 |
| Jim Kardach | 2 |
| Marty Cooper | 2 |
| Andrew Viterbi | 2 |
| Ray Tomlinson | 1 |
| Bob Metcalfe | 1 |
| Yakov Rekhter | 1 |
| Steve Deering | 1 |
| Bob Kahn | 1 |
| Jim Roskind | 1 |
| Paul Mockapetris | 1 |
| Eric Rescorla | 1 |
| Taher Elgamal | 1 |
| Mike Belshe | 1 |
| Jaap Haartsen | 1 |
| Sven Mattisson | 1 |
| Irwin Jacobs | 1 |
| Phil Karn | 1 |
| Stuart Cheshire | 1 |
| Charles Walton | 1 |
| Radia Perlman | 1 |
| Bob Heile | 1 |

### Per-file pioneer hits

**`src/lib/data/book/parts/layer-2-3.ts`**
- L226:20 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _eriment.', attribution: 'Vint Cerf, Linux.conf.au 2011' },_

**`src/lib/data/book/parts/story-of-the-internet.ts`**
- L106:14 — `[[pioneer:jon-postel|Jon Postel]]`  · _Jon_Postel.jpg', alt: 'Jon Postel — editor of RFC 791, 792, and_
- L244:14 — `[[pioneer:tim-berners-lee|Tim Berners-Lee]]`  · _Web_Server.jpg', alt: 'Tim Berners-Lee\'s NeXTcube — the world\'s fi_
- L154:14 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _n_Jacobson.jpg', alt: 'Van Jacobson — co-author of the 1988 paper_

**`src/lib/data/book/parts/utilities-security.ts`**
- L236:20 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _ry 2024.', attribution: 'Vint Cerf, Internet History list obitua_
- L391:16 — `[[pioneer:ray-tomlinson|Ray Tomlinson]]`  · _: 'narrative', title: 'Ray Tomlinson Picked the @', text: `_

**`src/lib/data/category-stories/network-foundations.ts`**
- L74:13 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _jpg' }, { name: 'Vint Cerf', years: '1943–', t_
- L64:13 — `[[pioneer:bob-metcalfe|Bob Metcalfe]]`  · _people: [ { name: 'Bob Metcalfe', years: '1946–', t_
- L92:13 — `[[pioneer:yakov-rekhter|Yakov Rekhter]]`  · _ks.' }, { name: 'Yakov Rekhter', years: 'c. 1950–',_
- L100:13 — `[[pioneer:steve-deering|Steve Deering]]`  · _et.' }, { name: 'Steve Deering', years: '1951–', t_

**`src/lib/data/category-stories/realtime-av.ts`**
- L35:13 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _jpg' }, { name: 'Van Jacobson', years: '1950\u2013',_
- L25:13 — `[[pioneer:henning-schulzrinne|Henning Schulzrinne]]`  · _people: [ { name: 'Henning Schulzrinne', years: 'c. 1962\u2013'_
- L116:13 — `[[pioneer:jonathan-rosenberg|Jonathan Rosenberg]]`  · _ng.' }, { name: 'Jonathan Rosenberg', years: '', title:_
- L221:13 — `[[pioneer:justin-uberti|Justin Uberti]]`  · _people: [ { name: 'Justin Uberti', years: '', title:_

**`src/lib/data/category-stories/transport.ts`**
- L25:13 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _people: [ { name: 'Vint Cerf', years: '1943\u2013',_
- L35:13 — `[[pioneer:bob-kahn|Bob Kahn]]`  · _jpg' }, { name: 'Bob Kahn', years: '1938\u2013',_
- L45:13 — `[[pioneer:jon-postel|Jon Postel]]`  · _jpg' }, { name: 'Jon Postel', years: '1943\u20131998_
- L193:13 — `[[pioneer:jim-roskind|Jim Roskind]]`  · _people: [ { name: 'Jim Roskind', years: '1960s\u2013',_

**`src/lib/data/category-stories/utilities.ts`**
- L25:13 — `[[pioneer:jon-postel|Jon Postel]]`  · _es." }, { name: 'Jon Postel', years: '1943–1998',_
- L129:13 — `[[pioneer:paul-mockapetris|Paul Mockapetris]]`  · _people: [ { name: 'Paul Mockapetris', years: '1948–', t_
- L281:13 — `[[pioneer:eric-rescorla|Eric Rescorla]]`  · _et.' }, { name: 'Eric Rescorla', years: '', title:_
- L263:13 — `[[pioneer:taher-elgamal|Taher Elgamal]]`  · _people: [ { name: 'Taher Elgamal', years: '1955–', t_

**`src/lib/data/category-stories/web-api.ts`**
- L17:36 — `[[pioneer:tim-berners-lee|Tim Berners-Lee]]`  · _t: 'The NeXT computer used by Tim Berners-Lee at CERN, the world\'s first w_
- L37:13 — `[[pioneer:roy-fielding|Roy Fielding]]`  · _jpg' }, { name: 'Roy Fielding', years: '1965\u2013',_
- L129:13 — `[[pioneer:mike-belshe|Mike Belshe]]`  · _people: [ { name: 'Mike Belshe', years: '', title:_
- L245:13 — `[[pioneer:ian-hickson|Ian Hickson]]`  · _ns." }, { name: 'Ian Hickson', years: '1976\u2013',_

**`src/lib/data/category-stories/wireless.ts`**
- L50:13 — `[[pioneer:jaap-haartsen|Jaap Haartsen]]`  · _em.' }, { name: 'Jaap Haartsen', years: '1963–', t_
- L58:13 — `[[pioneer:sven-mattisson|Sven Mattisson]]`  · _5)." }, { name: 'Sven Mattisson', years: '1956–', t_
- L66:13 — `[[pioneer:jim-kardach|Jim Kardach]]`  · _ts.' }, { name: 'Jim Kardach', years: '1958–', t_
- L26:13 — `[[pioneer:marty-cooper|Marty Cooper]]`  · _people: [ { name: 'Marty Cooper', years: '1928–', t_
- L34:13 — `[[pioneer:andrew-viterbi|Andrew Viterbi]]`  · _e*.' }, { name: 'Andrew Viterbi', years: '1935–', t_

**`src/lib/data/concept-foundations.ts`**
- L72:14 — `[[pioneer:vint-cerf|Vint Cerf]]`  · _people: [ { name: 'Vint Cerf', years: '1943 –',_
- L82:14 — `[[pioneer:jon-postel|Jon Postel]]`  · _' }, { name: 'Jon Postel', years: '1943 – 1998',_
- L479:11 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _-Van_Jacobson.jpg', alt: 'Van Jacobson — co-author of the 1988 paper_

**`src/lib/data/diagram-definitions.ts`**
- L464:58 — `[[pioneer:roy-fielding|Roy Fielding]]`  · _resentational State Transfer (Roy Fielding, 2000). Resources are URLs; *_

**`src/lib/data/outages.ts`**
- L339:13 — `[[pioneer:van-jacobson|Van Jacobson]]`  · _'tcp'], cast: [ { name: 'Van Jacobson (LBL)', role: "Co-author of t_

**`src/lib/data/protocols/bluetooth.ts`**
- L215:180 — `[[pioneer:jim-kardach|Jim Kardach]]`  · _ho united Denmark and Norway. Jim Kardach at {{intel\|Intel}} proposed t_

**`src/lib/data/protocols/cellular.ts`**
- L366:54 — `[[pioneer:marty-cooper|Marty Cooper]]`  · _3, Sixth Avenue, Manhattan.** Marty Cooper of Motorola dialed Joel Engel_
- L370:276 — `[[pioneer:andrew-viterbi|Andrew Viterbi]]`  · _cognizer. It made nothing for Andrew Viterbi directly; it made Qualcomm ev_
- L378:71 — `[[pioneer:irwin-jacobs|Irwin Jacobs]]`  · _ted for TDMA; later that year Irwin Jacobs presented CDMA and *"no one f_

**`src/lib/data/protocols/ipsec.ts`**
- L313:12 — `[[pioneer:phil-karn|Phil Karn]]`  · _funFacts: [ { title: 'Phil Karn sued the US State Department_

**`src/lib/data/protocols/mdns-dns-sd.ts`**
- L303:12 — `[[pioneer:stuart-cheshire|Stuart Cheshire]]`  · _1 years.' }, { title: 'Stuart Cheshire also wrote a tank game', t_

**`src/lib/data/protocols/nat-traversal.ts`**
- L297:12 — `[[pioneer:jonathan-rosenberg|Jonathan Rosenberg]]`  · _relays.' }, { title: 'Jonathan Rosenberg is a top-10 RFC author of all_
- L226:12 — `[[pioneer:justin-uberti|Justin Uberti]]`  · _date: '2024-11', title: 'Justin Uberti joins OpenAI to lead Real-Tim_

**`src/lib/data/protocols/nfc.ts`**
- L401:12 — `[[pioneer:charles-walton|Charles Walton]]`  · _funFacts: [ { title: 'Charles Walton died the same year Google Wal_

**`src/lib/data/protocols/ospf.ts`**
- L285:12 — `[[pioneer:radia-perlman|Radia Perlman]]`  · _ip\|IP]].' }, { title: 'Radia Perlman designed the competitor, not_

**`src/lib/data/protocols/rtp.ts`**
- L167:9 — `[[pioneer:henning-schulzrinne|Henning Schulzrinne]]`  · _287838924022%29.jpg', alt: 'Henning Schulzrinne, co-creator of RTP, speaking_

**`src/lib/data/protocols/sse.ts`**
- L128:9 — `[[pioneer:ian-hickson|Ian Hickson]]`  · _ting_Day_Three.jpeg', alt: 'Ian Hickson at a CSS Working Group meetin_

**`src/lib/data/protocols/zigbee.ts`**
- L384:12 — `[[pioneer:bob-heile|Bob Heile]]`  · _rmarket." }, { title: 'Bob Heile was a founding member of IEEE_

## 3. Concepts in `concepts.ts` mentioned without `{{…}}`

Editorial rule: wrap on first appearance per section, not every time. `low` priority terms are common English words and should only be wrapped where the technical sense is the focus.

| Term | Files |
|---|---:|
| Protocol | 86 |
| Port | 63 |
| Latency | 61 |
| Packet | 43 |
| Frame | 26 |
| Google | 25 |
| Apple | 22 |
| Stream | 22 |
| Handshake | 20 |
| Segment | 17 |
| Hop | 17 |
| Encryption | 14 |
| Linux | 14 |
| Payload | 12 |
| Cloudflare | 11 |
| Certificate | 10 |
| Socket | 9 |
| Bandwidth | 9 |
| Cisco | 9 |
| Matter | 8 |
| ARPANET | 8 |
| DARPA | 8 |
| Meta | 7 |
| Checksum | 7 |
| Datagram | 7 |
| Multipath | 7 |
| Signaling | 7 |
| Topic | 6 |
| Congestion Control | 6 |
| Peering | 5 |
| Encapsulation | 5 |
| Stateless | 5 |
| Microsoft | 5 |
| Public Key | 4 |
| Bufferbloat | 4 |
| DNS Resolution | 4 |
| Multiplexing | 4 |
| CCC Digital Key | 4 |
| Codec | 4 |
| HPACK | 4 |
| Unicast | 4 |
| Multicast | 4 |
| Broadcast | 4 |
| Anycast | 4 |
| Fragmentation | 4 |
| Request-Response | 4 |
| Private Key | 3 |
| BBRv3 | 3 |
| Three-Way Handshake | 3 |
| Spectrum | 3 |
| WPA3 | 3 |
| Auracast | 3 |
| Channel Sounding | 3 |
| Thread | 3 |
| Direct-to-Cell | 3 |
| Jitter | 3 |
| CUBIC | 3 |
| Intel | 3 |
| Subnet | 3 |
| Cookie | 3 |
| _…74 more_ | |

### Per-file concept hits (high priority)

**`src/lib/data/book/chapters.ts`** — 1 term(s)
- L48 — `{{encryption|encryption}}`  · _each makes easy or hard.', 'encryption-basics': "What HTTPS actual_

**`src/lib/data/book/parts/async-iot.ts`** — 3 term(s)
- L71 — `{{topic|topic}}`  · _agram — sensor publishes to a topic on a broker; subscriber recei_
- L241 — `{{matter|Matter}}`  · _CoAP Actually Runs — And the Matter Misconception', text:_
- L124 — `{{broadcom|Broadcom}}`  · _arrative', title: 'The Broadcom Acquisition, And Where AMQP G_

**`src/lib/data/book/parts/famous-outages.ts`** — 5 term(s)
- L21 — `{{arpanet|arpanet}}`  · _───────────────── { id: 'arpanet-1980', title: 'ARPANET 198_
- L77 — `{{darpa|DARPA}}`  · _elf.', credit: 'Image: DARPA / public domain, via Wikimedi_
- L135 — `{{peering|peering}}`  · _ng topology — each line a BGP peering relationship.', captio_
- L534 — `{{meta|Meta}}`  · _.jpg', alt: 'Facebook (Meta) Headquarters campus in Menlo_
- L397 — `{{linux|Linux}}`  · _.png', alt: 'Tux — the Linux mascot, a chubby cartoon peng_

**`src/lib/data/book/parts/frontier.ts`** — 9 term(s)
- L274 — `{{arpanet|ARPANET}}`  · _march_1977.png', alt: 'ARPANET logical map, March 1977 — the_
- L277 — `{{darpa|DARPA}}`  · _net.', credit: 'Image: DARPA / public domain, via Wikimedi_
- L74 — `{{public-key|public key}}`  · _metric cryptography diagram — public key encrypts, private key decrypt_
- L74 — `{{private-key|private key}}`  · _iagram — public key encrypts, private key decrypts.', caption:_
- L103 — `{{bufferbloat|Bufferbloat}}`  · _', title: 'The Problem Bufferbloat Created', text: `The m_
- L205 — `{{peering|peering}}`  · _topology with each line a BGP peering relationship.', captio_
- L50 — `{{apple|Apple}}`  · _pe: 'callout', title: 'Apple iOS 26 cliff: <2% to 25% in 9_
- L337 — `{{nvidia|NVIDIA}}`  · _rwan%29_22.png', alt: 'NVIDIA GB200 NVL72 GPU rack on displ_
- L147 — `{{bbrv3|bbrv3}}`  · _{ kind: 'frontier', id: 'bbrv3-default' } ] }, // ──_

**`src/lib/data/book/parts/how-to-learn-more.ts`** — 3 term(s)
- L50 — `{{arpanet|ARPANET}}`  · _t_1974.svg.png', alt: 'ARPANET in 1974 — the network the fir_
- L167 — `{{cloudflare|Cloudflare}}`  · _go.svg.png', alt: 'The Cloudflare logo — a stylised orange clou_
- L210 — `{{wireshark|Wireshark}}`  · _screenshot.png', alt: 'Wireshark — packet capture with protoco_

**`src/lib/data/book/parts/layer-2-3.ts`** — 7 term(s)
- L485 — `{{arpanet|ARPANET}}`  · _march_1977.png', alt: 'ARPANET logical map, March 1977 — pre_
- L488 — `{{darpa|DARPA}}`  · _aks.', credit: 'Image: DARPA / public domain, via Wikimedi_
- L382 — `{{firewall|firewall}}`  · _title: 'Dropping ICMP at the firewall is partially refusing to impl_
- L171 — `{{checksum|checksum}}`  · _t', title: 'ARP has no checksum and no authentication',_
- L69 — `{{payload|payload}}`  · _n MAC, source MAC, EtherType, payload, and FCS.', caption:_
- L155 — `{{hop|hop}}`  · _ket}} finds the next physical hop — [[arp\|STD 37]] has not been_
- L226 — `{{linux|Linux}}`  · _attribution: 'Vint Cerf, Linux.conf.au 2011' }, {_

**`src/lib/data/book/parts/patterns-failures.ts`** — 6 term(s)
- L115 — `{{latency|Latency}}`  · _title: 'Bufferbloat — Latency Without Loss', text: `_
- L78 — `{{handshake|handshake}}`  · _', alt: 'TCP three-way handshake — SYN, SYN-ACK, ACK between c_
- L175 — `{{congestion-control|Congestion Control}}`  · _ory', title: 'A History of Congestion Control', synopsis: 'Tahoe → Reno_
- L78 — `{{three-way-handshake|three-way handshake}}`  · _ke.svg.png', alt: 'TCP three-way handshake — SYN, SYN-ACK, ACK between c_
- L115 — `{{bufferbloat|Bufferbloat}}`  · _: 'narrative', title: 'Bufferbloat — Latency Without Loss',_
- L239 — `{{bbrv3|bbrv3}}`  · _{ kind: 'frontier', id: 'bbrv3-default' }, { kind: 'fron_

**`src/lib/data/book/parts/realtime-av.ts`** — 4 term(s)
- L4 — `{{latency|latency}}`  · _Protocols that prioritise low latency over perfect delivery — * vo_
- L167 — `{{hop|hop}}`  · _URI scheme means [[tls\|TLS]] hop-by-hop only, NOT end-to-end l_
- L98 — `{{cloudflare|Cloudflare}}`  · _}} mode.', attribution: 'Cloudflare engineering blog' },_
- L271 — `{{apple|Apple}}`  · _title: 'Low-Latency, And The "Apple Took It Away" Drama',_

**`src/lib/data/book/parts/story-of-the-internet.ts`** — 5 term(s)
- L55 — `{{arpanet|ARPANET}}`  · _alt: 'Hand-drawn sketch of ARPANET, December 1969 — the original_
- L58 — `{{darpa|DARPA}}`  · _ite.', credit: 'Image: DARPA / public domain, via Wikimedi_
- L261 — `{{bufferbloat|bufferbloat}}`  · _] }, { id: 'mobile-and-bufferbloat', title: 'The Mobile and B_
- L327 — `{{google|Google}}`  · _The_Dalles.jpg', alt: 'Google data center in The Dalles, Or_
- L374 — `{{linux|linux}}`  · _{ kind: 'frontier', id: 'a2a-linux-foundation' }, { kin_

**`src/lib/data/book/parts/transport.ts`** — 5 term(s)
- L149 — `{{encapsulation|encapsulation}}`  · _on.svg.png', alt: 'UDP encapsulation diagram showing an IP packet_
- L58 — `{{congestion-control|Congestion Control}}`  · _: 'narrative', title: 'Congestion Control: Tahoe Through BBR Through L4_
- L265 — `{{multipath|Multipath}}`  · _arrative', title: 'The Multipath QUIC Succession', text_
- L349 — `{{google|Google}}`  · _Rack.jpg', alt: 'Early Google "corkboard" server rack — bar_
- L251 — `{{apple|Apple}}`  · _arrative', title: 'The Apple iOS 7 Deployment', tex_

**`src/lib/data/book/parts/utilities-security.ts`** — 6 term(s)
- L142 — `{{certificate|certificate}}`  · _st.png', alt: 'Digital certificate chain of trust diagram — root_
- L142 — `{{certificate-chain|certificate chain}}`  · _st.png', alt: 'Digital certificate chain of trust diagram — root CA, i_
- L70 — `{{dns-resolution|DNS resolution}}`  · _.png', alt: 'Iterative DNS resolution diagram — client → recursive_
- L47 — `{{dnssec|DNSSEC}}`  · _e Kaminsky Moment, And Modern DNSSEC', text: `**Dan Kaminsk_
- L216 — `{{payload|payload}}`  · _rmat showing length, padding, payload, and MAC fields.', cap_
- L120 — `{{google|google}}`  · _r 344 domains** including \`*.google.com\`, used in {{man-in-the-m_

**`src/lib/data/book/parts/web-api.ts`** — 9 term(s)
- L280 — `{{client-server|Client-server model}}`  · _del-en.svg.png', alt: 'Client-server model diagram — multiple clients se_
- L214 — `{{handshake|handshake}}`  · _g', alt: 'TLS 1.3 full handshake diagram showing ClientHello,_
- L141 — `{{multiplexing|multiplexing}}`  · _HTTP/1.1 pipelining vs HTTP/2 multiplexing diagram, showing how multiple_
- L42 — `{{stateless|Stateless}}`  · _title: 'Text on the Wire, Stateless Semantics, Persistent Connect_
- L214 — `{{certificate|certificate}}`  · _ing ClientHello, ServerHello, certificate, finished messages in one rou_
- L122 — `{{server-push|Server Push}}`  · _pe: 'callout', title: 'Server Push is gone', text: '[[htt_
- L399 — `{{webtransport|WebTransport}}`  · _: 'narrative', title: 'WebTransport, and the Transport Future',_
- L223 — `{{multipath|multipath}}`  · _{ kind: 'frontier', id: 'multipath-quic' }, { kind: 'frontie_
- L487 — `{{linux|linux}}`  · _{ kind: 'frontier', id: 'a2a-linux-foundation' }, { kind: 's_

**`src/lib/data/book/parts/wireless.ts`** — 22 term(s)
- L560 — `{{darpa|DARPA}}`  · _rrative', title: 'From DARPA radar to AirTag — the 70-year_
- L143 — `{{bandwidth|bandwidth}}`  · _ned multipath from enemy into bandwidth', text: `The original_
- L321 — `{{hop|hop}}`  · _e fabric — and every backhaul hop is wrapped in [[ipsec\|IPsec]]_
- L610 — `{{ccc-digital-key|CCC Digital Key}}`  · _: 'narrative', title: 'CCC Digital Key — the canonical unlock flow',_
- L674 — `{{trust-center|trust center}}`  · _title: 'The mesh, the trust center, and the install code',_
- L674 — `{{install-code|install code}}`  · _sh, the trust center, and the install code', text: `A Zigbee netw_
- L494 — `{{matter|Matter}}`  · _— bootstrap to BLE / Wi-Fi / Matter', text: `For higher-th_
- L8 — `{{spectrum|spectrum}}`  · _-security * lineage, and the spectrum frontier through 2030. The pe_
- L143 — `{{multipath|multipath}}`  · _title: 'How MIMO turned multipath from enemy into bandwidth',_
- L168 — `{{wpa3|WPA3}}`  · _Dragonblood, and the road to WPA3', text: `{{wpa2\|WPA2}}_
- L264 — `{{le-audio|LE Audio}}`  · _: 'narrative', title: "LE Audio, Auracast, and the hearing-lo_
- L264 — `{{auracast|Auracast}}`  · _ve', title: "LE Audio, Auracast, and the hearing-loop replace_
- L273 — `{{channel-sounding|Channel Sounding}}`  · _: 'narrative', title: 'Channel Sounding — taking the fight to UWB',_
- L282 — `{{knob-attack|KNOB / BIAS / BLUFFS}}`  · _'callout', title: 'The KNOB / BIAS / BLUFFS lineage', text: 'Three_
- L910 — `{{mmwave|mmWave}}`  · _: 'narrative', title: 'mmWave — the band that under-deliver_
- L400 — `{{diameter|Diameter}}`  · _ve', title: 'The SS7 / Diameter trust holdover', text:_
- L648 — `{{thread|Thread}}`  · _'zigbee', title: 'Zigbee, Thread, and the Matter bridge', s_
- L5 — `{{direct-to-cell|Direct-to-Cell}}`  · _* 5G-Advanced, and Starlink Direct-to-Cell. Nine chapters cover the * s_
- L943 — `{{ambient-iot|Ambient IoT}}`  · _: 'narrative', title: 'Ambient IoT — when the IoT device has no_
- L629 — `{{apple|Apple}}`  · _Tag.svg.png', alt: 'An Apple AirTag — a small round white_
- L5 — `{{starlink|Starlink}}`  · _ooth 6.0, * 5G-Advanced, and Starlink Direct-to-Cell. Nine chapters_
- L854 — `{{wireshark|Wireshark}}`  · _screenshot.png', alt: 'Wireshark screen capture showing a pack_

**`src/lib/data/category-deep-dives.ts`** — 14 term(s)
- L354 — `{{jitter|Jitter}}`  · _'realtime-av', tagline: 'Jitter buffers, error correction, ad_
- L427 — `{{handshake|handshake}}`  · _e: 'PKI internals, TLS 1.3 handshake walkthrough, cryptographic pr_
- L101 — `{{flow-control|flow control}}`  · _ongestion control algorithms, flow control mechanics, and the subtle eng_
- L101 — `{{congestion-control|Congestion control}}`  · _: 'transport', tagline: 'Congestion control algorithms, flow control mech_
- L431 — `{{certificate|Certificate}}`  · _rrative', title: 'PKI and Certificate Chains', text: `The {{pki_
- L303 — `{{broker|Message Broker}}`  · _type: 'diagram', title: 'Message Broker Architecture Patterns', c_
- L427 — `{{dns-resolution|DNS resolution}}`  · _cryptographic primitives, and DNS resolution mechanics.', sections: [_
- L354 — `{{codec|codec}}`  · _correction, adaptive bitrate, codec negotiation, and the engineer_
- L213 — `{{hpack|HPACK}}`  · _ype: 'narrative', title: 'HPACK and QPACK Compression', t_
- L378 — `{{adaptive-bitrate|Adaptive Bitrate Streaming}}`  · _type: 'diagram', title: 'Adaptive Bitrate Streaming Flow', caption: `How {{ad_
- L118 — `{{cubic|CUBIC}}`  · _ndow Growth: Tahoe vs Reno vs CUBIC vs BBR', caption: `How di_
- L151 — `{{bufferbloat|Bufferbloat}}`  · _e: 'callout', title: 'The Bufferbloat Problem', text: 'Oversize_
- L288 — `{{exactly-once-delivery|exactly-once delivery}}`  · _antics, broker architectures, exactly-once delivery, and event sourcing patterns_
- L156 — `{{tcp-fast-open|TCP Fast Open}}`  · _ype: 'narrative', title: 'TCP Fast Open', text: `Standard [[tcp\|T_

**`src/lib/data/category-stories/network-foundations.ts`** — 6 term(s)
- L77 — `{{darpa|DARPA}}`  · _CP/IP', org: 'Stanford / DARPA / Google', contribution:_
- L5 — `{{xerox-parc|Xerox PARC}}`  · _foundations', tagline: 'From Xerox PARC to every connected device — h_
- L185 — `{{encapsulation|Encapsulation}}`  · _e: 'The Journey of a Packet — Encapsulation in Action', definition: `g_
- L77 — `{{google|Google}}`  · _org: 'Stanford / DARPA / Google', contribution: 'C_
- L103 — `{{cisco|Cisco}}`  · _Pv6', org: 'Xerox PARC / Cisco', contribution: 'P_
- L95 — `{{juniper|Juniper Networks}}`  · _tor of BGP', org: 'IBM / Juniper Networks', contribution: 'C_

**`src/lib/data/category-stories/realtime-av.ts`** — 6 term(s)
- L51 — `{{arpanet|ARPANET}}`  · _e: 'Network Voice Protocol on ARPANET', description: 'Fi_
- L97 — `{{signaling|Signaling}}`  · _e: 'pioneers', title: 'The Signaling Architects', people: [_
- L150 — `{{google|Google}}`  · _year: 2010, title: 'Google Acquires GIPS for $68.2M',_
- L143 — `{{apple|Apple}}`  · _title: 'HLS Announced by Apple', description: 'HT_
- L119 — `{{cisco|Cisco}}`  · _ct', org: 'dynamicsoft / Cisco / Five9', contribution:_
- L111 — `{{intel|Intel}}`  · _', org: 'Caltech / ISI / Intel', contribution: 'P_

**`src/lib/data/category-stories/transport.ts`** — 4 term(s)
- L5 — `{{arpanet|ARPANET}}`  · _'transport', tagline: 'From ARPANET to the modern web \u2014 the_
- L28 — `{{darpa|DARPA}}`  · _CP/IP', org: 'Stanford / DARPA', contribution: 'D_
- L167 — `{{google|Google}}`  · _: 'QUIC Development Begins at Google', description: "[[_
- L214 — `{{cisco|Cisco}}`  · _'SCTP Architect', org: 'Cisco', contribution: 'D_

**`src/lib/data/category-stories/utilities.ts`** — 2 term(s)
- L253 — `{{encryption|encryption}}`  · _e browser that introduced SSL encryption to the web', caption:_
- L152 — `{{cisco|Cisco}}`  · _org: 'Bucknell University / Cisco', contribution: 'D_

**`src/lib/data/category-stories/web-api.ts`** — 5 term(s)
- L141 — `{{hpack|HPACK}}`  · _title: 'Co-creator of SPDY & HPACK', org: 'Google', co_
- L132 — `{{google|Google}}`  · _-creator of SPDY', org: 'Google', contribution: 'L_
- L224 — `{{meta|Meta}}`  · _aphQL', org: 'Facebook / Meta', contribution: 'P_
- L319 — `{{linux|Linux}}`  · _tle: 'Both Protocols Join the Linux Foundation', description_
- L131 — `{{spdy|SPDY}}`  · _', title: 'Co-creator of SPDY', org: 'Google', co_

**`src/lib/data/category-stories/wireless.ts`** — 5 term(s)
- L191 — `{{spectrum|Spectrum}}`  · _type: 'callout', title: 'Spectrum at a glance', text: `Every_
- L170 — `{{auracast|Auracast}}`  · _e: 'Frankfurt Airport — first Auracast deployment', description_
- L156 — `{{channel-sounding|Channel Sounding}}`  · _title: 'Bluetooth 6.0 — Channel Sounding', description: 'Ad_
- L177 — `{{direct-to-cell|Direct-to-Cell}}`  · _title: 'T-Mobile + SpaceX Direct-to-Cell launches commercially',_
- L69 — `{{intel|Intel}}`  · _'Named Bluetooth', org: 'Intel', contribution: 'P_

**`src/lib/data/comparison/pairs.ts`** — 33 term(s)
- L43 — `{{bandwidth|bandwidth}}`  · _Throughput', left: 'Aggregate bandwidth of all paths', right: 'Limite_
- L14 — `{{latency|latency}}`  · _rives in order at the cost of latency; [[udp\|UDP]] prioritizes spee_
- L16 — `{{handshake|handshake}}`  · _\|Connection-oriented}} (3-way handshake)', right: '{{connectionless\|C_
- L448 — `{{connectionless|connectionless}}`  · _ansport', left: '[[udp\|UDP]] (connectionless)', right: '[[tcp\|TCP]] (persi_
- L1314 — `{{encapsulation|encapsulation}}`  · _aries, and multi-homing. This encapsulation is how [[webrtc\|WebRTC]] data_
- L67 — `{{multiplexing|Multiplexing}}`  · _boundaries)' }, { aspect: 'Multiplexing', left: 'Multiple independent_
- L17 — `{{retransmission|retransmission}}`  · _ft: 'Guaranteed delivery with retransmission', right: 'Best-effort, no ret_
- L317 — `{{stateless|stateless}}`  · _: '[[rest\|REST]] follows a stateless {{request-response\|request-re_
- L688 — `{{stateful|stateful}}`  · _model', left: 'Persistent stateful session (SELECT, FETCH, IDLE)_
- L89 — `{{encryption|encryption}}`  · _eliability, multiplexing, and encryption on top of [[udp\|UDP]] to repl_
- L669 — `{{certificate|Certificate}}`  · _t changing its protocol', 'Certificate-based trust via public CAs (L_
- L398 — `{{topic|topic}}`  · _', right: 'Binary with simple topic-based pub/sub' }, { aspect_
- L591 — `{{firewall|firewall}}`  · _'{{nat\|NAT}} traversal and firewall friendliness are critical'_
- L2151 — `{{subnet|subnet}}`  · _obtain an [[ip\|IP]] address, subnet mask, and {{default-gateway\|d_
- L756 — `{{checksum|checksum}}`  · _'Variable 20-60 bytes, header checksum, options', right: 'Fixed 40 b_
- L523 — `{{codec|codec}}`  · _t; [[dash\|DASH]] is the open, codec-agnostic MPEG standard for ad_
- L808 — `{{serialization|Serialization}}`  · _yDifferences: [ { aspect: 'Serialization', left: '{{xml\|XML}} (text-ba_
- L1274 — `{{unicast|unicast}}`  · _via [[udp\|UDP]] broadcast or unicast. This bootstrap problem makes_
- L551 — `{{multicast|multicast}}`  · _eer-to-peer\|Peer-to-peer}} or multicast', right: 'Client-to-server (i_
- L1274 — `{{broadcast|broadcast}}`  · _n OFFER, also via [[udp\|UDP]] broadcast or unicast. This bootstrap pr_
- L1844 — `{{anycast|anycast}}`  · _utes to reach it. [[dns\|DNS]] anycast relies on [[bgp\|BGP]] to adve_
- L76 — `{{signaling|signaling}}`  · _'You are building telecom signaling (SS7/SIGTRAN) or [[webrtc\|Web_
- L1304 — `{{payload|payload}}`  · _ence numbers, timestamps, and payload type identifiers, then sends_
- L1487 — `{{hop|hop}}`  · _(sips:) mandates [[tls\|TLS]] hop-by-hop across the signaling p_
- L757 — `{{fragmentation|Fragmentation}}`  · _eader chain' }, { aspect: 'Fragmentation', left: 'Routers and hosts ca_
- _…8 more in this file_

**`src/lib/data/concept-foundations.ts`** — 17 term(s)
- L75 — `{{darpa|DARPA}}`  · _P/IP', org: 'Stanford → DARPA → Google', contribution_
- L266 — `{{mac-address|MAC address}}`  · _t-field structure of a 48-bit MAC address — 24-bit OUI + 24-bit NIC, wi_
- L37 — `{{handshake|handshake}}`  · _png', alt: 'TCP three-way handshake sequence diagram — client SYN_
- L297 — `{{encapsulation|Encapsulation}}`  · _packets', title: 'Packets & Encapsulation', sections: [ { type_
- L645 — `{{encryption|encryption}}`  · _ers."` } ] }, { id: 'encryption-basics', title: 'Encryption_
- L693 — `{{certificate|certificate}}`  · _iate CA, which signs the leaf certificate.', caption: 'The X.5_
- L671 — `{{public-key|public key}}`  · _ncrypts with the recipient\'s public key; recipient decrypts with thei_
- L671 — `{{private-key|private key}}`  · _decrypts with their matching private key.', caption: '{{publi_
- L399 — `{{checksum|checksum}}`  · _e/ACK numbers, flags, window, checksum.', caption: 'The [[t_
- L266 — `{{multicast|multicast}}`  · _24-bit OUI + 24-bit NIC, with multicast and locally-administered flag_
- L37 — `{{three-way-handshake|three-way handshake}}`  · _shake.svg.png', alt: 'TCP three-way handshake sequence diagram — client SYN_
- L340 — `{{payload|payload}}`  · _source MAC, 2-byte EtherType, payload, 4-byte FCS.', caption:_
- L506 — `{{cubic|CUBIC}}`  · _ype: 'narrative', title: 'CUBIC: A Curve That Scales', te_
- L423 — `{{time-wait|TIME_WAIT}}`  · _e: 'callout', title: 'Why TIME_WAIT lives for 60 seconds', te_
- L524 — `{{pacing|Pacing}}`  · _e: 'callout', title: 'Why Pacing Matters', text: 'Classic_
- L459 — `{{spectrum|Spectrum}}`  · _, title: 'The Reliability Spectrum', definition: `graph LR_
- L75 — `{{google|Google}}`  · _org: 'Stanford → DARPA → Google', contribution:_

**`src/lib/data/diagram-definitions.ts`** — 47 term(s)
- L203 — `{{bandwidth|bandwidth}}`  · _when nothing changed — saves bandwidth on repeat visits. **Compressi_
- L169 — `{{latency|latency}}`  · _OS heuristics (signal, cost, latency).', 6: '**`MP_JOIN`** open_
- L696 — `{{jitter|jitter}}`  · _out-of-order) and to **smooth jitter** (variable arrival times). C_
- L49 — `{{handshake|handshake}}`  · _arting sequence numbers — the handshake is complete.', 4: 'The con_
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
- L104 — `{{encryption|encryption}}`  · _them** — connection setup and encryption happen in the same exchange,_
- L107 — `{{certificate|Certificate}}`  · _.', 3: 'Server sends its **Certificate** and a `Finished` message —_
- L1498 — `{{cipher-suite|cipher suite}}`  · _ist. The initiator proposes a cipher suite, sends its Diffie-Hellman / E_
- L1403 — `{{public-key|public key}}`  · _pted with the home network\'s public key (ECIES Profile A on Curve2551_
- L902 — `{{private-key|private key}}`  · _e transcript with the cert\'s private key — proves the server actually_
- L1703 — `{{certificate-chain|certificate chain}}`  · _suer), expiry, CDOL1, and the certificate chain for offline CDA verification._
- L104 — `{{tls-handshake|TLS handshake}}`  · _: 'Where TCP needs a separate TLS handshake on top, **QUIC merges them**_
- L282 — `{{status-code|HTTP status code}}`  · _ching Protocols`** = the only HTTP status code most people see for WebSocket_
- L728 — `{{request-response|request-response}}`  · _the 200 was received. SIP is request-response *except* for INVITE, which us_
- L498 — `{{topic|topic}}`  · _BE`** registers interest in a topic pattern. Wildcards: **`+`** m_
- L955 — `{{subnet|subnet}}`  · _includes the network config: subnet mask, default gateway, DNS se_
- _…22 more in this file_

**`src/lib/data/frontier.ts`** — 8 term(s)
- L41 — `{{topic|topic}}`  · _: string; oneLiner: string; topic: FrontierTopic; status: Fron_
- L24 — `{{observability|observability}}`  · _\| 'web' \| 'datacenter' \| 'observability' \| 'ai-agents' \| 'standards_
- L232 — `{{multipath|multipath}}`  · _inciples' } ] }, { id: 'multipath-quic', title: 'Multipath QU_
- L69 — `{{cloudflare|Cloudflare}}`  · _'2026-03-28' }, { label: 'Cloudflare HTTP', value: '40%', date: '2_
- L9 — `{{google|Google}}`  · _ROV/ASPA, IPv6 hitting 50% of Google * traffic (March 2026), Wi-F_
- L85 — `{{apple|Apple}}`  · _date: '2025-09 (default in Apple platforms)', protocols: ['t_
- L282 — `{{linux|linux}}`  · _auth' } ] }, { id: 'a2a-linux-foundation', title: 'A2A Do_
- L9 — `{{bbrv3|BBRv3}}`  · _ntum TLS (X25519MLKEM768), * BBRv3, L4S, ECH (RFC 9849), RPKI/RO_

**`src/lib/data/journeys.ts`** — 7 term(s)
- L38 — `{{handshake|Handshake}}`  · _colId: 'tcp', title: 'TCP Handshake', description: 'The_
- L147 — `{{encryption|Encryption}}`  · _: 'tls', title: 'TLS: The Encryption Layer', description:_
- L352 — `{{request-response|Request-Response}}`  · _Id: 'rest', title: 'REST: Request-Response', description: '[[re_
- L31 — `{{dns-resolution|DNS Resolution}}`  · _rotocolId: 'dns', title: 'DNS Resolution', description: 'Befo_
- L84 — `{{hop|hop}}`  · _ion address, then forwards it hop by hop toward its target. Eac_
- L703 — `{{connection-migration|Connection Migration}}`  · _Id: 'quic', title: 'QUIC: Connection Migration', description: '[[qu_
- L479 — `{{ice|ICE (Interactive Connectivity Establishment)}}`  · _orchestrates an entire stack: ICE (Interactive Connectivity Establishment) punches through NATs by testi_

**`src/lib/data/outages.ts`** — 7 term(s)
- L380 — `{{congestion-control|Congestion Control}}`  · _5681', label: 'RFC 5681 — TCP Congestion Control' } ] }, { id: 'centuryl_
- L374 — `{{congestion-avoidance|Congestion Avoidance}}`  · _.pdf', label: "Jacobson — Congestion Avoidance and Control (SIGCOMM '88)"_
- L333 — `{{hop|hop}}`  · _scale: 'NSFNET — three-IMP-hop path between Lawrence Berkele_
- L426 — `{{peering|peering}}`  · _}, { title: 'Manual de-peering needed', description:_
- L83 — `{{cloudflare|Cloudflare}}`  · _le: 'Operator' }, { name: 'Cloudflare', role: 'External monitor (1._
- L82 — `{{meta|Meta}}`  · _'tcp'], cast: [ { name: 'Meta (AS 32934)', role: 'Operator'_
- L563 — `{{linux|Linux}}`  · _e: 'SACK Panic — A One-Packet Linux Kernel Crash', date: '2019-_

**`src/lib/data/protocols/a2a.ts`** — 1 term(s)
- L164 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'HTTP round-trip latency_

**`src/lib/data/protocols/amqp.ts`** — 1 term(s)
- L158 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup is heav_

**`src/lib/data/protocols/arp.ts`** — 4 term(s)
- L169 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single broadcast + unica_
- L29 — `{{unicast|Unicast}}`  · _segment.' }, { title: 'Unicast ARP reply', description:_
- L24 — `{{broadcast|Broadcast}}`  · _process.' }, { title: 'Broadcast ARP request', description:_
- L173 — `{{payload|payload}}`  · _, overhead: '28-byte ARP payload inside a 42-byte Ethernet hea_

**`src/lib/data/protocols/bgp.ts`** — 6 term(s)
- L150 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Session setup: seconds (_
- L56 — `{{anycast|anycast}}`  · _ivery network}} ({{cdn\|CDN}}) anycast routing' ], codeExample: {_
- L54 — `{{peering|peering}}`  · _)', 'Cloud provider network peering (AWS, Google, Azure edge netw_
- L200 — `{{cloudflare|Cloudflare}}`  · _onstraint.' }, { org: 'Cloudflare', scale: '335+ cities, any_
- L54 — `{{google|Google}}`  · _rovider network peering (AWS, Google, Azure edge networks)', '{{_
- L186 — `{{linux|Linux}}`  · _', title: 'TCP-AO ships in Linux 6.7 for BGP', description:_

**`src/lib/data/protocols/bluetooth.ts`** — 12 term(s)
- L199 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'BLE connection event lat_
- L35 — `{{encryption|encryption}}`  · _}, { title: 'Pairing and encryption (SMP)', description: '_
- L204 — `{{payload|payload}}`  · _fault ATT MTU = 23 → 20 bytes payload per Notify; negotiate up to 2_
- L22 — `{{hop|hop}}`  · _37 data channels (0–36) that hop once per connection event."_
- L20 — `{{ism-band|ISM band}}`  · _quency-hopping in the 2.4 GHz ISM band', description: "Both B_
- L286 — `{{ccc-digital-key|CCC Digital Key}}`  · _l." }, { org: 'Tesla / CCC Digital Key', scale: 'Every Tesla sinc_
- L40 — `{{le-audio|LE Audio}}`  · _racking.' }, { title: 'LE Audio and Auracast (5.2+)', desc_
- L40 — `{{auracast|Auracast}}`  · _, { title: 'LE Audio and Auracast (5.2+)', description:_
- L45 — `{{channel-sounding|Channel Sounding}}`  · _acement.' }, { title: 'Channel Sounding (6.0+)', description:_
- L54 — `{{thread|Thread}}`  · _strap for {{matter\|Matter}} / Thread / [[wifi\|Wi-Fi]] IoT devices'_
- L252 — `{{google|Google}}`  · _: '2024-12', title: 'Apple-Google DULT anti-stalking draft → IE_
- L53 — `{{apple|Apple}}`  · _artwatches', 'Item finders: Apple AirTag, Samsung SmartTag, Til_

**`src/lib/data/protocols/cellular.ts`** — 7 term(s)
- L263 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Air-interface RTT: ~1 ms_
- L268 — `{{hop|hop}}`  · _ys an IPsec round on every N3 hop. ROHC header compression brin_
- L264 — `{{mmwave|mmWave}}`  · _cal mid-band 5G FR1, ~5–10 ms mmWave with retransmits, ~30–50 ms L_
- L62 — `{{volte|VoLTE / VoNR}}`  · _P "non-public networks")', 'VoLTE / VoNR voice + Wi-Fi calling handoff_
- L63 — `{{direct-to-cell|direct-to-cell}}`  · _alling handoff', 'Satellite direct-to-cell — T-Mobile + Starlink, AT&T +_
- L63 — `{{apple|Apple}}`  · _link, AT&T + AST SpaceMobile, Apple + Globalstar' ], codeExampl_
- L63 — `{{starlink|Starlink}}`  · _e direct-to-cell — T-Mobile + Starlink, AT&T + AST SpaceMobile, Appl_

**`src/lib/data/protocols/coap.ts`** — 1 term(s)
- L159 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'No connection setup (UDP) —_

**`src/lib/data/protocols/dash.ts`** — 1 term(s)
- L178 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Standard: 10-30 seconds._

**`src/lib/data/protocols/dhcp.ts`** — 2 term(s)
- L181 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Full DORA cycle: ~100-500ms_
- L21 — `{{broadcast|broadcast}}`  · _s: [ { title: 'DISCOVER (broadcast)', description: 'New d_

**`src/lib/data/protocols/dns.ts`** — 6 term(s)
- L167 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Cached: <1ms. Uncached:_
- L179 — `{{dns-resolution|DNS resolution}}`  · _t: 'Diagram showing iterative DNS resolution: client queries recursive res_
- L222 — `{{anycast|anycast}}`  · _13 root server letters, ~1500 anycast instances', description:_
- L194 — `{{dnssec|DNSSEC}}`  · _{ date: '2024', title: 'DNSSEC validation reaches 38%', d_
- L209 — `{{cloudflare|Cloudflare}}`  · _ldDeployments: [ { org: 'Cloudflare 1.1.1.1', scale: '~1 trill_
- L215 — `{{google|Google}}`  · _surements.' }, { org: 'Google 8.8.8.8', scale: '~14 tril_

**`src/lib/data/protocols/ethernet.ts`** — 2 term(s)
- L145 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-microsecond latency_
- L158 — `{{payload|payload}}`  · _le, MAC addresses, EtherType, payload, and FCS fields', caption:_

**`src/lib/data/protocols/ftp.ts`** — 1 term(s)
- L148 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup + transfer_

**`src/lib/data/protocols/graphql.ts`** — 3 term(s)
- L40 — `{{bandwidth|bandwidth}}`  · _Mobile applications (minimize bandwidth)', 'Complex dashboard UIs w_
- L133 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single HTTP round trip for_
- L134 — `{{payload|payload}}`  · _ut: 'No over-fetching reduces payload size; but complex queries can_

**`src/lib/data/protocols/grpc.ts`** — 3 term(s)
- L119 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'HTTP/2 connection reuse + b_
- L119 — `{{serialization|serialization}}`  · _P/2 connection reuse + binary serialization = very low latency per call',_
- L130 — `{{google|Google}}`  · _ard_Server_Rack.jpg', alt: "Google's original corkboard server r_

**`src/lib/data/protocols/hls.ts`** — 2 term(s)
- L153 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Standard: 10-30 seconds._
- L40 — `{{apple|Apple}}`  · _'Video on demand (Disney+, Apple TV+, and as fallback on Netfl_

**`src/lib/data/protocols/http1.ts`** — 2 term(s)
- L108 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT per {{request-resp_
- L132 — `{{keep-alive|keep-alive}}`  · _tent connections, showing how keep-alive reduces round trips', capti_

**`src/lib/data/protocols/http2.ts`** — 4 term(s)
- L113 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same connection setup as_
- L126 — `{{multiplexing|multiplexing}}`  · _uests, pipelining, and HTTP/2 multiplexing over a single connection',_
- L117 — `{{hpack|HPACK}}`  · _rhead waste', overhead: 'HPACK compresses headers by 30-76%_
- L26 — `{{binary-framing|Binary framing}}`  · _es, etc.' }, { title: 'Binary framing', description: 'All co_

**`src/lib/data/protocols/http3.ts`** — 9 term(s)
- L42 — `{{latency|latency}}`  · _-first applications', 'High-latency networks (satellite, remote a_
- L19 — `{{handshake|handshake}}`  · _tWorks: [ { title: 'QUIC handshake (1 RTT)', description:_
- L187 — `{{head-of-line-blocking|head-of-line blocking}}`  · _' }, { title: 'No more head-of-line blocking', text: 'In [[http2\|HTTP/2_
- L124 — `{{encryption|encryption}}`  · _r-packet than TCP due to QUIC encryption, offset by fewer round trips'_
- L34 — `{{connection-migration|Connection migration}}`  · _others.' }, { title: 'Connection migration', description: "If the_
- L154 — `{{webtransport|WebTransport}}`  · _{ date: '2024', title: 'WebTransport API ships in Chrome', desc_
- L162 — `{{cloudflare|Cloudflare}}`  · _ldDeployments: [ { org: 'Cloudflare', scale: 'All HTTPS traffi_
- L168 — `{{google|Google}}`  · _\|HTTP/3]].' }, { org: 'Google', scale: 'google.com / You_
- L174 — `{{meta|Meta}}`  · _rdisation.' }, { org: 'Meta', scale: '>75% of internet_

**`src/lib/data/protocols/icmp.ts`** — 4 term(s)
- L50 — `{{latency|latency}}`  · _ping)', 'Path discovery and latency measurement (traceroute/trace_
- L181 — `{{checksum|Checksum}}`  · _byte ICMP header (Type, Code, Checksum, Id, Seq) encapsulated in IP._
- L53 — `{{signaling|signaling}}`  · _Too Big messages)', 'Router signaling and redirect optimization' ]_
- L45 — `{{hop|hop}}`  · _s a host to use a better next-hop router. If a router receives_

**`src/lib/data/protocols/imap.ts`** — 1 term(s)
- L148 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'LOGIN + SELECT: ~200ms._

**`src/lib/data/protocols/ip.ts`** — 7 term(s)
- L173 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Per-hop forwarding: 1-10_
- L48 — `{{encapsulation|encapsulation}}`  · _eling ([[ip\|IP]]-in-[[ip\|IP]] encapsulation)', '{{multicast\|Multicast}}_
- L47 — `{{subnet|subnet}}`  · _n between devices on the same subnet', '{{vpn\|VPN}} tunneling ([_
- L187 — `{{checksum|checksum}}`  · _cation, flags, TTL, protocol, checksum, source and destination addre_
- L174 — `{{hop|hop}}`  · _ormance: { latency: 'Per-hop forwarding: 1-10 \u00b5s in h_
- L35 — `{{fragmentation|Fragmentation}}`  · _works).' }, { title: 'Fragmentation if needed', description:_
- L99 — `{{loopback|loopback}}`  · _\`\${addr.internal ? '(loopback)' : '(external)'}\` );_

**`src/lib/data/protocols/ipsec.ts`** — 9 term(s)
- L219 — `{{latency|latency}}`  · _} ] }, performance: { latency: '2 round trips for IKE_SA_
- L56 — `{{encryption|encryption}}`  · _y networks', 'Opportunistic encryption between cooperating networks_
- L141 — `{{certificate|Certificate}}`  · _enticationMethod</key><string>Certificate</string> <key>RemoteIdent_
- L338 — `{{hop|hop}}`  · _overhead. If an intermediate hop drops large packets and the [_
- L35 — `{{anti-replay|Anti-replay window}}`  · _crypted." }, { title: 'Anti-replay window', description: 'The 32_
- L53 — `{{apple|Apple}}`  · _'Roadwarrior remote access — Apple iOS/macOS native IKEv2, Micro_
- L53 — `{{microsoft|Microsoft}}`  · _Apple iOS/macOS native IKEv2, Microsoft Always-On VPN, strongSwan / N_
- L52 — `{{cisco|Cisco}}`  · _o-site VPN between firewalls (Cisco ASA, Juniper SRX, Fortinet, O_
- L222 — `{{intel|Intel}}`  · _pto NICs (Mellanox BlueField, Intel QAT). AWS Site-to-Site VPN: 5_

**`src/lib/data/protocols/ipv6.ts`** — 5 term(s)
- L168 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as IPv4 for most pa_
- L44 — `{{stateless|Stateless}}`  · _cast}}).' }, { title: 'Stateless autoconfiguration (SLAAC)',_
- L169 — `{{checksum|checksum}}`  · _— no NAT traversal, no header checksum computation at each hop, and_
- L169 — `{{hop|hop}}`  · _checksum computation at each hop, and some ISPs have shorter I_
- L171 — `{{fragmentation|fragmentation}}`  · _ksum recalculation, no router fragmentation, and fixed header size enable_

**`src/lib/data/protocols/json-rpc.ts`** — 1 term(s)
- L158 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as the underlying t_

**`src/lib/data/protocols/kafka.ts`** — 2 term(s)
- L186 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'End-to-end: 2-10ms typical._
- L198 — `{{topic|topic}}`  · _ng Kafka producers writing to topic partitions across brokers, wi_

**`src/lib/data/protocols/kerberos.ts`** — 7 term(s)
- L261 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for AS-REQ/AS-REP_
- L386 — `{{encryption|encryption}}`  · _' }, { title: 'Weak encryption types still lurk in old keyta_
- L299 — `{{certificate|certificate}}`  · _e: 'Microsoft enforces strong certificate binding (CVE-2022-37967 long-_
- L208 — `{{payload|payload}}`  · _: 'AS-REP — the magic two-key payload', code: `KRB-AS-REP ::=_
- L344 — `{{apple|Apple}}`  · _org: 'Heimdal', scale: 'Apple\'s macOS, Samba, FreeBSD',_
- L53 — `{{microsoft|Microsoft}}`  · _'**Active Directory** — every Microsoft AD domain on Earth, primary a_
- L338 — `{{linux|Linux}}`  · _al C codebase; ships in every Linux distro', description:_

**`src/lib/data/protocols/mcp.ts`** — 2 term(s)
- L150 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'stdio transport has near_
- L25 — `{{handshake|handshake}}`  · _}, { title: 'Initialize handshake', description: 'The cl_

**`src/lib/data/protocols/mdns-dns-sd.ts`** — 14 term(s)
- L299 — `{{icann|ICANN}}`  · _act of IETF jurisdiction over ICANN', text: 'RFC 6761 (Februar_
- L202 — `{{bandwidth|bandwidth}}`  · _nnounce/resolve. Steady-state bandwidth is dominated by the announce_
- L199 — `{{latency|latency}}`  · _} ] }, performance: { latency: '~750 ms for full probe (_
- L200 — `{{unicast|unicast}}`  · _on avoidance. Far faster than unicast DNS because no recursion is i_
- L5 — `{{multicast|Multicast}}`  · _{ id: 'mdns-dns-sd', name: 'Multicast DNS & DNS-Based Service Disco_
- L5 — `{{service-discovery|Service Discovery}}`  · _e: 'Multicast DNS & DNS-Based Service Discovery', abbreviation: 'mDNS / DNS-_
- L53 — `{{matter|Matter}}`  · __pdl-datastream._tcp`)', '**Matter** device commissioning (`_mat_
- L6 — `{{mdns|mDNS / DNS-SD}}`  · _e Discovery', abbreviation: 'mDNS / DNS-SD', categoryId: 'utilities',_
- L280 — `{{google|Google}}`  · _n at work." }, { org: 'Google Chromecast + Cast ecosystem',_
- L56 — `{{apple|Apple}}`  · _E remote-debug discovery', 'Apple Continuity (AirDrop, Handoff,_
- L234 — `{{microsoft|Microsoft}}`  · _ces-configuring', label: 'Microsoft security baseline' } },_
- L249 — `{{cisco|Cisco}}`  · _date: '2024-03', title: 'Cisco WLC mDNS DoS — cisco-sa-wlc-m_
- L275 — `{{linux|Linux}}`  · _cale: 'Default on every major Linux distro', description:_
- L56 — `{{airdrop|AirDrop}}`  · _covery', 'Apple Continuity (AirDrop, Handoff, Universal Clipboard_

**`src/lib/data/protocols/mptcp.ts`** — 5 term(s)
- L164 — `{{bandwidth|bandwidth}}`  · _throughput: 'Aggregated bandwidth of all subflows. Two 100Mbps_
- L161 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Initial: same as TCP (1_
- L19 — `{{handshake|handshake}}`  · _rks: [ { title: 'Initial handshake with MP_CAPABLE', descript_
- L5 — `{{multipath|Multipath}}`  · _col = { id: 'mptcp', name: 'Multipath TCP', abbreviation: 'MPTCP',_
- L46 — `{{apple|Apple}}`  · _]] to cellular handover)', 'Apple Siri, Maps, and Music on iOS_

**`src/lib/data/protocols/mqtt.ts`** — 2 term(s)
- L154 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-second for QoS 0; 1-2 R_
- L79 — `{{topic|topic}}`  · _sage) => { console.log(\`\${topic}: \${message.toString()}\`);_

**`src/lib/data/protocols/nat-traversal.ts`** — 11 term(s)
- L207 — `{{ip-address|IP address}}`  · _translated to a single public IP address', caption: 'The reason {_
- L195 — `{{bandwidth|bandwidth}}`  · _ra hop of latency and re-bill bandwidth; Cloudflare Realtime charges_
- L192 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for a STUN Binding_
- L6 — `{{stun-turn-ice|STUN/TURN/ICE}}`  · _T Traversal', abbreviation: 'STUN/TURN/ICE', categoryId: 'utilities',_
- L259 — `{{anycast|anycast}}`  · _e: '`stun.l.google.com:19302` anycast, free, default in libwebrtc',_
- L195 — `{{hop|hop}}`  · _e). TURN relays add one extra hop of latency and re-bill bandwi_
- L207 — `{{public-ip-address|public IP address}}`  · _router translated to a single public IP address', caption: 'The reason {_
- L285 — `{{cookie|cookie}}`  · _s: [ { title: 'The magic cookie spells "STUN"', text: '{{s_
- L55 — `{{cloudflare|Cloudflare}}`  · _, DERP as TURN-analogue)', 'Cloudflare Realtime, Twilio NTS, Microso_
- L51 — `{{google|Google}}`  · _[webrtc\|WebRTC]] video calls (Google Meet, Zoom, Teams, Discord, F_
- L55 — `{{microsoft|Microsoft}}`  · _udflare Realtime, Twilio NTS, Microsoft Teams relay backbone' ], co_

**`src/lib/data/protocols/nfc.ts`** — 9 term(s)
- L271 — `{{latency|latency}}`  · _} ] }, performance: { latency: '50–200 ms typical for ta_
- L173 — `{{payload|payload}}`  · _rd header — the universal NFC payload container', code: `Byte_
- L20 — `{{ism-band|ISM band}}`  · _MHz inductive coupling in the ISM band', description: "All NF_
- L20 — `{{inductive-coupling|inductive coupling}}`  · _s: [ { title: '13.56 MHz inductive coupling in the ISM band', descript_
- L324 — `{{ccc-digital-key|CCC Digital Key}}`  · _date: '2025-07', title: 'CCC Digital Key 4.0 announced', descriptio_
- L205 — `{{aliro|Aliro}}`  · _16-4 APDU — the EMV / eMRTD / Aliro command alphabet', code_
- L45 — `{{matter|Matter}}`  · _ndover to Bluetooth / Wi-Fi / Matter', description: "For hi_
- L56 — `{{google|Google}}`  · _[[nfc\|NFC]] tap at Apple Pay, Google Wallet, Samsung Pay, and ever_
- L56 — `{{apple|Apple}}`  · _payment — [[nfc\|NFC]] tap at Apple Pay, Google Wallet, Samsung P_

**`src/lib/data/protocols/ntp.ts`** — 3 term(s)
- L154 — `{{bandwidth|bandwidth}}`  · _: 64-1024 seconds. Negligible bandwidth.', overhead: '48-byte packe_
- L153 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single UDP round trip. Sync_
- L46 — `{{certificate|Certificate}}`  · _atory time requirements)', 'Certificate validity and expiration check_

**`src/lib/data/protocols/oauth2.ts`** — 3 term(s)
- L223 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Authorization flow: 1-3_
- L48 — `{{google|Google}}`  · _'Social login ("Sign in with Google/GitHub/Apple")', 'Third-par_
- L48 — `{{apple|Apple}}`  · _("Sign in with Google/GitHub/Apple")', 'Third-party API access_

**`src/lib/data/protocols/ospf.ts`** — 5 term(s)
- L185 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Default convergence ~40_
- L52 — `{{peering|peering}}`  · _ackbones)', 'MPLS-VPN PE-CE peering (RFC 4577)', 'Mid-tier ISP_
- L246 — `{{microsoft|Microsoft}}`  · _ldDeployments: [ { org: 'Microsoft Azure', scale: 'Inter-regi_
- L252 — `{{nvidia|NVIDIA}}`  · _{ org: 'Cumulus Networks / NVIDIA SONiC', scale: 'Default IG_
- L264 — `{{cisco|Cisco}}`  · _revalence." }, { org: 'Cisco IOS-XR / Juniper Junos', s_

**`src/lib/data/protocols/quic.ts`** — 9 term(s)
- L150 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for new connection_
- L20 — `{{handshake|handshake}}`  · _rks: [ { title: 'Initial handshake (1 RTT)', description:_
- L154 — `{{encryption|encryption}}`  · _er per-packet than TCP due to encryption, but fewer round trips overal_
- L35 — `{{connection-migration|Connection migration}}`  · _others." }, { title: 'Connection migration', description: 'Connec_
- L186 — `{{multipath|Multipath}}`  · _date: '2024-09', title: 'Multipath QUIC reaches stable IETF draf_
- L216 — `{{cloudflare|Cloudflare}}`  · _en-source.' }, { org: 'Cloudflare', scale: 'All HTTPS traffi_
- L164 — `{{google|Google}}`  · _r%2C_The_Dalles.jpg', alt: 'Google data center in The Dalles, Or_
- L222 — `{{apple|Apple}}`  · _y default.' }, { org: 'Apple', scale: 'iOS 18+ / macOS_
- L180 — `{{meta|Meta}}`  · _date: '2024-Q4', title: 'Meta reports >75% of internet traf_

**`src/lib/data/protocols/rest.ts`** — 4 term(s)
- L139 — `{{client-server|client-server model}}`  · _.png', alt: 'Diagram of the client-server model showing multiple clients comm_
- L115 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Per-request (no persistent_
- L28 — `{{stateless|Stateless}}`  · _ot safe.' }, { title: 'Stateless requests', description:_
- L43 — `{{matter|matter}}`  · _icity and broad compatibility matter' ], codeExample: { langua_

**`src/lib/data/protocols/rtmp.ts`** — 3 term(s)
- L47 — `{{latency|latency}}`  · _-server transmission', 'Low-latency live broadcasts and gaming st_
- L19 — `{{handshake|handshake}}`  · _ItWorks: [ { title: 'TCP handshake + RTMP handshake', descrip_
- L69 — `{{hop|hop}}`  · _\|RTMP]] is the standard first hop for live streaming — from enc_

**`src/lib/data/protocols/rtp.ts`** — 3 term(s)
- L155 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'No connection setup (UDP)._
- L155 — `{{jitter|jitter}}`  · _typically 50-300ms including jitter buffering.', throughput:_
- L157 — `{{codec|codec}}`  · _, throughput: 'Adaptive: codec and bitrate adjust based on R_

**`src/lib/data/protocols/sctp.ts`** — 4 term(s)
- L147 — `{{latency|latency}}`  · _} ] }, performance: { latency: '2 RTT for connection setup_
- L19 — `{{handshake|handshake}}`  · _Works: [ { title: '4-way handshake', description: "[[sctp_
- L40 — `{{signaling|signaling}}`  · _} ], useCases: [ 'Telecom signaling (SS7 over [[ip\|IP]], Diameter_
- L40 — `{{diameter|Diameter}}`  · _ignaling (SS7 over [[ip\|IP]], Diameter)', '4G/5G mobile network in_

**`src/lib/data/protocols/sdp.ts`** — 3 term(s)
- L177 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'SDP itself adds no latency_
- L177 — `{{signaling|signaling}}`  · _no latency — exchanged during signaling, before media flows.', thro_
- L189 — `{{cisco|Cisco}}`  · _Prototype.jpg', alt: 'Early Cisco TelePresence CTS-3000 prototy_

**`src/lib/data/protocols/sip.ts`** — 2 term(s)
- L167 — `{{bandwidth|bandwidth}}`  · _; the media (RTP) carries the bandwidth load', overhead: 'Text-base_
- L166 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Call setup: 1-3 seconds (IN_

**`src/lib/data/protocols/smtp.ts`** — 2 term(s)
- L146 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Seconds to minutes (store a_
- L11 — `{{hop|hop}}`  · _internet — store and forward, hop by hop.', overview: `[[smtp\|_

**`src/lib/data/protocols/soap.ts`** — 2 term(s)
- L127 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Same as HTTP — one reque_
- L128 — `{{request-response|request-response}}`  · _tency: 'Same as HTTP — one request-response round trip. XML parsing adds_

**`src/lib/data/protocols/sse.ts`** — 1 term(s)
- L117 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Sub-second (persistent conn_

**`src/lib/data/protocols/ssh.ts`** — 3 term(s)
- L175 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1-2 RTTs for connection + k_
- L176 — `{{encryption|encryption}}`  · _, throughput: 'Hardware AES encryption; limited mainly by the networ_
- L187 — `{{payload|payload}}`  · _acket length, padding length, payload, padding, and MAC fields',_

**`src/lib/data/protocols/stomp.ts`** — 2 term(s)
- L173 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Similar to the underlying b_
- L184 — `{{broker|message broker}}`  · _337%29.jpg', alt: 'RabbitMQ message broker presentation at a developer c_

**`src/lib/data/protocols/tcp.ts`** — 11 term(s)
- L157 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 RTT for TCP handshake_
- L111 — `{{handshake|Handshake}}`  · _{ title: 'Three-Way Handshake', code: `Client → Serve_
- L111 — `{{three-way-handshake|Three-Way Handshake}}`  · _tions: [ { title: 'Three-Way Handshake', code: `Client → Serve_
- L277 — `{{ephemeral-port|Ephemeral port}}`  · _apps.' }, { title: 'Ephemeral port exhaustion', text: 'On a_
- L227 — `{{cubic|CUBIC}}`  · _g: 'Linux kernel', scale: 'CUBIC default since 2.6.19', des_
- L184 — `{{time-wait|TIME_WAIT}}`  · _CLOSED through ESTABLISHED to TIME_WAIT', caption: 'The [[tcp\|TC_
- L273 — `{{delayed-ack|Delayed ACK}}`  · _s: [ { title: 'Nagle + Delayed ACK = 200ms latency', text: '_
- L232 — `{{google|Google}}`  · _e) run it.' }, { org: 'Google', scale: 'BBR for google.c_
- L244 — `{{apple|Apple}}`  · _ent paths.' }, { org: 'Apple', scale: 'iOS / macOS defa_
- L238 — `{{meta|Meta}}`  · _}\'s edge.' }, { org: 'Meta', scale: '>50% of traffic_
- L193 — `{{linux|Linux}}`  · _date: '2024-01', title: 'Linux 6.7 ships native TCP-AO (RFC_

**`src/lib/data/protocols/tls.ts`** — 8 term(s)
- L170 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'TLS 1.3: 1 RTT for new conn_
- L194 — `{{handshake|handshake}}`  · _e diagram of the full TLS 1.3 handshake showing ClientHello, ServerHe_
- L44 — `{{encryption|encryption}}`  · _API communication', 'Email encryption (SMTPS, IMAPS)', '{{vpn\|VPN_
- L26 — `{{certificate|Certificate}}`  · _{ title: 'ServerHello + Certificate', description: 'Server_
- L223 — `{{ech|ECH (Encrypted Client Hello)}}`  · _date: '2024-09', title: 'ECH (Encrypted Client Hello) progresses', description:_
- L231 — `{{cloudflare|Cloudflare}}`  · _ldDeployments: [ { org: 'Cloudflare', scale: '100% of HTTPS ed_
- L243 — `{{google|Google}}`  · _in iOS 26.' }, { org: 'Google Chrome', scale: 'Chrome 12_
- L237 — `{{apple|Apple}}`  · _udflare}}.' }, { org: 'Apple', scale: 'iOS 26 / macOS 1_

**`src/lib/data/protocols/udp.ts`** — 9 term(s)
- L152 — `{{arpanet|ARPANET}}`  · _.svg.png', alt: 'Map of the ARPANET in 1974, showing interconnect_
- L141 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Zero connection setup; sing_
- L19 — `{{handshake|handshake}}`  · _wItWorks: [ { title: 'No handshake', description: 'Unlike_
- L142 — `{{congestion-control|congestion control}}`  · _-response', throughput: 'No congestion control — can send as fast as the net_
- L141 — `{{request-response|request-response}}`  · _nection setup; single RTT for request-response', throughput: 'No congestio_
- L222 — `{{fragmentation|Fragmentation}}`  · _own.' }, { title: 'Fragmentation = unreliable delivery', t_
- L176 — `{{google|Google}}`  · _e: '~14 trillion queries/day (Google 8.8.8.8 alone)', descripti_
- L194 — `{{meta|Meta}}`  · _0% of Chrome traffic, >75% of Meta', description: 'The la_
- L167 — `{{linux|Linux}}`  · _{ date: '2025', title: 'Linux io_uring + UDP zero-copy',_

**`src/lib/data/protocols/uwb.ts`** — 6 term(s)
- L270 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Single DS-TWR ranging ro_
- L436 — `{{cipher-suite|cipher suite}}`  · _}, { title: 'STS / cipher suite — turn it on, and watch the r_
- L40 — `{{ccc-digital-key|CCC Digital Key}}`  · _ed form." }, { title: 'CCC Digital Key 3.0 — the canonical UWB unloc_
- L343 — `{{aliro|Aliro}}`  · _date: '2026-02', title: 'Aliro 1.0 finalised — "Matter for d_
- L343 — `{{matter|Matter}}`  · _itle: 'Aliro 1.0 finalised — "Matter for door locks" with UWB',_
- L56 — `{{apple|Apple}}`  · _ing with cm-class direction — Apple AirTag, Samsung SmartTag+, Fi_

**`src/lib/data/protocols/webrtc.ts`** — 5 term(s)
- L156 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Connection setup: 2-5 secon_
- L29 — `{{handshake|handshake}}`  · _er.' }, { title: 'DTLS handshake', description: 'Once a_
- L19 — `{{signaling|Signaling}}`  · _howItWorks: [ { title: 'Signaling', description: 'Peers_
- L24 — `{{ice-candidate|ICE candidate}}`  · _re how).' }, { title: 'ICE candidate gathering', description:_
- L40 — `{{google|Google}}`  · _ses: [ 'Video conferencing (Google Meet, Zoom web client)', 'V_

**`src/lib/data/protocols/websockets.ts`** — 4 term(s)
- L112 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 HTTP round trip for up_
- L100 — `{{handshake|Handshake}}`  · _{ title: 'Upgrade Handshake', code: `GET /chat HTTP_
- L124 — `{{full-duplex|full-duplex}}`  · _upgrade handshake followed by full-duplex bidirectional communication',_
- L42 — `{{google|Google}}`  · _s', 'Collaborative editing (Google Docs, Figma)', 'Multiplayer_

**`src/lib/data/protocols/wifi.ts`** — 7 term(s)
- L164 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1-5 ms typical for local ac_
- L32 — `{{handshake|handshake}}`  · _s.' }, { title: '4-way handshake (WPA2/WPA3)', description:_
- L168 — `{{encryption|encryption}}`  · _flags (vs 14 for Ethernet) + encryption overhead (CCMP adds 16 bytes)_
- L168 — `{{airtime|airtime}}`  · _s); acknowledgment frames add airtime cost' }, connections: ['eth_
- L32 — `{{wpa3|WPA3}}`  · _title: '4-way handshake (WPA2/WPA3)', description: 'After_
- L32 — `{{wpa2|WPA2}}`  · _{ title: '4-way handshake (WPA2/WPA3)', description: '_
- L141 — `{{beacon-frame|Beacon Frame}}`  · _}, { title: 'Beacon Frame', code: `802.11 Beacon_

**`src/lib/data/protocols/wireguard.ts`** — 6 term(s)
- L211 — `{{latency|latency}}`  · _} ] }, performance: { latency: '1 round trip for handsha_
- L25 — `{{handshake|Handshake}}`  · _plane).' }, { title: 'Handshake Initiation (148 bytes, type=1_
- L20 — `{{public-key|public key}}`  · _: [ { title: 'Identity = public key', description: 'Each {_
- L333 — `{{routing-table|routing table}}`  · _title: 'AllowedIPs is your routing table AND your ACL', text: 'A s_
- L52 — `{{cloudflare|Cloudflare}}`  · _sumer "global VPN" services — Cloudflare WARP, Mullvad, NordVPN NordLy_
- L212 — `{{linux|Linux}}`  · _ding-plane overhead in-kernel Linux; ~3–5 ms with BoringTun (user_

**`src/lib/data/protocols/xmpp.ts`** — 2 term(s)
- L195 — `{{latency|latency}}`  · _} ] }, performance: { latency: 'Near-instant over persis_
- L46 — `{{cisco|Cisco}}`  · _Enterprise instant messaging (Cisco Jabber, Zoom Chat backend)',_

**`src/lib/data/protocols/zigbee.ts`** — 7 term(s)
- L234 — `{{latency|latency}}`  · _} ] }, performance: { latency: '~30–80 ms one-hop ZCL co_
- L235 — `{{hop|hop}}`  · _latency: '~30–80 ms one-hop ZCL command on idle networks;_
- L10 — `{{ieee-802-15-4|IEEE 802.15.4}}`  · _rfc: 'Zigbee PRO 2023 (R23) / IEEE 802.15.4-2020', oneLiner: '{{ieee-8_
- L40 — `{{trust-center|Trust Center}}`  · _er 2023." }, { title: 'Trust Center + install codes — securing th_
- L45 — `{{matter|Matter}}`  · _ntirely." }, { title: 'Matter bridge — how Zigbee gets to t_
- L277 — `{{thread|Thread}}`  · _M3 ships globally — Zigbee + Thread + Matter in one box', desc_
- L368 — `{{apple|Apple}}`  · _title: 'Philips Hue\'s 2012 Apple Store launch never said "Zigb_

