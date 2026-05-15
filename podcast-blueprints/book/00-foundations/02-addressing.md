---
id: addressing
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Addressing & Identity
synopsis: How a packet finds your laptop — hostnames, IPs, MACs, and ports.
podcast_target_minutes: 15
position_in_book: 3 of 75
listening_order:
  prev: foundations/layer-model
  next: foundations/packets
related_protocols: [dns, ipv6, wifi, ip, ssh, arp, ethernet, bgp, tcp, webrtc]
related_pioneers: []
related_outages: []
related_frontier: [ipv6-50-percent]
related_rfcs: [1918]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/MAC-48_Address.svg/500px-MAC-48_Address.svg.png
    caption: A 48-bit MAC address — first 24 bits are the OUI (Apple = ac:de:48, Cisco = 00:1b:54), last 24 bits are assigned by the manufacturer per device. Two flag bits in the first octet mark multicast and locally-administered addresses.
    credit: Diagram — Wikimedia Commons / CC BY-SA 2.5
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/DNS_schema.svg/500px-DNS_schema.svg.png
    caption: The DNS namespace is a global tree rooted at "." — TLDs branch beneath the root, second-level domains beneath those. Resolution walks the tree from root to leaf, usually answered by a cache on the way.
    credit: Diagram — Wikimedia Commons / CC BY-SA 2.5
visual_cues:
  - "A vertical stack of four address layers labelled with concrete examples: google.com (hostname, for humans), 142.250.80.46 (IP, routes across the internet), f4:5c:89:9c:1a:30 (MAC, delivers on the local segment), :443 (port, delivers to the right process). Arrows down the right side label the resolver at each step: DNS, ARP/NDP, OS demux."
  - "A single packet drawn travelling left to right across ten router hops. The destination IP 142.250.80.46 is highlighted in green and stays the same in every frame. The source and destination MAC addresses change colour at every hop. The TTL counter ticks down from 64 to 50."
  - "A home router shown as a translation table — a private side with 192.168.1.x devices on the left, a single public IP on the right, and the (private IP, private port) → (public IP, public port) mapping in the middle. One outbound packet rewritten on the way out, one inbound response rewritten on the way back."
  - "A world map of the IPv6 deployment frontier as of March 2026 — Google's 50.1% peak labelled at the top, US mobile at 87%, T-Mobile at 93%, France at 86%, India at 75%. Dotted line at AWS's $0.005/hour IPv4 charge from February 2024 marked as the inflection point."
  - "Side-by-side IPv4 and IPv6 headers, drawn to scale: IPv4 at 20 bytes with checksum and options, IPv6 at fixed 40 bytes with no checksum, no in-router fragmentation, and an extension header chain dangling beneath."
---

# Part I, Chapter — Addressing & Identity

## The hook

When your browser loads google.com, four different identifiers cooperate to put one packet on one Google server. A hostname for humans. An IP address for the global routing fabric. A MAC address for the wire your laptop is on right now. A port number for the program that should answer. Each one identifies the destination at a different level of abstraction. None of them can do the others' job. This is the chapter where we lay out what those four addresses are, what scope each one lives in, and why the internet can scale to billions of hosts because no single device knows all of them.

## The story

### Four Layers of Identity, At Once

Start with the example. You type `google.com`. Before any traffic flows, your machine asks DNS — the Domain Name System — for an address. DNS returns something like `142.250.80.46`, or the IPv6 equivalent `2607:f8b0:4004:c1b::64`. That IP is what routers use to choose a path. It stays constant from your laptop all the way to the Google server.

Then your machine has to actually put a frame on a physical link. For that it needs a MAC address — a 48-bit hardware identifier like `f4:5c:89:9c:1a:30`. The MAC says "this device, on this wire, right now." The crucial property is that the MAC in a packet **changes at every router hop**. The IP destination stays the same; the next-hop MAC is rewritten as the packet moves from segment to segment.

Finally, when the packet arrives at the Google server, the operating system needs to know which program should get it. That's the port. Port 443 to the browser-facing nginx. Port 22 to the SSH daemon. Port 5432 to PostgreSQL. The port is meaningful only on that one host.

So the chain is: DNS resolves the hostname to an IP. IP routes the packet to the host. ARP — or its IPv6 cousin, Neighbor Discovery — resolves the next-hop IP to a MAC. The port delivers the payload to the right application. Four addresses, four different scopes, four different pieces of infrastructure keeping state about each one. How DNS actually walks the root-to-TLD-to-authoritative tree is the DNS episode. How ARP broadcasts its question and caches the reply is the ARP episode. The mechanism for each layer lives with that protocol; this chapter is the map.

