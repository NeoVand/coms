---
id: wire-to-web
type: journey
title: From Wire to Web
scope: global
podcast_target_minutes: 15
step_count: 5
protocols_in_order: [ethernet, arp, ip, tcp, http1]
related_protocols: [ethernet, arp, ipv4, ipv6, tcp, http1, icmp, ssh]
related_book_chapters: []
visual_cues:
  - "Five-node graph lighting up in sequence from the bottom up: Ethernet, then ARP, then IP, then TCP, then HTTP — with a thin layer label down the side marking L2, L3, L4, L7"
  - "An Ethernet frame anatomy: source MAC, destination MAC, EtherType, payload, Frame Check Sequence — with a callout that MACs are 48 bits burned into the network card"
  - "ARP request as a LAN-wide shout: one machine broadcasting 'Who has 192.168.1.1?' and exactly one machine replying with its MAC address, then a small ARP cache table filling in"
  - "A single packet hopping across routers: each hop decrements TTL, consults a routing table, and forwards on — with one hop sending an ICMP Time Exceeded back to the source when TTL hits zero"
  - "Stacked-layer diagram of one HTTP request travelling down the sender's stack and back up the receiver's: HTTP, then TCP, then IP, then Ethernet on the wire — each layer adding its own header"
---

# From Wire to Web

## In one breath
This journey traces a single piece of data from the physical Ethernet
cable all the way up to the application that finally makes sense of it.
Five protocols cooperate — Ethernet to frame the bits on the wire, ARP
to bridge IP and hardware, IP to route across networks, TCP to deliver
reliably to the right process, and HTTP to give the bytes meaning.
Walking them in order is the cleanest demo of the layered stack doing
its job from the bottom up.

## The hook (cold-open)
Plug an ethernet cable into a laptop, open a browser, and load a page.
The bytes that flash onto the screen started life as electrical signals
on a copper pair. Between those two endpoints, five protocols quietly
did their work, in a strict order, each one minding only its own layer.
None of them knows what the others do. None of them needs to. In the
next few minutes we walk that handoff, one layer at a time, from the
wire to the web.

## The journey

### Step 1 — Ethernet Frame (Ethernet)
Every piece of data on a local network travels as an Ethernet frame —
a precisely structured envelope. It carries a source MAC address, a
destination MAC address — both 48-bit hardware identifiers burned into
every network card — a type field that says what protocol lives inside,
whether that's IPv4, IPv6, or ARP, and a Frame Check Sequence at the
end for error detection. The frame is the physical currency of LANs.
Switches read the destination MAC and forward the frame to the correct
port. Without this framing, raw electrical signals on the wire would be
meaningless noise. The full mechanism — preambles, switching, collision
domains, the whole Layer 2 story — is in the Ethernet episode. Here we
just need to know that the frame is the envelope every byte on the LAN
travels in.

The Ethernet frame needs a destination MAC to go anywhere. But your
application only knows an IP address. Something has to bridge the gap
between Layer 3 — IP — and Layer 2 — Ethernet.

### Step 2 — ARP Resolution (ARP)
ARP is the glue between IP addresses and physical hardware. When your
machine needs to reach 192.168.1.1 but only knows the IP, it shouts an
ARP request to every device on the LAN: who has 192.168.1.1, tell me
your MAC address. The target machine — and only the target — replies
directly with its MAC. The result is cached in an ARP table so future
packets to the same address skip the broadcast. This is why the very
first packet to a new host on your LAN is slightly slower: ARP has to
resolve the address before anything else can move. The full mechanism
— request and reply formats, the cache, gratuitous ARP, the security
problems — is in the ARP episode. Here we just need the outcome: a
fresh mapping from IP to MAC, so the Ethernet frame finally has a
destination address it can use.

With the destination MAC resolved and the Ethernet frame ready, the
packet can leave the local network. From here on, the local LAN is no
longer enough. The IP layer takes over to handle global addressing and
routing.

### Step 3 — IP Routing (IPv4)
IP is the postal service of the internet. It stamps each packet with a
source and destination address, and then forwards it hop by hop toward
its target. At each router along the path, the same small dance plays
out: examine the destination IP, consult the routing table, decrement
the TTL — Time To Live — by one, and forward the packet to the next
hop. If the TTL ever reaches zero, the packet is discarded and an ICMP
Time Exceeded message is sent back to the source. That is exactly how
traceroute works under the hood. IP itself makes no guarantees about
delivery, no guarantees about order, no guarantees about reliability.
It does its best to get each packet to the right machine, and stops
there. The full mechanism — addressing, fragmentation, the routing
table, ICMP — is in the IP episode. Here we just need to know that
after this step, the packet has crossed however many hops it needed to
cross, and arrived at the destination machine.

