---
id: network-bootstrap
type: journey
title: Getting Online
scope: utilities
podcast_target_minutes: 12
step_count: 4
protocols_in_order: [dhcp, ntp, dns, smtp]
related_protocols: [dhcp, ntp, dns, smtp]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: DHCP, then NTP, then DNS, then SMTP — a thin timeline underneath showing the bootstrap order"
  - "The DORA exchange as a sequence diagram: client broadcasts Discover, server replies Offer, client sends Request, server sends Acknowledgment — with the leased IP, subnet mask, gateway, and DNS server fields highlighted on the final ACK"
  - "NTP stratum pyramid: stratum 0 atomic clock at the top, stratum 1 servers below it, stratum 2 below those, with the laptop syncing from somewhere down the tree"
  - "Recursive DNS walk for gmail.com: root, then .com TLD, then gmail.com authoritative nameserver, returning an IP address and the resolver caching at each step"
  - "SMTP text dialogue on a terminal: EHLO, AUTH LOGIN, MAIL FROM, RCPT TO, DATA — alongside a small badge showing SPF, DKIM and DMARC records pulled from DNS"
---

# Getting Online

## In one breath
This is the chain of protocols that runs every time a device joins a
network — before any web page, any chat message, any video call. Four
protocols cooperate in a strict order: DHCP gives the device an
identity, NTP gives it an accurate clock, DNS lets it look up names,
and SMTP — or any application — finally puts the stack to work. By the
time you send your first email, every layer below has already done its
job.

## The hook (cold-open)
You open a laptop in a coffee shop and click connect. A few seconds
later you're sending email. In between, your machine went from no
identity at all — no IP address, no idea where the gateway is, a clock
that might be years off — to a fully functioning member of the global
internet. Four protocols make that happen, in a strict order, and none
of them know about each other. We're going to walk that bootstrap
sequence one step at a time.

## The journey

### Step 1 — DHCP: Get an Address (DHCP)
When your device joins a network, it literally has no identity. No IP
address, no subnet mask, no idea where the gateway is. DHCP — the
Dynamic Host Configuration Protocol — solves that bootstrap problem
through a four-step dance called DORA. Your device broadcasts a
Discover message to the entire LAN, because it cannot address anyone
specifically yet. A DHCP server responds with an Offer containing an
available IP. Your device formally Requests that address. The server
sends an Acknowledgment confirming the lease. Along with the IP, DHCP
hands over the subnet mask, the default gateway, the DNS server
addresses, the lease duration, and often extras like NTP servers and
domain search suffixes. Without DHCP, every device on every network
would need manual IP configuration — a nightmare at any scale. The
full mechanism is in the DHCP episode; here we just need the outcome:
your machine now has a routable address and knows where to send
packets.

Your device has an IP address and can send packets. But its internal
clock might be hours or even years off — a factory default, or drifted
during a long power-off period. That matters more than you might
think. TLS certificates have validity windows. Log timestamps must be
accurate for debugging. Kerberos authentication fails with more than
five minutes of clock skew. Before anything else, the clock has to be
right.

### Step 2 — NTP: Sync the Clock (NTP)
NTP — the Network Time Protocol — synchronises your device's clock
with atomic time references accurate to billionths of a second. It
sends multiple time-stamped packets to upstream servers, measures the
round-trip delay, and calculates the offset between your clock and the
server's clock — compensating for the asymmetric latency of the
network path. NTP organises time sources in a stratum hierarchy.
Stratum zero is the atomic clock itself. Stratum one servers connect
directly to those clocks. Stratum two servers sync from stratum one,
and so on down the tree. Accurate time is not just a convenience. TLS
certificates that look expired due to clock drift get rejected.
Distributed databases use timestamps for conflict resolution. Forensic
logging is useless if you cannot trust when events occurred. The full
mechanism — the offset calculation, the stratum tree, the way NTP
defends against asymmetric paths — is in the NTP episode. Here we
just need the outcome: a clock the rest of the stack can trust.

Your device now has a network address from DHCP and an accurate clock
from NTP. The infrastructure is ready. But when you type "gmail.com"
into a browser, the network needs to translate that human-friendly
name into a machine-routable IP address. That is the next protocol's
job — and it could not have run any earlier, because DHCP is what told
us which DNS server to ask.

