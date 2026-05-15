---
id: packet-journey
type: journey
title: Journey of a Packet
scope: network-foundations
podcast_target_minutes: 12
step_count: 4
protocols_in_order: [ethernet, arp, ip, icmp]
related_protocols: [ethernet, arp, ip, icmp]
related_book_chapters: [02-layer-2-3/00-ethernet, 02-layer-2-3/02-arp-and-ndp, 02-layer-2-3/03-ipv4, 02-layer-2-3/05-icmp]
visual_cues:
  - "Four-node graph lighting up in sequence: Ethernet, then ARP, then IP, then ICMP — with a thin LAN diagram underneath showing the frame moving from NIC to switch to router"
  - "Anatomy of an Ethernet frame: source MAC, destination MAC, type field 0x0800 or 0x0806, payload, and the four-byte CRC-32 trailer"
  - "ARP broadcast in action: one machine shouting 'Who has 192.168.1.100?' to FF:FF:FF:FF:FF:FF, every device on the LAN listening, only one answering"
  - "Routing decision tree: destination IP compared against the subnet mask — local goes straight to ARP, remote goes to the default gateway with TTL ticking down hop by hop"
  - "Traceroute timeline: packets fired with TTL of 1, 2, 3, 4, each one drawing back a 'Time Exceeded' from a different router, slowly mapping the path"
---

# Journey of a Packet

## In one breath
This is the journey every byte takes the moment it leaves your machine:
from a frame on the wire to a routing decision at the gateway, with a
diagnostic protocol watching the whole thing for trouble. Four
protocols cooperate at the bottom of the stack — Ethernet to carry the
frame, ARP to find the next hop, IP to decide where it goes, and ICMP
to tell you what went wrong.

## The hook (cold-open)
You hit send on a request. Before any of the famous protocols get a
turn — before TCP, before TLS, before HTTP — a single packet has to be
built, addressed, and physically pushed onto the wire. There is a
chicken-and-egg problem at the very first step. There is a routing
decision that decides whether the packet ever leaves the building. And
there is an entire diagnostic nervous system running alongside, just so
you can find out when something breaks. Here is what actually happens
in the first few microseconds.

## The journey

### Step 1 — Ethernet Framing (Ethernet)
Every packet's journey begins at the network interface card. The NIC
builds an Ethernet frame from scratch. It stamps on its own 48-bit MAC
address as the source, writes in the destination MAC, sets a type
field — 0x0800 for IPv4, 0x0806 for ARP — drops in the payload, and
appends a four-byte Frame Check Sequence, a CRC-32, on the end. That
checksum is the only protection the frame has against electrical
interference on the wire. If a single bit flips in transit, the
receiver's CRC check fails and the frame is silently discarded. No
correction, no retransmit at this layer — just detection and a quiet
drop. This is the foundation everything else on a local network sits
on top of. The full mechanism — frame format, switching, the history
from coax to twisted pair — is in the Ethernet episode. Here we just
need the frame in our hand.

The frame is ready to send, but there is a chicken-and-egg problem.
Your application knows the destination IP address — say
192.168.1.100 — but it does not know the destination MAC. And without
a destination MAC, you cannot finish building the Ethernet frame. The
network needs a way to translate between these two addressing systems.

### Step 2 — ARP Resolution (ARP)
ARP solves the IP-to-MAC translation with a beautifully simple
broadcast. Your machine sends an ARP request to the broadcast MAC
address — FF:FF:FF:FF:FF:FF — asking, in effect, "Who has
192.168.1.100? Tell 192.168.1.1." Every device on the LAN segment
hears that question. Only the owner of that IP answers, with its own
MAC address. Your machine caches the mapping in its ARP table,
typically for about twenty minutes, so the next packet to that
destination skips the broadcast entirely. You can see your own ARP
cache right now by running "arp -a" in a terminal. The dark side of
this design is ARP spoofing — an attacker on the same LAN can send
fake ARP replies and quietly redirect traffic through their own
machine. That is one of the main reasons modern security relies on
encryption at higher layers rather than trusting the local network.
The full mechanism is in the ARP episode.

With the destination MAC resolved, the Ethernet frame can finally be
properly addressed for the local segment. But before the frame goes
out, the IP layer has to make a critical decision: is this packet
destined for a machine on the same local network, or does it need to
be handed to the default gateway and routed across the internet?