### How an Address Survives the Trip

Now follow a single packet from your laptop to that Google server, watching only the addresses.

At your laptop the packet has destination IP `142.250.80.46` and a destination MAC of your home router's LAN-side address. Your router strips the Ethernet frame, rewrites the source IP to its own public address using NAT — Network Address Translation — picks a new next-hop MAC for its ISP's gateway, and forwards. At every router along the path — typically ten to twenty hops between you and Google — the same thing happens. The IP destination is left untouched. The source IP is left untouched. The MAC pair is rewritten at every single hop. The router does all the work of finding the next hop, either via BGP — the Border Gateway Protocol that holds the public internet together — or via its internal routing table. The IP packet never knows about any of it.

When the packet finally reaches the Google server, its TTL — Time to Live — has decremented from 64, which is Linux's default, down to maybe 50. The source MAC is the last router's MAC. The destination MAC is the server's network interface card. The OS strips the Ethernet header, validates that the IP destination matches its own, looks up port 443 in its socket table, and hands the payload to the nginx process.

That division of labour — IP for end-to-end identity, MAC for hop-to-hop delivery — is the architectural choice that lets you build a network out of heterogeneous links. The wire format on the Ethernet between you and your router can be completely different from the wire format on the fibre running between continents, because at every router the Layer 2 envelope is thrown away and re-written for the next link. The Ethernet episode covers how those frames are switched on a LAN. The IP episode covers what's actually in the IPv4 header field by field. The BGP episode covers how the autonomous systems learn each other's prefixes in the first place.

### Address Scope Is What Matters Most

Here is the single sentence that explains why the rest of the system holds together. **The scope of an address determines what infrastructure has to keep state about it.**

A MAC is meaningful only inside one broadcast domain — one wire, one Wi-Fi cell. The switch on that segment learns the MAC, and that's the only device on Earth that needs to. An IP is globally unique, or unique within a private space behind a NAT. The routing system has to know how to reach every globally routable prefix, but no single router needs to know about every individual host — it just needs to know the next hop for the prefix. A port is meaningful only on one host; it's a number in that host's socket table. A hostname is meaningful to the entire DNS namespace, but DNS is a hierarchical, cached, distributed database, so no single server has to hold the whole thing.

That layering of scopes is why the internet scales to billions of devices without any one box knowing all of them. Switches keep MAC tables. Routers keep prefix tables. Hosts keep socket tables. DNS keeps a global tree of caches. Each layer is sized for what it has to remember, and nothing more.

### NAT Changed Everything

The single biggest disturbance to that scheme came from running out of IPv4 addresses. In 1993 the IETF — the Internet Engineering Task Force — realised IPv4's roughly 4.3 billion addresses would not last. Three responses landed nearly simultaneously. **CIDR**, Classless Inter-Domain Routing, in RFC 1519 of 1993, abolished the rigid Class A, B, C boundaries and let prefixes be allocated at any bit length. **Private address ranges**, in RFC 1918 of 1996, gave every organisation `10.0.0.0/8` and the rest to use internally. And **Network Address Translation**, in RFC 1631 of 1994, let one public IP front for thousands of private hosts.

NAT is the reason your home printer is at `192.168.1.10` and Google's nginx is at `142.250.80.46` even though no router on the public internet has any idea where `192.168.1.10` lives. Your home router rewrites the source IP and source port of every outbound packet, keeps a table mapping (private IP, private port) to (public IP, public port), and reverses the rewrite on the response. From outside, every device in your home shares a single public IP.

NAT bought IPv4 thirty extra years. It also broke a foundational property of the internet: end-to-end addressability. Two hosts behind separate NATs can no longer simply open a TCP connection to each other. They need a third-party relay — STUN and TURN — or elaborate hole-punching, which is what the WebRTC episode spends most of its time on, or a long-lived outbound connection, which is why almost everything in modern web architecture is polled or pushed via webhooks instead of pushed directly. The IPv6 transition is what eventually fixes this, and as we'll get to in a moment, that transition just crossed a real threshold.

### Why an IP Looks Like Four Numbers

One last piece of orientation, because it helps the rest make sense. IPv4 addresses are 32 bits, written as four decimal numbers separated by dots. `192.0.2.5` is just `11000000.00000010.00000000.00000101` in binary, broken into four eight-bit chunks. The dotted-decimal notation is for humans. The router only ever sees the bits. When you write a CIDR prefix like `192.0.2.0/24`, the `/24` means "the first 24 bits are the network; the last 8 are the host," and a router does its forwarding decision by comparing those leading bits against its prefix table to pick the next hop.