### Step 3 — DNS: Resolve Names (DNS)
With a working network connection and the DNS server address handed
over by DHCP, your device can finally translate domain names into IP
addresses. The recursive resolver — usually run by your ISP, or a
public service like 8.8.8.8 or 1.1.1.1 — does the heavy lifting. It
queries root servers, then TLD servers, then authoritative
nameservers on your behalf, caching results at each level. The first
DNS query after connecting might take fifty to a hundred milliseconds
as the resolver walks the hierarchy. Subsequent queries for the same
domain hit the cache and resolve in under a millisecond. This is also
where content delivery networks work their magic — DNS can return
different IP addresses based on your geographic location, directing
you to the nearest server. The full mechanism — root servers, TLDs,
record types, the caching that makes it all feel fast — is in the DNS
episode. Here we just need the outcome: any hostname on the internet
is now reachable.

Your device can now resolve any name and reach servers across the
globe. The network stack is fully operational. Time to put it all to
work by communicating with the outside world.

### Step 4 — SMTP: First Message (SMTP)
With the full network stack operational, your email client can connect
to the mail server and send your first message. SMTP — the Simple Mail
Transfer Protocol — uses a text-based command dialogue that has barely
changed since 1982. EHLO introduces your client. AUTH LOGIN
authenticates you. MAIL FROM and RCPT TO specify the envelope
addresses. DATA begins the message body — headers, MIME parts,
attachments. Modern SMTP uses STARTTLS to upgrade the connection to
encrypted, and SPF, DKIM and DMARC records — published in DNS —
authenticate the sender to prevent spoofing. That first successful
email is proof that every layer of the network stack, from physical
Ethernet up to application protocols, is functioning correctly. The
full mechanism — the command grammar, the store-and-forward hops, the
authentication records — is in the SMTP episode. Here it is the proof
of life for everything we just bootstrapped.

## What the listener now understands
This is the layered stack starting from absolutely nothing and walking
itself up to a working internet citizen. Each protocol depends on the
ones that ran before it. DHCP cannot wait for DNS, because DHCP is
what tells you which DNS server exists. NTP cannot wait for TLS,
because TLS will reject your certificates if your clock is wrong. DNS
cannot run before NTP if anything in its chain of trust uses DNSSEC
with time-bound signatures. And SMTP — or any real application —
cannot run until names resolve, the clock is honest, and packets can
leave the machine. The order is not arbitrary. It is the only order
the stack can come up in.

## Where this connects in the book
- The DHCP episode goes deep on the DORA exchange, lease renewal, and
  the subtle ways DHCP options shape the rest of a device's network
  life — including which DNS resolver and which NTP server it ends up
  trusting.
- The NTP episode unpacks the offset and delay calculation, the
  stratum hierarchy, and why a wrong clock quietly breaks half of
  modern infrastructure before anyone notices.
- The DNS episode walks the resolver hierarchy from root to
  authoritative, the caching that makes it feel instant on the second
  hit, and the geographic tricks CDNs play with the answers.
- The SMTP episode covers the 1982 command dialogue, STARTTLS, and
  the SPF, DKIM and DMARC layer that decides whether your message is
  trusted on the other end.

## See also (other journeys and protocol episodes)

- If you want to see the *next* layer in action — what happens once
  the bootstrap is done and you actually load a web page — the journey
  on what happens when you type a URL picks up exactly where this one
  ends. DNS, TCP, TLS and HTTP, in that order.

- The DHCP and DNS episodes are the two single-protocol deep dives
  most worth queueing up after this one. Together they explain almost
  everything about how a device finds its place on a network and how
  it finds anyone else.

- The NTP episode is the surprise listen here. Most engineers
  underestimate how many seemingly unrelated outages — expired certs,
  database conflicts, broken authentication — are really clock
  problems wearing a costume.

## Visual cues for image generation

- A four-node graph lighting up in sequence: DHCP, then NTP, then
  DNS, then SMTP — with a thin timeline underneath showing the
  bootstrap order from join-the-network to first message sent.
- The DORA exchange as a sequence diagram: client broadcasts
  Discover, server replies Offer, client sends Request, server sends
  Acknowledgment — with the leased IP, subnet mask, gateway and DNS
  server fields highlighted on the final ACK.
- An NTP stratum pyramid: stratum zero atomic clock at the top,
  stratum one servers below it, stratum two below those, with the
  laptop syncing from somewhere down the tree.
- A recursive DNS walk for gmail.com: root, then .com TLD, then
  gmail.com's authoritative nameserver, returning an IP address —
  with the resolver caching at each step.
- An SMTP text dialogue on a terminal: EHLO, AUTH LOGIN, MAIL FROM,
  RCPT TO, DATA — alongside a small badge showing SPF, DKIM and
  DMARC records pulled from DNS.
