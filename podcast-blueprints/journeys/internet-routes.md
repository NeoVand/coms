---
id: internet-routes
type: journey
title: How the Internet Routes
scope: network-foundations
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [ip, ipv6, bgp]
related_protocols: [ip, ipv6, bgp]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: IPv4, then IPv6, then BGP — with the address space expanding visually from a 32-bit bar to a 128-bit bar, then zooming out to a mesh of autonomous systems"
  - "Side-by-side header diagram: the IPv4 packet header with its checksum and fragmentation fields, next to the simplified IPv6 header — same role, fewer fields"
  - "World map of the autonomous system mesh: tens of thousands of AS nodes connected by BGP peering links, with one prefix announcement rippling outward from a single ISP"
  - "Timeline of the address space: 1981 IPv4 launch, 2011 IANA exhaustion, 28 March 2026 the day IPv6 first carried 50.1% of Google's traffic"
  - "Single-frame illustration of the 2008 YouTube hijack: a misannounced prefix from Pakistan being accepted by peers worldwide, with traffic visibly diverting"
---

# How the Internet Routes

## In one breath
This is the journey a packet takes from a local address on your laptop
to a server on the other side of the planet. Three protocols cooperate
to make it possible: IPv4 for the original addressing scheme, IPv6 for
the redesign that finally has enough addresses to go around, and BGP
for the routing that stitches over seventy thousand independent
networks into one internet.

## The hook (cold-open)
Every packet you send leaves your machine with two numbers on it: where
it came from, and where it's going. The internet's entire job is to get
that packet to that second number. To do it, the network has to solve
two separate problems — give every device an address, and figure out a
path to any address from anywhere. In the next few minutes we're going
to walk those two problems in order: addressing, then routing. Three
protocols, one packet, one global mesh.

## The journey

### Step 1 — IPv4: The Original Addressing (IPv4)
IPv4 is where it all starts. Designed in 1981, it gives every device a
32-bit address — the familiar dotted form like 192.168.1.1 — and
defines how packets get forwarded hop-by-hop through routers. It is
brilliantly simple, and that simplicity powered the explosive growth of
the internet. But the designers never imagined billions of smartphones,
IoT sensors, and cloud instances all wanting their own address. Thirty
two bits gives you 4.3 billion possibilities, and exhaustion was
inevitable. NAT — Network Address Translation — bought time by hiding
entire private networks behind a single public IP, but it breaks
end-to-end connectivity and complicates any protocol that embeds an IP
address inside its own payload. The full mechanism — the header, the
forwarding table, the way routers actually pick a next hop — is in the
IPv4 episode. Here we just need the shape of the problem: a beautifully
simple addressing scheme that ran out of room.

The bill came due in 2011, when IANA — the body that hands out address
blocks — allocated the very last ones. NAT held things together but
left the internet fragile, with devices unable to reach each other
directly. A fundamental redesign had been in the works since the 1990s,
and the world is finally adopting it.

### Step 2 — IPv6: The Next Generation (IPv6)
IPv6 is that redesign. It expands the address space from 32 bits to 128
bits — enough for 340 undecillion addresses, roughly a hundred per atom
on Earth's surface. That number is so large it's almost embarrassing,
and that's the point: nobody wants to do this migration twice. But IPv6
is not just bigger numbers. It simplifies the packet header, dropping
checksums and the kind of fragmentation that intermediate routers used
to do. It introduces SLAAC — Stateless Address Autoconfiguration — so a
device can generate its own address without needing a DHCP server. It
replaces ARP, the old way of finding a neighbour's MAC address, with a
cleaner protocol called Neighbor Discovery. And most importantly, it
restores true end-to-end connectivity: every device gets a globally
routable address, and NAT becomes unnecessary. The dual-stack
transition — running IPv4 and IPv6 side by side — is well underway.
On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first
time, with US mobile carriers averaging around 87%. The full mechanism
is in the IPv6 episode. Here we just need to know the address problem
finally has an answer.