IPv6 just makes the address space wider — 128 bits instead of 32, written as eight groups of four hex digits separated by colons, with collapses allowed for runs of zeros. The arithmetic works the same way; the prefix is on the left, the host bits are on the right.

## The figures

### The IPv6 50% milestone

On 28 March 2026, IPv6 carried 50.1% of Google's traffic for the first time in its history — 28 years after RFC 2460, the original IPv6 specification. Cloudflare's vantage point puts it at about 40% of HTTP requests. APNIC Labs measures 43.13% of networks as IPv6-capable. Different vantage points, same trend. Mobile carriers are the leading edge: the US averages around 87%, T-Mobile around 93%, France around 86%, India over 75%.

The economics that finally tipped it: Amazon Web Services started charging $0.005 per hour for every public IPv4 address in February 2024, which made IPv6-only architectures financially compelling at scale. Combined with 464XLAT being a first-class citizen in modern Android, iOS 9 and later, macOS 13 and later, and Windows 11, IPv6-only access networks now Just Work for IPv4 applications too. The full launch entry is on the Frontier page.

### RFC 1918 — Address Allocation for Private Internets

Published in 1996 by Yakov Rekhter and co-authors. Best Current Practice. RFC 1918 carved out three IPv4 ranges — `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16` — and reserved them for private use, never to be advertised on the public internet. That's the document that turned every home router and every corporate LAN into an addressable network without burning globally routable IPv4 space. It's the quiet foundation underneath every NAT deployment.

## What it taught the industry

Two things that are now permanent in how networks are designed.

**Separating identity from location.** The IP address is identity that travels end-to-end. The MAC address is location on a single wire. Keeping those separate is what lets the internet's links be heterogeneous — copper, fibre, radio, satellite — without the application caring. Every later transport protocol inherits this assumption.

**Keep state at the right scope, or pay forever.** The reason the internet works is that switches don't have to know about IPs, routers don't have to know about MACs, and hosts don't have to know about routing. NAT was the first big violation of that principle: a NAT box keeps per-flow state for every connection through it, which is why NAT traversal is hard and why every peer-to-peer system since 2000 — WebRTC included — has had to invent workarounds. The IPv6 transition is partly a story about getting back to a world where the box in the middle of your network does not have to remember anything about your individual flows.

## Listening order

- **Before this chapter:** *The Layer Model* — sets up why the stack has separate layers in the first place. Once you accept that addresses live at different layers, this chapter explains what each layer's address actually is.
- **After this chapter:** *Packets & Encapsulation* — zooms in on the envelope itself. Now that you know the four addresses, the next chapter is what the rest of the packet looks like and how each layer wraps the next.

## Where to go deeper

- **The DNS episode** picks up the hostname-to-IP story — the root server clusters, the caching cascade, DNSSEC signatures, DNS over TLS and DNS over HTTPS for privacy.
- **The IP episode** is the field-by-field tour of the IPv4 header — TTL, protocol number, fragmentation, why best-effort is the right answer.
- **The IPv6 episode** is the redesign — fixed 40-byte header, no router fragmentation, Neighbor Discovery instead of ARP, stateless address autoconfiguration, and the long migration story.
- **The ARP episode** is the broadcast-and-reply mechanism that resolves an IP to a MAC on the local segment, plus the spoofing problem that comes with zero authentication.
- **The Ethernet episode** is the Layer 2 frame format and how a switch learns MACs by watching source addresses.
- **The Wi-Fi episode** is what changes when the wire goes away — CSMA/CA, the four-address frame format, association and the WPA handshake.
- **The BGP episode** is how autonomous systems advertise their prefixes to each other, and the path-vector logic that picks the route across five to ten ASes.
- **The TCP episode** is what runs on top of an IP address and a port to give you reliable byte streams.
- **The SSH episode** is one example of a port-22 service that uses all four address layers we just walked through.
- **The WebRTC episode** is the place to go for the gory details of getting two hosts behind separate NATs to talk to each other directly.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Google IPv6 statistics](https://www.google.com/intl/en/ipv6/statistics.html)
- [APNIC — Google hits 50% IPv6](https://blog.apnic.net/2026/04/28/google-hits-50-ipv6/)
- [RFC 1918 — Address Allocation for Private Internets](https://datatracker.ietf.org/doc/html/rfc1918)
