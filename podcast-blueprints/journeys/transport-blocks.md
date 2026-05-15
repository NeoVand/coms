---
id: transport-blocks
type: journey
title: Building Blocks of Transport
scope: global
podcast_target_minutes: 15
step_count: 4
protocols_in_order: [udp, tcp, quic, sctp]
related_protocols: [udp, tcp, quic, sctp, dns, ssh, ipv4, http3, ethernet]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: UDP, then TCP, then QUIC, then SCTP — with a small badge on each node showing its single defining feature"
  - "Side-by-side header diagram: UDP's 8-byte header next to TCP's 20-byte header next to QUIC's variable-length packet on top of a UDP header"
  - "Head-of-line blocking visualised: one TCP stream with a lost packet stalling everything behind it, alongside one QUIC connection where four streams flow independently and only the affected stream pauses"
  - "Multi-homing diagram: a phone with two interfaces — WiFi and cellular — both bound to one SCTP association, with the active path switching when WiFi drops"
  - "A wall-clock timeline of three handshakes side by side — TCP's three-way handshake plus a TLS round trip, QUIC's combined transport-and-TLS handshake in one round trip, and QUIC's 0-RTT resume sending data immediately"
---

# Building Blocks of Transport

## In one breath
This journey walks the foundational transport protocols in the order
they appear in the story: from the simplest possible datagram to the
modern fusion that runs HTTP/3. Four protocols, four design tradeoffs,
one through-line — how the internet learned to move bytes reliably
without sacrificing speed.

## The hook (cold-open)
Every byte you send over the internet rides one of these. UDP is the
one-line protocol that just throws data at the network. TCP is the
forty-year workhorse that turned an unreliable mesh into a dependable
stream. QUIC is the modern rebuild that runs on top of UDP and powers
HTTP/3. SCTP is the one most engineers have never used, but whose ideas
quietly shaped the others. Four protocols, in order, and by the end
you'll understand why the stack looks the way it does today.

## The journey

### Step 1 — UDP: The Simple Datagram (UDP)
UDP is the bare minimum of transport. It adds just eight bytes of
overhead on top of an IP packet — a source port, a destination port,
a length, and a checksum — and that is the entire protocol. There is
no handshake. There are no acknowledgments. There are no ordering
guarantees. You hand UDP a chunk of data and it fires it into the
network. That ruthless simplicity is exactly the point. UDP is fast
because it does almost nothing. It is perfect for the cases where speed
matters more than perfection: DNS queries, live video, online gaming,
voice calls. If a packet is lost, the application gets to decide
whether to care. A missing video frame is better than waiting two
hundred milliseconds for a retransmission that arrives too late to
display anyway. The full mechanism is in the UDP episode — here we
just need to know that UDP is the protocol that gets out of your way.

UDP gives you raw speed, but plenty of applications cannot tolerate
missing or reordered data. A web page with a missing CSS file. A bank
transfer with lost bytes. A file download with gaps in the middle.
These need every byte, in the right order, every time. The internet
needed a more disciplined transport.

### Step 2 — TCP: Reliable Streams (TCP)
TCP is what turned the unreliable internet into a dependable byte
stream. It opens connections with a three-way handshake. It assigns a
sequence number to every byte. It requires acknowledgments for the data
it sends, and it retransmits anything that goes missing. On top of that
it runs congestion control — algorithms like Reno, CUBIC, and BBR that
actively probe the network to find the maximum safe sending rate without
causing collapse. TCP has been the backbone of the internet for over
forty years. HTTP rides on it. Email rides on it. SSH — there's a
separate episode on SSH — rides on it. File transfer rides on it. The
tradeoff is latency. The handshake costs a full round trip before any
data flows. Acknowledgments add delay. And the single-stream design
means head-of-line blocking — one lost packet stalls every byte queued
behind it, even if those bytes belong to unrelated requests. The full
mechanism is in the TCP episode — here we just need the picture: a
single ordered pipe, paid for in one round trip and one constant
trickle of acknowledgments.

TCP proved that reliability works at internet scale, but the cost
started to show as the web grew. One lost packet blocking unrelated
requests. A full round trip burned before any data moves. Engineers
began asking the obvious question: can we keep the reliability and
eliminate these bottlenecks?

