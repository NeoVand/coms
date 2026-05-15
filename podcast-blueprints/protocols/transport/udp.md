---
id: udp
type: protocol
name: User Datagram Protocol
abbreviation: UDP
etymology: "[U]ser [D]atagram [P]rotocol"
category: transport
year: 1980
rfc: RFC 768
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - story-of-the-internet/the-1981-burst
  - story-of-the-internet/the-quic-redesign
  - layer-2-3/icmp
  - transport/udp
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - web-api/http3
  - async-iot/coap
  - realtime-av/rtp-and-rtcp
  - realtime-av/webrtc
  - realtime-av/moq-transport
  - utilities-security/dns
  - patterns-failures/failure-modes
  - frontier/ultra-ethernet
related_protocols: [tcp, ip, ipv6, dns, quic, webrtc, dhcp, ntp, rtp, coap, sip, ipsec, http3, sctp]
related_pioneers: [jon-postel]
related_outages: []
related_frontier: []
related_rfcs: [768, 8085, 8200, 8899, 9000, 9221, 9250, 9369, 6935, 6936, 3828, 6335]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Arpanet_1974.svg/500px-Arpanet_1974.svg.png
    caption: The ARPANET in 1974 — the network where UDP was born. While TCP guaranteed delivery, UDP offered raw speed for the applications that needed it most.
    credit: Image — ARPANET / Public Domain, via Wikimedia Commons
visual_cues:
  - "An illustrated UDP datagram header — 8 bytes total, two 32-bit rows. Source port and destination port stacked on row one in one colour, length and checksum on row two in another. Below it, an open box labelled 'payload, up to 65,507 bytes on IPv4'. Caption: 'Everything UDP gives you above raw IP.'"
  - "A side-by-side: a TCP three-way handshake (SYN, SYN-ACK, ACK) over one full RTT before any data flows; next to it a single UDP arrow leaving the sender immediately, marked 'first byte at t=0'."
  - "A bar chart of NTP amplification: a 234-byte monlist query on the left, a 48-kilobyte response on the right, both with the same destination IP — the victim. Above the bars, '206×' in large red type and a date stamp '10 February 2014, 400 Gbps'."
  - "A stack diagram showing the modern UDP envelope: outer IP header, then UDP (8 bytes), then a frosted-glass box labelled 'QUIC — encrypted, opaque to middleboxes' inside which sit TLS 1.3 records, QUIC streams, and HTTP/3 frames. A side annotation: '21% of Cloudflare HTTP requests as of Q1 2026.'"
  - "A throughput graph from the Tailscale benchmark: x-axis is configuration, y-axis is packets per second per core. Three bars — '320–500 kpps without offloads', then a much taller '2.7 Mpps with UDP GSO + GRO + checksum offload' on the same Ryzen 9 / ConnectX-6 hardware."
  - "A timeline ribbon labelled 'UDP 1979–2026': IEN 71 (Reed, Jan 1979), RFC 768 (Postel, Aug 1980), IPv6 makes checksum mandatory (1998/2017), RFC 8085 BCP 145 (2017), RFC 9000 QUIC (2021), draft-ietf-tsvwg-udp-options IESG-approved (April 2025), in-kernel io_uring zero-copy UDP in Linux 6.13 (early 2025)."
---

# UDP — User Datagram Protocol

## In one breath

UDP is what you get when you take IP and add the bare minimum needed to reach an application: a source port, a destination port, a length, and a checksum. Eight bytes of header. No handshake, no acknowledgements, no retransmission, no ordering, no congestion control. That minimalism — three pages of spec, untouched since August 1980 — is exactly why UDP now carries every DNS lookup, every Discord voice frame, every WireGuard tunnel, and a rapidly growing share of the public web underneath HTTP/3.

## The pitch (cold-open)

In January 1979, an MIT professor named David Reed wrote a memo about something he later called, in his own words, a little embarrassing. Three pages. No handshakes, no acknowledgements, no retries. Just send a packet and hope. Forty-six years later that throwaway memo is the protocol underneath every voice call you make on Discord, every DNS lookup your browser performs, every WireGuard VPN you connect through, every TikTok and YouTube stream loaded over Chrome's HTTP/3 — and every record-breaking denial-of-service attack, including the 31.4-terabit-per-second flood Cloudflare absorbed last Christmas. The protocol is UDP, and it is the most important null in computing.

## How it actually works

The simulator demonstration is exactly five datagrams. The sender opens a UDP socket on ephemeral port 49152, picks destination port 9000, and starts writing. Datagram one ships immediately — no SYN, no SYN-ACK, no waiting. The IP header carries protocol number 17, the UDP header is eight bytes, and the application payload follows. Datagram two leaves the moment the application calls send again; the sender does not wait for the first to be acknowledged because the protocol has no notion of an acknowledgement. Datagram three is dropped somewhere on the path and neither side knows. Datagram four and datagram five arrive normally. The receiver's application reads packets one, two, four, and five — out of order if the network reordered them, with no flag indicating that three was missing. If the application cares, it numbers its own messages.

That is the entire protocol. There is no other behaviour to describe.

### Header at a glance

The UDP header is four 16-bit fields, eight bytes total. There is nothing else.

