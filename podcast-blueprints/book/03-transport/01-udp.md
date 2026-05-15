---
id: udp
type: chapter
part_id: transport
part_label: IV
part_title: Transport
title: UDP
synopsis: Three pages of RFC, no guarantees, ubiquitous.
podcast_target_minutes: 12
position_in_book: 26 of 84
listening_order:
  prev: transport/tcp
  next: transport/sctp
related_protocols: [tcp, udp, ip, dns, ntp, dhcp, rtp, quic, webrtc, sip, http3]
related_pioneers: [jon-postel]
related_outages: []
related_frontier: [moq-transport]
related_rfcs: [768, 793]
images: []
visual_cues:
  - "A side-by-side header diagram: TCP's twenty-byte header crowded with sequence numbers, ACKs, window size, and flags — next to UDP's eight bytes: source port, destination port, length, checksum. Nothing else."
  - "A timeline pin: August 1980, RFC 768 published, three pages, Jon Postel — and a flat line stretching to 2026 labelled 'no updates needed.'"
  - "A pie chart of what runs on UDP today: DNS lookups, NTP synchronisations, DHCP broadcasts, RTP media frames, and a giant slice labelled QUIC carrying HTTP/3, MoQ, RTP-over-QUIC, and HTTP/3 datagrams."
  - "A NAT router cross-section: an outbound UDP packet punching a 'pinhole' keyed by source IP and source port, with a 30-to-60-second hourglass next to it counting down to closure."
  - "A stacked area chart: UDP traffic share on the public internet from 2015 to 2026, with QUIC's contribution growing from near-zero to dominant — Cloudflare's twenty-one percent and Meta's seventy-five percent annotated."
---

# Part IV, Chapter — UDP

## The hook

RFC 768 is three pages long. Jon Postel wrote it in August 1980, two months before the first version of TCP. It has not been updated since. There has been nothing to update.

## The story

### The Unopinionated Datagram

UDP is what you get when you take IP and add the bare minimum needed to reach an application. A sixteen-bit source port. A sixteen-bit destination port. A length. A checksum. Eight bytes of header. No connection setup. No acknowledgements. No retransmission. No congestion control. No ordering. The application gets a fire-and-pray datagram service, and if it wants reliability, it implements reliability itself.

That spec, RFC 768, was published in August 1980 by Jon Postel — the next episode is about him. TCP's first version, RFC 793, came two months later in September 1981. RFC 793 has since been obsoleted by RFC 9293. RFC 768 has not been touched in forty-five years. There has been nothing to touch. UDP works, and the entire weight of "what does this protocol need to do?" sits with the application above it.

### Why Half the Internet Runs On It

That minimalism is why UDP is the foundation of so much of what you actually use.

Start with DNS. Every lookup is one datagram each way. Google Public DNS alone answers around fourteen trillion queries per day. The persistent connection model TCP gives you is overhead a recursive resolver does not need; the connection-per-query model UDP gives you scales to root-server volumes. The DNS episode covers the resolution mechanism in depth.

Then NTP. Time correction has to be precise to the microsecond. You cannot tolerate handshake delay. You cannot tolerate retransmission timing variance. UDP delivers a packet in a few milliseconds and lets the protocol math figure out clock offset from the round-trip time. The NTP episode walks through the four-timestamp exchange.

Then DHCP. You do not have an IP address yet. You cannot do TCP. UDP broadcast is the only way a host without an address can ask the network for one. The DHCP episode covers the Discover-Offer-Request-Acknowledge sequence.

Then RTP. A dropped audio packet should be ignored, not retransmitted. Late audio is worse than missing audio. RTP carries timestamps, sequence numbers, and payload-type identifiers over bare UDP, with RTCP riding alongside as the feedback channel. The RTP episode is the deep dive — and WebRTC and SIP both build on top of it.

And then, the big one. QUIC. The entire next-generation transport runs inside UDP datagrams to escape kernel ossification. By 2026, QUIC carries roughly twenty-one percent of Cloudflare-observed web traffic and over seventy-five percent of Meta's internet bytes. UDP's role as the QUIC substrate has made it the fastest-growing protocol on the internet by relative volume. The QUIC episode and the chapter on the QUIC redesign tell that story.

The single thing UDP gives you above raw IP is ports — the sixteen-bit demux that picks which application receives the packet on a given host. That is the entire reason multiple applications can share a host's network adapter. It is most of what Layer 4 needs to be.

### NAT Pinholes Are a UDP-Specific Concern

There is one operational cost the spec does not mention. A NAT router opens a pinhole for outbound UDP keyed by source IP and source port. The pinhole closes after a few minutes of silence. For long-lived UDP applications — VoIP, IoT keepalives, QUIC connections that have gone idle — you must send a keepalive every thirty to sixty seconds to keep the pinhole open. Otherwise the next inbound packet gets dropped at the NAT. This is one of the reasons WebRTC and SIP both have explicit keepalive timers despite their underlying transports having no need for them. The WebRTC episode and the SIP episode both spend time on this.

### The QUIC Renaissance