IP has delivered the packet to the right machine. But that machine
might be running dozens of applications at once — a web server on
port 80, an SSH daemon on port 22, a database on port 5432. Something
has to deliver the data to the right process, in the right order, with
no missing pieces.

### Step 4 — TCP Delivery (TCP)
TCP is the reliability layer that IP lacks. It uses 16-bit port numbers
— anything from 0 to 65535 — to multiplex many conversations over the
same IP address, so each segment lands in the correct application.
Beyond addressing, TCP guarantees that data arrives complete, in order,
and without duplicates. It retransmits lost segments, resequences
arrivals that show up out of order, and uses sliding-window flow
control to stop a fast sender from drowning a slow receiver. This
reliability is the reason the web, email, and file transfer all sit on
top of TCP. The full mechanism — the three-way handshake, sequence
numbers, congestion control, the sliding window itself — is in the TCP
episode. Here we just need the outcome: a clean, ordered byte stream
delivered to the exact process the application is running in.

The data has now been reliably delivered to the right process on the
right machine. Every layer below has done its job. The application can
finally interpret the bytes using its own protocol semantics.

### Step 5 — HTTP Application (HTTP/1.1)
At the very top of the stack, HTTP gives meaning to the raw bytes. It
defines a structured conversation. The client sends a request with a
method — GET, POST, PUT — a path like /index.html, and headers that
describe its capabilities. The server answers with a status code, 200
OK or 404 Not Found, its own headers describing content type and
caching rules, and the actual content — HTML, JSON, an image. This is
the layer that developers interact with directly. It only works because
every layer below carried the data faithfully. The full mechanism —
methods, status codes, headers, the original spec — is in the HTTP/1.1
episode. The one fact worth holding on to here: every modern page
triggers many of these request-response cycles, and each one rides the
exact same stack we just climbed.

## What the listener now understands
This is the layered stack actually doing its job, from the bottom up.
Ethernet does not know anything about IP. ARP does not know anything
about TCP. IP does not know which application owns which port. TCP
does not know what HTTP means. HTTP assumes a clean, ordered byte
stream to the right process and asks no questions about how that came
to exist. Each protocol minds its own concern and trusts the others to
mind theirs. When data flows from a wire into a browser window, what
you are really seeing is five independently designed systems composing
perfectly, in the right order, every single time.

## Where this connects in the book
- The chapter on Ethernet covers the wire itself — framing, MAC
  addressing, switching, and why Layer 2 is what makes a LAN feel like
  one shared room.
- The chapter on ARP unpacks the broadcast-and-reply dance, the ARP
  cache, and the security holes that come with trusting whoever shouts
  back first.
- The chapter on IP goes deep on addressing, routing tables, and the
  hop-by-hop journey that traceroute exposes one TTL at a time.
- The chapter on TCP walks through the handshake, retransmission,
  sliding windows, and the reliability guarantees that the rest of the
  application stack quietly depends on.
- The chapter on HTTP/1.1 covers the original request-response model
  and the limits that later versions of HTTP set out to fix.

## See also (other journeys and protocol episodes)

- If you want the same five layers told from the other direction —
  starting at the URL bar and reaching the wire — the journey on what
  happens when you type a URL is the natural companion. It picks up
  where this one ends.

- If the routing step felt like the most interesting part, the IP
  episode and the ICMP episode are the two to start with. Together they
  explain how packets actually find their way and how the network tells
  you when something has gone wrong.

- The Ethernet episode and the ARP episode pair tightly: one defines
  the frame, the other tells the frame where to go. Listen to them back
  to back if Layer 2 is where you want to spend more time.

- The TCP episode is the right next listen if the reliability story
  felt like sleight of hand. It's the protocol that does the most work
  for the least credit in this whole journey.

## Visual cues for image generation

- Five-node graph lighting up in sequence from the bottom up: Ethernet,
  then ARP, then IP, then TCP, then HTTP — with layer labels down the
  side marking L2, L3, L4, and L7.
- An Ethernet frame anatomy diagram: source MAC, destination MAC,
  EtherType, payload, and Frame Check Sequence — with a callout that
  the MACs are 48 bits burned into the network card.
- ARP as a LAN-wide shout: one machine broadcasting "who has
  192.168.1.1?" and exactly one machine replying with its MAC address,
  then a small ARP cache table filling in.
- A single packet hopping across routers, each hop decrementing TTL and
  consulting a routing table — with one hop sending an ICMP Time
  Exceeded back to the source when TTL hits zero.
- Stacked-layer diagram of one HTTP request travelling down the
  sender's stack and back up the receiver's: HTTP at the top, then TCP,
  then IP, then Ethernet on the wire — each layer adding its own
  header.