- **Source port (16 bits).** The sender's port, usually an ephemeral one in the 49152–65535 range. Optional in IPv4 (zero means unused), optional only as zero in IPv6. The receiver replies to this port.
- **Destination port (16 bits).** Required. Names the receiving application — port 53 for DNS, 67/68 for DHCP, 123 for NTP, 5060 for SIP, 4789 for VXLAN, 6081 for GENEVE, 5683 for CoAP, 443 when QUIC is squatting where HTTPS lives.
- **Length (16 bits).** Number of bytes of UDP header plus UDP data. Minimum is 8 (header only); theoretical maximum is 65,535. In practice, IPv4 caps the payload at 65,507 bytes; IPv6 jumbograms via RFC 2675 can exceed 65,535 but almost nobody uses them.
- **Checksum (16 bits).** A one's-complement Internet checksum computed over a pseudo-header, the UDP header, and the data. The pseudo-header — source IP, destination IP, the protocol number 17, and the UDP length — is reconstructed by both sides from the IP context but is not on the wire. Optional in IPv4 (zero disables it). Mandatory in IPv6 because IPv6 dropped the IP-layer header checksum. If a computed checksum comes out as zero, it is transmitted as 0xFFFF; a transmitted zero means "no checksum".

That is everything. The pseudo-header is the architectural detail to know — letting UDP see its IP context for integrity without occupying the bytes is why every IPv6 UDP tunnel encapsulation (VXLAN, GENEVE, GTP-U, WireGuard) had to negotiate special permission to ship a zero outer checksum, codified in RFC 6935 and RFC 6936.

### State machine in three sentences

UDP has no state machine. Sending is `app → sendto → kernel UDP layer prepends header and computes checksum → kernel IP layer routes and possibly fragments → device transmits`; receiving is the reverse, with the kernel demultiplexing arriving packets by destination IP and destination port to the matching socket. Message boundaries are preserved — one `sendto` produces one `recvfrom` — and that is the entire contract: no retransmission, no reordering, no duplicate suppression, no flow control, no congestion control.

### Reliability, flow, security — and what UDP does instead

UDP does none of these. The choice was deliberate: reliability, ordering, and pacing are application concerns. Three families of approach have emerged.

The first family lives with loss. DNS sends one query, waits for one response, and retries at the application layer if nothing arrives within a timeout. NTP sends a 48-byte timestamped probe and uses the receive and transmit timestamps to compute clock offset and round-trip time; a missed packet is just measured again. RTP carries a frame, and if it is lost the next frame is already on the way — late audio is worse than missing audio.

The second family rebuilds reliability inside the application. CoAP defines confirmable messages with its own message IDs and retransmission timer. SIP runs its own application-layer retry timers. WireGuard ships its own reliable, encrypted handshake on top of UDP datagrams.

The third family — the one that has reshaped the protocol's role — is QUIC. QUIC re-creates inside encrypted UDP everything TCP plus TLS does: a one-round-trip handshake (zero on resumption), per-stream sequencing with no head-of-line blocking, congestion control, key negotiation, and connection migration via 64-bit Connection IDs. Every QUIC packet is a UDP datagram. The kernel sees only opaque UDP; the entire transport runs in user space.

Security on raw UDP is whatever you bring. DTLS (RFC 9147) is TLS adapted for datagrams and is what WebRTC media, CoAP, and earlier QUIC drafts use. SRTP encrypts RTP media. Modern QUIC stacks integrate AEAD (AES-GCM or ChaCha20-Poly1305) directly. The pattern is consistent: UDP gets you onto the network; the bytes inside negotiate everything else.

## Where it shows up in production

DNS is the canonical case. Every recursive resolver in the world is a UDP server on port 53; Google Public DNS at 8.8.8.8 alone fields roughly 14 trillion queries a day, almost all of them one UDP datagram each way. The model is so well matched — small, idempotent transactions, one round-trip is the whole conversation — that even DNS over QUIC (RFC 9250, May 2022) is a UDP-based replacement, not a TCP one.

NTP is the second largest by query count. The pool — pool.ntp.org and its roughly 4,000 public servers — answers about 25 billion UDP/123 queries a day, keeping the world's clocks within a few milliseconds. TCP's connection setup and retransmission would distort the timing math.

DHCP runs on UDP because it has to. A client without an IP address cannot complete a TCP handshake; it broadcasts a DHCPDISCOVER from port 68 to port 67 as a UDP datagram. The DHCP server replies the same way. There is no other transport that can cross this bootstrap problem.

Real-time media is essentially universal on UDP. RTP plus RTCP carries audio and video for every Zoom, Teams, FaceTime, and SIP call on the planet. Discord runs the largest publicly documented RTP fleet — at peak, more than 2.6 million concurrent voice users on roughly 850 voice servers across 13 regions, pushing about 220 gigabits per second of egress and 120 million packets per second through their custom WebRTC SFUs. Discord swapped DTLS-SRTP for libsodium's xsalsa20_poly1305 inside their libwebrtc fork to save CPU at that scale.

QUIC and HTTP/3 are the largest single application of UDP today. As of Cloudflare's 2025 Year in Review, HTTP/3 carries about 21 percent of Cloudflare's HTTP requests globally; in 15 countries the share exceeds one third. Meta reported in 2020 that more than 75 percent of its internet-facing traffic was QUIC, and adoption has only deepened since. Google measured roughly 40 percent of Chrome traffic on QUIC by mid-2023. In December 2025 Cloudflare open-sourced `tokio-quiche`, the async wrapper around `quiche` that powers Apple's iCloud Private Relay, Cloudflare's Oxy proxies, and the WARP MASQUE client — handling, in their words, millions of HTTP/3 requests per second.

The mobile core hides another enormous UDP deployment. Every byte of LTE and 5G data flows between the radio access network and the core encapsulated in GTP-U on UDP/2152. Cloud SDNs add VXLAN on UDP/4789 and GENEVE on UDP/6081, both of which use RFC 6935's zero-checksum exception for IPv6 outer packets so they can scale beyond the 4,094 VLANs of classical Ethernet to about 16 million virtual networks.

