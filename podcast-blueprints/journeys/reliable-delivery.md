---
id: reliable-delivery
type: journey
title: Evolution of Reliable Delivery
scope: transport
podcast_target_minutes: 15
step_count: 4
protocols_in_order: [tcp, sctp, mptcp, quic]
related_protocols: [tcp, sctp, mptcp, quic, udp, tls, http2, http3, ipv4, wifi]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: TCP, then SCTP, then MPTCP, then QUIC — with a sidebar listing what each one fixes about the previous one"
  - "Head-of-line blocking diagram: a single TCP byte stream stalled by one lost packet, with several HTTP/2 streams piled up behind it waiting; alongside, an SCTP association where one stream stalls and the others keep flowing"
  - "Multi-homed phone using MPTCP: two parallel subflows — one over WiFi, one over cellular — feeding a single logical connection, with a smooth handoff as the WiFi bar drops"
  - "QUIC handshake timeline next to a TCP-plus-TLS handshake timeline: 1-RTT versus 2-RTT for a fresh connection, 0-RTT versus 1-RTT for a repeat visit"
  - "QUIC connection identified by a Connection ID rather than IP-and-port: the same connection surviving a network change as the device migrates from WiFi to cellular"
---

# Evolution of Reliable Delivery

## In one breath
This journey traces forty years of one stubborn problem: how do you move
bytes reliably across an unreliable internet without each new generation
of applications hitting the same wall the last one did. Four transport
protocols, each one answering the failures of the one before it, ending
in the design that now carries HTTP/3 for billions of users every day.

## The hook (cold-open)
Reliable delivery sounds like a solved problem. TCP has been doing it
since 1981. But every time the way we use the network changes — when
the web learns to multiplex, when phones gain two radios, when latency
matters more than throughput — TCP's design starts to creak in a new
place. In the next few minutes we walk the four transport protocols
that tried, in order, to fix what the previous one couldn't. TCP, then
SCTP, then Multipath TCP, then QUIC. Same job. Four very different
answers.

## The journey

### Step 1 — TCP: The Original (TCP)
TCP has been the workhorse of reliable internet communication since
1981. Its job is simple to state and very hard to do: guarantee that
every byte arrives, in order, with no duplicates, over a network that
loses, reorders, and duplicates packets at will. Underneath, it does
this with sequence numbers, acknowledgements, retransmission timers,
and a sophisticated congestion controller — algorithms like Reno,
CUBIC, and BBR that constantly probe the network to find a sending rate
that's fast but fair. The full mechanism is in the TCP episode. The
fact worth holding on to here is the shape of what TCP delivers: a
single ordered byte stream. Exactly one. Everything that travels over a
TCP connection is, from TCP's point of view, the same conversation.
That assumption was fine for one file at a time. It became a problem
when HTTP/2 started multiplexing dozens of requests over a single TCP
connection — because a single lost packet now blocks every one of those
streams until the retransmission arrives. This is head-of-line blocking,
and it gets more painful the more concurrent data a connection carries.

TCP's single-stream design meant that loss in one logical conversation
blocked every other conversation sharing the same connection. The
telecom industry, which needed to carry many independent signaling
messages over the same association at the same time, could not live
with that. They went and built something different.

### Step 2 — SCTP: Multi-Streaming (SCTP)
SCTP was the first transport protocol to attack head-of-line blocking
head-on. Inside a single SCTP association, it carries independent
streams. A lost packet on stream 5 stalls only stream 5 — streams 1
through 4 keep flowing. SCTP also pioneered multi-homing: a single
association can span multiple IP addresses on each endpoint, so if a
network interface goes down, the association fails over to another one
automatically, with no help from the application. And unlike TCP's raw
byte stream, SCTP preserves message boundaries natively, which makes it
a natural fit for structured signaling — most famously SS7 over IP,
where every message is a discrete unit. SCTP never made it to the open
web, because most NATs and firewalls in the path simply do not
understand SCTP packets and drop them. The full mechanism is in the
SCTP episode. The reason it earns a step in this journey is that its
two big ideas — independent streams and multi-homing — turned out to be
exactly the ideas the next two protocols would borrow.

SCTP proved that independent streams kill head-of-line blocking, and
that multi-homing buys you resilience for free. But fail-over is a
defensive use of multiple paths. The next question was the offensive
one: what if you didn't just keep a spare path warm, but actively used
all of them at once to add up their bandwidth?

### Step 3 — MPTCP: Multiple Paths (MPTCP)
Multipath TCP extends standard TCP to use several network interfaces at
the same time. Your phone can send and receive over WiFi and cellular
simultaneously, aggregating the bandwidth of both. Walk out of WiFi
range and the cellular subflow keeps the connection alive — no drop,
no reconnection delay, the application above never notices. Underneath,
MPTCP opens multiple TCP subflows and spreads data across them, with a
coupled congestion controller that balances load across the paths
fairly so it doesn't stomp on single-path TCP traffic sharing the same
links. Apple uses MPTCP in iOS for Siri and Maps, and it's the
machinery behind the seamless WiFi-to-cellular handoffs you experience
every day without noticing. The full mechanism is in the MPTCP episode.
The tradeoff worth naming is complexity: a scheduler now has to decide
which path each chunk of data goes down, and reordering at the receiver
adds its own latency to the cost.

