---
id: network-troubleshooting
type: journey
title: Network Troubleshooting
scope: global
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [icmp, dns, arp]
related_protocols: [icmp, dns, arp]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: ICMP, then DNS, then ARP — with a small terminal window beside each running ping, dig, and arp"
  - "Traceroute diagram: a packet hopping across routers, TTL counting down from 1 to 0, each router returning an ICMP Time Exceeded message back to the source"
  - "Layered diagnostic ladder: application name at the top, then DNS resolving it to an IP, then ICMP reachability at Layer 3, then ARP at Layer 2 mapping IP to MAC"
  - "A dig query for google.com on screen, with the answer section highlighted — A record, TTL counter ticking down, authoritative nameserver labelled"
  - "ARP table screenshot: rows of IP-to-MAC mappings on a LAN, one row highlighted red as a stale or duplicate entry"
---

# Network Troubleshooting

## In one breath
This is the diagnostic toolkit every engineer reaches for when the
network looks broken. Three protocols — ICMP, DNS, and ARP — answer
three different versions of the same question: is it alive, is the
name resolving, is the wire underneath actually working. Knowing which
tool answers which question is most of what separates a five-minute
fix from a five-hour outage.

## The hook (cold-open)
The site is down. Or maybe it isn't — maybe it's just down for you.
Before you page anyone, before you open a ticket, before you blame the
cloud, you reach for three commands that have barely changed in
thirty years. Ping. Dig. Arp. Each one talks to a different protocol,
each one asks a different question, and together they pin down which
layer of the stack is actually broken. In the next few minutes we're
going to walk that troubleshooting ladder, top to bottom, one protocol
at a time.

## The journey

### Step 1 — ICMP: Is It Alive? (ICMP)
When something goes wrong on a network, ICMP is the first tool you
reach for. The ping command sends an ICMP Echo Request to a host and
measures the time until the Echo Reply comes back. One command gives
you three answers at once: round-trip time, packet loss percentage,
and basic reachability. If ping returns clean replies, the host is
alive and the path to it is at least functional. If it times out, you
already know to look further down the stack. Traceroute exploits ICMP
in a cleverer way. It fires packets with incrementally increasing TTL
values — Time to Live — one, then two, then three. Each router along
the path decrements the TTL, and when it hits zero, that router sends
back an ICMP Time Exceeded message, revealing its identity and its
distance from you. Run traceroute and you get the exact path your
packets take across the internet, with each hop's latency printed next
to it. That's how you spot where a connection is dying — at your own
gateway, three hops into your ISP, or fifteen hops away inside someone
else's cloud. The full mechanism, the message types, the way error
reporting layers onto IP itself, is in the ICMP episode.

ICMP told you whether the host is reachable and traced the network
path to get there. But what if the problem is not routing? What if
the hostname itself is not resolving to the right IP address? DNS
issues are one of the most common causes of "the internet is broken,"
and ICMP can't see them at all.

### Step 2 — DNS: Is It Resolving? (DNS)
DNS problems masquerade as total network failures. Everything seems
down, but the real issue is name resolution — the host is fine, the
network is fine, your laptop just doesn't know where to send the
packet. The dig command queries DNS servers directly and shows you
exactly what came back: which records were returned, which nameserver
answered, the TTL remaining on cached entries, and the full query
chain. You can target specific record types — A, AAAA, MX, CNAME, NS
— and you can point dig at a specific DNS server. That last trick is
how you isolate the fault. Ask your local resolver, then ask the
authoritative server directly. If their answers differ, you've found
your bug. The usual suspects are familiar: stale cached records that
need to expire or be flushed, misconfigured NS delegations pointing at
the wrong nameservers, missing or wrong A and AAAA records after a
deploy, and DNSSEC validation failures that silently make a name
unresolvable to anyone doing the check. The full mechanism — the
resolver hierarchy, the record types, how caching and TTL really work
— is in the DNS episode. Here, dig is the scalpel that tells you
whether the name is the problem.

