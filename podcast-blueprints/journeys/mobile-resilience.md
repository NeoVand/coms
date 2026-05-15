---
id: mobile-resilience
type: journey
title: Mobile Network Resilience
scope: transport
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [tcp, mptcp, quic]
related_protocols: [tcp, mptcp, quic]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: TCP, then MPTCP, then QUIC — with a phone icon walking from a Wi-Fi hotspot into cellular range above the timeline"
  - "Side-by-side comparison: a TCP connection breaking when the IP address changes, versus a QUIC Connection ID surviving the same handoff untouched"
  - "MPTCP fan-out: one logical TCP stream visible to the application, two physical paths underneath — Wi-Fi and cellular carrying packets in parallel"
  - "Timeline of a video call during a Wi-Fi to cellular handoff: TCP shows a visible interruption and re-handshake; QUIC shows a continuous line"
  - "Diagram of QUIC's Connection ID as a token that floats above the IP and port layer, unaffected when the addresses underneath it swap out"
---

# Mobile Network Resilience

## In one breath
This is the journey of a single idea — keeping a connection alive while
the network underneath it changes — told through three transport
protocols. TCP assumed the endpoints never move. MPTCP patched that by
letting one connection ride two paths at once. QUIC threw out the
assumption entirely and built identity into the protocol itself.

## The hook (cold-open)
You're on a video call. You walk out of your kitchen, off the home
Wi-Fi, into the street, and onto cellular. On a phone built ten years
ago, the call hiccups — sometimes drops. On a modern phone, it doesn't.
The same physical handoff happened either way. What changed is the
transport protocol moving the bytes. In the next few minutes we're
going to walk three of them, in the order they were invented, and watch
mobile resilience get designed in.

## The journey

### Step 1 — TCP: The Reliable Foundation (TCP)
TCP was designed for fixed networks. Desktops on a wire, servers in a
rack — endpoints that don't move. So it does something that made
perfect sense at the time: it identifies a connection by a 4-tuple of
source IP, source port, destination IP, destination port. Change any
one of those and TCP no longer recognises the connection at all. On a
phone, that assumption breaks the moment you switch from Wi-Fi to
cellular, or even hop between cell towers. Your IP address changes, and
every TCP connection you had is silently dead. The application has to
notice the failure, redo the TCP handshake, redo the TLS handshake on
top of it, and re-authenticate. For a video call or a file download,
that means a visible interruption. The full mechanism of what TCP is
doing here — the handshake, the sequence numbers, the byte stream
abstraction — is in the TCP episode. Here we just need to know that
TCP's idea of identity is tied to the IP address, and IP addresses on
mobile devices don't stay still.

So TCP ties connections to IP addresses, which is exactly the wrong
thing to do on a network that keeps swapping IP addresses underneath
you. The first attempt at fixing it kept TCP intact and worked around
the limitation: what if a single connection could span multiple
network interfaces at the same time, and survive a handoff because it
was already on the other path?

### Step 2 — MPTCP: Multiple Paths (MPTCP)
Multipath TCP extends regular TCP to use more than one network path at
once. A phone running MPTCP can send data over both Wi-Fi and cellular
in parallel, and shift traffic between them as conditions change. When
you walk out of Wi-Fi range, MPTCP gracefully migrates the connection
to cellular without dropping a single byte — and the application above
it sees one uninterrupted TCP stream. This isn't a research toy. Apple
shipped MPTCP in iOS in 2013 for Siri and Apple Maps, and turned it on
system-wide in iOS 17. It's also designed to be backward-compatible:
when the other endpoint doesn't speak MPTCP, it falls back to plain
TCP and nothing breaks. The trade-off is the messy reality of the
internet's middle. Firewalls and NATs sometimes strip the MPTCP options
they don't understand, which knocks the connection back down to a
single path. The full mechanism is in the MPTCP episode. Here it's
enough to know that MPTCP keeps TCP and adds resilience on top.