### Step 3 — QUIC: The Modern Fusion (QUIC)
QUIC is what happens when you redesign transport from scratch with
modern needs in mind. It runs on top of UDP — deliberately — so it
passes through the existing firewalls and NATs of the internet without
asking anyone's permission. But inside that UDP envelope it implements
its own reliability, its own ordering, and its own congestion control.
The crucial move is multiplexed independent streams. A QUIC connection
carries many logical streams at once, and a lost packet on stream three
does not block streams one, two, or four. Head-of-line blocking, the
problem TCP could not escape, simply goes away. QUIC also bakes in
TLS 1.3 encryption from the start — there's a separate episode on TLS
for the deep dive — merging the transport and security handshakes into
a single round trip. On repeat connections, zero round-trip-time
resumption lets you send application data immediately, with no waiting
at all. The full mechanism is in the QUIC episode — here we just need
the headline: QUIC powers HTTP/3, which has its own episode, and it is
rapidly becoming the new default transport for the web.

QUIC solves head-of-line blocking and connection setup latency
beautifully, but it makes one assumption that does not always hold —
that the connection lives on a single network path. What happens when
a device has multiple network interfaces? WiFi and cellular on a
phone. Two Ethernet ports on a server — Ethernet has its own episode.
A wired link and a wireless backup. There is a transport designed for
exactly that scenario, and the story is older than QUIC.

### Step 4 — SCTP: Multi-Stream Transport (SCTP)
SCTP, the Stream Control Transmission Protocol, introduced two ideas
ahead of their time. The first is multiple independent message streams
inside a single association — the same multiplexing idea QUIC would
later make famous, but standardised decades earlier. The second is
multi-homing. An SCTP endpoint can bind to several IP addresses at
once and fail over between them without dropping the connection. If
one network interface goes down, SCTP seamlessly switches to another.
It was originally designed for telecom signaling — carrying phone call
setup messages between switches — and it speaks in message boundaries
rather than the raw byte stream TCP gives you. SCTP never took over the
web. NAT traversal was the killer; middleboxes on the open internet did
not understand it, and the few that did treated it as something
suspicious. But its concepts directly influenced QUIC's stream
multiplexing design. The full mechanism is in the SCTP episode — here
the point is that the ideas matter even when the protocol itself stays
niche.

## What the listener now understands
This is the lineage of transport, told as one through-line. UDP is the
floor: the smallest possible layer that can carry application data
between two ports. TCP is the protocol that turned the unreliable
internet into a stream you could write programs against, and it paid
for that reliability with handshake latency and head-of-line blocking.
SCTP saw both of those costs coming and proposed multi-streaming and
multi-homing — ideas the web ignored at the time. QUIC took the same
ideas, rebuilt them on top of UDP so the existing internet would let
them through, and folded encryption into the same handshake. Every
modern transport decision — when to use UDP, when to use TCP, why
HTTP/3 looks the way it does — is a choice somewhere on the line these
four protocols trace.

## Where this connects in the book
- The UDP episode covers the eight-byte header, the application
  patterns that thrive on fire-and-forget delivery, and why DNS made
  UDP its default.
- The TCP episode unpacks the three-way handshake, sequence numbers,
  retransmits, and the congestion controllers — Reno, CUBIC, BBR —
  that actually decide how fast your bytes flow.
- The QUIC episode goes deep on stream multiplexing, the combined
  transport-plus-TLS handshake, and the 0-RTT resumption that makes
  HTTP/3 feel instant on repeat visits.
- The SCTP episode covers multi-homing, message boundaries, and the
  telecom signaling world that gave SCTP its first and largest home.

## See also (other journeys and protocol episodes)

- If you want to hear the same protocols inside a single concrete
  request, the journey on what happens when you type a URL walks DNS,
  TCP, TLS, and HTTP in order over half a second — TCP plays the role
  this journey just described.

- The QUIC episode is the right next listen if the multiplexing and
  combined handshake felt like the most interesting move. It is the
  protocol that took SCTP's best ideas and finally got them deployed.

- The HTTP/3 episode picks up where QUIC ends — same transport, but
  now seen through the application layer that turned QUIC into the new
  default of the web.

- The TCP episode is worth a focused listen on its own. Forty years of
  the internet are sitting in that handshake, and the tradeoffs the
  other three protocols make only make sense once you have heard it.

## Visual cues for image generation

- Four-node graph lighting up in sequence: UDP, then TCP, then QUIC,
  then SCTP — each node carrying a one-line badge with its defining
  feature.
- Side-by-side header diagram: UDP's eight-byte header next to TCP's
  twenty-byte header next to a QUIC packet riding on top of a UDP
  header.
- Head-of-line blocking visualised: one TCP stream with a lost packet
  stalling everything behind it, alongside one QUIC connection where
  four streams flow independently and only the affected stream pauses.
- Multi-homing diagram: a phone with two interfaces — WiFi and
  cellular — both bound to one SCTP association, with the active path
  switching when WiFi drops.
- A wall-clock timeline of three handshakes side by side — TCP's
  three-way handshake plus a TLS round trip, QUIC's combined
  transport-and-TLS handshake in one round trip, and QUIC's 0-RTT
  resume sending data immediately.
