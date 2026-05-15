---
id: arp
type: protocol
name: Address Resolution Protocol
abbreviation: ARP
etymology: "[A]ddress [R]esolution [P]rotocol"
category: network-foundations
year: 1982
rfc: RFC 826
standards_body: ietf
podcast_target_minutes: 20
related_book_chapters:
  - foundations/layer-model
  - foundations/addressing
  - layer-2-3/arp-and-ndp
related_protocols: [ethernet, ip, wifi, dhcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [826, 5227, 1027, 4861, 9568, 8925, 6820, 9135, 9047, 9161, 9131, 6775, 8302, 903, 2390, 2225]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Ethernet_Switch_%28Front_View%29.jpg/500px-Ethernet_Switch_%28Front_View%29.jpg"
    caption: "An Ethernet switch — the broadcast domain where ARP does its work. When a host needs to send an IP packet on the local segment, it shouts who has this IP onto the wire and the owner replies with its MAC."
    credit: "Photo: CCDBarcodeScanner / CC BY-SA 4.0, via Wikimedia Commons"
visual_cues:
  - "A 60-byte Ethernet frame with the 28-byte ARP payload highlighted in one colour and the 18 bytes of zero-padding in another, labelled with field names HLEN, PLEN, opcode, SHA, SPA, THA, TPA"
  - "Two-host swimlane: Host A broadcasts who has 192.168.1.50 to FF:FF:FF:FF:FF:FF, Host B replies unicast with its MAC, both caches updated"
  - "The Linux neighbour state machine as a five-node graph: INCOMPLETE, REACHABLE, STALE, DELAY, PROBE, FAILED, with the 15-to-45-second reachable timer annotated"
  - "An attacker labelled Mallory between Host and Gateway, sending two forged ARP replies in opposite directions, each cache pointing at Mallory's MAC"
  - "An EVPN leaf switch intercepting an ARP request and answering it from a BGP-learned table, with the request never reaching the spine"
  - "A timeline ribbon from 1982 RFC 826 to 2024 RFC 9568 VRRPv3 reissue, with the 28-byte wire format unchanged across the entire span"
---

# ARP — Address Resolution Protocol

## In one breath

ARP is the 28-byte question every IPv4 host on Earth has to ask before it can send a single packet on a local segment: who owns this IP, and what is your MAC address? David Plummer wrote it at Symbolics in November 1982, RFC 826 became Internet Standard 37, and forty-four years later it has never been obsoleted. It is also trusted by default, which is why it is the basis of the entry-level man-in-the-middle attack and why every enterprise switch ships with Dynamic ARP Inspection.

## The pitch (cold-open)

In November 1982 a Symbolics engineer typed up an eleven-page document at MIT, sent it from the address DCP at MIT-MC, and registered it as Request for Comments 826. The fix was small: when an Ethernet card sees a 32-bit IP address, how does it figure out which 48-bit hardware address to put on the wire? Plummer's answer was to broadcast the question and let the rightful owner reply. Forty-four years later that exact 28-byte packet still rides 100-gigabit Ethernet, still has no authentication, and is now spending more and more of its life being intercepted, suppressed, or quietly replaced by IPv6.

## How it actually works

A host wants to send an IP packet to 192.168.1.50 on the same subnet. The kernel has the destination IP, but Ethernet does not address by IP; it addresses by 48-bit MAC. So before the packet can leave the NIC, the OS checks its ARP cache for a mapping. On a miss, it crafts an ARP request with its own IP and MAC as the source, the target IP filled in, and the target MAC set to all zeroes — that zero is the placeholder for the unknown answer. The frame is sent to the Ethernet broadcast address FF:FF:FF:FF:FF:FF with EtherType 0x0806, so every device on the segment receives it.

Each receiver checks the target IP. If it does not match, the receiver may snoop the sender's IP-MAC pair into its own cache and then drop the request. The one host that owns the IP responds with a unicast ARP reply — opcode 2 instead of 1 — addressed straight back to the requester's MAC. The reply carries the answer in the sender hardware address field. Both ends update their caches: the requester now has the destination MAC, and the responder has the requester's MAC for free, since reply traffic is almost always coming.

With the cache populated, the original IP packet finally goes out. The destination MAC is the resolved address, the EtherType flips to 0x0800 for IPv4, and bidirectional traffic flows with no further ARP overhead until the cache entry expires. On modern Linux and Windows Vista and later, that entry sits in the REACHABLE state for the base reachable time multiplied by a random factor between 0.5 and 1.5 — defaulting to 15 to 45 seconds — then transitions to STALE. STALE entries are only re-resolved if traffic actually flows to them, which is the trick that keeps the cache from churning.

A host can also send unsolicited ARP messages. An ARP announcement, defined by RFC 5227, is a request with the sender IP and target IP both set to the host's own address; it tells the segment "I now claim this IP, update your caches." An ARP probe is a request with the sender IP set to 0.0.0.0 and the target IP set to the address the host is about to claim — the all-zero sender field is the magic flag for "I am asking, not asserting." If a probe gets a reply, the host must not configure the address. Stuart Cheshire at Apple wrote those rules; they are the basis of the 169.254/16 IPv4 link-local algorithm.

### Header at a glance

ARP is essentially all header. There is no payload. The fixed 28 bytes for IPv4 over Ethernet contain:

- Hardware Type, 16 bits. 1 means Ethernet. The full registry lives at IANA under "ARP Parameters" — Frame Relay is 15, ATM is 16, HDLC is 17.
- Protocol Type, 16 bits. Same numbering as the EtherType field. 0x0800 for IPv4 is the universal case.
- HLEN, 8 bits. Hardware address length. 6 for Ethernet.
- PLEN, 8 bits. Protocol address length. 4 for IPv4.
- Operation, 16 bits. 1 for request, 2 for reply, 3 and 4 for RARP, 8 and 9 for InARP. The opcode is the only thing on the wire that distinguishes a request from a reply.
- Sender Hardware Address, 6 bytes. The MAC of whoever generated the packet.
- Sender Protocol Address, 4 bytes. Their IP.
- Target Hardware Address, 6 bytes. Zeros in a request, the requester's MAC in a reply.
- Target Protocol Address, 4 bytes. The IP being asked about or confirmed.

Wrap that 28-byte payload in a 14-byte Ethernet header and you get 42 bytes — below the Ethernet minimum of 60 bytes, so the NIC pads with 18 zero bytes. The famous 60-byte ARP frame trips up everyone who counts bytes for the first time. There is no internal checksum; ARP relies entirely on the Ethernet frame check sequence.

### State machine in three sentences

ARP itself does not have a connection state machine — every packet stands alone. What does have states is the ARP cache, and modern Linux since kernel 2.2 and Windows Vista and later both run the RFC 4861 IPv6 neighbour state machine for IPv4 entries: INCOMPLETE, REACHABLE, STALE, DELAY, PROBE, FAILED. New entries enter INCOMPLETE while the request is in flight, become REACHABLE on a successful reply, age into STALE after the reachable timer, and only re-resolve through DELAY and PROBE if traffic actually wants to use them.

### Reliability, security, and what is missing

There is none of the reliability or security machinery you would find in TCP or TLS. No authentication of any kind. No checksum. No retry semantics in the protocol itself, although Linux buffers up to three packets per unresolved entry — the unres_qlen knob — while waiting for a reply. The first reply that comes back wins, even if it is a lie. That single design choice is the parent of the entire ARP-spoofing literature: anyone on the segment can broadcast a forged reply claiming to own the gateway IP, and every host on the segment will happily start sending its outbound traffic to the attacker's MAC. The only defences are operational: Dynamic ARP Inspection on managed switches, which validates every ARP against a DHCP-snooping binding table; static ARP entries for critical hosts; and at higher layers, TLS that authenticates the server independent of any IP or MAC the network claims.

## Where it shows up in production

Linux runs ARP in net/ipv4/arp.c on top of the generic neighbour subsystem in net/core/neighbour.c. The tunables live under /proc/sys/net/ipv4/neigh/ and they matter: gc_thresh1 defaults to 128, gc_thresh2 to 512, gc_thresh3 to 1024. That last number is the hard ceiling — one extra neighbour and the kernel logs "neighbour: arp_cache: neighbor table overflow" and silently drops traffic. OpenStack Neutron has been telling operators since Ubuntu Launchpad bug 1780348 in 2018 to bump those thresholds to at least 1024, 2048, 4096 on cloud hosts, and to 16384, 28672, 32768 on hosts running many namespaces, because the neighbour table is not namespaced for sizing purposes. Userland is ip neighbour for the modern tool and arp for the legacy one.

Windows since Vista uses the unified neighbour cache with the same RFC 4861 state machine for IPv4 and IPv6. The reachable time defaults to 30 seconds times a random factor of 0.5 to 1.5, so 15 to 45 seconds. The pre-Vista ArpCacheLife and ArpCacheMinReferencedLife registry knobs are gone. Cisco IOS and IOS-XE default to a four-hour ARP timeout of 14400 seconds, which is interestingly longer than the typical CAM-table aging of five minutes — a mismatch that causes switches to flood unicast frames after five minutes of silence on a quiet host. Juniper Junos defaults to 20 minutes and shares its ARP table across logical systems.

AWS does not run ARP at all in the way the protocol pretends to. Their Logical Separation on AWS whitepaper states it directly: ARP packets never hit the network because they are not needed for discovery of the virtual network topology. The hypervisor virtual switch synthesises ARP replies from the central VPC mapping service. EC2 instances cannot send packets with a source MAC other than the assigned ENI MAC — the hypervisor drops them. ARP spoofing inside a VPC is not possible. Azure does the same with its OpenFlow-based VFP virtual switch, and GCP does the same with Andromeda.

The data centre fabric story is EVPN. RFCs 9135, 9047, and 9161, all from 2021, define ARP suppression: every leaf switch learns IP-MAC bindings via BGP EVPN Type-2 routes, and when a host sends an ARP request, the local leaf answers from the BGP-learned database without ever flooding to the fabric. Arista EOS, Cisco NX-OS and IOS-XE, Juniper Junos, Nokia SR Linux, and FRRouting on SONiC all support this. RFC 6820 from 2013 set the stage by documenting that broadcast ARP scales sublinearly past the 10⁴ to 10⁵ neighbours per L2 domain mark; modern data-centre switch silicon — Broadcom Tomahawk, Trident, Jericho — supports neighbour tables in the 100-thousand to 500-thousand range, and pushing the burden into BGP scales further.

Carriers mostly do not use ARP. Mobile operator GGSN and PGW gateways serve millions of subscribers off GTP tunnels with explicit next-hop forwarding. ISP edge routers running PPPoE never ARP customers. The corner where ARP scale still bites is IXP peering LANs with 1500-plus peers on one shared VLAN — RFC 9161 EVPN proxy ARP is the standards answer, but per-port ARP rate limiting is the bandaid most IXPs apply today.

## Things that go wrong

The single most common Linux production failure is ARP cache exhaustion. The kernel logs "neighbour: arp_cache: neighbor table overflow" and connectivity to a random subset of peers gets intermittent and weird. Anyone running Kubernetes or OpenStack on hosts with many network namespaces has hit this; the fix is to raise gc_thresh1, gc_thresh2, and gc_thresh3 to numbers proportional to the actual neighbour count. Ubuntu and OpenStack bug 1780348 has been the canonical reference since 2018 and is still relevant in 2026.

ARP spoofing is the original sin and predates almost every other named attack on Layer 2. Steve Bellovin disclosed it publicly in 1989; Dug Song shipped it as a usable weapon in the dsniff suite in 1999, alongside arpspoof, dnsspoof, mailsnarf, urlsnarf, webmitm, and sshmitm. Alberto Ornaghi and Marco Valleri added a GUI and bridged-mode interception in Ettercap in 2001. Eric Butler's Firesheep extension, released October 2010, popularised session-cookie hijacking on coffee-shop Wi-Fi using ARP poisoning plus HTTP sniffing — every IT publication ran an article that month, and the practical attack accelerated industry adoption of HTTPS-everywhere. There is no CVE for the underlying weakness because it is a design property of RFC 826, not an implementation bug.

The gratuitous-ARP failure family is a perennial. Lindsay Hill's "War Stories: Gratuitous ARP and VRRP" at lkhill.com is the canonical write-up. The pattern: switch CAM tables age out the virtual MAC because regular VRRP advertisements use the physical source MAC, not the virtual one; downstream switches then flood unicast frames destined to the virtual MAC. Huawei issued patches that emit periodic gratuitous ARPs every 60 seconds from the master to keep CAM tables fresh; Cisco and Nokia have similar mechanisms. Asymmetric-routing firewall policies that drop the virtual-IP source make this particularly nasty. The detailed cutover failure — HSRP migration to VRRP, hosts holding old four-hour ARP cache entries pointing at a now-unowned MAC, what was meant to be a four-minute blip turning into 47 minutes of partial outage — is the chapter on ARP and NDP in the book; the protocol blueprint compresses it.

EVPN ARP suppression breaking application keepalives is the modern footgun. The APNIC blog of December 2021 wrote it up: cluster software that uses broadcast ARP requests as cheap inter-node liveness checks gets silently broken by aggressive ARP suppression. Every node sees its peers as alive forever, fencing fails to fire, split-brain ensues. The fix is to configure ARP suppression to honour probes — packets with sender IP 0.0.0.0 must not be suppressed, or duplicate-IP detection breaks too — and to selectively forward gratuitous ARP, or to flood ARP at low rate.

iOS 14 had a documented bug where it sent ARP replies carrying the hardware MAC instead of the randomised per-SSID MAC. Cisco Meraki documented it; enterprise Wi-Fi networks saw false duplicate-IP alarms; subsequent iOS minor releases fixed it. The lore around AWS US-EAST-1 outages of April 2011 and June 2012 routinely calls them ARP storms, but Amazon's own postmortems are explicit that the lasting damage was an EBS re-mirroring storm and a power and datastore failover bottleneck respectively, not a strict L2 ARP storm. Cloudflare's 2024 to 2026 outages — the September 17 2024 BGP withdrawal, the June 20 2024 DDoS-mitigation latent bug, the November 18 2025 Bot Management feature-file bug — none of them have been attributed to ARP either. Lore is louder than RCAs.

## Common pitfalls (for the practitioner)

- Default Linux gc_thresh3 of 1024 silently drops traffic on cloud hosts with more than roughly 700 neighbours. Symptom is intermittent reachability and dmesg flooded with neighbour table overflow. Cure is to raise the thresholds in /etc/sysctl.d.
- Cisco IOS default ARP timeout of 14400 seconds is longer than the typical CAM-table aging of five minutes, which makes switches flood unicast to a quiet host after five minutes of silence. Either match the timers or accept the flooding.
- Overzealous Dynamic ARP Inspection configuration can drop ARP probes — packets with sender IP 0.0.0.0 — and break duplicate-IP detection. Verify DAI does not drop probes.
- Asymmetric proxy ARP, where one router proxies and another does not, leaves half the hosts on a segment learning the wrong MAC.
- MAC flapping in EVPN — the same MAC seen on two different VTEPs — produces Type-2 route advertisement-and-withdrawal storms. RFC 9135 section 7 specifies the mobility procedure.
- Putting a NIC in promiscuous mode behind a misconfigured bridge can make the bridge reply to ARP for IPs it should not own, hijacking traffic accidentally.
- Migrating from HSRP to VRRP without accounting for the virtual MAC change — HSRP uses 00:00:0C:07:AC:VRID, VRRP uses 00:00:5E:00:01:VRID — strands hosts on the old MAC until ARP entries age out. Shorten ARP timers ahead of the change.

## Debugging it

- ip neigh show is the modern tool. It prints the neighbour state — REACHABLE, STALE, DELAY, PROBE, FAILED — alongside each entry.
- arp -an is the legacy but universal one-liner; quick to scan.
- arping from the iputils package actively sends an ARP request and times it. It distinguishes "I cannot reach you on the wire" from "I can reach you but the application is broken."
- tcpdump -nn -e -i any 'arp' shows all ARP on a host; the -e flag shows L2 addresses. Add 'arp host 10.0.0.1' to filter.
- Wireshark display filters: arp for everything, arp.opcode == 1 for requests, arp.opcode == 2 for replies, arp.src.proto_ipv4 == 0.0.0.0 for probes, arp.duplicate-address-detected for Wireshark's heuristic on conflicts.
- Scapy is the right tool for crafting test ARPs from Python: Ether(dst="ff:ff:ff:ff:ff:ff")/ARP(pdst="10.0.0.1") and send.
- ip monitor neigh on Linux watches cache changes in real time.
- arpwatch from Lawrence Berkeley Lab, originally Craig Leres, watches ARP traffic and emails on every new IP-MAC pairing — still standard Tier-1 NOC tooling in 2026 because nothing has replaced its simplicity.
- For switch-side debugging: show ip arp inspection statistics on Cisco gives DAI deny counters; switch interface counters for unknown-unicast flooding above roughly 1 percent of traffic indicate a CAM and ARP timer mismatch.
- Linux tunables to know by name: net.ipv4.neigh.default.gc_thresh1, gc_thresh2, gc_thresh3, base_reachable_time_ms, gc_stale_time, unres_qlen, locktime.

## What's changing in 2026

- VRRPv3 has been re-issued. RFC 9568 in April 2024 supersedes RFC 5798 as the current VRRPv3 specification for IPv4 and IPv6, including the gratuitous-ARP behaviour on master transition.
- IPv6-mostly is going mainstream. The IETF v6ops draft draft-ietf-v6ops-6mops, on revision 07 as of March 2026, is on track to become an RFC. It standardises how RFC 8925 (DHCP option 108, IPv6-only Preferred), RFC 8781 (PREF64 in router advertisements), and 464XLAT compose. SC24 in November 2024 and SC25 ran an IPv6-only Wi-Fi SSID using RFC 8925 in production; both Apple and Android shipped clients that respect option 108. IPv6-mostly hosts never run ARP.
- iOS 18, iPadOS 18, and macOS Sequoia 15, all from September 2024, introduced "Rotate Wi-Fi Address" mode on top of the per-SSID private MAC introduced in iOS 14 in 2020. The default for open and pre-WPA2 networks is to rotate every 14 days; secure networks use a fixed but per-SSID MAC. This breaks captive portals, MAC-based DHCP reservations, and the assumption that a MAC in your ARP cache stays valid for a while. Many enterprise Wi-Fi deployments needed reconfiguration.
- The Linux kernel became its own CVE Numbering Authority on February 13, 2024. CVE volume jumped to 3,529 in 2024 per CIQ analysis and accelerated through 2025. The neighbour subsystem has not had a headline ARP CVE in this window, but the patching calculus changed.
- EVPN ARP and ND suppression has become the data-centre default in greenfield builds. RFCs 9135, 9047, and 9161 are now table-stakes in Arista EOS, Cisco NX-OS, Juniper Junos, Nokia SR Linux, and FRRouting on SONiC. The flood-and-learn era is ending.
- Active IETF drafts touching ARP-adjacent behaviour as of May 2026: draft-ietf-v6ops-6mops for IPv6-mostly operations; draft-ietf-v6ops-claton for CLAT node behaviour; updates to draft-ietf-bess-evpn-proxy-arp-nd; draft-ietf-6lo-rfc6775-update for 6LoWPAN registration extensions.
- No new RFC has obsoleted RFC 826. STD 37 is still STD 37.

## Fun facts (host material)

ARP-over-IPv4-over-Ethernet is exactly 28 bytes, padded to 60 bytes — 64 with the frame check sequence — by the NIC. That is roughly the size of two IPv6 addresses. The 28-byte wire format has not changed since November 1982. It was designed to outlive Ethernet, with HLEN and PLEN as variable fields, and it has — Token Ring is dead, FDDI is dead, ATM is dead, Frame Relay is mostly dead, and ARP still rides 100 GbE.

Symbolics Inc. of 243 Vassar Street, Cambridge MA — the Lisp Machine company spun out of the MIT AI Lab — registered symbolics.com on March 15, 1985. It was the first .com domain ever registered. The same company employed RFC 826's author, David C. Plummer. Two separate networking firsts, one company.

There are two Dave Plummers and conflating them is one of the easiest fact-checks to fail. David C. Plummer of Symbolics and MIT-MC wrote RFC 826 in 1982; his contact line in the RFC itself is DCP at MIT-MC and the address is 243 Vassar Street. David William "Dave" Plummer, born 1968 in Regina Saskatchewan, wrote the Windows NT Task Manager at Microsoft starting in 1993 and runs the Dave's Garage YouTube channel. He was 14 years old in November 1982. He did not write RFC 826.

The phrase "the ARP hack" was the inventors' own. RFC 1027 from 1987 by Carl-Mitchell and Quarterman of UT Austin opens with the line about "an ARP-based method (commonly known as 'Proxy ARP' or 'the ARP hack')." It was a kludge from the day it was named.

GARP is not gratuitous ARP. IEEE 802.1's Generic Attribute Registration Protocol was renamed MRP in 802.1ak; both deal with VLAN and multicast registration on bridges. The acronym collision with gratuitous ARP causes hours of confusion every year for new engineers, and you can find IETF participants in archived mailing lists asking that GARP never be used as shorthand for gratuitous ARP for this exact reason.

RFC 5227 section 1.2, by Stuart Cheshire at Apple in 2008, contains a meditation that reads more like philosophy than networking. He writes that an ARP probe with an all-zero sender IP address may seem to be asking an innocent question — is anyone using this address — but an intelligent implementation should recognise the question as the precursor to claiming the address. It is one of the rare RFCs that pauses to think about what a question even means on a wire.

## Where this connects in the book

- Foundations chapter "The Layer Model" — seven layers, the standards war that decided their fate, and where the layers blur. ARP straddles Layer 2 and Layer 3 and is the exhibit A for that blur, which is why textbooks argue about whether to call it Layer 2.5.
- Foundations chapter "Addressing and Identity" — how a packet finds your laptop. Hostnames, IPs, MACs, and ports. ARP is the bridge between IP and MAC; the chapter sets the stage for why the bridge has to exist.
- Layer 2-3 chapter "ARP and NDP" — how a packet finds the next physical hop, with the line that STD 37 has not been obsoleted in 44 years. This chapter carries the historical narrative about Plummer at Symbolics, the dsniff and Ettercap and Firesheep arc, the SEND-stillborn IPv6 story, the AWS does-not-run-ARP footgun, and the full HSRP-to-VRRP cutover failure story — all expanded.

## See also (other protocol episodes)

If you have heard the Ethernet episode, ARP is the protocol that makes IPv4 sit on top of it. ARP runs directly on Ethernet with EtherType 0x0806; there is no IP header in an ARP packet. Plummer designed ARP to be Ethernet-shaped — broadcast resolution, 48-bit hardware addresses — but generalised it via HLEN and PLEN so the same wire format could ride non-Ethernet links.

The IPv4 episode pairs naturally with this one. ARP is the mechanism that lets IPv4 sit on Ethernet at all. Without ARP, every IPv4-over-Ethernet packet would need a static MAC-to-IP mapping. RFC 1122 places ARP "in the link layer" — the last hop from logical addressing to physical delivery happens through this 28-byte question.

The Wi-Fi episode is where ARP gets weird. ARP works the same on 802.11 as on Ethernet, but broadcasts are expensive on radio — they go out at the lowest data rate and there is no block-acknowledgement — so modern access points implement ARP proxying that converts broadcast ARP into unicast queries against a learned table. And MAC randomisation in iOS, Android, and Windows breaks the assumption that a MAC is a stable identity at all.

The DHCP episode is the natural before-and-after. DHCP assigns the IP, ARP resolves the IP to a MAC, and they bootstrap a device onto the network in that order. RFC 5227 says a DHCP client should send ARP probes for the offered address before declaring the lease bound, and announcements after. Switches running DHCP snooping build the IP-MAC-port binding table that Dynamic ARP Inspection consumes.

There is no IPv6 episode where ARP appears, because IPv6 replaced ARP entirely. RFC 4861's Neighbor Discovery Protocol runs over ICMPv6 — Neighbor Solicitation type 135, Neighbor Advertisement 136, Router Solicitation 133, Router Advertisement 134, Redirect 137 — and uses solicited-node multicast addresses like FF02::1:FFxx:xxxx instead of broadcast. Hosts only hear solicitations for IPs they actually own, dramatically reducing CPU interrupts. RFC 9131 from October 2021 added gratuitous ND so first-hop routers proactively populate the neighbour cache when a host announces a new address — the direct analogue of RFC 5227.

## Visual cues for image generation

- A 60-byte Ethernet frame illustration with the 14-byte L2 header, the 28-byte ARP payload, and the 18 zero-bytes of pad each in a different colour, all field names labelled
- A two-host swimlane diagram: Host A at 192.168.1.100 broadcasts the request, Host B at 192.168.1.50 replies unicast, both caches now show the freshly learned mapping
- The Linux neighbour state machine as a directed graph with five named states — INCOMPLETE, REACHABLE, STALE, DELAY, PROBE, FAILED — and the transitions labelled with the timer constants 15-to-45 seconds and gc_stale_time 60 seconds
- An attacker labelled Mallory between a host and its gateway, with two forged ARP replies drawn as crooked arrows in opposite directions, both target caches updated to point at Mallory's MAC
- An EVPN leaf switch in a spine-and-leaf fabric intercepting an ARP request, answering it locally from a BGP-learned binding table, with a red X over the path that would have flooded to the spine
- A timeline ribbon from RFC 826 in November 1982 to RFC 9568 in April 2024, with the 28-byte wire format unchanged across the entire span and milestone RFCs — 903, 1027, 4861, 5227, 6820, 9135 — marked along the way

## Sources

### RFCs

- [RFC 826 — An Ethernet Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826)
- [RFC 5227 — IPv4 Address Conflict Detection](https://datatracker.ietf.org/doc/html/rfc5227)
- [RFC 1027 — Using ARP to Implement Transparent Subnet Gateways (Proxy ARP)](https://datatracker.ietf.org/doc/html/rfc1027)
- [RFC 4861 — Neighbor Discovery for IP version 6](https://www.rfc-editor.org/rfc/rfc4861)
- [RFC 5798 — VRRPv3](https://datatracker.ietf.org/doc/html/rfc5798)
- [RFC 6775 — 6LoWPAN Neighbor Discovery](https://datatracker.ietf.org/doc/html/rfc6775)
- [RFC 6820 — Address Resolution Problems in Large Data Center Networks](https://datatracker.ietf.org/doc/html/rfc6820)
- [RFC 8302 — TRILL ARP/ND Optimization](https://tools.ietf.org/html/rfc8302)
- [RFC 8925 — IPv6-Only Preferred Option for DHCPv4](https://datatracker.ietf.org/doc/rfc8925/)
- [RFC 9047 — Propagation of ARP and ND Flags in EVPN](https://datatracker.ietf.org/doc/rfc9047/)
- [RFC 9131 — Gratuitous Neighbor Discovery](https://datatracker.ietf.org/doc/rfc9131/)
- [RFC 9135 — Integrated Routing and Bridging in EVPN](https://datatracker.ietf.org/doc/rfc9135/)
- [RFC 2390 — Inverse Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc2390.html)
- [IETF draft-ietf-v6ops-6mops — IPv6-Mostly operational guidance](https://datatracker.ietf.org/doc/draft-ietf-v6ops-6mops/)

### Papers and technical reports

- [APNIC Blog — ARP problems in EVPN](https://blog.apnic.net/2021/12/01/arp-problems-in-evpn/)
- [LACNIC Blog — IPv6-Mostly frontier](https://blog.lacnic.net/en/ipv6-mostly-frontier/)
- [RIPE Labs](https://labs.ripe.net/)
- [Stevens — TCP/IP Illustrated Vol. 1, 2nd ed., sample chapter PDF](https://ptgmedia.pearsoncmg.com/images/9780321336316/samplepages/0321336313.pdf)

### Vendor and engineering blogs

- [AWS — Logical Separation on AWS, VPC chapter](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/vpc-and-accompanying-features.html)
- [AWS — Summary of June 29 2012 EC2 disruption](https://aws.amazon.com/message/67457/)
- [Microsoft Learn — ARP caching behavior](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/address-resolution-protocol-arp-caching-behavior)
- [Juniper — EVPN Proxy ARP and ARP Suppression](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn-proxy-arp-support.html)
- [Juniper — EVPN concepts](https://www.juniper.net/documentation/us/en/software/junos/evpn/topics/concept/evpn.html)
- [Cisco Meraki — MAC Address Randomization](https://documentation.meraki.com/General_Administration/Cross-Platform_Content/Meraki_and_MAC_Address_Randomization)
- [Cisco Meraki — Dynamic ARP Inspection](https://documentation.meraki.com/Switching/MS_-_Switches/Operate_and_Maintain/How-Tos/Dynamic_ARP_Inspection)
- [Cisco Press — VXLAN BGP EVPN Enhancements](https://www.ciscopress.com/articles/article.asp?p=2803865)
- [FRRouting — EVPN documentation](https://docs.frrouting.org/en/latest/evpn.html)
- [FRRouting — VRRP documentation](https://docs.frrouting.org/en/latest/vrrp.html)
- [ipSpace.net — Ivan Pepelnjak](https://blog.ipspace.net/)
- [Lindsay Hill — War Stories: Gratuitous ARP and VRRP](https://lkhill.com/war-stories-gratuitous-arp-and-vrrp/)
- [ANTlabs — iOS 18 MAC randomization advisory](https://www.antlabs.com/advisories/advisory-ios-18-mac-randomization-what-it-means-for-your-hotel-wi-fi-2/)
- [Datavalet — Understanding MAC Address Rotation in iOS 18](https://www.datavalet.com/blog/understanding-mac-address-rotation-in-ios18)
- [Linux man page — arp(7)](https://linux.die.net/man/7/arp)
- [Baeldung — Linux ARP settings](https://www.baeldung.com/linux/arp-settings)
- [Cyberciti — neighbor table overflow](https://www.cyberciti.biz/faq/centos-redhat-debian-linux-neighbor-table-overflow/)
- [ixnfo — Changing gc_thresh on Linux](https://ixnfo.com/en/changing-gc_thresh-on-linux.html)
- [Ubuntu Launchpad bug 1780348](https://bugs.launchpad.net/bugs/1780348)
- [Sysdig — CVE-2024-1086 detection](https://www.sysdig.com/blog/detecting-cve-2024-1086-the-decade-old-linux-kernel-vulnerability-thats-being-actively-exploited-in-ransomware-campaigns)
- [CIQ — Linux kernel CVEs 2025](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)
- [Containerlab](https://containerlab.dev/)
- [Wireshark](https://www.wireshark.org/)
- [Wireshark display filter reference](https://www.wireshark.org/docs/dfref/)
- [Ask Wireshark — display ARP and ICMP only](https://ask.wireshark.org/question/1506/display-arp-and-icmp-only/)
- [Network Academy — Dynamic ARP Inspection](https://www.networkacademy.io/ccna/network-security/dynamic-arp-inspection-dai)
- [Grumpy Networkers Journal — DAI](https://grumpy-networkers-journal.readthedocs.io/en/latest/VENDOR/CISCO/SWITCHING/DAI.html)
- [HPC.mil — Neighbor Discovery Protocol attacks](https://www.hpc.mil/solution-areas/networking/ipv6-knowledge-base/ipv6-knowledge-base-security/neighbor-discovery-protocol-attacks)
- [Packet Pushers IPv6 Buzz — Deploying IPv6-Only Wi-Fi at SC24](https://packetpushers.net/podcasts/ipv6-buzz/ipb168-deploying-ipv6-only-wi-fi-at-the-sc24-conference/)
- [CCNA Classes — Inverse ARP](https://ccna-classes.com/ccna-exam-preparation/what-is-inverse-arp-in-networking/)
- [Network Bulls — Why ARP is called a Layer 2.5 protocol](https://www.networkbulls.com/ask/why-arp-called-a-layer-25-protocol)

### News, course, and reference

- [Stanford CS144 — Introduction to Computer Networking](https://cs144.github.io/)
- [Princeton COS 461 — Computer Networks](https://www.cs.princeton.edu/courses/archive/spring24/cos461/)
- [Vintage Computer Federation — David Plummer bio](https://vcfed.org/bio-david-plummer/)
- [Cloudflare — Incident on September 17, 2024](https://blog.cloudflare.com/cloudflare-incident-on-september-17-2024/)
- [Cloudflare — outage tag](https://blog.cloudflare.com/tag/outage/)
- [Ben Eater — networking series](https://www.youtube.com/@BenEater)
- [Dave's Garage — note the disambiguation](https://www.youtube.com/c/DavesGarage)

### Wikipedia

- [Address Resolution Protocol](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)
- [dsniff](https://en.wikipedia.org/wiki/DSniff)
- [Symbolics](https://en.wikipedia.org/wiki/Symbolics)
- [IP over Avian Carriers — Grokipedia](https://grokipedia.com/page/IP_over_Avian_Carriers)
