---
id: layer-2-3/arp-and-ndp
type: chapter
part_id: layer-2-3
part_label: III
part_title: "Layer 2–3: Foundations"
title: ARP and NDP
synopsis: How a packet finds the next physical hop — STD 37 has not been obsoleted in 44 years.
podcast_target_minutes: 15
position_in_book: chapter 20 of 75
listening_order:
  prev: layer-2-3/wifi
  next: layer-2-3/ipv4
related_protocols: [ip, ipv6, ethernet, arp, wifi, icmp, dhcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [826, 4861, 4862, 8925, 8781]
images: []
visual_cues:
  - "A 28-byte ARP packet diagram next to a 60-byte Ethernet frame, calling out HLEN and PLEN as the variable fields that carried the format from Token Ring to FDDI to ATM to Frame Relay."
  - "Side-by-side: an ARP request broadcast to FF:FF:FF:FF:FF:FF on the left, an IPv6 Neighbor Solicitation to a solicited-node multicast group on the right."
  - "A Linux dmesg console with the line 'neighbour: arp_cache: neighbor table overflow!' highlighted, with a sysctl edit bumping gc_thresh3 above the default 1024."
  - "A timeline ribbon: November 1982 RFC 826, 2007 RFC 4861, October 2020 Bad Neighbor CVE, August 2024 CVE-2024-38063, September 2024 iOS 18 MAC rotation."
  - "An EC2 instance with arp -a returning a single hypervisor-supplied entry, captioned 'AWS does not run ARP.'"
---

# Part III, Chapter — ARP and NDP

## The hook

Two layers meet awkwardly inside your network adapter. The IP layer thinks in 32-bit IPv4 addresses, or 128-bit IPv6. The Ethernet layer thinks in 48-bit MAC addresses burned into the silicon. To send a packet to 192.0.2.5, the kernel has to know which MAC on the local segment owns that IP — and that mapping is given nowhere in advance. The Address Resolution Protocol, written by David C. Plummer at Symbolics in November 1982, solved it with the simplest broadcast you can imagine. STD 37 has not been obsoleted in 44 years.

## The story

### The Layer Seam

Every packet that leaves your machine has to cross a seam. Layer 3 says "send this to 192.0.2.5." Layer 2 says "I can only deliver frames to MAC addresses." Nothing on the wire tells the kernel which 48-bit hardware address answers to that 32-bit IP. ARP, RFC 826, fixes the seam by shouting onto the local segment: "who has 192.0.2.5?" The host that owns it shouts back, "I do, MAC ab:cd-and-so-on." The sender caches the answer for a few minutes and repeats when it expires.

Plummer wrote RFC 826 from the address DCP at MIT-MC in November 1982. It became STD 37, and it has never been obsoleted — only updated by RFC 5227. The packet itself is 28 bytes, padded to 60 by Ethernet, which makes it one of the smallest standard PDUs on the Internet. The HLEN and PLEN fields — hardware length and protocol length — were left variable on purpose, and that single design choice carried the same wire format through Token Ring, FDDI, ATM, and Frame Relay long after each of those died. How ARP actually constructs those request and reply frames, what gratuitous ARP looks like on the wire, and how the cache ages out — that is the ARP protocol episode.

### ARP has no checksum and no authentication

There is no integrity check above the Layer 2 frame check sequence, and there is no authentication at all. ARP simply trusts the first reply that comes back. Which is why ARP spoofing is an entry-level network attack — and why every enterprise switch ships with Dynamic ARP Inspection. Three tools made their reputations on this weakness. dsniff, written by Dug Song in 1999. Ettercap, by Ornaghi and Valleri in 2001. And Firesheep, by Eric Butler in October 2010, which made hijacking unencrypted Facebook and Twitter sessions on coffee-shop Wi-Fi a one-click demo. Firesheep is the proximate cause of the industry-wide HTTPS-everywhere push that followed.

### The IPv6 Successor — and Its CVE Year

IPv6 redesigned the same idea as the Neighbor Discovery Protocol, RFC 4861. Same shape — solicitation, advertisement — but layered on ICMPv6 instead of riding directly on Ethernet, and using solicited-node multicast instead of broadcasting to every interface on the segment. There is an optional cryptographic mode called Secure Neighbor Discovery, SEND, in RFC 3971, which uses cryptographically generated addresses to defeat spoofing. NDP also folds in router discovery and stateless address autoconfiguration — SLAAC, RFC 4862 — so a fresh-booted IPv6 host can pick its own address and find the local router without ever talking to a DHCP server. The mechanism details — solicited-node multicast groups, the duplicate-address-detection dance, how SLAAC builds an address from a prefix — belong to the IPv6 episode.

One operational note worth pinning. VRRPv3 was reissued as RFC 9568 in April 2024, and that update changed the gratuitous-ARP behavior on master transition. If you run virtual router redundancy on a campus or in a data center, that is the document you want.

Two NDP CVEs deserve naming on their own. CVE-2024-38063, disclosed by Microsoft in August 2024, was an integer underflow in tcpip.sys during IPv6 fragment reassembly. CVSS 9.8, exploitable from anywhere on the link, patched on August 13, 2024. Two years earlier, CVE-2020-16898 — the one nicknamed "Bad Neighbor," disclosed October 13, 2020 — exploited Windows tcpip.sys mishandling an ICMPv6 Router Advertisement that carried an even-length RDNSS option. CVSS 8.8, remote code execution, claimed wormable. The IPv6 stack was supposed to be cleaner than IPv4. The CVE record shows the implementations are no less intricate.

And SEND? SEND remains stillborn. NIST Special Publication 800-119, section 5.4.3, acknowledged in 2010 that cryptographic NDP is not deployed. Nothing has changed in 2024, 2025, or 2026.

### Three Operational Footguns to Know

First: AWS does not run ARP. The AWS Logical Separation whitepaper says it directly — "ARP packets never hit the network as they are not needed for discovery of the virtual network topology." Every ARP request inside a VPC is intercepted and answered by the hypervisor from an authenticated central database. If you have ever wondered why arp dash a looks weird on an EC2 instance, that is why.

Second: the Linux default gc_thresh3 of 1024 silently drops traffic on cloud hosts with more than about seven hundred neighbors. The symptom is dmesg flooding with "neighbour: arp_cache: neighbor table overflow." It is documented as Ubuntu OpenStack bug 1780348, and it is still relevant in 2026. The cure is to bump net.ipv4.neigh.default.gc_thresh3 and its friends.

Third: in September 2024, iOS 18 and macOS Sequoia introduced "Rotate Wi-Fi Address" mode, which changes the MAC address every fourteen days on weak or open networks. That broke captive portals, MAC-based DHCP reservations, and ARP-cache freshness assumptions across a lot of enterprise Wi-Fi deployments, many of which needed reconfiguration.

### The day ARP becomes vestigial

The frontier here is IPv6-mostly going mainstream. RFC 8925 plus RFC 8781 plus 464XLAT lets a single SSID or VLAN serve dual-stack laptops and IPv6-only-capable phones simultaneously, with the IPv6-only-capable hosts never running ARP at all. Apple iOS, Apple macOS, Android, and recent macOS releases request DHCP option 108 by default — that is RFC 8925, the IPv6-Only Preferred option. Windows is lagging. The day ARP becomes vestigial is not here yet, but it is approaching.

## The figures

### RFC 826 — An Ethernet Address Resolution Protocol

David C. Plummer's November 1982 specification of how to map a protocol address to a hardware address by broadcasting a 28-byte request and unicasting the reply. Internet Standard, STD 37. Never obsoleted in 44 years; only updated by RFC 5227 for address-conflict detection.

### RFC 4861 — Neighbor Discovery for IP Version 6 (IPv6)

T. Narten and co-authors, 2007. Standards-track. Defines the IPv6 successor to ARP — neighbor solicitation, neighbor advertisement, router solicitation, router advertisement, and redirect — all carried over ICMPv6, all using solicited-node multicast instead of broadcast.

### RFC 4862 — IPv6 Stateless Address Autoconfiguration

S. Thomson, T. Narten, and T. Jinmei, 2007. Standards-track. Specifies SLAAC: how a fresh-booted IPv6 host derives its own globally unique address from the local prefix in a router advertisement, with no DHCP server in the loop.

### RFC 8925 — IPv6-Only Preferred Option for DHCPv4

L. Colitti, J. Linkova, M. Richardson, and T. Mrugalski, 2020. Proposed standard. Defines DHCP option 108, the signal a client uses to tell the network it would rather be IPv6-only than dual-stack. Apple, Google, and recent Linux distributions request it by default.

### RFC 8781 — Discovering PREF64 in Router Advertisements

L. Colitti and J. Linkova, 2020. Proposed standard. Lets a host discover the NAT64 prefix from a router advertisement, which is the missing piece that makes 464XLAT just work on an IPv6-only access network.

## What it taught the industry

That a protocol with no authentication, no integrity beyond the L2 frame check, and a 28-byte packet can outlive every Layer 2 technology it was designed against. That the simple thing — broadcast on the wire, trust the first reply — is good enough for forty-four years and counting, and that every attempt to fix it cryptographically has failed in deployment. That when IPv6 redesigned address resolution from scratch, with multicast and ICMPv6 and an optional cryptographic mode, the implementations were no cleaner — Bad Neighbor and CVE-2024-38063 are the receipts. And that the real path past ARP is not to authenticate it, but to stop running it: IPv6-mostly access networks, with phones and laptops on the same SSID and the IPv6-only hosts never sending an ARP request in their life.

## Listening order

- **Before this chapter:** "Wi-Fi" — sets up the wireless side of the access layer that ARP and NDP both have to traverse, and explains why MAC randomization on iOS 18 lands so disruptively.
- **After this chapter:** "IPv4" — picks up the 32-bit address space whose exhaustion in 2011 is the reason IPv6-mostly is now a real frontier and not a slide.

## Where to go deeper

- The ARP episode picks up the mechanism story — request and reply on the wire, gratuitous ARP, cache aging, Dynamic ARP Inspection, and what an ARP-spoofing attack looks like packet by packet.
- The IPv6 episode covers Neighbor Discovery in detail — solicited-node multicast groups, duplicate-address detection, SLAAC, and how the 40-byte fixed header changes router processing.
- The Ethernet episode is where MAC addresses, EtherType 0x0806, and the 60-byte minimum frame size all come from.
- The Wi-Fi episode explains how the access point bridges 802.11 frames to 802.3 frames so that ARP and IP work seamlessly across both, and how MAC randomization landed in iOS 18.
- The ICMP episode covers the broader ICMPv6 specification that NDP rides on top of.
- The DHCP episode covers option 108 and the DHCPv4 message flow that IPv6-mostly clients use to opt out of an IPv4 address.

## Visual cues for image generation

- A 28-byte ARP packet diagram next to a 60-byte Ethernet frame, calling out HLEN and PLEN as the variable fields that carried the format from Token Ring to FDDI to ATM to Frame Relay.
- Side-by-side: an ARP request broadcast to FF:FF:FF:FF:FF:FF on the left, an IPv6 Neighbor Solicitation to a solicited-node multicast group on the right.
- A Linux dmesg console with the line "neighbour: arp_cache: neighbor table overflow!" highlighted, with a sysctl edit bumping gc_thresh3 above the default 1024.
- A timeline ribbon: November 1982 RFC 826, 2007 RFC 4861, October 2020 Bad Neighbor CVE, August 2024 CVE-2024-38063, September 2024 iOS 18 MAC rotation.
- An EC2 instance with arp -a returning a single hypervisor-supplied entry, captioned "AWS does not run ARP."