WireGuard is exclusively UDP and has been a major beneficiary of recent kernel work. Tailscale's 2023 benchmark on a Ryzen 9 3950X with a ConnectX-6 Dx and a 1500-byte MTU measured a tap echo at 320 to 500 thousand packets per second per core without offloads, and 2.7 million packets per second per core with UDP GSO, GRO, and checksum offload turned on. The wireguard-go user-space implementation gained roughly 40 percent throughput just from TUN UDP GSO and GRO. Daniel Borkmann's LPC 2024 numbers showed the in-kernel WireGuard plus UDP GRO at about 15 percent over baseline at 1500 MTU and about 17 percent at 8K MTU.

## Things that go wrong

UDP's core architectural weakness is that the protocol does not verify the return path before the response is sent. Spoof a source IP, send a small request to a service that returns a large response, and the response goes to the victim. This pattern has produced the largest distributed denial-of-service attacks in history.

The 2014 NTP amplification campaign was the moment the industry learned the lesson. NTP has a diagnostic command, `monlist`, that returns the last 600 IP addresses to query the server. Most operators did not know it existed. Tens of thousands of NTP servers exposed it on UDP port 123 with no authentication. A 234-byte `monlist` query with the victim's address spoofed as source returned about a 48-kilobyte response — to the victim. On 10 February 2014 Cloudflare's Matthew Prince posted "Someone's got a big new cannon. Start of ugly things to come." The peak was 400 gigabits per second, sourced from roughly 4,529 vulnerable servers, an amplification factor of about 206 times. Within ten days more than three quarters of the vulnerable NTP servers had been patched or filtered. The genie was out — amplification became the dominant DDoS vector for the next decade.

The 2018 GitHub memcached attack pushed it further. memcached over UDP/11211 had a worst-case amplification factor of about 51,000. On 28 February 2018 GitHub absorbed 1.35 terabits per second at 126.9 million packets per second; days later Arbor reported a 1.7 terabit strike against an unnamed customer. memcached has since defaulted UDP off.

The Mirai-class botnets escalated the bandwidth side. October 2024 saw a 3.8 terabit per second flood at Cloudflare; on 29 October 2024 they absorbed 5.6 terabits per second from roughly 13,000 IoT devices in 80 seconds. Mid-May 2025 brought a 7.3 terabit per second multi-vector attack against a Magic Transit hosting customer, 99.996 percent of which was UDP floods plus reflection from QOTD, Echo, NTP, Mirai UDP, Portmap, and RIPv1. In September 2025 the Aisuru botnet pushed 22.2 terabits per second at 10.6 billion packets per second for 40 seconds at a single European IP, characterised as a UDP carpet bomb across roughly 31,000 destination ports per second. On 24 October 2025 Microsoft Azure neutralised a 15.72 terabit per second Aisuru UDP flood at a single Australian IP from over 500,000 sources. Late 2025 — what Cloudflare calls "Night Before Christmas" — pushed the record to 31.4 terabits per second for 35 seconds, plus 200-million-requests-per-second L7 attacks, attributed to the Aisuru-Kimwolf botnet.

QUIC has produced its own incidents. CVE-2025-4820 and CVE-2025-4821 in Cloudflare's `quiche` lacked ACK-range validation, opening Optimistic ACK attacks that force a server to over-send — both DDoS amplification and server CPU exhaustion in one bug. Patched in 2025. The NCC Group disclosed Hash-DoS bugs in the connection-ID hashtables of multiple QUIC stacks — picoquic (CVE-2025-24946), xquic (CVE-2025-47200), ngtcp2, Apache Traffic Server, Ericsson Rask — fixes shipped Q1 and Q2 2025. The HTTP/2 Rapid Reset class (CVE-2023-44487) was TCP-only, but QUIC analogues — many cheap streams over one connection causing CPU exhaustion — are an active vendor-mitigation area in 2024 through 2026.

The kernel side has its own steady drumbeat. CVE-2024-36971 was a use-after-free in `__dst_negative_advice()` triggered through UDP socket `dst_cache` clearing without proper RCU — local privilege escalation, CVSS 7.8. The 2024 Linux kernel CVE flood — about 3,529 CVEs after the kernel team became its own CNA, roughly a 10x year-on-year jump — reflects a process change more than a real bug-rate change, but UDP and IPv6 paths show up across the list.

The Cloudflare 18 November 2025 outage was not UDP-related — a database permissions change in a ClickHouse cluster doubled the size of a Bot Management feature file and crashed proxy processes — but during early triage Cloudflare initially suspected a hyper-volumetric DDoS. That is a useful illustration: the UDP amplification threat model now shapes how the industry's incident response begins, even when the actual cause is a config push.

For the deeper history of why these incidents matter, the Failure Modes chapter episode walks through the broader bestiary — bufferbloat, ossification, head-of-line blocking, MTU black holes — that operators learn by being burned.

## Common pitfalls (for the practitioner)

**No congestion control by default.** Sending UDP at line rate without backoff is what brought the internet down in 1986. RFC 8085 — the Eggert/Fairhurst/Shepherd UDP Usage Guidelines, BCP 145, March 2017 — is the operational bible: it mandates congestion control for UDP applications and is the document any UDP service should be measured against. The cure is to use a transport library that pacing already lives inside (QUIC, RTP with feedback) rather than rolling your own.

**Fragmentation equals unreliable delivery.** A UDP datagram larger than the path MTU gets fragmented at the IP layer; if any one fragment is dropped, the entire datagram is lost because there is no per-fragment retransmit, and many middleboxes silently drop fragments anyway. The cure is to keep payloads under about 1,400 bytes for safety, or to use Datagram Packetization Layer Path MTU Discovery (RFC 8899) and resend at the application layer. On Linux, set `IP_MTU_DISCOVER` or `IPV6_MTU_DISCOVER` to `IP_PMTUDISC_PROBE` rather than `_DO` — `_DO` trusts ICMP and is vulnerable to blind performance-degrading ICMP attacks (RFC 5927).