MPTCP showed how powerful multiple paths can be. But it inherited
TCP's old constraints — the three-way handshake before any data can
flow, a kernel implementation that's slow to update across the
internet's installed base, and middleboxes in the path that get
confused by anything they haven't seen before. To fix those, you'd have
to start over: throw away the assumption that the transport lives in
the kernel and on top of IP, and design something new with all of the
last forty years of lessons baked in from day one.

### Step 4 — QUIC: The Modern Synthesis (QUIC)
QUIC is what you get when you take everything TCP, SCTP, and MPTCP
taught us and start fresh. It rides on top of UDP, which lets it slip
past the ossified middleboxes that strangled SCTP and that constrain
what TCP can change. Reliability and congestion control move out of the
kernel and into userspace, which means a browser can ship a new
congestion controller in a release without waiting on operating-system
upgrades. From SCTP, QUIC borrows independent streams, so loss on one
stream no longer stalls the others. It folds TLS 1.3 directly into its
own handshake, so a fresh secure connection costs a single round trip,
and a repeat visit can cost zero. And instead of identifying a
connection by the IP-and-port tuple the way TCP does, it identifies it
by a variable-length Connection ID — which means the same connection
can survive a network change. Switch from WiFi to cellular mid-call and
QUIC migrates the connection rather than dropping it. Google built it,
the IETF standardized it, and it now carries HTTP/3 for a large slice
of the web. The full mechanism is in the QUIC episode. Here it's the
synthesis that matters: every one of QUIC's headline features is an
answer to a specific failure mode of one of the protocols that came
before it.

## What the listener now understands
This is what protocol evolution actually looks like up close. Each of
these four protocols was a serious answer to a real failure of the one
before it. TCP gave the internet reliable delivery and held the line
for forty years, but its single byte stream couldn't survive the move
to multiplexed traffic. SCTP fixed the streams and added multi-homing,
but the network it had to live on wouldn't carry it. MPTCP smuggled
multi-path back into the world by hiding it under a TCP-shaped wrapper
the network already trusted. And QUIC took the lessons and the wrapper
trick — UDP underneath, kernel bypass, TLS folded in, streams from
day one, connections that survive a network change — and put it all in
a single design. None of these protocols is wrong. Each one is the
right answer to the question its era was asking.

## Where this connects in the book
- The chapter on TCP is the foundation everything in this journey
  depends on — sequence numbers, the three-way handshake, congestion
  control, and the reasons its single byte stream became a bottleneck.
- The chapter on SCTP unpacks multi-streaming and multi-homing, and
  why telephony signaling pushed them into existence even though the
  open web never adopted them.
- The chapter on MPTCP walks through the subflow model, the coupled
  congestion controller, and the practical deployments — most visibly,
  the WiFi-to-cellular handoffs Apple ships in iOS.
- The chapter on QUIC ties the whole thread together: UDP underneath,
  userspace transport, TLS 1.3 in the handshake, and the Connection ID
  that finally decouples a connection from a network address.

## See also (other journeys and protocol episodes)

- The QUIC episode is the natural next listen if the synthesis at the
  end of this journey was the part that grabbed you. It goes deeper on
  the handshake, the streams, and connection migration.

- The TCP episode is where to go if the head-of-line blocking story
  felt important and you want to see exactly why a single lost packet
  can stall a whole multiplexed conversation.

- For where these transports actually show up on the wire, the journeys
  on what happens when you type a URL and on the wire-to-web walk give
  you TCP and QUIC in their natural habitat — carrying real HTTP
  traffic for a real page load.

- The SCTP and MPTCP episodes are the right pair if you want to see the
  ideas QUIC borrowed in their original setting, before they were
  reassembled into a new design.

## Visual cues for image generation

- Four-node graph lighting up in sequence: TCP, then SCTP, then MPTCP,
  then QUIC — with a sidebar noting what each one fixes about the
  previous one.
- Head-of-line blocking diagram: a single TCP byte stream stalled by
  one lost packet, with several HTTP/2 streams piled up behind it
  waiting; alongside, an SCTP association where one stream stalls and
  the others keep flowing.
- A multi-homed phone running MPTCP: two parallel subflows, one over
  WiFi and one over cellular, feeding a single logical connection, with
  a smooth handoff as the WiFi bar drops.
- QUIC handshake timeline next to a TCP-plus-TLS handshake timeline:
  1-RTT versus 2-RTT for a fresh connection, and 0-RTT versus 1-RTT
  for a repeat visit.
- A QUIC connection identified by a Connection ID rather than an
  IP-and-port tuple: the same connection surviving a network change as
  the device migrates from WiFi to cellular.