Individual devices now have addresses they can keep for life. But the
internet is not one network — it's over seventy thousand of them, each
run by an ISP, a cloud provider, a university, an enterprise. These
independent networks need a way to discover each other and calculate
paths across the whole mesh.

### Step 3 — BGP: The Internet's Routing Protocol (BGP)
BGP, the Border Gateway Protocol, is the protocol that literally holds
the internet together. Each of those independent networks is called an
autonomous system, and each one uses BGP to announce which IP prefixes
it owns and which paths it can reach. BGP routers sitting at the
borders of each network exchange those announcements with their peers,
and out of all that gossip emerges a global map of reachability. Path
selection is not just shortest-path — it's policy. An ISP might prefer
a cheaper transit provider, avoid routes through certain countries, or
favour shorter AS paths. The flip side of that flexibility is fragility:
when BGP gets misconfigured — like the day in 2008 when Pakistan
accidentally hijacked YouTube's prefix and large parts of the internet
went dark for hours — the whole system can wobble. And yet, despite
carrying the routing table for the entire internet — nearly a million
IPv4 prefixes today — BGP runs on surprisingly modest hardware and
converges within minutes after a topology change. The full mechanism is
in the BGP episode. Here it's enough to know that BGP is the layer that
turns a mesh of seventy thousand networks into one reachable address
space.

## What the listener now understands
This is the layered story of how the internet routes. IP gives you an
address. IPv6 gives you enough of them. BGP gives you a path. None of
these protocols knows what the others do. The packet on your machine
doesn't care how its destination address was assigned, and the
destination network doesn't care what path BGP picked to get there.
Each layer minds its own concern, and the global internet emerges out
of that separation. When a packet leaves your laptop and arrives in a
data centre on the other side of the world, what you're really seeing
is three independently designed systems composing — addressing,
re-addressing, and routing — to make the mesh look like one network.

## Where this connects in the book
- The chapter on IPv4 unpacks the original packet header, hop-by-hop
  forwarding, and how NAT changed the shape of the network it was
  meant to extend.
- The chapter on IPv6 walks through the simplified header, SLAAC,
  Neighbor Discovery, and the long, slow story of the dual-stack
  transition.
- The chapter on BGP goes deep on autonomous systems, peering, route
  announcements, and the policy side of path selection — including the
  famous misconfiguration incidents that show how much of the modern
  internet rests on this one protocol behaving.

## See also (other journeys and protocol episodes)

- If this is the journey of how a packet finds its way, the journey on
  what happens when you type a URL is the natural next listen — it
  picks up after the packet arrives and walks through DNS, TCP, TLS,
  and HTTP doing their work on top of the routed network.

- The IPv6 episode is the right next stop if the address-space numbers
  caught your attention. It's the one transition the internet has been
  in the middle of for two decades, and the mechanism is more
  interesting than the marketing.

- The BGP episode is worth a listen on its own — the policy and
  trust model behind global routing is one of the most surprising
  pieces of the whole stack, and the incidents are unforgettable once
  you understand the protocol.

## Visual cues for image generation

- Three-node graph lighting up in sequence: IPv4, then IPv6, then BGP,
  with the address space expanding visually from a 32-bit bar to a
  128-bit bar, then zooming out to a mesh of autonomous systems.
- Side-by-side header diagram: the IPv4 packet header with its checksum
  and fragmentation fields, next to the simplified IPv6 header — same
  role, fewer fields.
- World map of the autonomous system mesh: tens of thousands of AS
  nodes connected by BGP peering links, with one prefix announcement
  rippling outward from a single ISP.
- Timeline of the address space: 1981 IPv4 launch, 2011 IANA
  exhaustion, 28 March 2026 the day IPv6 first carried 50.1% of
  Google's traffic.
- Single-frame illustration of the 2008 YouTube hijack: a misannounced
  prefix from Pakistan being accepted by peers worldwide, with traffic
  visibly diverting.