**EMSGSIZE means the path got narrower.** When the kernel returns EMSGSIZE on `sendto`, the path MTU dropped and PMTUD is enabled. Handle it by retrying with a smaller payload. QUIC stacks use this to update the path's max datagram size on the fly.

**NAT pinholes close.** A NAT router opens a pinhole for outbound UDP keyed by source IP and source port; the pinhole closes after a few minutes of silence. Long-lived UDP applications — VoIP, IoT keepalives, idle QUIC connections — must send a keepalive every 30 to 60 seconds or the next inbound packet is dropped at the NAT. This is why WebRTC and SIP both have explicit keepalive timers despite their underlying transports having no need for them. On the receiving side, the conntrack defaults — `nf_conntrack_udp_timeout` at 30 seconds, `udp_timeout_stream` at 120 seconds — need bumping for WireGuard and long-lived QUIC.

**Ephemeral port exhaustion.** A high-rate UDP client opening a fresh socket per request will exhaust `net.ipv4.ip_local_port_range` (default about 28,000 ports). The cure is either to reuse a connected UDP socket or to expand the range to 1024–65535 on dedicated egress hosts.

**IPv6 makes the checksum mandatory.** A UDP datagram with checksum zero is forbidden by default in IPv6 (RFC 8200 §8.1); receivers must discard such packets and should log them. Tunnel encapsulations get the carve-out via RFC 6935 and 6936; ordinary applications do not.

**Source-port randomisation matters for security too.** Dan Kaminsky's 2008 DNS cache-poisoning attack worked because resolvers were not randomising the source port, leaving only the 16-bit transaction ID as entropy. The fix made source-port randomisation mandatory; the deeper fix is DNSSEC (slow) and DoT/DoH/DoQ (faster).

## Debugging it

The first stop is `cat /proc/net/snmp | grep Udp:`. The fields to read are `InDatagrams`, `OutDatagrams`, `NoPorts` (packets to closed ports), `InErrors` (mostly checksum failures), `RcvbufErrors` and `SndbufErrors` (socket buffer overflow), and `InCsumErrors`. `ss -uap` enumerates UDP sockets and queue depths; `ss -uxapn` adds Unix-socket plus address detail. `nstat -as | grep -i udp` is the modern alternative.

For socket buffer tuning, raise `net.core.rmem_max`, `net.core.wmem_max`, `net.core.rmem_default`, and `net.ipv4.udp_mem`. At least 16 megabytes for high-rate receivers is the rule of thumb; otherwise watch for `RcvbufErrors`. `SO_REUSEPORT` lets multiple processes or threads bind the same address and port and the kernel hashes flow tuples to balance load — essential above about 100,000 packets per second and the foundation underneath every major QUIC server.

For throughput, GSO and GRO are the levers. `setsockopt(UDP_SEGMENT, gso_size)` lets an application hand the kernel a super-buffer up to 64 segments times MSS, with segmentation deferred until the device driver. `ethtool -k` shows what the NIC supports; `tx-udp-segmentation` is the one to look for. Pair with `SO_TXTIME` and `fq` for pacing. Checksum offload is required for GSO to be correct — `ethtool -K eth0 tx on rx on`. On a QUIC server, GSO plus `sendmmsg` can yield 2 to 5x throughput; Cloudflare's "Accelerating UDP packet transmission for QUIC" series is the canonical writeup.

On the wire, `tcpdump -nn -i any 'udp port 53'` is the cheap default. Wireshark with the QUIC dissector and SSLKEYLOGFILE handles the encrypted case — Wireshark 4.x has full QUIC support. `bpftrace` probes on `udp_recvmsg` and `udp_sendmsg` give per-syscall visibility. For deterministic protocol unit tests, `packetdrill` will replay a scenario reliably enough to file a bug. For load, `secnetperf` (msquic) and Cloudflare's `quiche` perf tool are the QUIC-aware analogues to iperf3 — note that iperf3 itself is TCP-only and does not exercise UDP GSO or GRO.

For kernel-bypass UDP, AF_XDP and XDP enable line-rate processing — Cloudflare's gatebot, Meta's Katran, and Google's Maglev clones all sit here.

## What's changing in 2026

**Early 2025: io_uring zero-copy for UDP.** Linux 6.13 landed io_uring zero-copy send and receive paths for UDP, dramatically improving QUIC server performance. The kernel-versus-user-space gap that the 2024 ACM paper "QUIC is not Quick Enough over Fast Internet" had quantified at up to a 45.2 percent throughput regression above 500 megabits per second is being closed.

**April 2025: UDP Options approved by the IESG.** After about 45 revisions, `draft-ietf-tsvwg-udp-options` (Touch and Heard, eds.) was approved at the 3 April 2025 IESG telechat as a Proposed Standard updating RFC 768. It defines a TLV options "surplus area" between UDP Length and IP Length, finally giving UDP something like TCP's options without breaking RFC 768 wire compatibility — safe options like NOP, EOL, FRAG, MDS, MRDS, REQ/RES, TIME, AUTH, APC, plus a separate UNSAFE class for compression, encryption, and experimental use. The companion `draft-ietf-tsvwg-udp-options-dplpmtud` was approved alongside. RFC publication is imminent rather than final as of compilation; check the RFC Editor queue.