Almost all internet UDP traffic growth in the last five years has been QUIC. Where UDP used to be a niche transport for DNS, NTP, and RTP, it now carries the majority of HTTP/3 traffic plus the entire next generation of media transports. Media-over-QUIC Transport rides on QUIC. RTP-over-QUIC is in IETF Working Group Last Call as of July 2025, draft fourteen. HTTP/3 datagrams shipped as RFC 9297. MASQUE — the proxy stack behind iCloud Private Relay and Cloudflare WARP — sits on RFCs 9298 and 9484.

Linux 6.13, in early 2025, landed io_uring zero-copy send and receive paths for UDP, dramatically improving QUIC server performance. The kernel-versus-userspace performance gap — the basis of the 2024 ACM paper that showed forty-five percent throughput regressions for QUIC over fast networks — is being closed.

The longer arc is in-kernel QUIC. Xin Long's nine-thousand-line patch series, posted in July 2025, puts QUIC into the Linux kernel as IPPROTO_QUIC, mirroring IPPROTO_MPTCP. Mainline merge is expected in 2026. When that ships, QUIC will run alongside TCP at kernel speeds — and UDP will become an even larger share of the internet's transport mix.

The protocol itself has not changed. The role it plays has been reshaped by what was built on top of it.

## The figures

### Jon Postel

Postel edited the foundational TCP/IP RFCs — RFC 791 for IPv4 in September 1981, RFC 792 for ICMP, RFC 793 for TCP, and RFC 768 for UDP in August 1980, three pages long, the most spartan and durable spec in networking. He served as the RFC Editor for nearly three decades and was the first steward of IANA. In 1978, with David Reed, he argued for splitting the original monolithic TCP into IP plus a separate transport layer — the architectural decision that made UDP and, decades later, QUIC possible. The Robustness Principle — be conservative in what you send, be liberal in what you accept — first appeared in his RFC 760 introduction and entered the cultural canon. Inducted into the Internet Hall of Fame in 2012; received the IEEE Internet Award in 1999. There is a separate episode on Postel.

### Media-over-QUIC Transport

Draft seventeen of the IETF MoQ Transport spec, dated March 2026, defines sub-second live streaming over QUIC — designed to replace the RTMP-into-HLS pipeline that streamers use today. Cloudflare and Meta have public MoQ relay implementations; Twitch and YouTube are evaluating. The MoQ entry on the Frontier page has the architecture: publishers send named objects to relays, subscribers fetch named objects from the nearest relay, and a relay can drop objects under congestion — preserving key frames over delta frames — without coordinating with the publisher.

### RFC 768 — User Datagram Protocol

Published August 1980, edited by Jon Postel. Internet Standard. Three pages. Defines the eight-byte UDP header — source port, destination port, length, checksum — over IP. Has not been updated.

### RFC 793 — Transmission Control Protocol

Published September 1981, edited by Jon Postel. Now Historic, obsoleted by RFC 9293. The original TCP specification — the protocol UDP shipped two months ahead of, and the foil that defines what UDP deliberately leaves out.

## What you'd see in the simulator

Press Play on the UDP simulation and you will see fire-and-forget on the wire. The client builds a datagram — eight bytes of header wrapped around the application payload — and hands it to IP. There is no SYN. There is no handshake. The packet leaves. The server receives it and processes it. There is no acknowledgement returned. If the client wants to know whether the packet arrived, the application has to ask. If the packet is lost in flight, no one retransmits it. That is the entire point. The simulation makes the contrast to the TCP lifecycle visible in a single side-by-side: the TCP path needs three packets before any application data flows; the UDP path is one packet, one direction, done.

## Listening order

- **Before this chapter:** *TCP* — the reliable, ordered, congestion-controlled transport that defines, by contrast, everything UDP chooses not to do.
- **After this chapter:** *SCTP* — the message-oriented, multi-streaming, multi-homing transport that tried to be a better TCP and ran straight into the middlebox problem UDP avoids by design.

## Where to go deeper

- **The TCP episode** is the contrast study — the twenty-byte header, the three-way handshake, slow start, AIMD, CUBIC, and BBRv3 as Google's default since 2023.
- **The QUIC episode** picks up the user-space transport that rides inside UDP — the one-RTT handshake, zero-RTT resumption, per-stream loss recovery, connection migration.
- **The HTTP/3 episode** is HTTP carried over QUIC carried over UDP — independent streams, no head-of-line blocking, the path to roughly thirty-five percent of web traffic by 2025.
- **The DNS episode** is the canonical UDP application — fourteen trillion queries per day on Google Public DNS alone, one datagram each way.
- **The NTP episode** explains how the four-timestamp exchange over UDP keeps every clock on the internet synchronised to the millisecond.
- **The DHCP episode** is the Discover-Offer-Request-Acknowledge dance — the only way a host without an IP can broadcast for one.
- **The RTP episode** is real-time media over UDP — sequence numbers, timestamps, payload types, and RTCP feedback.
- **The WebRTC episode** and the **SIP episode** are where the NAT-pinhole keepalive story actually shows up in production.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