DNS resolved the hostname to an IP address, and ICMP confirmed the
host is reachable at the network layer. So Layer 3 is healthy and the
name is correct. But on a local network there is one more address
translation happening invisibly underneath all of this — and when it
breaks, devices on the same subnet stop talking to each other
entirely, even though every other test still looks fine.

### Step 3 — ARP: Is Layer 2 Working? (ARP)
ARP operates at the boundary between IP addresses and physical
hardware. When your machine knows the IP of a target on the same
subnet, it still can't put a frame on the wire — Ethernet doesn't
understand IPs, it understands MAC addresses. So ARP broadcasts a
request to the entire LAN: "who has this IP?" The target responds
with its MAC, and your machine caches the mapping. The arp command
shows you that cache directly: every IP-to-MAC pair your machine
currently believes in. That table is where subtle failures live.
Stale entries point at decommissioned hardware that no longer exists.
Duplicate IP addresses show up as two different MACs claiming the
same IP, and your packets get tossed at one of them at random.
Worst of all, ARP poisoning attacks — a malicious device on the LAN
quietly claiming to be the gateway — route every packet you send
through the attacker first. On modern networks ARP issues are rare,
but when they hit they're devastating, and they typically present as
intermittent connectivity that is maddeningly difficult to diagnose
without looking at the ARP table directly. Everything else passes;
ping works some of the time; DNS resolves; and yet packets keep
disappearing. The full mechanism — the request and reply format, the
broadcast model, the way ARP sits between Layer 3 and Layer 2 — is in
the ARP episode.

## What the listener now understands
This is the diagnostic ladder, top to bottom. ICMP tells you whether
a host is reachable and how the packets get there. DNS tells you
whether the name on the address bar is even pointing at the right
machine. ARP tells you whether your own LAN can still translate IPs
to the hardware addresses that Ethernet actually moves frames
between. Three commands, three protocols, three completely different
layers of the stack — and a real outage almost always lives in
exactly one of them. The skill isn't memorising flags. It's knowing,
within a few seconds of the first failure, which of these three
questions to ask first.

## Where this connects in the book
- The chapter on ICMP unpacks why an error-reporting protocol sits
  alongside IP itself — and why ping and traceroute, two of the
  oldest tools in the toolkit, both ride on the same handful of
  message types.
- The chapter on DNS goes deep on the resolver hierarchy, caching,
  and the record types dig surfaces — the same machinery that makes
  most outages feel like total internet failures.
- The chapter on ARP covers Layer 2 address resolution and the
  broadcast model that holds a LAN together, including the security
  weaknesses that make ARP poisoning possible in the first place.

## See also (other journeys and protocol episodes)

- If this journey was useful, the URL-bar journey is a good companion
  — it shows what happens when none of this is broken, and four
  protocols hand off cleanly from name to bytes on the screen.

- The ICMP episode and the DNS episode are the two to start with if
  you want to go deeper on the first two rungs of the ladder. Most
  real outages stop there.

- The ARP episode is the right next listen if Layer 2 surprised you.
  It's the protocol most engineers never think about until the day
  it's the one thing left standing between them and a working
  network.

## Visual cues for image generation

- Three-node graph lighting up in sequence: ICMP, then DNS, then
  ARP — with a small terminal window beside each running ping, dig,
  and arp.
- Traceroute diagram: a packet hopping across routers, TTL counting
  down from 1 to 0, each router returning an ICMP Time Exceeded
  message back to the source.
- Layered diagnostic ladder: application name at the top, then DNS
  resolving it to an IP, then ICMP reachability at Layer 3, then ARP
  at Layer 2 mapping IP to MAC.
- A dig query for google.com on screen, with the answer section
  highlighted — A record, TTL counter ticking down, authoritative
  nameserver labelled.
- ARP table screenshot: rows of IP-to-MAC mappings on a LAN, one row
  highlighted red as a stale or duplicate entry.