**March 2025: practical guidance on UDP fragmentation.** `draft-seemann-tsvwg-udp-fragmentation` documented how to set `IP_MTU_DISCOVER` and `IPV6_MTU_DISCOVER` correctly to avoid both kernel-side and on-path fragmentation — current best practice for any UDP service operator.

**March 2026: Multipath QUIC at draft -21.** `draft-ietf-quic-multipath` is the most active QUIC extension under design, allowing a single QUIC connection to use several network paths simultaneously. Inherits Multipath TCP's algorithmic ideas — subflows, coupled congestion control, packet scheduling — inside a transport that traverses middleboxes, because the multipath logic is encrypted inside the UDP envelope. Apple, Alibaba, and Tessares have already deployed predecessors. The MPTCP chapter episode covers the long arc of how this idea travelled from kernel TCP into QUIC.

**March 2026: Media over QUIC at draft -17.** `draft-ietf-moq-transport` is the first IETF media transport that intentionally is not RTP — sub-second one-to-many publish/subscribe at CDN scale. NAB 2026 (28 April 2026) demoed MoQ interop across eleven vendors under a new OpenMOQ Software Consortium. Cloudflare opened the first global MoQ relay network late 2025 across 330+ cities. The MoQ Transport chapter episode is the place for the working-group-fork drama and where it sits versus WebRTC and HLS.

**2025: QUIC adoption plateau and the in-kernel push.** HTTP/3 is at roughly 21 percent of Cloudflare-observed traffic — flat or slightly declining for several months. Xin Long posted the first roughly 9,000-line in-kernel QUIC patch series for Linux on 22 July 2025; the design uses `IPPROTO_QUIC`, mirroring `IPPROTO_MPTCP`, with the TLS handshake delegated to user space via `tlshd`. Mainline merge is expected 2026 at earliest. When in-kernel QUIC ships, the throughput gap with kernel TCP closes and UDP's share of the transport mix grows further.

**2025: Post-quantum TLS over QUIC by default.** By the end of 2025 the majority of Cloudflare-served human traffic uses hybrid post-quantum key exchange. Apple iOS 26, iPadOS 26, and macOS Sequoia (September 2025) turned this on by default for TLS, dragging QUIC along with it.

**2025: stateful, QUIC-aware DDoS mitigation as the new default.** Microsoft Azure DDoS Protection added QUIC-aware filtering by default in 2025; Cloudflare's `tokio-quiche` includes ACK validation. Per-protocol filtering of memcached/UDP, NTP `monlist`, SSDP, Chargen, and QOTD reflection sources is now table stakes.

**2026: Quad9 enables DoH/3 and DoQ globally.** RFC 9250 (DNS over Dedicated QUIC, May 2022) is moving from AdGuard-only territory into mainstream resolvers. Every DoQ query is, of course, a UDP datagram.

If we had to bet for 2027: UDP options deployed in production for transport telemetry, a Multipath QUIC RFC published, and HTTP/3's share at major CDNs passing HTTP/2.

## Fun facts (host material)

**RFC 768 is three pages long.** Header format, length field, checksum, a paragraph of prose, and references — the entire spec. Jon Postel wrote it in August 1980, two months before the first version of TCP. It has not been updated since. There has been nothing to update. RFC 9000, the QUIC successor that re-invents reliable transport on top of UDP, is 211 pages.

**The "User" in User Datagram Protocol means the application programmer, not the human.** Reed and Postel were drawing a contrast to "Internet Datagram Protocol" — the working title of the new IP layer — and "Host-Host Protocol", the older ARPANET name. UDP delivers datagrams to user processes via ports. The "Universal Datagram Protocol" expansion you sometimes see is wrong; it has been *User* since IEN 71.

**UDP gives you ports, and that is most of what L4 needs to be.** The single thing UDP adds above raw IP is the source/destination port pair. That is the entire reason multiple applications can share a host's network adapter. Everything else — reliability, ordering, congestion control — is left to the application above. From a certain angle, RFC 768 is "TCP with almost everything removed", which is exactly what David Reed has said about it. He calls being known as "the designer of UDP" a little embarrassing.

**UDP is what the middleboxes already pass.** QUIC runs over UDP not because UDP is great, but because every NAT router, firewall, and transparent proxy on the deployed internet already has to forward UDP unchanged. SCTP is in many ways a better transport — multi-streaming, multi-homing, message-oriented — but it cannot traverse the public internet because middleboxes drop unknown protocol numbers. UDP is the deployment substrate. The SCTP chapter episode is where this lesson lives in detail; it's also the origin of QUIC's design philosophy.

**The pseudo-header is not on the wire.** Both endpoints reconstruct it from the IP header and the UDP length to compute the checksum. That single design choice — letting UDP see its IP context for integrity but not occupy its bytes — is the architectural reason IPv6 (which has no IP header checksum) had to make the UDP checksum mandatory, and the reason every IPv6 UDP tunnel encapsulation had to negotiate special permission to ship a zero outer checksum.

**The April Fools' RFC tradition that UDP fans love.** RFC 1149 — IP over Avian Carriers, D. Waitzman, 1 April 1990 — was actually implemented in 2001 by the Bergen Linux User Group with 55 percent packet loss and roughly a one-hour round-trip time. RFC 2549 added quality of service. RFC 6214 (Carpenter and Hinden, 1 April 2011) ported it to IPv6. The pioneer episode on Jon Postel covers his role as both RFC editor and the keeper of this tradition.

## Where this connects in the book

