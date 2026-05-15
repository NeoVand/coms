---
id: transport/sctp
type: chapter
part_id: transport
part_label: IV
part_title: Transport
title: SCTP
synopsis: Multi-stream, multi-homed — niche but architecturally important.
podcast_target_minutes: 12
position_in_book: chapter 27 of 75
listening_order:
  prev: transport/udp
  next: transport/mptcp
related_protocols: [sctp, tcp, quic, udp, ip, mptcp, webrtc, http2, http3, grpc, websockets]
related_pioneers: []
related_outages: []
related_frontier: [multipath-quic]
related_rfcs: [2960, 9260, 8831]
images: []
visual_cues:
  - "A 1990s telephone switch with copper SS7 lines on one side and an IP router with Ethernet cables on the other, labeled 'SS7 over IP' bridging the two."
  - "Side-by-side comparison: a single TCP connection as one pipe with a clog blocking everything; an SCTP association as four parallel pipes where one clog leaves the others flowing."
  - "A laptop with two IP addresses (Wi-Fi and Ethernet) connected by an SCTP association to a server with two IP addresses, with one path crossed out and traffic continuing on the surviving path."
  - "A middlebox labeled 'NAT / firewall' with three packets approaching: TCP and UDP pass through green checkmarks, an SCTP packet hits a red wall."
  - "A WebRTC data channel stack diagram: SCTP on top, DTLS in the middle, UDP at the bottom, with the browser logo above and the open internet below."
---

# Part IV, Chapter — SCTP

## The hook
SCTP is the better TCP that lost the deployment war. It shipped in October 2000 with multi-streaming, multi-homing, and message boundaries — the exact features QUIC would re-invent fifteen years later. It still lost. The reason is the most useful lesson in modern transport design: if you want a new transport on the deployed internet, you must tunnel inside UDP. SCTP did not, and it paid for it.

## The story

### A protocol born from telephony
In the late 1990s, the SS7 telephony signalling protocol was being moved onto IP. The PSTN's reliability requirements — sub-second failover when a link dies — embarrassed TCP. A TCP connection bound to a single source/destination pair will hang indefinitely when its path fails, regardless of whether other paths to the same endpoint are working. Phone networks could not accept that. Randall Stewart at Cisco, working with the IETF SIGTRAN group, designed a replacement.

The result was SCTP — the Stream Control Transmission Protocol — published as RFC 2960 in October 2000 and refreshed as RFC 9260 in June 2022. SCTP is TCP redesigned with three improvements.

The first is multi-streaming. A single SCTP association carries multiple independent streams that do not block each other on loss. The exact head-of-line-blocking fix that QUIC would later adopt — how QUIC actually does it is the QUIC episode.

The second is multi-homing. An association can be bound to multiple IP addresses on each side, and traffic seamlessly moves to a healthy path when one fails. MPTCP would later approximate this for TCP, and the next chapter is about MPTCP.

The third is message-orientation. Data is delivered as discrete messages, not a stream of bytes that the application has to re-frame. The application's send is the application's recv on the other side. No framing layer required.

### Why it failed deployment
SCTP is, on paper, the better protocol. It powers SS7-over-IP and Diameter, the LTE and 5G signalling stack, and a few specialised use cases. But it failed to displace TCP for general use because NAT and firewall middleboxes do not understand it.

An SCTP packet between Internet endpoints is dropped almost immediately. Home routers, corporate firewalls, mobile carriers, and most cloud load balancers either silently discard SCTP or have explicit rules treating non-TCP, non-UDP traffic as suspicious. The protocol is technically right and operationally invisible.

The deeper lesson is the one QUIC took to heart: if you want a new transport on the deployed internet, you must tunnel inside UDP. SCTP did not, and was confined to controlled networks. QUIC did, and is rapidly becoming the default — that whole story is the QUIC episode. Multipath QUIC, which entered IETF Last Call in late 2025, brings SCTP-style multi-homing into a transport that actually traverses middleboxes.

### Callout — WebRTC data channels are SCTP under the hood
There is one place SCTP runs successfully on the open internet: WebRTC data channels. RFC 8831, published in 2021, defines the data channel as SCTP over DTLS over UDP — the same SCTP-over-something-else trick QUIC would later generalise. Browser implementations like libwebrtc and Firefox's networking stack carry an SCTP stack in user space. WebRTC is the largest production SCTP deployment by message count, even though almost nobody knows it. The full WebRTC story is the WebRTC episode.

### What survived
Most of SCTP's good ideas survived through descendants. Multi-streaming and connection migration are core to QUIC. Multi-homing is what MPTCP approximates for TCP and what multipath QUIC is generalising. Message-orientation is the default in modern application protocols — HTTP/2 and HTTP/3 frame the bytes, gRPC adds length prefixes, WebSocket has explicit message boundaries. Each of those has its own episode.