### Step 3 — IP Addressing and Routing (IPv4)
The IP layer makes the key routing decision. It compares the
destination IP against the subnet mask to decide whether the target is
local or remote. If it is local, ARP resolves the target's MAC
directly and the frame goes straight there. If it is remote, the
packet is sent to the default gateway — your router — which consults
its routing table and forwards the packet toward its destination, hop
by hop. Each router along the way decrements the TTL field, the time
to live, by one. TTL typically starts at 64. When it hits zero, the
packet is discarded — which is what stops a misconfigured network
from looping packets forever. The IP header also carries a header
checksum, a protocol field that says what is inside — 6 for TCP, 17
for UDP — and fragmentation controls for packets that exceed a link's
maximum transmission unit. The full mechanism — addressing, subnetting,
fragmentation, the long story of IPv4 exhaustion — is in the IP
episode. Here we just need the routing decision and the TTL counting
down.

The packet has been delivered, and most of the time that is the end
of the story. But networks are not always healthy. Links go down,
routes change, hosts become unreachable, and packets quietly get
dropped. How does anyone find out what is broken?

### Step 4 — ICMP Diagnostics (ICMP)
ICMP is the internet's diagnostic nervous system. It does not carry
user data. Its entire job is to report on the health and status of
the network itself. The "ping" command sends ICMP Echo Requests and
measures the round-trip time, which is how you verify a host is
reachable at all. "Traceroute" plays a clever trick with the TTL
field we just talked about: it sends packets with TTL set to 1, then
2, then 3, and so on. Each successive router along the path is the
one that ticks the TTL to zero, and each one sends back a "Time
Exceeded" message — which means traceroute slowly maps the entire
path to a destination, one router at a time. ICMP also carries the
critical error messages you have probably seen without realising it:
"Destination Unreachable", with subcodes for network, host, port, and
fragmentation failures; "Redirect", which tells a host to use a
better route; and "Source Quench", a legacy congestion signal. Without
ICMP, debugging network problems would be nearly impossible. The full
mechanism is in the ICMP episode.

## What the listener now understands
This is the layered stack at its most physical. Ethernet does not
know what an IP address is — it just shuttles framed bytes between
MAC addresses on a wire. ARP exists for the single, narrow job of
bridging those two address worlds. IP does not know what is in the
payload it is routing — it just looks at the destination, checks the
subnet mask, and either delivers locally or forwards to the gateway.
ICMP rides on top of IP and watches the whole show, ready to report
when something breaks. Each protocol minds its own concern, and
trusts the others to mind theirs. When a packet leaves your machine
and arrives somewhere useful, what you are seeing is four
independently designed systems composing perfectly, in order, in
microseconds.

## Where this connects in the book
- The chapter on Ethernet goes deep on the frame format, switching,
  and how the wired foundation of local networks actually works at
  Layer 2.
- The chapter on ARP and NDP unpacks the address-resolution problem,
  the spoofing attacks that follow from it, and how IPv6's neighbour
  discovery handles the same job differently.
- The chapter on IPv4 covers addressing, subnetting, the routing
  table, fragmentation, and the long history that led to IPv4
  exhaustion and NAT everywhere.
- The chapter on ICMP walks through ping, traceroute, the error
  message taxonomy, and why blocking ICMP at a firewall tends to break
  more than it fixes.

## See also (other journeys and protocol episodes)

- If you want to hear what happens once a packet leaves the local
  network and starts hopping across the public internet, the IP
  episode and the BGP episode together pick up exactly where this
  journey ends.

- The ARP episode is the right next listen if the broadcast trick at
  Step 2 felt like the most surprising part. It is the one most
  engineers have never had to look at directly, but it is running
  under every connection they make on a LAN.

- For the diagnostic side of the story, the ICMP episode goes deeper
  into traceroute, the full error-message table, and the practical
  art of debugging a network you cannot see.

- If this journey was about the bottom of the stack, the journey on
  what happens when you type a URL is the natural sequel — same
  packet, but now followed all the way up through TCP, TLS, and HTTP.

## Visual cues for image generation

- Four-node graph lighting up in sequence: Ethernet, then ARP, then
  IP, then ICMP — with a thin LAN diagram underneath showing the
  frame moving from NIC to switch to router.
- Anatomy of an Ethernet frame: source MAC, destination MAC, type
  field 0x0800 or 0x0806, payload, and the four-byte CRC-32 trailer.
- ARP broadcast in action: one machine shouting "Who has
  192.168.1.100?" to FF:FF:FF:FF:FF:FF, every device on the LAN
  listening, only one answering.
- Routing decision tree: destination IP compared against the subnet
  mask — local goes straight to ARP, remote goes to the default
  gateway with TTL ticking down hop by hop.
- Traceroute timeline: packets fired with TTL of 1, 2, 3, 4, each one
  drawing back a "Time Exceeded" from a different router, slowly
  mapping the path.