- **Foundations — "The Layer Model"** — where transport sits, why a 7-layer abstraction loses to a 4-layer reality, and the seam UDP fits into.
- **Foundations — "Packets & Encapsulation"** — frames inside packets inside segments, with UDP as the smallest possible Layer 4 envelope.
- **Foundations — "Ports & Sockets"** — how one machine runs a hundred services without confusing them, and why ports are most of what UDP gives you.
- **Foundations — "Reliability vs Speed"** — the defining tradeoff between TCP and UDP, and why QUIC tries to have both.
- **Story of the Internet — "The 1981–83 Standardisation Burst"** — the three years that turned UDP, IP, ICMP, and TCP from research notes into the production internet. The chapter that covers the architectural decision to split TCP from IP — the move that made every transport after 1980, including UDP and eventually QUIC, possible.
- **Story of the Internet — "The QUIC Redesign"** — why a new transport in 2012, why tunnel inside UDP rather than ship a new protocol number, and how SCTP's deployment failure became QUIC's design lesson.
- **Layer 2–3 — "ICMP"** — ping, traceroute, and the diagnostic backplane UDP relies on for Path MTU Discovery (and the MTU black hole that happens when ICMP is filtered).
- **Transport — "UDP"** — the chapter episode for the protocol's longer historical and architectural arc, including the QUIC renaissance and the in-kernel QUIC trajectory.
- **Transport — "SCTP"** — the better TCP that lost the deployment war. Knowing why SCTP failed makes every modern transport-design decision clearer, including UDP's role as the universal substrate.
- **Transport — "MPTCP"** — Apple's iOS 7 deployment for Siri, Korea Telecom's GIGA Path, and the multipath-QUIC succession that brings the idea inside the UDP envelope.
- **Transport — "QUIC"** — the user-space transport on UDP that changed what was possible to ship, including the 21 percent plateau and the in-kernel push.
- **Web/API — "HTTP/3"** — HTTP semantics on QUIC on UDP, and the QUIC-is-not-Quick-Enough paper that explains the plateau.
- **Async/IoT — "CoAP"** — REST shrunk for microcontrollers on UDP/5683, the QLC-Chain surprise, and EDHOC's three-message handshake.
- **Real-time A/V — "RTP and RTCP"** — the protocol Steve Casner and friends built on top of UDP from MBone in 1992, and why every RTP packet on Earth has version field 2.
- **Real-time A/V — "WebRTC"** — peer-to-peer in the browser; ICE, STUN, TURN, DTLS, SRTP — and currently the only way for a browser to send a UDP packet.
- **Real-time A/V — "MoQ Transport"** — sub-second live streaming over QUIC, the first IETF media transport that intentionally is not RTP.
- **Utilities & Security — "DNS"** — the internet's distributed phone book, the canonical UDP application, the Kaminsky moment, and the DoH/DoQ centralisation debate.
- **Patterns & Failures — "Failure Modes"** — bufferbloat, ossification, head-of-line, microloops, MTU black holes — the bestiary that explains most of UDP's operational pain.
- **Frontier — "Ultra Ethernet"** — RoCEv2 encapsulates InfiniBand transport in UDP/4791 to train Llama 3 across 24,000 GPUs at Meta; UEC 1.0 (11 June 2025) is the next iteration.

## See also (other protocol episodes)

If you have heard the **TCP** episode, the contrast is everything: TCP guarantees every byte arrives in order at the cost of latency; UDP prioritises speed by skipping reliability entirely. Connection-oriented versus connectionless, three-way handshake versus immediate first byte, 20-to-60-byte header versus 8 bytes, retransmits and AIMD versus best-effort. Use TCP when you need guaranteed in-order delivery (file transfer, web pages, email, database replication); use UDP when low latency is critical and occasional loss is acceptable (gaming, live video), or when each packet is self-contained (DNS, NTP), or when your application handles its own reliability (QUIC, WebRTC).

The **QUIC** episode is the natural sequel to this one. Raw UDP is a minimal, unreliable datagram service; QUIC builds reliability, multiplexing, and TLS 1.3 encryption on top of UDP to replace TCP plus TLS. The complexity gradient is enormous — minimal 8-byte UDP header versus a full transport with congestion control, flow control, and 0-RTT. Use UDP when your protocol handles its own reliability or you need absolute minimum overhead per packet; use QUIC when you need reliable delivery without TCP's head-of-line blocking, integrated encryption, or fast resumption.

The **DNS** episode covers UDP's most famous tenant. Every query is a single UDP datagram, every response another. Below 512 bytes (or whatever EDNS0 negotiates), UDP/53 carries the entire conversation in one round-trip; above that, the truncation bit fires and the resolver retries over TCP.

The **CoAP** episode is the IoT mirror image: REST semantics on UDP/5683 for devices that cannot afford TCP's overhead, with confirmable messages providing optional reliability inside the UDP envelope.

The **DHCP** episode shows the only-possible-transport case: a client without an IP address cannot do TCP, so UDP broadcast on port 68/67 is the bootstrap.

The **HTTP/3** episode is HTTP semantics on QUIC on UDP. UDP carries QUIC packets, QUIC carries HTTP/3 frames. UDP's universal NAT and firewall traversal is what makes HTTP/3 deployable without changes to network infrastructure.

The **NTP** episode covers the protocol where UDP's predictable, fixed-overhead transport is the entire point — TCP's variable latency from connection setup and retransmission would corrupt the timing math.

The **RTP** episode covers the real-time-media side: a 12-byte header on every UDP datagram with sequence numbers, timestamps, and payload type. UDP's lack of retransmission is a feature here — retransmitting a dropped video frame would arrive too late to be useful.

The **SCTP** episode is the lesson. SCTP can be encapsulated inside UDP per RFC 6951 to traverse middleboxes — and that encapsulation is exactly how WebRTC data channels deliver SCTP over the public internet. The SCTP-over-UDP-over-DTLS sandwich is the move QUIC later generalised.