The protocol itself remains specialised. It is the canonical example of a technically-superior transport that lost on deployment economics — and the canonical justification for QUIC's choice to tunnel inside UDP. Knowing why SCTP failed makes every modern transport-design decision clearer.

## The figures

### Multipath QUIC
The IETF draft `draft-ietf-quic-multipath` is in last call as of late 2025 / early 2026. It extends QUIC with multiple concurrent paths between endpoints — the same idea MPTCP brought to TCP, but built into QUIC's connection-ID architecture rather than bolted on as TCP options. Use cases include aggregating Wi-Fi and cellular bandwidth on a phone, seamless handover when the user changes interfaces, and reaching a multi-homed server through whichever path is fastest. The 3GPP ATSSS standard for 5G already specifies MPTCP and multipath QUIC for traffic steering between cellular and Wi-Fi. The full account is the multipath QUIC entry on the Frontier page.

### RFC 2960 — Stream Control Transmission Protocol
Published in October 2000 by Randall Stewart and colleagues. Historic status. It defined SCTP's four-way cookie handshake, multi-streaming, multi-homing, and message boundaries — the original specification that everything since has refined.

### RFC 9260 — Stream Control Transmission Protocol
Published in June 2022 by Stewart, Tüxen, and Nielsen. Proposed standard. It obsoletes the prior SCTP base spec and is the current definition of the protocol — twenty-two years of operational experience folded back into the standard.

### RFC 8831 — WebRTC Data Channels
Published in 2021 by Jesup, Loreto, and Tüxen. Proposed standard. It specifies how SCTP runs over DTLS over UDP inside the browser to provide reliable and unreliable data channels between peers — the only path by which SCTP reaches the open internet at scale.

## What you'd see in the simulator
Press play on the SCTP — Multi-Stream Association simulation and you watch a four-way handshake light up between two endpoints. The initiator sends an INIT chunk. The responder replies with INIT-ACK carrying a state cookie — that cookie is the trick that prevents SYN-flood attacks, because the responder does not allocate any state until the cookie comes back. The initiator echoes the cookie in COOKIE-ECHO, the responder confirms with COOKIE-ACK, and the association is up. From there the diagram shows multiple parallel streams carrying data inside the same association, and a second IP address on each side standing by — if the primary path fails, traffic moves to the backup without tearing down the association. That last part is what the telephony engineers came for.

## What it taught the industry
SCTP taught the industry that being technically right is not enough. The middleboxes in the path have a vote, and they vote by dropping packets they do not recognise. Every transport designed since has had to answer the SCTP question: how do you get through the deployed internet? QUIC's answer — tunnel inside UDP, terminate the protocol in user space, encrypt the wire so middleboxes cannot rewrite it — is a direct response to watching SCTP fail. The ideas SCTP pioneered survived. The protocol itself did not.

## Listening order

- **Before this chapter:** "UDP" — sets up the connectionless transport whose ubiquity is exactly what SCTP lacked and what QUIC later borrowed.
- **After this chapter:** "MPTCP" — the bolt-on retrofit that brought SCTP-style multi-homing back to TCP, twelve years late.

## Where to go deeper
- The TCP episode is the protocol SCTP was trying to improve on — single-path, byte-stream, head-of-line blocked.
- The QUIC episode picks up the deployment lesson and runs with it — multi-streaming and connection migration done right, over UDP.
- The MPTCP episode is the parallel-universe answer — keep TCP, add subflows, ship it in iOS 7 for Siri.
- The WebRTC episode covers the one place SCTP runs at internet scale, hidden inside data channels.
- The HTTP/2, HTTP/3, gRPC, and WebSockets episodes show where message-orientation finally won at the application layer.

## Visual cues for image generation
- A 1990s telephone switch with copper SS7 lines on one side and an IP router with Ethernet cables on the other, labeled "SS7 over IP" bridging the two.
- Side-by-side comparison: a single TCP connection as one pipe with a clog blocking everything; an SCTP association as four parallel pipes where one clog leaves the others flowing.
- A laptop with two IP addresses (Wi-Fi and Ethernet) connected by an SCTP association to a server with two IP addresses, with one path crossed out and traffic continuing on the surviving path.
- A middlebox labeled "NAT / firewall" with three packets approaching: TCP and UDP pass through green checkmarks, an SCTP packet hits a red wall.
- A WebRTC data channel stack diagram: SCTP on top, DTLS in the middle, UDP at the bottom, with the browser logo above and the open internet below.