But adding resilience on top of TCP also means inheriting TCP's
limitations. Head-of-line blocking is still there — one lost packet
still stalls every stream sharing the connection. The middlebox
problem is still there. And because MPTCP lives in the kernel, rolling
out changes to it takes years. The third move was bigger: throw the
whole thing out, build a new transport on top of UDP, and put it
entirely in user space.

### Step 3 — QUIC: Connection Migration (QUIC)
QUIC was designed from the start for mobile networks. The single most
important decision it made is to stop identifying a connection by IP
address and port. Instead, every QUIC connection has a Connection ID —
a variable-length token that both endpoints recognise no matter what
network path the packets take. When your phone switches from Wi-Fi to
cellular, the IP address underneath the connection changes, but the
Connection ID doesn't. So the connection just continues. No
re-handshake, no re-authentication, no lost data — the application
above it never even notices the network changed. QUIC also fixes the
two other things that bit MPTCP. A lost packet only affects its own
stream, so head-of-line blocking is gone. And because transport and
encryption setup are fused into a single 1-RTT handshake, opening a
new QUIC connection costs less round trips than opening a TCP
connection and then negotiating TLS on top of it. The numbers back
this up: Google reports that QUIC reduces video rebuffering on mobile
networks by 18% compared to TCP. The full mechanism is in the QUIC
episode. The takeaway here is the design move — connection identity
moved up, off of the IP layer, into the protocol itself.

## What the listener now understands
This is one idea told three times. The reality of mobile networks is
that connections drop, IP addresses change, and bandwidth varies — and
the transport layer has to deal with that. TCP couldn't, because it
was designed before that was a problem. MPTCP could partially, by
keeping TCP and quietly riding two paths at once. QUIC could fully,
because it stopped asking the IP address to be the connection's name in
the first place. The arc from TCP to MPTCP to QUIC is the transport
layer learning that endpoints move, and redesigning identity around
that fact.

## Where this connects in the book
- The chapter on TCP is the foundation for everything in this journey
  — the 4-tuple, the handshake, the byte stream — and explains why
  decisions made for fixed networks were the right call at the time.
- The chapter on MPTCP picks up the resilience question and goes deep
  on the multipath scheduler, the fallback behaviour, and the
  middlebox problems that still bite real deployments.
- The chapter on QUIC unpacks the Connection ID, the 1-RTT handshake,
  and the move into user space — including why putting transport on
  top of UDP was the unlock.

## See also (other journeys and protocol episodes)

- The TCP episode is the right next listen if the 4-tuple argument
  felt like the load-bearing piece. It's where the original design
  choices get explained on their own terms, not just as the thing QUIC
  is reacting against.

- The QUIC episode goes deep on connection migration, on stream-level
  loss recovery, and on why HTTP/3 sits on top of QUIC instead of TCP.
  If you want one episode to listen to after this one, that's it.

- For a related walkthrough that shares some of these protocols, the
  journey on what happens when you type a URL covers TCP and TLS in
  the classic desktop case — useful as the contrast that makes the
  mobile story land.

## Visual cues for image generation

- Three-node graph lighting up in sequence: TCP, then MPTCP, then QUIC
  — with a phone icon walking from a Wi-Fi hotspot into cellular range
  above the timeline.
- Side-by-side comparison: a TCP connection breaking when the IP
  address changes, versus a QUIC Connection ID surviving the same
  handoff untouched.
- MPTCP fan-out: one logical TCP stream visible to the application,
  two physical paths underneath — Wi-Fi and cellular carrying packets
  in parallel.
- Timeline of a video call during a Wi-Fi to cellular handoff: TCP
  shows a visible interruption and re-handshake; QUIC shows a
  continuous line through the same moment.
- Diagram of QUIC's Connection ID as a token floating above the IP and
  port layer, unaffected when the addresses underneath it swap out.