The **SIP** episode covers VoIP signalling on UDP/5060, where short, independent messages benefit from UDP's low overhead and SIP adds its own application-layer retransmission timers.

The **WebRTC** episode is the only path by which a web browser can send a UDP packet — peer-to-peer audio, video, and data channels with ICE for NAT traversal, DTLS-SRTP for encryption, and SCTP for data channels, all riding UDP underneath.

The **IPv4** and **IPv6** episodes cover what UDP runs on. IPv4's UDP checksum is optional and the IP header has its own checksum; IPv6 has no IP-layer checksum, so the UDP checksum becomes mandatory and the pseudo-header swaps in 128-bit addresses. RFC 6935/6936 carve out the tunnel exception.

## Visual cues for image generation

- An illustrated UDP datagram header — 8 bytes total, two 32-bit rows. Source port and destination port stacked on row one in one colour, length and checksum on row two in another. Below it, an open box labelled "payload, up to 65,507 bytes on IPv4". Caption: "Everything UDP gives you above raw IP."
- A side-by-side: a TCP three-way handshake (SYN, SYN-ACK, ACK) over one full RTT before any data flows; next to it a single UDP arrow leaving the sender immediately, marked "first byte at t=0".
- A bar chart of NTP amplification: a 234-byte monlist query on the left, a 48-kilobyte response on the right, both with the same destination IP — the victim. Above the bars, "206×" in large red type and a date stamp "10 February 2014, 400 Gbps".
- A stack diagram showing the modern UDP envelope: outer IP header, then UDP (8 bytes), then a frosted-glass box labelled "QUIC — encrypted, opaque to middleboxes" inside which sit TLS 1.3 records, QUIC streams, and HTTP/3 frames. A side annotation: "21% of Cloudflare HTTP requests as of Q1 2026."
- A throughput graph from the Tailscale benchmark: x-axis is configuration, y-axis is packets per second per core. Three bars — "320–500 kpps without offloads", then a much taller "2.7 Mpps with UDP GSO + GRO + checksum offload" on the same Ryzen 9 / ConnectX-6 hardware.
- A timeline ribbon labelled "UDP 1979–2026": IEN 71 (Reed, Jan 1979), RFC 768 (Postel, Aug 1980), IPv6 makes checksum mandatory (1998/2017), RFC 8085 BCP 145 (2017), RFC 9000 QUIC (2021), draft-ietf-tsvwg-udp-options IESG-approved (April 2025), in-kernel io_uring zero-copy UDP in Linux 6.13 (early 2025).

## Sources

### RFCs

