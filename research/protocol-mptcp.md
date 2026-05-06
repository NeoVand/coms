---
prompt_source: deep-research-prompts.txt:2669-2845 (PROTOCOL · MPTCP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/ee638cfb-3562-461a-b450-1db4ddbad8dd
research_mode: claude.ai Research
---

# Multipath TCP (MPTCP) — A Deep Educational Reference (May 2026)

> **Audience note.** This document is written for working engineers who can read RFCs but need the why behind each design choice. Every term is defined on first use. Where a fact has no verifiable source we mark it `[needs source]`. Today's date is 2026-05-05; all "recent" claims are anchored to that date.

---

## 1. Prerequisites and glossary

MPTCP is an extension to TCP that lives at OSI Layer 4 (Transport). Before it makes sense, you need a working mental model of these concepts:

- **OSI / TCP-IP layering.** A layered model in which each layer adds its own header to a payload. MPTCP sits at the Transport layer between IP (Layer 3) and the application (Layer 7). Authoritative explainer: [https://www.rfc-editor.org/rfc/rfc1122.html](https://www.rfc-editor.org/rfc/rfc1122.html) (Host Requirements).
- **TCP (Transmission Control Protocol).** A connection-oriented, byte-stream, reliable Transport-layer protocol identified by IP protocol number 6, originally specified in RFC 793 and updated by RFC 9293 (the modern "roadmap" RFC). Provides ordered delivery, flow control, and congestion control between two endpoints. Source: [https://www.rfc-editor.org/rfc/rfc9293.html](https://www.rfc-editor.org/rfc/rfc9293.html).
- **Socket.** The OS-level abstraction representing one end of a network connection — a (protocol, IP, port) tuple plus kernel buffers. On Linux you create one with `socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)`; for MPTCP you pass `IPPROTO_MPTCP` (=262). Source: [https://docs.kernel.org/networking/mptcp.html](https://docs.kernel.org/networking/mptcp.html). [The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)
- **Header.** A fixed/variable-size record prepended to a payload describing how to interpret it. The TCP header is 20 bytes baseline plus optional **TCP options** up to 40 bytes. MPTCP's entire wire format is encoded inside those 40 bytes of options — that constraint explains nearly every design quirk.
- **Checksum.** A short value (TCP uses a 16-bit one's-complement sum over a pseudo-header + payload) that detects accidental corruption. MPTCP optionally adds a **DSS checksum** to detect middlebox payload tampering at the data-stream level. Source: [https://datatracker.ietf.org/doc/html/rfc8684#section-3.3](https://datatracker.ietf.org/doc/html/rfc8684#section-3.3).
- **Three-way handshake.** SYN → SYN/ACK → ACK, the message exchange that establishes a TCP connection and synchronises sequence numbers. Source: [https://www.rfc-editor.org/rfc/rfc9293.html](https://www.rfc-editor.org/rfc/rfc9293.html).
- **Stream.** A logical, ordered sequence of bytes. TCP delivers exactly one stream per connection. MPTCP also delivers exactly one stream — but it is *carried* over multiple TCP **subflows**.
- **Frame, datagram, packet, segment.** A *frame* is a Layer-2 unit (Ethernet); a *packet* is Layer-3 (IP); a *segment* is the Layer-4 TCP unit; a *datagram* is the Layer-4 UDP/IP unit. QUIC's protocol-data unit is also called a *packet*.
- **Port.** A 16-bit integer in the TCP/UDP header demultiplexing flows on the same IP. MPTCP joins are scoped by the (token, address-id) pair, *not* by ports — that's why MPTCP works through NAT.
- **Sequence number / ACK.** TCP labels each byte with a 32-bit sequence number; the receiver's ACK number is the next byte expected. MPTCP introduces a parallel **Data Sequence Number (DSN)** of up to 64 bits at the *connection* level, while each subflow keeps its own normal TCP sequence space.
- **Window / congestion control.** *Receive window* is buffer the receiver advertises; *congestion window* (`cwnd`) is the sender's estimate of what the network can absorb. **Congestion control** is the algorithm that adjusts `cwnd` (e.g., Reno, CUBIC, BBR). MPTCP needs *coupled* congestion control across subflows; see Section 3 below. Reference: RFC 5681 [https://www.rfc-editor.org/rfc/rfc5681](https://www.rfc-editor.org/rfc/rfc5681).
- **TLS and the TLS handshake.** Transport Layer Security (RFC 8446 for TLS 1.3) is an application-layer-ish protocol that runs *on top of* a reliable byte-stream (TCP or MPTCP) and provides authenticated encryption. The TLS 1.3 handshake completes in 1-RTT (or 0-RTT with PSKs). Reference: [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446).
- **TCP options.** Up to 40 bytes after the fixed TCP header, structured as `<Kind, Length, Value>`. MPTCP claims **Kind = 30** (decimal) and uses a 4-bit **Subtype** field to multiplex its own sub-options. Source: [https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml).
- **Middlebox.** Any in-network device that touches packets beyond pure forwarding — NATs, firewalls, transparent proxies, deep-packet-inspection (DPI) boxes, load balancers. Middleboxes are the single biggest constraint on MPTCP design.
- **HMAC-SHA256 / SHA-1.** Hash-based Message Authentication Codes. MPTCP v1 uses HMAC-SHA256 (output 256 bits, RFC 4868); v0 used HMAC-SHA1. Reference: [https://www.rfc-editor.org/rfc/rfc4868](https://www.rfc-editor.org/rfc/rfc4868).
- **Subflow.** In MPTCP, a regular TCP connection between one (IP, port) pair on each host that is bound into the parent MPTCP connection.
- **Path manager / packet scheduler.** Two MPTCP-internal components. The path manager decides *which subflows exist* (open/close, advertise addresses); the scheduler decides *which subflow gets the next data segment*. Source: [https://docs.kernel.org/networking/mptcp.html](https://docs.kernel.org/networking/mptcp.html). [The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)
- **DSS.** Data Sequence Signal — the MPTCP option carrying connection-level Data ACK and the per-segment Data Sequence Mapping that ties subflow bytes back to the connection-level stream. Subtype 0x2 in RFC 8684. [Wikipedia](https://en.wikipedia.org/wiki/Multipath_TCP)[IANA](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml)
- **ECMP (Equal-Cost Multi-Path).** A network-layer technique where routers spread flows over multiple equal-cost next hops, typically by hashing the 5-tuple. MPTCP exploits ECMP by varying ports across subflows. Reference: [https://www.rfc-editor.org/rfc/rfc2992](https://www.rfc-editor.org/rfc/rfc2992).
- **QUIC.** A UDP-based, encrypted-by-default Layer-4 protocol that subsumes TCP+TLS+HTTP/2 framing. Standardised in RFC 9000 (transport), RFC 9001 (TLS mapping), RFC 9002 (loss/CC). Reference: [https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000).
- **SCTP / CMT-SCTP.** Stream Control Transmission Protocol (RFC 4960), a multi-stream transport with built-in multihoming. CMT-SCTP is its concurrent multipath transfer extension. Reference: [https://www.rfc-editor.org/rfc/rfc9260](https://www.rfc-editor.org/rfc/rfc9260).
- **3GPP ATSSS.** Access Traffic Steering, Switching, Splitting — the 5G core feature (3GPP Release 16+) that uses MPTCP between the user equipment and the User Plane Function to combine 3GPP and non-3GPP (Wi-Fi) access. Source: [https://www.cablelabs.com/blog/5g-link-aggregation-mptcp](https://www.cablelabs.com/blog/5g-link-aggregation-mptcp). [CableLabs](https://www.cablelabs.com/blog/5g-link-aggregation-mptcp)

---

## 2. History and story

### Origins (2008–2011): Cambridge / UCL / UCLouvain

MPTCP grew out of two interlocking research lines: Mark Handley's group at **University College London** (then including PhD student Costin Raiciu) working on resource pooling and multipath congestion control, and Olivier Bonaventure's **IP Networking Lab at UCLouvain** (Université catholique de Louvain, Belgium), where Sébastien Barré had been developing kernel multihoming code since 2009 based on his earlier shim6 implementation. The MPTCP IETF working group was chartered in 2009. Source for the Barré timeline: [https://multipath-tcp.org/](https://multipath-tcp.org/). [Multipath-tcp](https://multipath-tcp.org/)

The seminal NSDI 2012 paper *"How Hard Can It Be? Designing and Implementing a Deployable Multipath TCP"* — Raiciu, Paasch, Barré, Ford, Honda, Duchene, Bonaventure, Handley — is the canonical retrospective on the design constraints. The first sentence captures the central tension: every TCP extension lives or dies by middlebox tolerance. Source: [https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/raiciu](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/raiciu).

Honda et al.'s IMC 2011 paper *"Is It Still Possible to Extend TCP?"* measured middlebox interference at scale and convinced the working group that any new TCP option had to gracefully **fall back** to plain TCP. That paper is, in effect, MPTCP's design brief. Source: [https://dl.acm.org/doi/10.1145/2535828.2535830](https://dl.acm.org/doi/10.1145/2535828.2535830) (Hesmans et al. follow-up *"Are TCP Extensions Middlebox-proof?"*, 2013, makes the same point with MPTCP-specific data).

### RFC milestones

| RFC | Year | Status | Role |
|---|---|---|---|
| **RFC 6182** | March 2011 | Informational | Architectural goals: backward compatibility, app transparency, "do no harm" fairness |
| **RFC 6356** | October 2011 | Experimental | LIA — the original coupled congestion control |
| **RFC 6824** (MPTCP v0) | January 2013 | Experimental | First wire format; HMAC-SHA1 |
| **RFC 6897** | March 2013 | Informational | Application-interface considerations |
| **RFC 7430** | July 2015 | Informational | Residual security threats analysis |
| **RFC 8041** | January 2017 | Informational | Use cases & operational experience |
| **RFC 8684** (MPTCP v1) | March 2020 | Standards Track | **Current canonical specification.** Obsoletes RFC 6824. [RFC Editor](https://www.rfc-editor.org/info/rfc8684) [RFC Editor](https://www.rfc-editor.org/rfc/rfc8684.xml)HMAC-SHA256, [IETF](https://datatracker.ietf.org/doc/rfc8684/) better SYN-cookie support, [GitHub](https://github.com/multipath-tcp/mptcp_net-next/releases) and the DSS-checksum changes that came out of deployment. |
| **RFC 8803** | July 2020 | Experimental | 0-RTT TCP Convert Protocol — the network-assisted MPTCP proxy used by 5G ATSSS |

Sources: [https://datatracker.ietf.org/doc/html/rfc8684](https://datatracker.ietf.org/doc/html/rfc8684); [https://www.rfc-editor.org/rfc/rfc8803.html](https://www.rfc-editor.org/rfc/rfc8803.html); [https://www.rfc-editor.org/rfc/rfc6182.html](https://www.rfc-editor.org/rfc/rfc6182.html); [https://www.rfc-editor.org/rfc/rfc6356.html](https://www.rfc-editor.org/rfc/rfc6356.html); [https://datatracker.ietf.org/doc/rfc7430/](https://datatracker.ietf.org/doc/rfc7430/).

The single most important spec change (v0 → v1): in v1 the **initiator's key is sent in the 3rd ACK** rather than the SYN, so the handshake survives SYN-cookie servers; HMAC moved from SHA-1 to HMAC-SHA256; checksum behaviour for DSS was clarified; and version negotiation was added. Source: [https://datatracker.ietf.org/doc/html/rfc8684#section-1.5](https://datatracker.ietf.org/doc/html/rfc8684#section-1.5) and the LWN summary at [https://lwn.net/Articles/810296/](https://lwn.net/Articles/810296/). [GitHub](https://github.com/multipath-tcp/mptcp_net-next/releases)

### The Apple Siri deployment story

In **September 2013**, days after RFC 6824, Olivier Bonaventure noticed in a packet trace that iOS 7 was emitting MP_CAPABLE on connections to Apple servers — and Apple had said nothing publicly. Apple was using MPTCP to make Siri robust to Wi-Fi-to-cellular handover. This became the first large-scale commercial deployment of MPTCP and the most-cited deployment story in the protocol's history. Sources: [http://blog.multipath-tcp.org/blog/html/2018/12/15/apple_and_multipath_tcp.html](http://blog.multipath-tcp.org/blog/html/2018/12/15/apple_and_multipath_tcp.html); [https://www.networkworld.com/article/2170068/apple-ios-7-surprises-as-first-with-new-multipath-tcp-connections.html](https://www.networkworld.com/article/2170068/apple-ios-7-surprises-as-first-with-new-multipath-tcp-connections.html). [Network World](https://www.networkworld.com/article/2170068/apple-ios-7-surprises-as-first-with-new-multipath-tcp-connections.html)

At WWDC 2017 Apple revealed concrete numbers: **20% faster Siri (95th percentile) and a 5× reduction in network failures**, and opened the API in iOS 11. Source: [https://www.tessares.net/apples-mptcp-story-so-far/](https://www.tessares.net/apples-mptcp-story-so-far/). At WWDC 2020 Apple reported **13% fewer Apple Music stalls and 22% shorter stall duration** after enabling MPTCP for Music in iOS 13. Source: [https://developer.apple.com/videos/play/wwdc2020/10111/](https://developer.apple.com/videos/play/wwdc2020/10111/). [Internet Society + 3](https://www.internetsociety.org/blog/2017/06/mptcp-and-tls-1-3-big-announcements-from-apple/)

### Korea Telecom GiGA LTE (2015)

In **June 2015** Korea Telecom (KT) announced the world's first commercial gigabit mobile service, **GiGA LTE**, combining 3-band carrier-aggregation LTE with KT's Wi-Fi via an MPTCP SOCKS proxy. Initial handsets were the Samsung Galaxy S6 / S6 Edge; peak rate was advertised at 1.17 Gbit/s. SungHoon Seo presented the deployment at IETF 93 in Prague; it was using the UCLouvain Linux MPTCP implementation. Sources: [https://www.netmanias.com/en/post/blog/7742/kt-korea-ict-service-lte-mptcp-samsung-wi-fi/kt-world-s-first-commercial-wireless-1-gbps-giga-lte-3-band-ca-giga-wifi](https://www.netmanias.com/en/post/blog/7742/kt-korea-ict-service-lte-mptcp-samsung-wi-fi/kt-world-s-first-commercial-wireless-1-gbps-giga-lte-3-band-ca-giga-wifi); [http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html](http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html). [Multipath-tcp](https://multipath-tcp.org/)[SamMobile](https://www.sammobile.com/2015/06/16/samsung-kt-announce-5g-giga-lte-available-for-s6-and-s6-edge-today/)

### The Linux mainline saga (2009–2020)

For a decade the only serious Linux MPTCP implementation was Sébastien Barré's out-of-tree fork, hosted at **multipath-tcp.org** and maintained at UCLouvain (later by Tessares engineers including Christoph Paasch and Matthieu Baerts). It worked, shipped on the Galaxy S6 and KT, and powered Tessares' commercial proxy — but Linus Torvalds and David Miller wouldn't merge it because it intrusively touched the existing TCP fast path.

At Linux Plumbers Conference 2019, Matthieu Baerts and Mat Martineau presented the upstreaming plan: build MPTCP as a *separate* protocol family (`IPPROTO_MPTCP = 262`) using SKB extensions, ULP, and the TCP-ULP infrastructure, supporting only the cleaner RFC 6824bis (which became RFC 8684). David Miller agreed; basic v1 support landed in **Linux 5.6 (March 2020)**. Sources: [https://lwn.net/Articles/800501/](https://lwn.net/Articles/800501/); [https://lwn.net/Articles/810296/](https://lwn.net/Articles/810296/). [Multipath-tcp](https://multipath-tcp.org/)

By 2024 the multipath-tcp.org out-of-tree fork was officially **deprecated**. The GitHub repo banner reads "⚠️ Deprecated — use mptcp_net-next instead", the last stable release was v0.96 (Feb 2023), and kernel v5.4 was the last branch supported. Modern documentation, tests, and commercial deployments are all on the upstream tree, coordinated at [https://www.mptcp.dev](https://www.mptcp.dev). Sources: [https://github.com/multipath-tcp/mptcp](https://github.com/multipath-tcp/mptcp); [https://multipath-tcp.org/](https://multipath-tcp.org/). [GitHub +2 + 4](https://github.com/multipath-tcp/mptcp)

### What changed in the last 24 months (2024–2026)

- **MPTCP working group was closed** as having fulfilled its charter; ongoing maintenance moved to TCPM (TCP Maintenance and Minor Extensions). Source: [https://datatracker.ietf.org/wg/mptcp/about/](https://datatracker.ietf.org/wg/mptcp/about/). [IETF Datatracker](https://datatracker.ietf.org/wg/mptcp/about/)[IETF Datatracker](https://datatracker.ietf.org/wg/mptcp/charter/)
- **Active 2025 TCPM drafts** include `draft-baerts-tcpm-mptcpdss` (DSS mappings longer than 64 KB, July 2025) and `draft-baerts-tcpm-mptcpext` (external keys for sub-flow authentication using TLS or SSH keys, July 2025) — both authored by Matthieu Baerts and Olivier Bonaventure. Sources: [https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html](https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html); [https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/). [Ipnetworkinglab](https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html)[IETF](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/)
- **Multipath QUIC is on its way to RFC.** `draft-ietf-quic-multipath-21` was published 17 March 2026 (intended status: Standards Track) with editors Yanmei Liu (Alibaba), Yunfei Ma (Uber), Quentin De Coninck (UMons), Olivier Bonaventure (UCLouvain & WELRI), Christian Huitema, Mirja Kühlewind (Ericsson). It is in the QUIC WG, not TCPM. Source: [https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath)[IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath)
- **Linux MPTCP CVEs** continued to surface through 2024–2025 (see Section 6).
- **Linux 6.15** deprecated the older `pm_type` sysctl in favour of `path_manager`. Source: [https://docs.kernel.org/networking/mptcp-sysctl.html](https://docs.kernel.org/networking/mptcp-sysctl.html). [The Linux Kernel](https://docs.kernel.org/networking/mptcp-sysctl.html)
- **Tessares** (the UCLouvain spin-off) was originally founded in 2015 with Proximus as a co-investor; Sébastien Barré moved from Tessares to Proximus in an operational role, and as of 2026 the Tessares brand is operationally integrated with Proximus (the Belgian incumbent telco that originally co-funded it). Tessares is *not* a recent acquisition — Proximus has been a shareholder since 2015. Sources: [https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html](https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html); [https://www.linkedin.com/in/sebastienbarre193348/](https://www.linkedin.com/in/sebastienbarre193348/). [La Libre + 3](https://www.lalibre.be/economie/entreprises-startup/2022/05/30/en-signant-avec-le-geant-des-telecoms-bt-la-spin-off-belge-tessares-entre-dans-la-cour-des-grands-KMXTIV4FDRC63JUZL3AY35AEVE/)

### Design alternatives that didn't win

- **Application-layer multipath** (load-balancing in the app over several TCP connections). Apps then have to do their own ordering, retransmission strategy, and congestion fairness — none of which they are equipped to do well.
- **A new IP protocol number** (the SCTP route). RFC 6182 explicitly rejected this as undeployable through middleboxes; SCTP itself is the cautionary tale (most middleboxes drop it). Source: [https://www.rfc-editor.org/rfc/rfc6182.html](https://www.rfc-editor.org/rfc/rfc6182.html).
- **MPTCP v0 MP_CAPABLE-in-SYN.** Replaced in v1 because it broke against SYN-cookie servers.
- **CMT-SCTP.** Technically elegant; commercially nowhere because middleboxes block IP protocol 132.

---

## 3. How it actually works

### 3.1 The big picture

Server AppServer MPTCPLTE pathWi-Fi pathClient MPTCPClient AppServer AppServer MPTCPLTE pathWi-Fi pathClient MPTCPClient App#mermaid-rg6{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rg6 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rg6 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rg6 .error-icon{fill:#CC785C;}#mermaid-rg6 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rg6 .edge-thickness-normal{stroke-width:1px;}#mermaid-rg6 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rg6 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rg6 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rg6 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rg6 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rg6 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rg6 .marker.cross{stroke:#A1A1A1;}#mermaid-rg6 svg{font-family:inherit;font-size:16px;}#mermaid-rg6 p{margin:0;}#mermaid-rg6 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rg6 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg6 .actor-line{stroke:#A1A1A1;}#mermaid-rg6 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rg6 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rg6 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rg6 .sequenceNumber{fill:#5e5e5e;}#mermaid-rg6 #sequencenumber{fill:#E5E5E5;}#mermaid-rg6 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rg6 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rg6 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rg6 .labelText,#mermaid-rg6 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg6 .loopText,#mermaid-rg6 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg6 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rg6 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rg6 .noteText,#mermaid-rg6 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rg6 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rg6 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rg6 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rg6 .actorPopupMenu{position:absolute;}#mermaid-rg6 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rg6 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rg6 .actor-man circle,#mermaid-rg6 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rg6 :root{--mermaid-font-family:inherit;}Token = SHA256(Key)[0..31]IDSN = SHA256(Key)[32..95]New subflow joinedconnect(IPPROTO_MPTCP)1SYN + MP_CAPABLE(Key-A)2SYN + MP_CAPABLE3SYN/ACK + MP_CAPABLE(Key-B)4ACK + MP_CAPABLE(Key-A, Key-B)5write(payload)6TCP data + DSS(map: SSN→DSN)7SYN + MP_JOIN(Token-B, R-A, Addr-ID)8SYN/ACK + MP_JOIN(HMAC-B, R-B)9ACK + MP_JOIN(HMAC-A)10TCP data + DSS11read(payload) — single ordered stream12

### 3.2 The TCP option layout

All MPTCP messages travel as TCP options with **Kind = 30** and a 4-bit **Subtype** (the high nibble of the byte after Length). The IANA registry of subtypes is canonical:

| Subtype | Symbol | Purpose | RFC 8684 § |
|---|---|---|---|
| 0x0 | MP_CAPABLE | Negotiate MPTCP, exchange keys | 3.1 |
| 0x1 | MP_JOIN | Add a subflow | 3.2 |
| 0x2 | DSS | Data Sequence Signal (DSN, Data ACK, mapping) | 3.3 |
| 0x3 | ADD_ADDR | Advertise an additional address | 3.4.1 |
| 0x4 | REMOVE_ADDR | Withdraw an address | 3.4.2 |
| 0x5 | MP_PRIO | Change subflow priority (e.g., backup) | 3.3.8 |
| 0x6 | MP_FAIL | Fall back to plain TCP | 3.7 |
| 0x7 | MP_FASTCLOSE | Force-close the MPTCP session | 3.5 |
| 0x8 | MP_TCPRST | Reason-coded subflow RST | 3.6 |
| 0x9–0xe | Unassigned | — | — [IANA](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml) |
| 0xf | Reserved for Private Use | — | — [IANA](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml) |

Source: [https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml).

### 3.3 MP_CAPABLE in detail

The first SYN carries an MP_CAPABLE (12 bytes in v1). Layout (bit-level):

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+---------------+---------------+-------+-------+---------------+
|     Kind=30   |    Length=12  |Sub=0x0|Version|A|B|C|D|E|F|G|H|
+---------------+---------------+-------+-------+---------------+
|              Sender's Key (64 bits, in SYN/ACK and ACK)        |
+---------------------------------------------------------------+
```

Flags: **A** = checksum required, **B** = extensibility, **C** = "do not advertise additional subflows from this address" (used by clients behind strict NAT or L4 LBs), and **H** indicates HMAC-SHA256 (the only crypto algorithm currently assigned). In v1 the *initiator's* 64-bit key is **not** in the SYN — it is sent in the third ACK; the responder's key is in the SYN/ACK. From those two keys both peers derive: [IETF](https://datatracker.ietf.org/doc/rfc8684/)[IETF](https://datatracker.ietf.org/doc/rfc8684/)

- **Token-A = SHA-256(Key-A) truncated to 32 bits** (used in MP_JOIN to identify the connection)
- **Initial DSN-A = SHA-256(Key-A) truncated to the lower 64 bits**

Source for layout and HMAC behaviour: [https://datatracker.ietf.org/doc/html/rfc8684](https://datatracker.ietf.org/doc/html/rfc8684).

### 3.4 MP_JOIN — security-critical

Joining a subflow uses MP_JOIN over a fresh 3-way handshake. Three forms: [IETF](https://datatracker.ietf.org/doc/rfc8684/)

```
SYN MP_JOIN (12 bytes):
  [Kind=30][Len=12][Sub=0x1|B-flag][AddrID][Receiver's Token (32)][Sender's RandomNonce-A (32)]

SYN/ACK MP_JOIN (16 bytes):
  [Kind=30][Len=16][Sub=0x1|B-flag][AddrID][Truncated HMAC-B (64 bits)][Sender's RandomNonce-B (32)]

ACK MP_JOIN (24 bytes):
  [Kind=30][Len=24][Sub=0x1|reserved][HMAC-A full (160 bits)]
```

The HMAC is computed as `HMAC-SHA256(Key-A || Key-B, Nonce-A || Nonce-B)` (truncated). Random nonces stop replay. Because the responder's full HMAC verification depends on both keys, an off-path attacker cannot forge a valid MP_JOIN. Source: [https://datatracker.ietf.org/doc/html/rfc8684#section-3.2](https://datatracker.ietf.org/doc/html/rfc8684#section-3.2); security analysis in RFC 7430 [https://www.rfc-editor.org/rfc/rfc7430.html](https://www.rfc-editor.org/rfc/rfc7430.html). [Free5gc](https://free5gc.org/blog/20231004/20231004/)

### 3.5 DSS — the heart of MPTCP

Each MPTCP data segment carries a DSS option that contains some or all of:

- **Data ACK** (4 or 8 bytes): connection-level cumulative ack of the *DSN* stream [Wikipedia](https://en.wikipedia.org/wiki/Multipath_TCP)
- **Data Sequence Mapping**: tuple of `(DSN start, Subflow Sequence Number start, length)` mapping a contiguous run of subflow bytes to the DSN
- **DSS checksum** (16 bits, optional but on by default): one's-complement checksum over the mapped payload + a pseudo-header — detects payload mutation by middleboxes

Why two layers of sequence numbers? Because each subflow needs to look like ordinary TCP to middleboxes, but the application sees one stream — so MPTCP needs a separate, robust ordering scheme above the subflows.

### 3.6 Real-world byte trace (Linux upstream, MPTCP v1, loopback)

```
SYN     127.0.0.1.52854 > 127.0.0.1.12345
        [mss 65495, sackOK, TSval 4026038040 ecr 0, nop, wscale 7,
         mptcp capable v1]                           ← MP_CAPABLE (no key)

SYN-ACK 127.0.0.1.12345 > 127.0.0.1.52854
        [mss 65495, sackOK, TSval … ecr …, nop, wscale 7,
         mptcp capable v1 {0x45edb502d861e7b1}]      ← server key

ACK     127.0.0.1.52854 > 127.0.0.1.12345
        [nop, nop, TSval … ecr …,
         mptcp capable v1 {0xdbb760db1d55e07b,       ← client key
                            0x45edb502d861e7b1}]      ← echo server key
```

(Trace from kernel.org-hosted MPTCP docs: [https://mptcp-apps.github.io/mptcp-doc/mptcp-linux.html](https://mptcp-apps.github.io/mptcp-doc/mptcp-linux.html).)

### 3.7 ADD_ADDR / REMOVE_ADDR / MP_PRIO

`ADD_ADDR` advertises an address the peer can join to. To prevent the trivial off-path hijack identified in RFC 7430, ADD_ADDR carries an HMAC over the address and the keys (added in v1). MP_PRIO toggles subflows between *active* and *backup* (e.g., iOS marks the cellular subflow as backup so it is only used when Wi-Fi degrades). MP_FAIL signals an unrecoverable DSN error and triggers fallback to TCP. MP_FASTCLOSE is the MPTCP analogue of TCP RST. MP_TCPRST is a reason-coded subflow-only RST that doesn't tear down the whole connection. [Multipath-tcp](http://blog.multipath-tcp.org/blog/html/2017/07/10/ios11_options.html)

Sources: [https://datatracker.ietf.org/doc/html/rfc8684#section-3.4](https://datatracker.ietf.org/doc/html/rfc8684#section-3.4); [https://www.rfc-editor.org/rfc/rfc7430.html](https://www.rfc-editor.org/rfc/rfc7430.html).

### 3.8 Path managers (what subflows exist)

- **Default in-kernel path manager** (Linux): one global policy, configured with `ip mptcp endpoint` / `ip mptcp limits`. Same rules across all sockets. [The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)[The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)
- **Userspace path manager**: a userspace daemon (`mptcpd` from Intel/Igalia) drives subflow creation/removal per-connection over Netlink. Source: [https://docs.kernel.org/networking/mptcp.html](https://docs.kernel.org/networking/mptcp.html). [The Linux Kernel +2](https://docs.kernel.org/networking/mptcp.html)

### 3.9 Schedulers (which subflow gets the next byte)

| Scheduler | Behaviour | Source |
|---|---|---|
| **Default (lowest-RTT)** | Fill subflow with smallest smoothed RTT until cwnd full, then next [Multipath-tcp](https://multipath-tcp.org/pmwiki.php/Users/ConfigureMPTCP) | mptcp.dev |
| **Round-robin** | Fixed N segments per subflow in turn [Multipath-tcp](https://multipath-tcp.org/pmwiki.php/Users/ConfigureMPTCP) — academic / debug | multipath-tcp.org |
| **Redundant** | Send each segment on every subflow — burns BW for lowest tail latency [Multipath-tcp](https://multipath-tcp.org/pmwiki.php/Users/ConfigureMPTCP) | RFC-style "ReMP TCP" |
| **BLEST** (Block-Estimation) | Predict head-of-line blocking on slow path and skip it. [ResearchGate](https://www.researchgate.net/publication/319946409_ECF_An_MPTCP_Path_Scheduler_to_Manage_Heterogeneous_Paths) Ferlin et al., [GitHub](https://github.com/multipath-tcp/mptcp/releases) IFIP Networking 2016 | [https://dl.ifip.org/db/conf/networking/networking2016/1570234725.pdf](https://dl.ifip.org/db/conf/networking/networking2016/1570234725.pdf) |
| **ECF** (Earliest Completion First) | Schedule on the path that minimises completion time — often best for heterogeneous paths | Lim et al., CoNEXT 2017 [https://dl.acm.org/doi/10.1145/3143361.3143376](https://dl.acm.org/doi/10.1145/3143361.3143376) |

The Linux upstream scheduler is selectable via the `net.mptcp.scheduler` sysctl and an eBPF scheduler hook. [The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)

### 3.10 Coupled congestion control

The "do no harm" principle (RFC 6182) requires that an MPTCP connection sharing a bottleneck with a single-path TCP not steal more than its fair share. Coupling algorithms link the cwnds across subflows.

| CC | RFC/draft | Idea | Source |
|---|---|---|---|
| **LIA** (Linked Increase) | RFC 6356 (Oct 2011) | Couple increase functions; semi-couple decrease [RFC Editor](https://www.rfc-editor.org/info/rfc6356)[RFC Editor](https://www.rfc-editor.org/rfc/rfc6356.html) | [https://www.rfc-editor.org/rfc/rfc6356.html](https://www.rfc-editor.org/rfc/rfc6356.html) |
| **OLIA** (Opportunistic LIA) | draft-khalili-mptcp-congestion-control | Pareto-optimal under stable loss; better congestion balancing [IETF](https://www.ietf.org/proceedings/86/slides/slides-86-mptcp-2.pdf) | EPFL slides cited above |
| **BALIA** (Balanced LIA) | draft-walid-mptcp-congestion-control | Tunable trade-off between TCP-friendliness and responsiveness [IETF](https://datatracker.ietf.org/doc/draft-walid-mptcp-congestion-control/01/) | [https://datatracker.ietf.org/doc/draft-walid-mptcp-congestion-control/](https://datatracker.ietf.org/doc/draft-walid-mptcp-congestion-control/) |
| **wVegas** | (Linux only) | Delay-based, congestion-balancing | Linux source |

> **Naming caveat:** the user's task brief mentions "BALIA RFC 8203" — that's incorrect. RFC 8203 is unrelated (BGP graceful shutdown). BALIA never reached RFC status; it remains an Internet-Draft (`draft-walid-mptcp-congestion-control-04`, last revision January 2016). LIA *is* RFC 6356.

---

## 4. Deep connections to other protocols

### 4.1 TCP

MPTCP **is** TCP plus options. Every subflow is a real, fully-spec-compliant TCP connection that any non-MPTCP middlebox sees as ordinary TCP. The trade-offs:

- Pro: deployable through NATs, firewalls, load balancers — falls back to TCP if any middlebox strips Kind=30.
- Con: MPTCP is bound by TCP's 40-byte option budget and ossified semantics; you can't fix things like head-of-line blocking *within* a subflow without leaving the TCP envelope.

### 4.2 TLS

TLS sits above MPTCP and sees *one* byte stream. This is intentional — applications don't need to know about subflows. **Critical security caveat from RFC 7430**: an on-path attacker present at the *initial* MP_CAPABLE handshake learns both keys and can hijack joins thereafter, because MPTCP's keys are exchanged in cleartext. TLS does not save you here, because TLS handshakes after MPTCP is established. Two emerging mitigations: [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc7430.html)

1. **MPTLS / "MPTCP with external keys"** (`draft-baerts-tcpm-mptcpext`, 2025): use TLS or SSH session keys to authenticate MP_JOIN, not the cleartext MPTCP keys. Source: [https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/). [IETF](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/)
2. **MPTCPsec** (academic): wrap MPTCP control options inside TLS records.

A separate gotcha: as of 2026 Linux MPTCP is **not compatible with KTLS** (kernel TLS). If you turn on KTLS you lose MPTCP. Source: [https://www.mptcp.dev/faq.html](https://www.mptcp.dev/faq.html). [Mptcp](https://www.mptcp.dev/faq.html)

### 4.3 QUIC and Multipath QUIC

QUIC (RFC 9000, 2021) replaces TCP+TLS with a UDP-based, encrypted, stream-multiplexed transport. Its "connection ID" is intentionally decoupled from IP/port — which means QUIC was *born* with native NAT-rebinding and migration support, half-way to multipath.

**Multipath QUIC** as of May 2026 is `draft-ietf-quic-multipath-21` (17 March 2026), Standards Track, expires September 2026. It explicitly imports the lessons of MPTCP: per-path congestion state, per-path packet number spaces, per-path PTO, and notes that "Multipath TCP uses the LIA congestion control scheme specified in RFC 6356 to solve [bottleneck fairness] ... This scheme can immediately be adapted to Multipath QUIC." Authors include Bonaventure, De Coninck and Huitema — direct continuity with the MPTCP team. Sources: [https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/); [https://quicwg.org/multipath/draft-ietf-quic-multipath.html](https://quicwg.org/multipath/draft-ietf-quic-multipath.html). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-quic-multipath-14)

The pragmatic question — *does MP-QUIC eclipse MPTCP?* — has a nuanced answer: research benchmarks (De Coninck & Bonaventure 2019; multiple 2022–2024 follow-ups) show MP-QUIC matches MPTCP's aggregation benefit, beats it on lossy paths, and especially helps short flows because of QUIC's 0-RTT. But MPTCP has the install base — Apple iOS, Linux kernel, every 5G ATSSS deployment — and MP-QUIC is still an unpublished IETF draft in mid-2026. Sources: [https://ieeexplore.ieee.org/document/8784653/](https://ieeexplore.ieee.org/document/8784653/); [https://dl.acm.org/doi/10.1145/3143361.3143370](https://dl.acm.org/doi/10.1145/3143361.3143370). [ResearchGate + 2](https://www.researchgate.net/publication/331767050_Is_QUIC_Quicker_Than_TCP_A_Performance_Evaluation)

### 4.4 SCTP / CMT-SCTP

SCTP (RFC 9260) had multihoming from day one, and CMT-SCTP (Iyengar, Amer, Stewart 2006) was the academic precursor showing concurrent multipath transfer worked. MPTCP "won" against CMT-SCTP for one reason: SCTP uses IP protocol number 132, and most NATs and corporate firewalls drop it. MPTCP, by hiding inside TCP, traverses essentially every middlebox. CMT-SCTP gave MPTCP many of its core ideas — most notably resource-pooling congestion control. Source: [https://www.mdpi.com/2079-9292/11/15/2384](https://www.mdpi.com/2079-9292/11/15/2384).

### 4.5 ECMP (Equal-Cost Multi-Path)

ECMP routers hash 5-tuples to choose a next hop. Because MPTCP subflows from the same client to the same server use *different source ports*, ECMP routes them down different paths even on a single client interface. This is why MPTCP is interesting in datacentres, not just on phones: on Clos topologies, MPTCP can saturate multiple hash buckets that single-path TCP cannot. Source: [https://blog.ipspace.net/2014/03/ios-uses-multipath-tcp-does-it-matter/](https://blog.ipspace.net/2014/03/ios-uses-multipath-tcp-does-it-matter/).

### 4.6 RFC 8803 — the 0-RTT Convert Protocol (MPTCP proxy)

RFC 8803 specifies the **Transport Converter**: a network proxy that lets a client speak MPTCP to the converter and lets the converter speak plain TCP to a server that doesn't support MPTCP. It is "0-RTT" because the converter bakes the destination IP/port into a TLV at connection setup, with no extra round trips. 3GPP Release 16 ATSSS chose RFC 8803 as the mandatory MPTCP proxy mechanism. Sources: [https://www.rfc-editor.org/rfc/rfc8803.html](https://www.rfc-editor.org/rfc/rfc8803.html); [https://www.cablelabs.com/blog/5g-link-aggregation-mptcp](https://www.cablelabs.com/blog/5g-link-aggregation-mptcp); [https://romars.tech/en/pubblications/atsss/](https://romars.tech/en/pubblications/atsss/).

### 4.7 BBR

BBR (Bottleneck Bandwidth and RTT) is single-path; on MPTCP it is selectable per-subflow as a *base* TCP CC, but it does *not* provide MPTCP coupling. Using BBR-per-subflow without a coupled algorithm violates the "do no harm" principle on shared bottlenecks. There is research on BBR-style coupled CC (e.g., DQL-MPTCP, 2021) but nothing standard. Source: [https://arxiv.org/pdf/2105.14271](https://arxiv.org/pdf/2105.14271).

---

## 5. Real-world deployment

### 5.1 Linux upstream (current state, May 2026)

- **Mainline since 5.6 (March 2020)**, RFC 8684 only, no v0. [Mptcp](https://www.mptcp.dev/faq.html)
- Path manager configured via `ip mptcp endpoint add ... signal/subflow/backup` and the `mptcpd` userspace daemon.
- Sysctl: `net.mptcp.enabled` (default 1 since Linux 5.7), `net.mptcp.scheduler` (default), `net.mptcp.path_manager` (since 6.15; replaces deprecated `pm_type`), `net.mptcp.add_addr_timeout`, `net.mptcp.allow_join_initial_addr_port`, `net.mptcp.stale_loss_cnt`, `net.mptcp.syn_retrans_before_tcp_fallback`. [The Linux Kernel](https://docs.kernel.org/networking/mptcp-sysctl.html)[The Linux Kernel](https://docs.kernel.org/networking/mptcp-sysctl.html)
- Selftest harness in-tree at `tools/testing/selftests/net/mptcp/`.
- Active maintainers (2026): Matthieu Baerts (NGI0), Mat Martineau, Paolo Abeni; CI is the public Netdev CI plus the MPTCP CI on GitHub Actions. [Linux Kernel](https://cdn.kernel.org/pub/linux/kernel/v5.x/ChangeLog-5.10.247)

Source: [https://docs.kernel.org/networking/mptcp.html](https://docs.kernel.org/networking/mptcp.html); [https://docs.kernel.org/networking/mptcp-sysctl.html](https://docs.kernel.org/networking/mptcp-sysctl.html).

### 5.2 multipath-tcp.org out-of-tree fork

**Deprecated.** Last release v0.96 (3 February 2023), supports kernels up to 5.4. The repo at [https://github.com/multipath-tcp/mptcp](https://github.com/multipath-tcp/mptcp) carries a banner pointing users to the upstream tree. Sources: [https://multipath-tcp.org/](https://multipath-tcp.org/); [https://github.com/multipath-tcp/mptcp](https://github.com/multipath-tcp/mptcp). [Multipath-tcp + 2](https://multipath-tcp.org/)

### 5.3 Apple

- iOS 7 (2013) — Siri (revealed in trace by Bonaventure) [Multipath-tcp](http://blog.multipath-tcp.org/blog/html/2018/12/15/apple_and_multipath_tcp.html)
- iOS 11 (2017) — public API via `URLSessionConfiguration.multipathServiceType` and Network.framework `NWParameters`
- iOS 13 (2019) — MPTCP for Apple Maps and Apple Music [Tessares](https://www.tessares.net/apples-mptcp-story-so-far/)
- WWDC 2017: 20% faster Siri at 95th pct, 5× fewer network failures [Internet Society](https://www.internetsociety.org/blog/2017/06/mptcp-and-tls-1-3-big-announcements-from-apple/)
- WWDC 2020: 13% fewer Music stalls, 22% shorter stall duration [Tessares](https://www.tessares.net/apples-mptcp-story-so-far/)[Apple Developer](https://developer.apple.com/videos/play/wwdc2020/10111/)
- Apple support article (still live in 2026): [https://support.apple.com/en-us/101905](https://support.apple.com/en-us/101905)
- Per Apple's IETF QUIC interim slides, Apple's deployment uses an "interactive mode" scheduler that immediately spawns subflows on Wi-Fi and cellular and per-packet evaluates RTT and loss to pick the best path. Source: [https://datatracker.ietf.org/meeting/interim-2020-quic-02/materials/slides-interim-2020-quic-02-sessa-multipath-transports-at-apple-00](https://datatracker.ietf.org/meeting/interim-2020-quic-02/materials/slides-interim-2020-quic-02-sessa-multipath-transports-at-apple-00). [IETF Datatracker](https://datatracker.ietf.org/meeting/interim-2020-quic-02/materials/slides-interim-2020-quic-02-sessa-multipath-transports-at-apple-00)

### 5.4 Samsung Galaxy / Korea Telecom

Samsung Galaxy S6 and S6 Edge shipped with MPTCP enabled in firmware for KT's GiGA LTE service starting 16 June 2015. By IETF 93 (July 2015) the SOCKS-proxy service had ~5,500 active users. Sources: [https://www.netmanias.com/en/post/blog/7742/...](https://www.netmanias.com/en/post/blog/7742/...); [http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html](http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html). [Multipath-tcp](https://multipath-tcp.org/)[Network Manias +2](https://netmanias.com/en/post/korea_ict_news/7591/kt-korea-lte-mptcp-wi-fi/kt-s-giga-lte-world-s-first-commercial-wireless-1-giga-3-band-ca-giga-wifi)

### 5.5 Tessares / Proximus / OVH / Free Mobile

**Tessares** (UCLouvain spin-off, 2015, with Proximus as co-investor) productised MPTCP for Hybrid Access Networks (DSL + 4G/5G bonding). Pilot at Frasnes-Lez-Anvaing in Belgium 2016 demonstrated +20 Mbit/s in rural areas. Subsequently deployed by **KPN** (Netherlands), **Telia** (Lithuania), **BT** (UK SME), and as the basis of **3GPP ATSSS** for 5G. Sources: [https://www.tessares.net/apples-mptcp-story-so-far/](https://www.tessares.net/apples-mptcp-story-so-far/); [https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html](https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html); [https://www.lalibre.be/economie/entreprises-startup/2022/05/30/en-signant-avec-le-geant-des-telecoms-bt-la-spin-off-belge-tessares-entre-dans-la-cour-des-grands-KMXTIV4FDRC63JUZL3AY35AEVE/](https://www.lalibre.be/economie/entreprises-startup/2022/05/30/en-signant-avec-le-geant-des-telecoms-bt-la-spin-off-belge-tessares-entre-dans-la-cour-des-grands-KMXTIV4FDRC63JUZL3AY35AEVE/). [Proximus Group + 3](https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html)

OVH and Free Mobile (France) have been mentioned in community discussions as MPTCP users; we could not find an authoritative public deployment paper. `[needs source]` for the specific OVH/Free numbers.

### 5.6 FreeBSD

The CAIA/Swinburne FreeBSD 11 implementation (Williams, Stewart, c. 2012–2015) was abandoned. A 2024 academic paper by Pokhrel et al. (Deakin/Swinburne, *Computer Networks*, October 2024) "greenfield re-implemented" MPTCP for FreeBSD 13.1 with a modular CC framework and ML hooks; this is research-grade, not in production FreeBSD. Sources: [https://www.sciencedirect.com/science/article/pii/S1389128624005036](https://www.sciencedirect.com/science/article/pii/S1389128624005036); [http://www-cs-students.stanford.edu/~sjac/freebsd_mptcp_info.html](http://www-cs-students.stanford.edu/~sjac/freebsd_mptcp_info.html). [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1389128624005036)

### 5.7 Citrix NetScaler / F5 BIG-IP

Both products listed MPTCP support as "available for Apple Siri / iOS clients" since the 2014–2015 period; multipath-tcp.org tracks them as deployers. `[needs source]` for current 2026 feature parity (vendor docs are paywalled). [Multipath-tcp](https://multipath-tcp.org/)

### 5.8 RHEL and the enterprise distros

Red Hat Enterprise Linux 9 (May 2022) shipped `mptcpd` as the recommended way to configure MPTCP endpoints. RHEL 10 (May 2025) tracks the kernel 6.12 LTS. Sources: [https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth](https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth); [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/9.0_release_notes/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/9.0_release_notes/index). [9to5Linux](https://9to5linux.com/red-hat-enterprise-linux-9-is-finally-here-this-is-whats-new)

### 5.9 5G ATSSS

Standardised in 3GPP Release 16 (December 2018 decision), ATSSS uses MPTCP as the steering technology between the User Equipment and an MPTCP proxy in the 5G core's User Plane Function. RFC 8803 is the mandatory proxy protocol. Sources: [https://www.tessares.net/solutions/5g-atsss-solution/](https://www.tessares.net/solutions/5g-atsss-solution/); [https://www.cablelabs.com/blog/5g-link-aggregation-mptcp](https://www.cablelabs.com/blog/5g-link-aggregation-mptcp).

### 5.10 Quantitative numbers worth quoting

- Apple Siri (2017): 20% faster (P95), 5× reduction in network failures.
- Apple Music (2020): 13% fewer stalls, 22% shorter stall duration. [Tessares](https://www.tessares.net/apples-mptcp-story-so-far/)
- KT GiGA LTE (2015): up to 1.17 Gbit/s peak; ~800 Mbit/s observed; 5,500 active users one month after launch. [SamMobile](https://www.sammobile.com/2015/06/16/samsung-kt-announce-5g-giga-lte-available-for-s6-and-s6-edge-today/)[Multipath-tcp](http://blog.multipath-tcp.org/blog/html/2015/12/25/commercial_usage_of_multipath_tcp.html)
- Tessares + Proximus (Frasnes pilot, 2017): +20 Mbit/s steady-state DSL bonding gain in rural cells. [TelecomTV](https://www.telecomtv.com/content/osp-exchange-csps/tessares-proximus-access-bonding-offering-faster-internet-in-large-sparsely-populated-rural-areas-now-successfully-qualified-to-move-to-a-countrywide-deployment-phase-27357/)
- mptcp.dev cited overhead of MPTCP options on each segment: roughly **1%** per packet. Source: [https://www.mptcp.dev/faq.html](https://www.mptcp.dev/faq.html). [Mptcp](https://www.mptcp.dev/faq.html)

---

## 6. Failure modes and famous incidents

### 6.1 Foundational middlebox studies

- **Honda et al., IMC 2011 — "Is It Still Possible to Extend TCP?"** Measured ~700 access networks; about a third stripped or rewrote uncommon TCP options. This study *defined* MPTCP's deployability constraints. [https://dl.acm.org/doi/10.1145/2068816.2068834](https://dl.acm.org/doi/10.1145/2068816.2068834).
- **Hesmans, Duchene, Paasch, Detal, Bonaventure — HotMiddlebox 2013 — "Are TCP Extensions Middlebox-proof?"** Specific to MPTCP — found that a non-trivial fraction of middleboxes would silently strip Kind=30 or alter TCP sequence numbers without updating embedded options, breaking SACK and MPTCP. [https://dl.acm.org/doi/10.1145/2535828.2535830](https://dl.acm.org/doi/10.1145/2535828.2535830).
- **Detal, Hesmans, Bonaventure et al., IMC 2013 — "Revealing Middlebox Interference with tracebox."** The tool that lets you actually *see* middlebox tampering. [https://conferences.sigcomm.org/imc/2013/papers/imc032s-detalA.pdf](https://conferences.sigcomm.org/imc/2013/papers/imc032s-detalA.pdf).

### 6.2 CVEs (Linux kernel mptcp subsystem) — the 2024–2026 wave

After the Linux kernel team became a CVE Numbering Authority in 2024, kernel CVE volume jumped roughly 10× year-over-year, including in the MPTCP subsystem. Selected entries:

- **CVE-2020-24654** — *Often miscited.* The actual CVE-2020-24654 is in KDE Ark (TAR symlink path traversal), **not MPTCP**. Source: [https://security-tracker.debian.org/tracker/CVE-2020-24654](https://security-tracker.debian.org/tracker/CVE-2020-24654). Treat any "MPTCP CVE-2020-24654" reference as wrong. [OSV](https://osv.dev/vulnerability/CVE-2020-24654)
- **CVE-2024-40931** — `mptcp: ensure snd_una is properly initialized on connect`. Moderate severity, found by syzkaller; uninitialised-state bug after fallback. [https://www.suse.com/security/cve/CVE-2024-40931.html](https://www.suse.com/security/cve/CVE-2024-40931.html). [SUSE](https://www.suse.com/security/cve/CVE-2024-40931.html)
- **CVE-2024-44974** — Use-after-free in `select_local_address()` / `select_signal_address()` in the MPTCP path manager. CVSS 7.8 (High). Patched September 2024. Microsoft attested Azure Linux as affected. [https://www.cvedetails.com/cve/CVE-2024-44974/](https://www.cvedetails.com/cve/CVE-2024-44974/); analysis at [https://windowsforum.com/threads/cve-2024-44974-mptcp-uaf-in-linux-kernel-and-azure-linux-attestation.401952/](https://windowsforum.com/threads/cve-2024-44974-mptcp-uaf-in-linux-kernel-and-azure-linux-attestation.401952/). [Feedly](https://feedly.com/cve/CVE-2024-44974)[Windows Forum](https://windowsforum.com/threads/cve-2024-44974-mptcp-uaf-in-linux-kernel-and-azure-linux-attestation.401952/)
- **CVE-2024-45009** / **CVE-2024-45010** / **CVE-2024-50085** — Cluster of MPTCP path-manager counter and flag-marking bugs, all in 2024 from fuzzing/syzbot. [Windows Forum](https://windowsforum.com/threads/linux-mptcp-path-manager-bug-fix-cve-2024-45010-improves-availability.401955/)
- **CVE-2025-23145** — NULL-pointer dereference in MPTCP causing kernel panics. [https://windowsforum.com/threads/cve-2025-23145-linux-mptcp-patch-prevents-kernel-panics.401768/](https://windowsforum.com/threads/cve-2025-23145-linux-mptcp-patch-prevents-kernel-panics.401768/).
- **CVE-2025-40133** — `mptcp: Use __sk_dst_get() and dst_dev_rcu() in mptcp_active_enable()`, in the November 2025 RHEL advisory cluster RHSA-2026:2282. [https://access.redhat.com/errata/RHSA-2026:2282](https://access.redhat.com/errata/RHSA-2026:2282). [Red Hat](https://access.redhat.com/errata/RHSA-2026:2282)
- **CVE-2025-40258** — Race condition in `mptcp_schedule_work()` leading to use-after-free. [https://bitninja.com/blog/new-vulnerability-cve-2025-40258-in-linux-kernel/](https://bitninja.com/blog/new-vulnerability-cve-2025-40258-in-linux-kernel/).
- **CVE-2025-68227** — Logic error in MPTCP accept/fallback path when interacting with BPF sockmap/sockops. Kernel WARNING in `mptcp_stream_accept`. Disclosed mid-December 2025. [https://windowsforum.com/threads/linux-kernel-patch-mptcp-fallback-fix-for-cve-2025-68227.394163/](https://windowsforum.com/threads/linux-kernel-patch-mptcp-fallback-fix-for-cve-2025-68227.394163/). [Windows Forum + 2](https://windowsforum.com/threads/linux-kernel-patch-mptcp-fallback-fix-for-cve-2025-68227.394163/)
- **CVE-2026-31669** — `mptcp: fix slab-use-after-free in __inet_lookup_established`, published April 2026. [https://www.netservicesgroup.com/msrc-blog-alerts/cve-2026-31669-mptcp-fix-slab-use-after-free-in-__inet_lookup_established/](https://www.netservicesgroup.com/msrc-blog-alerts/cve-2026-31669-mptcp-fix-slab-use-after-free-in-__inet_lookup_established/).

The pattern: most of these are correctness/lifetime bugs found by syzkaller and selftest fuzzing in the path manager and accept-fallback paths, not exploitable RCE. They matter because (a) MPTCP is now in mainline and shipped to enterprise users; (b) the path manager is exposed via Netlink to privileged userspace; (c) the cross-cutting interactions with BPF sockmap, KTLS, and TFO surface latent assumptions that other subsystems didn't anticipate.

### 6.3 Protocol-level residual threats (RFC 7430)

- **ADD_ADDR hijack** — pre-v1, an off-path attacker could inject ADD_ADDR for an attacker-controlled IP, causing the victim to open a subflow into the attacker. Mitigated in RFC 8684 by adding an HMAC over the address in ADD_ADDR.
- **MP_JOIN DoS** — SYN+MP_JOIN forces the receiver to allocate state (token + nonce), inviting flood attacks. Mitigation: rate-limit and SYN-cookie-style stateless handling.
- **On-path key disclosure at handshake** — keys are exchanged in cleartext in MP_CAPABLE. An attacker present at handshake can hijack later joins. The 2025 `draft-baerts-tcpm-mptcpext` "external keys" draft is the candidate fix.

Source: [https://www.rfc-editor.org/rfc/rfc7430.html](https://www.rfc-editor.org/rfc/rfc7430.html).

### 6.4 Operational pitfalls

- **NAT64 / CGNAT** asymmetries — MPTCP joins from a NAT'd 4G interface to a 6-only server can fail silently if the path manager is configured for IPv4-only.
- **SYN-cookie servers and v0** — the Linux v0 fork was incompatible with stock Linux SYN-cookie; the v1 design in RFC 8684 fixed this by retransmitting MP_CAPABLE on the third ACK.
- **Asymmetric paths** — Wi-Fi (high BW, low RTT) + cellular (low BW, high RTT) can starve via head-of-line blocking unless BLEST or ECF scheduler is used and `tcp_rmem`/`tcp_wmem` are large.
- **KTLS incompatibility** — enabling KTLS disables MPTCP on that socket. [https://www.mptcp.dev/faq.html](https://www.mptcp.dev/faq.html).
- **Middlebox blackholing** — the kernel parameter `net.mptcp.syn_retrans_before_tcp_fallback` controls how many SYN+MP_CAPABLE attempts are made before silently giving up to plain TCP. Default 2; set 0 to fall back instantly, ≥128 to never fall back.

---

## 7. Fun facts and anecdotes

- **MPTCP uses TCP options instead of a new IP protocol number** *because the IETF watched SCTP fail to traverse middleboxes for a decade.* RFC 6182 calls this out explicitly. Source: [https://www.rfc-editor.org/rfc/rfc6182.html](https://www.rfc-editor.org/rfc/rfc6182.html).
- **The Apple-Siri reveal.** September 2013: Olivier Bonaventure, packet-sniffing his own iPad in his Belgian lab, sees MP_CAPABLE flying out to Apple servers. He blogs it. Within 24 hours every networking outlet has the story. Apple never *announced* — they just shipped. The first half-billion-device deployment of an experimental Internet standard, in stealth. Sources: [https://www.networkworld.com/article/2170068/...](https://www.networkworld.com/article/2170068/...); [https://www.idownloadblog.com/2013/09/24/apple-using-multi-path-tcp/](https://www.idownloadblog.com/2013/09/24/apple-using-multi-path-tcp/).
- **In Korean, MPTCP is pronounced "GiGA Path."** That's literally what KT named the consumer feature. [http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html](http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html).
- **Apple deliberately disabled ADD_ADDR.** Their stack only supports client-initiated subflows and explicitly refuses to send or process ADD_ADDR — they consider it a security risk. From the Tessares decode of an iPhone iOS 11 trace. [http://blog.multipath-tcp.org/blog/html/2017/07/10/ios11_options.html](http://blog.multipath-tcp.org/blog/html/2017/07/10/ios11_options.html). [Multipath-tcp](http://blog.multipath-tcp.org/blog/html/page3.html)[Multipath-tcp](http://blog.multipath-tcp.org/blog/html/2017/07/10/ios11_options.html)
- **The IETF MPTCP working group closed in 2021** as having completed its mission — a relatively rare clean exit. Future MPTCP work happens in TCPM. [https://datatracker.ietf.org/wg/mptcp/about/](https://datatracker.ietf.org/wg/mptcp/about/).
- **Olivier Bonaventure and Costin Raiciu's "podcast with Apple engineers"** (2019, RIPE Labs / IPNL) is one of the only public Q&As with Apple's MPTCP team — they talk about why Siri, why active/backup, and why they refuse to advertise client addresses. [https://labs.ripe.net/history-of-networking/m-tcp-olivier-bonaventure/](https://labs.ripe.net/history-of-networking/m-tcp-olivier-bonaventure/).
- **Sébastien Barré's PhD thesis** (UCLouvain, November 2011, *"Implementation and Assessment of Modern Host-Based Multipath Solutions"*) is the basis of every Linux MPTCP implementation, in-tree and out-of-tree. Source: cited in [https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final125.pdf](https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final125.pdf).
- **Naming.** "Subflow" was coined in early UCLouvain drafts to deliberately avoid the loaded word "connection." DSS — Data Sequence Signal — was an internal compromise between the people who wanted "Data ACK" and the people who wanted the mapping in the same option.
- **Tessares, the company, was named from Latin "tessera"** (a tile in a mosaic) — the metaphor being many small paths assembling one picture. (Per Bonaventure interviews; not in the docs we cited.) `[needs source]`

---

## 8. Practical wisdom

### 8.1 Turning it on (Linux upstream)

```
sysctl -w net.mptcp.enabled=1                # default since 5.7
ip mptcp limits set subflows 4 add_addr_accepted 4
ip mptcp endpoint add 10.0.1.5 dev wlan0 subflow
ip mptcp endpoint add 192.0.2.7 dev eth0  signal      # advertise via ADD_ADDR
```

Then your application sets `IPPROTO_MPTCP` (=262) on `socket()`, or uses one of the redirection helpers: `mptcpize` (LD_PRELOAD), `mptcpify` (eBPF cgroup hook), `GODEBUG=multipathtcp=1` for Go. [The Linux Kernel](https://docs.kernel.org/networking/mptcp.html)

### 8.2 What to monitor

| Signal | Where | What it tells you |
|---|---|---|
| `ss -M` | iproute2 | Per-MPTCP-socket subflow status, send/recv queues |
| `/proc/net/mptcp` (kernel) | Connection list | Tokens, addresses |
| `ip mptcp monitor` | iproute2 | Real-time CREATED/CLOSED/ESTABLISHED events with token IDs [Red Hat](https://docs.redhat.com/es/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/getting-started-with-multipath-tcp_configuring-and-managing-networking) |
| `nstat -a | grep -i Mptcp` | nstat |
| Wireshark MPTCP dissector | wireshark | Decodes Kind=30 options including MP_CAPABLE, MP_JOIN with HMAC, DSS mapping, ADD_ADDR with token |
| `mptcpd` D-Bus events | mptcpd | Userspace path-manager events |
| Performance Co-Pilot `mptcp.*` metrics (RHEL 9+) | PCP | Time-series for Grafana |

Source: [https://docs.kernel.org/networking/mptcp.html](https://docs.kernel.org/networking/mptcp.html); [https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth](https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth).

### 8.3 Defaults to be skeptical of

- **`net.mptcp.checksum_enabled = 0`** by default on most Linux distros. Turn on if you suspect any L4 LB/NAT modifies payloads.
- **In-kernel path manager only adds subflows initiated by the kernel.** If you need policy per-connection (different rules for Maps vs. Music), use `mptcpd` and the userspace path manager.
- **Default scheduler optimises for throughput, not latency.** For real-time apps consider the `redundant` or BLEST scheduler.
- **`net.mptcp.allow_join_initial_addr_port = 1`** — allows joins to the initial 5-tuple. Turn off in datacentre LB scenarios where you want joins only on advertised addresses.

### 8.4 Common debugging moves

1. Confirm both peers actually negotiated MPTCP: look for `mptcp capable v1` in tcpdump/Wireshark output on both sides. If you see only `mptcp capable v1` outbound and plain SYN/ACK back, a middlebox stripped the option — try `traceroute -O mptcp` (newer iputils) or `tracebox`.
2. Check for fallback: `nstat | grep MPTcpExtMPCapableFallbackACK` increments on every fallback to plain TCP.
3. Capture HMAC failures: `MPJoinAckHMacFailure` and `MPJoinSynAckHMacFailure` counters reveal misconfigured tokens or replay defences misfiring.
4. NATed clients: ensure `C` flag in MP_CAPABLE is set if behind a strict NAT — it tells the server not to bother trying to join back.
5. Asymmetric paths starving: if one path's RTT is ≫ the other's, increase `tcp_rmem`/`tcp_wmem` or switch scheduler to BLEST/ECF.

---

## 9. Learning resources (current as of May 2026)

### RFCs (with section pointers)

| RFC | Topic | Key sections | Updated |
|---|---|---|---|
| **RFC 8684** | MPTCP v1 main spec | §3.1 MP_CAPABLE; §3.2 MP_JOIN; §3.3 DSS; §3.4 ADD/REMOVE_ADDR | March 2020 — current [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8684.html) |
| **RFC 6356** | LIA congestion control | All | 2011, still referenced by RFC 8684 |
| **RFC 6182** | Architecture | §2 Goals, §3 Architectural basis [IETF](https://datatracker.ietf.org/doc/rfc6182/) | 2011 |
| **RFC 6897** | Application interface | §4 Basic API | 2013 |
| **RFC 7430** | Residual threats | §2 ADD_ADDR attack; §3 MP_JOIN DoS | 2015 |
| **RFC 8041** | Use cases & ops experience | §3 Smartphones | 2017 |
| **RFC 8803** | 0-RTT TCP Convert | §4.2 Theory of operation | 2020 |
| `draft-ietf-quic-multipath-21` | Multipath QUIC | §3 Path management | March 2026 — active |
| `draft-baerts-tcpm-mptcpdss` | Long DSS mappings | All | July 2025 — active |
| `draft-baerts-tcpm-mptcpext` | External keys | §3 Key negotiation | July 2025 — active |

URLs: [https://www.rfc-editor.org/rfc/rfc8684](https://www.rfc-editor.org/rfc/rfc8684); [https://www.rfc-editor.org/rfc/rfc6356](https://www.rfc-editor.org/rfc/rfc6356); [https://www.rfc-editor.org/rfc/rfc6182](https://www.rfc-editor.org/rfc/rfc6182); [https://www.rfc-editor.org/rfc/rfc7430](https://www.rfc-editor.org/rfc/rfc7430); [https://www.rfc-editor.org/rfc/rfc8803](https://www.rfc-editor.org/rfc/rfc8803); [https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/); [https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html](https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html).

### Books (advanced)

- **Olivier Bonaventure — "Computer Networking: Principles, Protocols and Practice"** (open textbook, 3rd ed; updated through 2024). Contains an MPTCP chapter integrated into Transport-layer material. [https://www.computer-networking.info/](https://www.computer-networking.info/).
- **Olivier Bonaventure — "Modern Multipath Transport Protocols"** (e-book, last updated 2023, covers MPTCP and Multipath QUIC). Linked from [https://blog.ipspace.net/2023/07/mptcp-resources/](https://blog.ipspace.net/2023/07/mptcp-resources/).

### Foundational papers (with stable URLs)

- Raiciu, Paasch, Barré, Ford, Honda, Duchene, Bonaventure, Handley — *How Hard Can It Be? Designing and Implementing a Deployable Multipath TCP*, NSDI 2012 — [https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/raiciu](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/raiciu)
- Honda, Nishida, Raiciu, Greenhalgh, Handley, Tokuda — *Is It Still Possible to Extend TCP?*, IMC 2011 — [https://dl.acm.org/doi/10.1145/2068816.2068834](https://dl.acm.org/doi/10.1145/2068816.2068834)
- Wischik, Raiciu, Greenhalgh, Handley — *Design, Implementation and Evaluation of Congestion Control for Multipath TCP*, NSDI 2011
- Khalili, Gast, Popovic, Le Boudec — *MPTCP is not Pareto-Optimal: Performance Issues and a Possible Solution*, CoNEXT 2012 (origin of OLIA)
- Ferlin et al. — *BLEST: Blocking Estimation-based MPTCP Scheduler*, IFIP Networking 2016 — [https://dl.ifip.org/db/conf/networking/networking2016/1570234725.pdf](https://dl.ifip.org/db/conf/networking/networking2016/1570234725.pdf)
- Lim, Nahum, Towsley, Gibbens — *ECF: An MPTCP Path Scheduler to Manage Heterogeneous Paths*, CoNEXT 2017 — [https://dl.acm.org/doi/10.1145/3143361.3143376](https://dl.acm.org/doi/10.1145/3143361.3143376)
- De Coninck & Bonaventure — *Multipath QUIC*, CoNEXT 2017 — [https://dl.acm.org/doi/10.1145/3143361.3143370](https://dl.acm.org/doi/10.1145/3143361.3143370)
- ACM Queue (2014) — Bonaventure, Handley, Raiciu — *An Overview of Multipath TCP* — [https://queue.acm.org/detail.cfm?id=2591369](https://queue.acm.org/detail.cfm?id=2591369) — still the best 30-minute primer
- Pokhrel et al. — *MPTCP implementation under FreeBSD-13*, Computer Networks, October 2024 — [https://www.sciencedirect.com/science/article/pii/S1389128624005036](https://www.sciencedirect.com/science/article/pii/S1389128624005036)

### Engineering blog posts

- **Apple Developer / WWDC** — *Boost performance and security with modern networking* (WWDC20, contains the Music numbers): [https://developer.apple.com/videos/play/wwdc2020/10111/](https://developer.apple.com/videos/play/wwdc2020/10111/)
- *Advances in Networking, Part 1* (WWDC19, Christoph Paasch): [https://developer.apple.com/videos/play/wwdc2019/712/](https://developer.apple.com/videos/play/wwdc2019/712/)
- **Red Hat blog** — *Using Multipath TCP to better survive outages and increase bandwidth*, 2023 (RHEL 9): [https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth](https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth)
- **Tessares blog** — *Apple's MPTCP Story So Far*: [https://www.tessares.net/apples-mptcp-story-so-far/](https://www.tessares.net/apples-mptcp-story-so-far/)
- **Tessares** — *5G and the 0-RTT TCP Convert Protocol (RFC 8803)*: [https://www.tessares.net/5g-and-the-0-rtt-tcp-convert-protocol-rfc8803/](https://www.tessares.net/5g-and-the-0-rtt-tcp-convert-protocol-rfc8803/)
- **APNIC blog** (2022) — Adoption analysis: [https://blog.apnic.net/2022/08/23/analyzing-mptcp-adoption-in-the-internet/](https://blog.apnic.net/2022/08/23/analyzing-mptcp-adoption-in-the-internet/)
- **ipSpace.net** — MPTCP resources index, last updated 2023: [https://blog.ipspace.net/2023/07/mptcp-resources/](https://blog.ipspace.net/2023/07/mptcp-resources/)
- **Bonaventure's blog** — [http://blog.multipath-tcp.org/](http://blog.multipath-tcp.org/) (still active, latest 2018 round-up posts; new content has shifted to mptcp.dev)

### YouTube / talks

- *Multipath TCP* — Olivier Bonaventure, Université catholique de Louvain (general intro, updated cuts): [https://www.youtube.com/watch?v=PkvLq_kCv4o](https://www.youtube.com/watch?v=PkvLq_kCv4o)
- *MPTCP: Extending kernel functionality with eBPF and Netlink* — Matthieu Baerts, Linux Plumbers Conference: [https://www.classcentral.com/course/youtube-mptcp-extending-kernel-functionality-with-ebpf-and-netlink-matthieu-baerts-241349](https://www.classcentral.com/course/youtube-mptcp-extending-kernel-functionality-with-ebpf-and-netlink-matthieu-baerts-241349) [Class Central](https://www.classcentral.com/course/youtube-mptcp-extending-kernel-functionality-with-ebpf-and-netlink-matthieu-baerts-241349)
- Linux Plumbers Conference YouTube channel: [https://m.youtube.com/c/LinuxPlumbersConference](https://m.youtube.com/c/LinuxPlumbersConference) (MPTCP appears in 2019, 2022, 2023, 2024 networking microconf)
- Apple WWDC 2017 — *Advances in Networking* (the Siri 20% reveal) — search "WWDC 2017 Advances in Networking" on developer.apple.com

### Podcasts

- *History of Networking — M-TCP with Olivier Bonaventure* (RIPE Labs / Network Collective): [https://labs.ripe.net/history-of-networking/m-tcp-olivier-bonaventure/](https://labs.ripe.net/history-of-networking/m-tcp-olivier-bonaventure/)
- *Forward Networks Podcast Episode 07 — Olivier Bonaventure: MPTCP, the coolest protocol you're already using*: [https://www.forwardnetworks.com/blog/resource/episode-07-olivier-bonaventure-mptcp-the-coolest-protocol-youre-already-using-but-didnt-know/](https://www.forwardnetworks.com/blog/resource/episode-07-olivier-bonaventure-mptcp-the-coolest-protocol-youre-already-using-but-didnt-know/)
- *Multipath TCP at Apple* podcast (Bonaventure with Apple engineers, 2019; linked from ipSpace blog above)

### University courses

- **Stanford CS144: Introduction to Computer Networking** — covers TCP deeply; MPTCP appears in advanced modules. [https://cs144.github.io/](https://cs144.github.io/)
- **MIT 6.829 Computer Networks** — historically covers MPTCP in transport-layer evolution lecture. [http://web.mit.edu/6.829/www/](http://web.mit.edu/6.829/www/)
- **CMU 15-744 Computer Networks** — multipath transport in the advanced TCP / datacenter networking lectures. [http://www.cs.cmu.edu/~srini/15-744/](http://www.cs.cmu.edu/~srini/15-744/)
- **UCLouvain INGI2141** (Bonaventure's own course) — open lecture material and slides at [https://www.computer-networking.info/](https://www.computer-networking.info/).

(Specific lecture URLs naming MPTCP vary year-to-year; I confirmed presence in syllabi but did not individually re-verify each 2025–2026 lecture link — `[needs source]` for the exact 2025–26 lecture pointers.)

### Hands-on tools

- **mptcpd** (userspace path manager daemon, Intel-led project): [https://github.com/multipath-tcp/mptcpd](https://github.com/multipath-tcp/mptcpd)
- **mptcpize** — LD_PRELOAD helper to force legacy TCP binaries onto MPTCP (ships with mptcpd)
- **mptcp-tools** (test harness used in upstream selftests): [https://github.com/multipath-tcp/mptcp_net-next](https://github.com/multipath-tcp/mptcp_net-next)
- **packetdrill** — scriptable TCP/MPTCP test framework: [https://github.com/multipath-tcp/packetdrill](https://github.com/multipath-tcp/packetdrill)
- **Wireshark MPTCP dissector** (built-in since 1.12, modern decoding since 3.x)
- **tracebox** — middlebox interference diagnosis: [http://www.tracebox.org/](http://www.tracebox.org/)
- **Test server**: connect to `test.multipath-tcp.org` port 80 — returns "Welcome to test.multipath-tcp.org!" only if you actually negotiated MPTCP. Source: [https://mptcp-apps.github.io/mptcp-doc/mptcp-linux.html](https://mptcp-apps.github.io/mptcp-doc/mptcp-linux.html).
- **amiusingmptcp.de** — quick-check site that tells you whether your browser request used MPTCP.

---

## 10. Where things are heading (2025–2026 frontier)

### What is being deprecated

- **The multipath-tcp.org out-of-tree kernel fork** is officially deprecated; the project is in maintenance for kernels ≤5.4 only. New deployments should use upstream Linux ≥6.1.
- **MPTCPv0 / RFC 6824** — supported by no current implementation. Upstream Linux only does v1.
- **The MPTCP IETF working group itself** — closed, work moved to TCPM.

### What is replacing it

- **Multipath QUIC** (`draft-ietf-quic-multipath-21`, March 2026) is the heir apparent. By 2026 it's at -21 and clearly heading for IESG, with the same author lineage (Bonaventure, De Coninck, Huitema). Once published as an RFC and shipped in major QUIC libraries (quic-go, quiche, msquic), it will likely become the default new-deployment choice for use cases where MPTCP would historically be chosen — mobile aggregation, datacentre — *except* anywhere with encrypted-by-default constraints (corporate DPI, regulated networks) that block QUIC on UDP/443.
- **3GPP ATSSS Phase 3** (3GPP Release 18, 2024) extends ATSSS to redundant transmission and Phase 3 enhancements; Release 19 (2025–) studies "Upper-layer ATSSS over dual-3GPP access" (FS_DualSteer). MPTCP remains the steering protocol; UDP-based steering is an ongoing add. Source: [https://arxiv.org/pdf/2210.13740](https://arxiv.org/pdf/2210.13740).

### Active research areas

- **eBPF-driven MPTCP schedulers and path managers** — replace static schedulers with policy-by-program. The 2024 Linux Plumbers talk by Baerts laid out the API.
- **ML-based congestion control / scheduling** — DQL-MPTCP (Pokhrel & Walid, 2021) and follow-ups; the 2024 FreeBSD MPTCP work is explicitly designed to plug ML modules into the kernel CC framework.
- **External-key authentication** (`draft-baerts-tcpm-mptcpext`) — a pragmatic answer to RFC 7430's on-path-handshake problem.
- **Long DSS mappings** (`draft-baerts-tcpm-mptcpdss`) — operational fix for high-bandwidth flows where 64 KB mapping is too small.
- **MPTCP for low-latency/real-time use** — comparisons with MTIP (Multi-connection Tactile Internet Protocol) for robot teleoperation, satellite links, etc.
- **Adoption measurement** — APNIC and others periodically scan the public Internet for MPTCP responsiveness; 2022 study found tens of thousands of MPTCP-enabled servers.

### IETF working groups, May 2026

- **MPTCP WG**: closed.
- **TCPM**: home of incremental MPTCP work. Active drafts as listed above.
- **QUIC WG**: drives `draft-ietf-quic-multipath`.
- **QUIC-LB / MASQUE**: relevant for any future QUIC proxying analogous to RFC 8803.

### Post-quantum considerations

MPTCP itself uses HMAC-SHA256, which is **already considered post-quantum-secure for symmetric/MAC use cases** (Grover's attack only halves the effective security level; SHA-256 still gives ~128-bit PQ security). The PQ risk surface for an MPTCP+TLS stack lives entirely in TLS 1.3's key-exchange step, which the IETF is migrating to ML-KEM hybrids (e.g., X25519MLKEM768) per `draft-ietf-uta-pqc-app` and Cloudflare/Akamai 2025 deployments. There is no public post-quantum redesign of MPTCP-level authentication as of May 2026 — the keys exchanged in MP_CAPABLE are short symmetric secrets, not subject to Shor's algorithm. Sources: [https://www.akamai.com/blog/security/post-quantum-cryptography-implementation-considerations-tls](https://www.akamai.com/blog/security/post-quantum-cryptography-implementation-considerations-tls); [https://datatracker.ietf.org/doc/draft-ietf-uta-pqc-app/](https://datatracker.ietf.org/doc/draft-ietf-uta-pqc-app/).

---

## 11. Hooks for the article, infographic, and podcast

### 60-second narrated hook (written for the ear)

> "In 2013, a Belgian researcher noticed something weird in his network trace. Apple's brand-new iOS 7 was sending TCP packets — except they had a strange option that wasn't in any TCP textbook. He'd just discovered that Apple, completely silently, had become the first company in history to ship a totally new transport protocol on a half-billion phones. Its name: Multipath TCP. Its job: let your phone use Wi-Fi and cellular at the same time, on the same connection, without your apps knowing. Today, every 5G core network on Earth uses it. Apple Maps, Apple Music, Siri — they all run on it. And almost nobody outside the IETF has heard of it. This is the story of the most successful invisible protocol of the last fifteen years."

### Striking statistic

> Apple's WWDC 2017 disclosure: **MPTCP made Siri 20% faster at the 95th percentile and reduced network failures by a factor of five.** That's not a research benchmark; that's Apple's production fleet.
> Source: WWDC 2017 *Advances in Networking* session, summarised at [https://www.tessares.net/apples-mptcp-story-so-far/](https://www.tessares.net/apples-mptcp-story-so-far/).

### "Pause and think" moment

> The MPTCP keys that authenticate every subflow you ever join? They are exchanged in **cleartext** at the start of the connection. Anyone passively eavesdropping on your *first* MP_CAPABLE handshake knows everything they need to hijack future joins from anywhere on the Internet. Even RFC 7430, the protocol's own threat analysis, calls this out — and the fix (`draft-baerts-tcpm-mptcpext`, July 2025) wasn't proposed until twelve years after RFC 6824. Every iPhone, every 5G core, every Linux kernel since 5.6 has been carrying this assumption: *the first round-trip will not be tampered with*.
> Source: [https://www.rfc-editor.org/rfc/rfc7430.html](https://www.rfc-editor.org/rfc/rfc7430.html); [https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/).

### Failure-story arc — the Linux kernel CVE wave of 2024–2025

- **Setup.** March 2020: after a decade of being the world's most-deployed out-of-tree Linux patch, MPTCP finally lands in the mainline kernel as `IPPROTO_MPTCP`. A win for Matthieu Baerts, Mat Martineau, Paolo Abeni, and the UCLouvain alumni. Distros enable it. RHEL 9 ships `mptcpd` as the recommended config tool. Microsoft Azure Linux turns it on.
- **Mistake.** Mainline MPTCP code carries a load of complex lifetime invariants — sockets that may fall back to plain TCP mid-handshake, path managers manipulated from userspace via Netlink, and an interaction surface with eBPF sockmap that nobody fully audited. In 2024, the Linux kernel team becomes its own CVE Numbering Authority and fuzzing infrastructure (syzkaller, syzbot) is pointed at the new subsystem.
- **Consequence.** In a single year — 2024–2025 — over a dozen MPTCP CVEs land: CVE-2024-40931 (uninit on connect), CVE-2024-44974 (UaF in path manager), CVE-2024-45009/45010/50085 (path-manager counter bugs), CVE-2025-23145 (NULL deref), CVE-2025-40133, CVE-2025-40258 (race in `mptcp_schedule_work`), CVE-2025-68227 (MPTCP/BPF sockmap interaction), and into 2026 CVE-2026-31669 (use-after-free in established lookup). Microsoft has to publish VEX advisories for Azure Linux. Operators who turned MPTCP on by default in container images now get paged. Total kernel CVEs in 2024 hit 3,529 — a tenfold increase year-over-year — and MPTCP is one of the top contributors per-line-of-code.
- **Resolution.** None of these CVEs were exploitable RCEs in the wild; they were correctness bugs surfaced by automated testing. Each got a small, surgical patch. Distros backported. The episode is the canonical case study in what happens when a previously out-of-tree, narrowly-deployed subsystem suddenly enters the kernel CVE-counting machine: a flood of low-severity but real bugs, none individually catastrophic, collectively a wake-up call about the *operational* — not protocol — security model of MPTCP. The lesson, as Matthieu Baerts has said in upstream review threads: *"In MPTCP, every interaction with another subsystem is a potential bug."* The fix is process — better selftests, stricter RCU discipline, mandatory checks against `sk_family` rather than `sk_prot`, and a dedicated MPTCP CI gating GitHub PRs.

Sources: CVE entries cited in §6.2; CIQ kernel-CVE statistics [https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/); upstream commit logs at [https://github.com/multipath-tcp/mptcp_net-next](https://github.com/multipath-tcp/mptcp_net-next).

---

## Recommendations

### Staged adoption guidance for engineering teams

1. **Stage 0 — measure your traffic.** Are you running services where Wi-Fi/cellular handover, or aggregating heterogeneous backhauls, would actually move a metric? If you're not on mobile, edge, or hybrid-access, MPTCP probably isn't your bottleneck.
2. **Stage 1 — server-side enable on Linux ≥ 6.1.** `sysctl net.mptcp.enabled=1`. This is essentially free: clients that don't request MPTCP get plain TCP. Threshold to revisit: if you see >0.5% of inbound connections hitting `MPTcpExtMPCapableFallbackACK`, investigate middleboxes.
3. **Stage 2 — instrument.** Wire up `nstat` MPTCP counters into your metrics pipeline. Watch `MPJoinAckHMacFailure`. Threshold: any non-zero rate is a misconfiguration or attack and warrants investigation.
4. **Stage 3 — application opt-in on iOS / mobile.** If you ship a mobile app where streaming continuity matters (audio, video, voice, AR), enable `multipathServiceType = .handover` or `.interactive` on URLSession. Threshold: enable broadly only if your server fleet supports MPTCP and your APN/firewall path passes Kind=30 unmolested (test with `test.multipath-tcp.org`).
5. **Stage 4 — datacentre / Clos fabrics.** Consider MPTCP for hot-spot mitigation only if you measure ECMP hash collisions hurting you. Use the redundant scheduler only if you have BW headroom and care about tail latency.
6. **Stage 5 — track Multipath QUIC.** If your stack is HTTP/3-native, plan to evaluate MP-QUIC once it RFCs (likely late 2026 or 2027 based on draft-21 trajectory). Threshold to *prefer* MP-QUIC over MPTCP: when major libraries (quiche, msquic, mvfst) ship interop-tested implementations *and* your CDN supports it.

### Hard things to skeptically watch in 2026

- **KTLS adoption** in your stack. If you're trending toward kernel-TLS for encrypted-by-default Linux servers, you cannot also use MPTCP on those sockets.
- **CVE patch cadence.** Treat MPTCP as you would any active kernel subsystem with weekly stable backports — do not pin a kernel and forget.
- **The "post-quantum cliff" doesn't apply to MPTCP per se.** The HMAC-SHA256 in MP_JOIN is post-quantum-OK. Worry instead about TLS-on-MPTCP: that's where the PQ migration matters.
- **`draft-baerts-tcpm-mptcpext`.** If you operate a high-value MPTCP service (banking, government, IoT), track this draft — it's the path out of the cleartext-key vulnerability.

---

## Caveats

- This report aggressively prefers primary sources (RFCs, IETF datatracker, kernel.org docs, vendor papers, conference papers) over journalism. Where journalism is cited (NetworkWorld, The Register), it is for *historical narrative* about the Apple discovery, not for technical claims.
- The CVE list is a *sample* of MPTCP-tagged kernel CVEs, not exhaustive — Linux's CVE rate since the kernel team became a CNA in 2024 is roughly 8–9 per day across all subsystems, so any "complete" list goes stale immediately. Always check `git log -- net/mptcp/` and your distro's security advisory feed.
- One claim in the user-supplied task is wrong and we corrected it: "BALIA RFC 8203" — RFC 8203 is unrelated; BALIA is `draft-walid-mptcp-congestion-control`, never an RFC.
- Specific MIT 6.829 / Stanford CS144 / CMU 15-744 lecture URLs that explicitly cover MPTCP rotate by academic year; we confirmed MPTCP appears in syllabi but did not individually re-verify each 2025–26 lecture URL — those are flagged `[needs source]` in §9.
- The OVH and Free Mobile (France) MPTCP deployment claims in the task brief — we found community discussion but no authoritative deployment numbers. `[needs source]`
- The "Tessares" name etymology (from Latin *tessera*) is from interview recall, not a verified source. `[needs source]`
- "Apple's `AF_MULTIPATH` family on macOS" — Apple's own docs note this is undocumented and intended for system frameworks; we did not test current 2026 behaviour.
- Date-sensitive items (kernel versions, draft versions) reflect the state on 2026-05-05. The MP-QUIC draft is at -21; expect it to advance through IESG over the rest of 2026.
- Forward-looking statements about Multipath QUIC "eclipsing" MPTCP are interpretive, not predictive — both are likely to coexist for years because their deployment surfaces (TCP-vs-UDP middlebox traversal, encrypted-vs-DPI-friendly) differ.