- [RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 8085 — UDP Usage Guidelines (BCP 145)](https://www.rfc-editor.org/rfc/rfc8085.html)
- [RFC 8200 — IPv6 Specification](https://www.rfc-editor.org/rfc/rfc8200.html)
- [RFC 8899 — Datagram PLPMTUD](https://www.rfc-editor.org/rfc/rfc8899)
- [RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9369 — QUIC v2](https://www.rfc-editor.org/rfc/rfc9369)
- [RFC 9250 — DNS over Dedicated QUIC Connections](https://www.rfc-editor.org/rfc/rfc9250.html)
- [RFC 6935 — IPv6 and UDP Checksums for Tunneled Packets](https://www.rfc-editor.org/rfc/rfc6935.html)
- [RFC 6936 — Applicability Statement for IPv6 UDP with Zero Checksums](https://www.rfc-editor.org/rfc/rfc6936.html)
- [RFC 3828 — UDP-Lite](https://www.rfc-editor.org/rfc/rfc3828)
- [RFC 6335 — IANA port assignment policy](https://www.rfc-editor.org/rfc/rfc6335)
- [RFC 791 — Internet Protocol](https://tools.ietf.org/html/rfc791)
- [draft-ietf-tsvwg-udp-options](https://datatracker.ietf.org/doc/draft-ietf-tsvwg-udp-options/)
- [draft-ietf-tsvwg-udp-options-dplpmtud](https://datatracker.ietf.org/doc/html/draft-ietf-tsvwg-udp-options-dplpmtud-13)
- [draft-seemann-tsvwg-udp-fragmentation](https://datatracker.ietf.org/doc/draft-seemann-tsvwg-udp-fragmentation/)
- [draft-ietf-quic-multipath](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/)
- [draft-ietf-moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- [IEN 71 — User Datagram Protocol (Reed, 1979)](https://www.rfc-editor.org/ien/ien71.pdf)
- [IESG telechat minutes, 3 April 2025](https://datatracker.ietf.org/doc/minutes-interim-2025-iesg-06-202504031400/)

### Papers

- [Edeline et al., "Using UDP for Internet Transport Evolution," ETH TIK Tech Report 366 (2016)](https://arxiv.org/pdf/1612.07816)
- [Kempf et al., "QUIC Steps: Evaluating Pacing Strategies in QUIC Implementations," Proc. ACM Netw., June 2025](https://arxiv.org/html/2505.09222v1)
- [QFAM: Mitigating QUIC Handshake Flooding Attacks Through Crypto Challenges (Dec 2024)](https://arxiv.org/html/2412.08936v1)
- [Demystifying QUIC from the Specifications (Nov 2025)](https://arxiv.org/html/2511.08375v1)
- [ODoQ paper (Sep 2025)](https://arxiv.org/html/2509.11123v1)

### Vendor and engineering blogs

- [Cloudflare — Accelerating UDP packet transmission for QUIC](https://blog.cloudflare.com/accelerating-udp-packet-transmission-for-quic/)
- [Cloudflare — Defending the Internet: 7.3 Tbps DDoS](https://blog.cloudflare.com/defending-the-internet-how-cloudflare-blocked-a-monumental-7-3-tbps-ddos/)
- [Cloudflare — Defending QUIC from acknowledgement-based DDoS attacks](https://blog.cloudflare.com/defending-quic-from-acknowledgement-based-ddos-attacks/)
- [Cloudflare — Virtual networking 101: TAP, USO, URO](https://blog.cloudflare.com/virtual-networking-101-understanding-tap/)
- [Cloudflare — MoQ: Refactoring the Internet's real-time media stack](https://blog.cloudflare.com/moq/)
- [Cloudflare — 2025 Radar Year in Review](https://blog.cloudflare.com/radar-2025-year-in-review/)
- [Cloudflare — Network performance update, Birthday Week 2024](https://blog.cloudflare.com/network-performance-update-birthday-week-2024/)
- [Cloudflare — 2025 Q4 DDoS threat report (31.4 Tbps record)](https://blog.cloudflare.com/ddos-threat-report-2025-q4/)
- [Cloudflare — Technical details behind the 400 Gbps NTP amplification attack](https://blog.cloudflare.com/technical-details-behind-a-400gbps-ntp-amplification-ddos-attack/)
- [Cloudflare — Good news: vulnerable NTP servers closing down](https://blog.cloudflare.com/good-news-vulnerable-ntp-servers-closing-down/)
- [Cloudflare — November 18, 2025 outage](https://blog.cloudflare.com/18-november-2025-outage/)
- [Cloudflare — December 5, 2025 outage](https://blog.cloudflare.com/5-december-2025-outage/)
- [Tailscale — Surpassing 10 Gb/s with Tailscale](https://tailscale.com/blog/more-throughput)
- [Tailscale — Enhance UDP throughput for QUIC and HTTP/3 on Linux](https://tailscale.com/blog/quic-udp-throughput)
- [Microsoft — Azure neutralized a 15 Tbps DDoS attack](https://techcommunity.microsoft.com/blog/azureinfrastructureblog/defending-the-cloud-azure-neutralized-a-record-breaking-15-tbps-ddos-attack/4470422)
- [Microsoft — Azure DDoS Protection now supports QUIC](https://techcommunity.microsoft.com/blog/azurenetworksecurityblog/azure-ddos-protection-now-supports-quic-protocol-%E2%80%94-securing-the-future-of-http3-/4456522)
- [Discord — How Discord handles 2.5M concurrent voice users using WebRTC](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- [Discord — Voice connections developer docs](https://docs.discord.com/developers/topics/voice-connections)
- [GitHub — February 28th DDoS Incident Report](https://github.blog/news-insights/company-news/ddos-incident-report/)
- [InfoQ — Cloudflare open sources tokio-quiche](https://www.infoq.com/news/2025/12/quic-http3-rust/)
- [Daniel Borkmann — WireGuard and GRO? (LPC 2024)](https://lpc.events/event/18/contributions/1968/attachments/1534/3213/LPC24_%20WireGuard_perf.pdf)
- [Tom Herbert — Segmentation offload and protocols](https://medium.com/@tom_84912/segmentation-offload-and-protocols-lets-be-friends-64d9e6341054)
- [NCC Group — Hash DoS in multiple QUIC implementations](https://github.com/ncc-pbottine/QUIC-Hash-Dos-Advisory)
- [Cellstream — An update on QUIC adoption and traffic levels](https://www.cellstream.com/2025/02/14/an-update-on-quic-adoption-and-traffic-levels/)
- [Quad9 — Enables DNS over HTTP/3 and DNS over QUIC](https://blog.massapi.com/posts/2026-03-30-1750-quad9-enables-dns-over-http3-and-dns-over-quic/)
- [SentinelOne — CVE-2024-36971](https://www.sentinelone.com/vulnerability-database/cve-2024-36971/)
- [CIQ — Linux kernel CVEs 2025](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)

### News

- [The Hacker News — Largest ever 400 Gbps DDoS attack via NTP amplification](https://thehackernews.com/2014/02/NTP-Distributed-Denial-of-Service-DDoS-attack.html)
- [The Hacker News — Biggest-ever DDoS attack (1.35 Tbps) hits GitHub](https://thehackernews.com/2018/03/biggest-ddos-attack-github.html)
- [The Hacker News — Mirai botnet launches record 5.6 Tbps DDoS attack](https://thehackernews.com/2025/01/mirai-botnet-launches-record-56-tbps.html)
- [SecurityWeek — Record-breaking DDoS attack peaks at 22 Tbps and 10 Bpps](https://www.securityweek.com/record-breaking-ddos-attack-peaks-at-22-tbps-and-10-bpps/)
- [Threatpost — NTP amplification blamed for 400 Gbps DDoS attack](https://threatpost.com/ntp-amplification-blamed-for-400-gbps-ddos-attack/104201/)

### Books and tutorials

- [Ilya Grigorik — High Performance Browser Networking, "Building Blocks of UDP"](https://hpbn.co/building-blocks-of-udp/)
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)
- [Stanford CS144 — Introduction to Computer Networking](https://cs144.github.io/)
- [QUIC WG implementations](https://quicwg.org/implementations)
- [Fall and Stevens — TCP/IP Illustrated, Vol 1, 2e](https://www.oreilly.com/library/view/tcp-ip-illustrated-volume/9780132808200/)

### Wikipedia

- [User Datagram Protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol)
- [David P. Reed](https://en.wikipedia.org/wiki/David_P._Reed)
- [Internet Experiment Note](https://en.wikipedia.org/wiki/Internet_Experiment_Note)
- [Virtual Extensible LAN](https://en.wikipedia.org/wiki/Virtual_Extensible_LAN)
- [IP over Avian Carriers](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers)
