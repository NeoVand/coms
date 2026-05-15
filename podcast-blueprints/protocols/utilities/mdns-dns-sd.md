---
id: mdns-dns-sd
type: protocol
name: Multicast DNS & DNS-Based Service Discovery
abbreviation: mDNS / DNS-SD
etymology: "[m]ulticast [DNS] and [DNS]-[S]ervice [D]iscovery"
category: utilities
year: 2013
rfc: RFC 6762 / RFC 6763
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [dns, dhcp, udp, ip, ipv6, wifi]
related_pioneers: [stuart-cheshire, lennart-poettering]
related_outages: []
related_frontier: []
related_rfcs: [6762, 6763, 6760, 6761, 7558, 8552, 8553, 8765, 8766, 9664, 9665]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Multicast.svg/500px-Multicast.svg.png"
    caption: "The mDNS trick in one diagram. Instead of unicasting a DNS query to a recursive resolver, every host on the link both asks and answers on a single multicast group — 224.0.0.251 for IPv4, FF02::FB for IPv6. One question, every printer hears it. One announcement, every laptop caches it. Apple shipped this as Rendezvous in macOS 10.2 in 2002, renamed it Bonjour in 2005, and the IETF standardised it in February 2013."
    credit: "Image: Wikimedia Commons / GNU Free Documentation License"
visual_cues:
  - "A 12-byte DNS header diagram with the QCLASS and RRCLASS fields blown up — the high bit of QCLASS labelled UNICAST-RESPONSE, the high bit of RRCLASS labelled CACHE-FLUSH, lower 15 bits in both showing IN (1)"
  - "Five-state lifecycle as a circular flow: Probing (3 queries, 250 ms apart) → Announcing (2 responses, 1 s apart, cache-flush bit) → Live → Defending → Goodbye (TTL=0), with timing annotations on every arrow"
  - "Swimlane diagram of an iPhone discovering an AirPlay speaker: PTR query for _airplay._tcp.local, random 20–120 ms wait, PTR response with Living Room._airplay._tcp.local, then SRV+TXT+AAAA queries, then a TCP SYN to port 7000"
  - "Stack diagram of Matter commissioning: BLE GAP advertisement, PASE credential transfer, Wi-Fi join, then mDNS announces _matterc._udp with a discriminator D=, then operational mode flips to _matter._tcp"
  - "Map of an enterprise floor with two SSIDs on different VLANs and an mDNS gateway in the middle, illustrating how Cisco WLC mDNS-sd / Aruba AirGroup whitelist exactly 224.0.0.251 and FF02::FB to bridge link-local across the VLAN boundary"
  - "Timeline ribbon from 2002 Rendezvous on Mac OS X 10.2 → 2005 Bonjour rename → February 2013 RFC 6762 / 6763 → June 2020 RFC 8765 / 8766 → June 2025 RFC 9665 SRP, with the SRP anycast address 2001:1::3/128 highlighted"
---

# mDNS / DNS-SD — Multicast DNS and DNS-Based Service Discovery

## In one breath

mDNS is the DNS you already know, sent to a link-local multicast group on UDP port 5353 instead of unicast to a recursive resolver. Same 12-byte header, same RR types, same wire format — but two repurposed flag bits and a probe / announce / respond / defend / goodbye lifecycle turn it into a self-organising name registry for the local link. DNS-SD layers a naming convention on top — `<Instance>._<service>._<proto>.local` — so every printer, Chromecast, AirPlay speaker, Sonos, and Matter device on your Wi-Fi can find each other with zero configuration. Apple shipped it in 2002 as Rendezvous; the IETF standardised it as RFC 6762 and RFC 6763 in February 2013; today it runs on more than two billion Apple devices, every Matter SKU, and Windows 11 by default.

## The pitch (cold-open)

Right now, in the room you are sitting in, your phone is having a quiet conversation with your AirPods, your Chromecast, your printer, and your thermostat — and none of them know each other's names. The protocol that lets them all find each other is Multicast DNS — DNS, the same protocol that resolves google.com, with one tiny change: the destination address. Instead of being sent to a far-away server, mDNS packets are shouted to a single address, 224.0.0.251, that the router knows never to forward. Everything on your link hears them. Everything on your link can answer. Stuart Cheshire designed it at Apple in the late 1990s to replace AppleTalk's printer-finding magic. Twenty-three years later it is the discovery layer of the smart home — and in June 2025 the IETF finally published RFC 9665, which lets tiny low-power devices register themselves without shouting at all.

## How it actually works

A new printer powers up on the office Wi-Fi. It has a candidate hostname, `office-printer.local`, and a service to announce — IPP printing on port 631. Before it can claim the name it has to ask the link if anyone else owns it.

The printer multicasts a DNS query for `office-printer.local`, type ANY, with the unicast-response bit set. Destination IP 224.0.0.251, destination MAC 01:00:5E:00:00:FB, destination UDP port 5353, source 5353. It carries its tentative records in the Authority section of the message — the trick that lets two printers powering up at the same instant compare records and pick a winner by lexicographic comparison of RDATA. Two hundred and fifty milliseconds later it sends the same probe again. Then a third, 250 ms after that. Seven hundred and fifty milliseconds total of silence and the name is the printer's.

Now it announces. Two unsolicited responses, one second apart, multicast back to 224.0.0.251. Each carries four records: a PTR mapping `_ipp._tcp.local` to `Office Printer._ipp._tcp.local`, an SRV with priority 0, weight 0, port 631, target `office-printer.local`, a TXT with `rp=ipp/print pdl=application/pdf`, and an A record mapping `office-printer.local` to 192.168.1.42. Every record has the cache-flush bit set on its RRCLASS field — the high bit of those sixteen bits — which tells every receiver "discard anything else you had cached for this name and type within one second." The printer is live.

A laptop user opens the print dialog. The OS multicasts a PTR query for `_ipp._tcp.local` with the unicast-response bit set — "what IPP printers exist on this link, and reply to me directly to save bandwidth." The printer waits a random 20 to 120 ms (collision avoidance, RFC 6762 §6) and sends one unicast PTR response back to the laptop's MAC. The laptop follows up with combined SRV, TXT and A queries — usually packed into one DNS message and listing already-known answers in the Answer section, the known-answer suppression trick from RFC 6762 §7. The printer responds with everything the laptop needs to open a TCP connection to port 631. No DHCP-served DNS server was involved at any point; no resolver hierarchy was traversed; nobody was authenticated.

When the printer is unplugged cleanly, it sends one final multicast response with TTL=0 on every record it owns. Receivers immediately flush them. A crash-exit skips the goodbye — the records age out at their normal TTL, 120 seconds for hostnames, 4500 seconds for service records.

A meta-query exists too. Send a PTR query for `_services._dns-sd._udp.local` and every responder lists every service type it advertises. That is how Bonjour Browser and `dns-sd -B` enumerate the entire link.

### Header at a glance

The 12-byte header is identical to RFC 1035 unicast DNS — ID, flags, QDCOUNT, ANCOUNT, NSCOUNT, ARCOUNT — and almost everything in it is conventional. ID is normally zero because there is no transaction to correlate against on a multicast bus. OPCODE is QUERY. QR distinguishes query from response. AA is set on responses because every responder is authoritative for its own records.

The novelty is in the records. Look at the question section: QNAME, then QTYPE, then sixteen bits that the original DNS spec called QCLASS and used for IN. RFC 6762 reinterprets the high bit of those sixteen as the unicast-response bit (QU). One means "please reply unicast." The lower fifteen bits still carry IN (1). So a query with QCLASS 0x8001 on the wire is asking IN, with a request for a unicast reply.

Now look at a response RR: RRNAME, RRTYPE, sixteen bits, then TTL, RDLENGTH, RDATA. The high bit of those sixteen is the cache-flush bit. One means "I am the unique owner of this name and type — discard whatever else you have cached for this combination within one second." Lower fifteen bits, IN. RRCLASS 0x8001 on the wire means an authoritative cache-flush IN record. Conventional TTLs are 120 s for A and AAAA records, 4500 s — seventy-five minutes — for the shared service records (PTR, SRV, TXT) per RFC 6762 §10.

That is the entire technical novelty. Two flag bits and a destination address. Everything else is choreography.

### State machine in three sentences

The host lifecycle has five states: Probing (three multicast queries 250 ms apart for the candidate name, ~750 ms total), Announcing (two multicast responses 1 second apart with the cache-flush bit set), Live (responding to incoming queries with a 20–120 ms random delay), Defending (re-announce once if a conflict appears, rename if the conflict persists for ten seconds), and Goodbye (one multicast response with TTL=0 on graceful shutdown). On simultaneous probes the tiebreak is lexicographic comparison of RDATA — whichever is greater wins, and the loser renames itself "Mac-2", "Mac-3", "Mac-4". This is also why a flapping VM with two interfaces on the same link gets stuck in a rename loop.

### Reliability and security mechanics

There is no reliability machinery. Every packet is best-effort UDP multicast. Three probes 250 ms apart exist precisely to handle bursty packet loss on busy Wi-Fi; two announces 1 s apart exist for the same reason. Cache coherency is enforced by two mechanisms: the cache-flush bit on owned records (drop other entries for this name+type within one second of the announcement) and goodbye packets with TTL=0 (immediate invalidation). Convergence after any link change is on the order of a second.

There is, classically, no security. Anyone on the same Wi-Fi can claim any name, answer any query, or spoof a printer. RFC 9665's authors are blunt about this in the new SRP draft — mDNS "allows arbitrary hosts on a single IP link to advertise services [RFC6763], relying on whatever service is advertised to provide authentication as a part of its protocol rather than in the service advertisement... we have not established trust." The threat model is "physical access to the link equals authorisation." Two evolving mitigations exist: SRP (RFC 9665) uses SIG(0) public-key signatures on DNS UPDATE messages with First-Come-First-Served naming, so once a name is claimed only the original key can update it; and IETF dnssd WG drafts on randomised hostnames and mDNS-over-DTLS are progressing slowly.

## Where it shows up in production

Apple's mDNSResponder is the reference implementation, written in C, Apache 2.0-licensed at `opensource.apple.com/source/mDNSResponder`. It is built into every macOS, iOS, iPadOS, tvOS, watchOS and visionOS device shipped since Mac OS X 10.2 Jaguar in 2002. Apple disclosed an active installed base of more than two billion devices on its January 2024 Q1 earnings call. Every one of them runs mDNSResponder by default.

Avahi is the dominant Linux and BSD implementation, LGPL, started in 2004 by Lennart Poettering and Trent Lloyd before Poettering moved on to PulseAudio and systemd. It is bundled by Debian, Ubuntu, Fedora, RHEL and openSUSE. The project's CVE history is active — CVE-2023-1981, the CVE-2023-38469 through 38473 cluster, CVE-2024-52616, and a 2025 unbounded-clients DoS in 0.9-rc2 — which is what you would expect from a daemon enabled by default on the entire Linux fleet. systemd-resolved provides native mDNS resolution on most modern distros and often coexists with Avahi.

Microsoft's DNS Client gained native mDNS resolution in Windows 10 1703 in March 2017 (initially printers and casts only) and extended it to general hostname lookup in Windows 10 1903 in May 2019. The Windows 11 24H2 security baseline released in October 2024 ships with mDNS enabled and LLMNR disabled. Microsoft's official rationale was, in their own words, that "having [LLMNR/NetBIOS] enabled needlessly expands the attack surface." The decade-long "why can't my Windows PC see my AirPrint printer" support era is over.

Google Cast — Chromecast, Cast-enabled TVs and speakers — announces `_googlecast._tcp.local` via mDNS. The last public installed-base figure was "100 million" Cast devices at Google I/O 2018; the actual number today is presumably much higher.

The Connectivity Standards Alliance bet Matter on mDNS+DNS-SD. Matter 1.0 shipped in October 2022 with two mandatory service types: `_matterc._udp.local` for commissionable (unpaired) devices, advertised for about fifteen minutes after factory reset, and `_matter._tcp.local` for operational devices, with one PTR per fabric the device has joined. TXT records carry the discriminator, vendor ID, product ID and pairing hints. CSA had certified more than two thousand Matter device SKUs by end of 2024 across Matter 1.0–1.3 — Apple, Google, Amazon, Samsung, Aqara, Eve, Philips Hue, IKEA, Schlage, Yale and dozens more. Every one of them runs an mDNS responder.

The AirPlay-2 ecosystem advertises `_airplay._tcp` and `_raop._tcp` — Sonos, Bose, Bang & Olufsen, Yamaha, Marantz, Denon, LG and Samsung TVs, plus Apple's own HomePod and Apple TV. CUPS and IPP Everywhere — `_ipp._tcp` and `_ipps._tcp` — is the discovery layer for AirPrint, which means effectively every networked printer shipped this decade. Spotify Connect uses `_spotify-connect._tcp`. Plex Media Server uses `_plexmediasvr._tcp`. Apple Continuity — AirDrop, Handoff, Universal Clipboard, Wi-Fi Password Sharing — uses a combination of BLE advertisements and mDNS announcements over Apple Wireless Direct Link on the virtual `awdl0` interface.

Espressif's ESP-IDF mDNS component is the basis of much of the consumer-IoT responder fleet running on ESP32 chips. Android has had `android.net.nsd` Network Service Discovery since API level 16, Android 4.1 Jelly Bean in 2012. Apple still ships Bonjour for Windows as a free download — and you can find a copy embedded in the Blizzard launcher at `C:\Program Files\Blizzard\Bonjour Service\mDNSResponder.exe`, the subject of a 2024 Exploit-DB unquoted-service-path advisory.

## Things that go wrong

The mDNS reflection DDoS era ran from 2014 to 2016. Many home routers and embedded devices shipped with mDNS responders that answered queries on their WAN interface — a misconfiguration that violates RFC 6762's link-local-only intent. A small query produces a response with PTR plus SRV plus TXT plus A and AAAA; the bandwidth amplification factor measured by Christian Rossow in his "Amplification Hell" paper at NDSS 2014 was up to roughly ten times in the worst case across his sample. CERT/CC published VU#550620 in March 2015. Akamai's threat advisory in December 2016 confirmed in-the-wild use against customers. The mitigations were straightforward — patch responders to refuse non-link-local unicast queries, deploy BCP 38 ingress filtering at the WAN edge, firewall UDP/5353 — but the lesson was that mDNS, like every UDP service-discovery protocol of its generation, was a reflector waiting to be discovered.

Cisco's mDNS Gateway feature has shipped at least four distinct DoS CVEs over a decade. CVE-2014-3358 was a memory leak. CVE-2015-0650, advisory `cisco-sa-20150325-mdns`, bug CSCup70579: a single malformed UDP/5353 packet, IPv4 or IPv6, reloads the device. There was a 2019 Aironet FlexConnect mDNS DoS, advisory `cisco-sa-aironet-mdns-dos-E6KwYuMx`. And in March 2024, advisory `cisco-sa-wlc-mdns-dos-4hv6pBGf`: a continuous stream of mDNS packets pegs WLC CPU at 100% and access points lose their CAPWAP tunnel. The pattern is the cost of being the LAN protocol that every vendor implements differently.

Apple's Continuity stack — Handoff, Universal Clipboard, AirDrop, Wi-Fi Password Sharing — was the subject of a five-year run of academic privacy work. Martin et al., "Handoff All Your Privacy" (PoPETs 2019, arXiv:1904.10600), documented long-term device fingerprinting, OS-version inference and behavioural profiling from BLE Continuity advertisements. Celosia and Cunche's "Discontinued Privacy" (PoPETs 2020) showed that the AirPrint TLV embeds the printer's IP and port in the clear. Stute et al., "Disrupting Continuity of Apple's Wireless Ecosystem Security" (USENIX Security 2021), demonstrated cross-MAC-randomisation tracking via Handoff's mDNS responses, denial-of-service attacks against Handoff, Universal Clipboard and Wi-Fi Password Sharing, and a man-in-the-middle on Wi-Fi Password Sharing. Apple progressively shortened the device-name advertisement, randomised AWDL MACs, and tightened TLV content over iOS 13, 14 and 15. The underlying lesson, the one to keep in mind, is that "frictionless" and "private" are in genuine tension — same protocol that hands off your phone call to your laptop is broadcasting your behaviour to anyone listening in a coffee shop.

Apple's mDNSResponder itself has had memory-corruption vulnerabilities. The 2007 Apple Security Advisory 2007-005 covered a UPnP-style Location: header overflow that became a Metasploit module — `exploit/osx/mdns/upnp_location` — for remote code execution as root. In October 2015, CERT VU#143335 covered CVE-2015-7987, 7988 and 7989, multiple memory-based vulnerabilities in mDNSResponder versions 379.27 through 625.41.1, fixed by Apple security updates and merged into Android N.

The Avahi DoS train of 2023–2024 was discovered by Evgeny Vereshchagin: CVE-2023-1981 (CVSS 5.5, local DoS via reachable assertion), the cluster CVE-2023-38469 through 38473 (Ubuntu USN-6487-1, November 2023), and CVE-2024-52616 (predictable DNS transaction IDs). Patched in Debian DLA-3990 in December 2024 and Red Hat RHSA-2023:7190.

A subtle one — around 2020, Cisco IOS service-routing for mDNS-SD on Catalyst switches cached records correctly but only matched on incoming packets where `answers=0`. Apple's mDNS implementation occasionally embeds a question and an answer in the same packet — that is the known-answer suppression pattern from RFC 6762 §7. So Apple devices would fail to resolve Chromecasts across VLANs while Android worked fine. Reported via Cisco Community; the broader response was the move toward dedicated mDNS-gateway products that understand the full message set.

And then the unwritten incidents: the stadium and large-venue mDNS storms. Tens of thousands of phones in one VLAN, each chattering Bonjour. APs without IGMP snooping, or with snooping miscalibrated, rebroadcast every mDNS packet at the basic rate of 6 Mbps — the air-time floor for 802.11a/g multicast. Result: air-time exhaustion, failed authentications, user complaints. The lesson is in Cisco, Aruba and Meraki blog posts rather than CVE records — operators treat these incidents as embarrassments and seldom name the venue.

## Common pitfalls (for the practitioner)

IGMP and MLD snooping is mDNS's number-one enemy on enterprise Wi-Fi. APs forward multicast at the lowest basic rate. Managed switches with snooping enabled drop frames whose listeners have not joined the group. Per-SSID and per-VLAN isolation breaks the link-local scope assumption that mDNS depends on. The cure is to deploy an mDNS gateway — Cisco WLC's `mdns-sd` profile, Aruba AirGroup, Aerohive Bonjour Gateway. Whitelist exactly 224.0.0.251 and FF02::FB. Rate-limit UDP/5353 to roughly 50 packets per second per client. Never enable multicast-to-unicast conversion blindly; it interacts badly with link-local multicast.

The `.local` resolver search-path trap catches Active Directory shops. If `/etc/resolv.conf` lists `search corp.local` and the AD domain is also called `corp.local`, every short hostname lookup goes through mDNS first and fails because `nss_dns` short-circuits on `.local`. The fix is to rename the AD domain to `corp.example.com` or remove `.local` from the search path. On macOS the equivalent is the Search Domains pane in Network preferences; on Windows, the DNS Suffix list.

Conflict-resolution name inflation — that "MacBook-2", "MacBook-3", "MacBook-4" hostname series you see at conferences — is almost always two interfaces on the same host (Ethernet plus Wi-Fi) each claiming the same name on the same link. RFC 6762 §11 specifies interface coalescence; enable it in your responder, or just disable one interface.

TTL choices come from RFC 6762 §10: 120 seconds for A and AAAA records, 4500 seconds for shared service records (PTR, SRV, TXT). Shorter TTLs mean more multicast chatter and faster battery drain on sleeping clients. Longer TTLs mean stale entries linger after lost goodbye packets.

Use the QU bit on cold-cache queries. When your client starts up with no cache, set the unicast-response bit on its first multicast query. Responders reply unicast. The link is spared a multicast storm. After the first response is cached, switch to standard multicast for refreshes.

For Matter, open up IPv6 multicast FF02::FB on UDP/5353 and the Matter operational ports 5540 and 5541. A Matter device that *should* be discoverable but is not is almost always being blocked by router-level multicast filtering. On Ubiquiti UniFi turn on Multicast Enhancement; on OpenWrt enable mDNS; on pfSense enable Avahi; on consumer routers look for "IGMP Proxy" or "mDNS Reflector."

And disable mDNS on cellular interfaces. Microsoft already does this for NetBIOS. The protocol has no semantic meaning across a NAT and only leaks identifiers.

## Debugging it

On macOS and iOS, `dns-sd` ships built-in. `dns-sd -B _services._dns-sd._udp local.` lists every service type on the link. `dns-sd -B _airplay._tcp local.` browses AirPlay receivers. `dns-sd -L "Living Room" _airplay._tcp local.` resolves SRV and TXT for one instance. `dns-sd -R "Test Speaker" _airplay._tcp local. 7000 model=Test` registers a service. `dns-sd -G v6 mymac.local` resolves AAAA. `dns-sd -Z _ipp._tcp local.` produces a zone-file dump.

On Linux, the Avahi suite. `avahi-browse -a` browses every service type continuously. `avahi-browse -r _http._tcp` browses one type and resolves each instance. `avahi-publish-service "Test Web" _http._tcp 80 path=/index.html` registers. `avahi-resolve -n mymac.local` resolves a name.

On Windows 10 1903 and later, `Resolve-DnsName mymac.local` does a native mDNS lookup.

Wireshark dissector has been built-in since version 0.10. The display filter `mdns` is the entry point. Combine it with `dns.flags.response == 1 and dns.resp.cache_flush == 1` to find authoritative announcements. `dns.qry.name == "_airplay._tcp.local"` filters DNS-SD PTR queries for AirPlay. For tcpdump on Linux:

```bash
# All mDNS traffic, IPv4 and IPv6
sudo tcpdump -i any -n -s 0 -w mdns.pcap \
  '(udp port 5353) and (host 224.0.0.251 or host ff02::fb)'

# Outbound probes from one host
sudo tcpdump -i en0 -n 'udp port 5353 and src host 192.0.2.42'

# Matter commissioning plus operational
sudo tcpdump -i any 'udp port 5353 or udp port 5540 or udp port 5541'
```

For Matter onboarding specifically: confirm the phone, hub and commissionable device are on the same broadcast domain. Allow IPv6 multicast FF02::FB on UDP/5353. Allow UDP 5540–5541 for operational. If commissioning fails, run `dns-sd -B _matterc._udp` on a laptop on the same link and confirm the device's advertisement is reaching you. Once paired, the device flips its advertisement to `_matter._tcp`.

## What's changing in 2026

In June 2025 the IETF published RFC 9665 — Service Registration Protocol — by Ted Lemon (Apple, then Fastly, now back at Apple) and Stuart Cheshire. This is the headline change of the past twelve months. Before SRP, a constrained IoT device that wanted to publish a service had to multicast — catastrophic on a battery-powered Thread mesh and expensive on Wi-Fi. SRP lets a device send a SIG(0)-signed DNS UPDATE message to a registrar, typically a Thread Border Router or home gateway. Names are claimed first-come-first-served and protected by the requester's key for a KEY-LEASE typically set to fourteen days; the service registration itself uses a shorter Lease, typically two hours, via the companion RFC 9664 EDNS(0) Update Lease option also published in June 2025. The constrained-host variant uses the new special-use domain `default.service.arpa.` (registered by RFC 9665 §10.1). And SRP allocated `2001:1::3/128` as the DNS-SD Service Registration Protocol Anycast Address (RFC 9665 §10.5, allocation date April 2024) — analogous to PCP's `2001:1::1` — so a device with no prior configuration can find a registrar at a fixed IPv6 address.

Matter 1.4 shipped in November 2024 with the new HRAP (Home Router and Access Point) device type — a single device class for combined Wi-Fi AP plus Thread Border Router. The Thread Border Router *must* run an SRP registrar and an Advertising Proxy. Matter 1.4 also added enhanced multi-admin (single-user consent for multi-ecosystem pairing) and energy-management device types for solar, batteries and heat pumps. Matter 1.4.2, current as of January 2026, requires Thread border routers to support at least 150 devices and Wi-Fi APs to handle 100 simultaneous Matter connections. Thread 1.4 (September 2024) standardised Border Router credential sharing across vendors so that one mesh now spans Apple, Google, Amazon and Samsung hubs; as of 1 January 2026 Thread 1.3 certifications are no longer accepted for new hardware.

Windows 11 24H2 shipped in October 2024 with mDNS enabled and LLMNR disabled in the security baseline — the GPO is "Computer Configuration → Administrative Templates → Network → DNS Client → Turn off multicast name resolution." Microsoft's stated direction is "mDNS is the only multicast name resolution protocol on by default." NetBIOS-NS is in fallback-only "learning mode" on cellular interfaces and recent insider builds since 2022. The default-off-for-all-users step for LLMNR has not yet been taken in shipping channels as of May 2026.

In November 2024 Evgeny Vereshchagin's CVE-2024-52616 — predictable DNS transaction IDs in Avahi — was patched in Debian DLA-3990 (December 2024). The 2025 unbounded-clients DoS in Avahi 0.9-rc2 was fixed in PR #808.

DNS Push Notifications (RFC 8765, June 2020) replaces poll-based DNS-SD updates over unicast with a long-lived TCP/TLS DSO subscription — the natural client-side complement to SRP for clients that want fresh data. Adoption outside Apple's own infrastructure has been slow.

The Discovery Proxy (RFC 8766, June 2020) exposes each subnet's mDNS namespace as a unicast DNS subdomain, queryable from anywhere in the enterprise. As of 2025 multiple Thread Border Router implementations bundle one.

Privacy-preserving service discovery is moving on three tracks in parallel: randomised hostnames per network (already shipping in iOS and macOS since iOS 14), IETF dnssd WG drafts that hash service-instance names, and early-stage proposals for mDNS over DTLS or TLS. The empirical pressure is the Continuity research above.

Speculative items, clearly flagged: Espressif developer blogs and Connectivity Standards Alliance presentations speculate that Matter 1.5 or 1.6 will expand the use of SRP and may merge discovery with DNS Push for "live" inventory. As of May 2026 these are vendor projections, not standards.

## Fun facts (host material)

The Rendezvous-to-Bonjour rename narrowly avoided "OpenTalk." On 18 February 2005 AppleInsider broke the news that Apple had filed for the OpenTalk trademark before settling on Bonjour. Insiders called OpenTalk "too techie." Apple's own internal logic was that "naturally, when Rendezvous-enabled computers and devices come within range of each other, they say 'hello' — hence the name 'Bonjour.'" The rebrand was forced by a Tibco Software trademark suit filed on 27 August 2003; Tibco had owned the "TIBCO Rendezvous" mark for its enterprise messaging product since 1994. The settlement was in July 2004. Apple announced Bonjour on 12 April 2005.

`.local` is one of the cleanest examples of the IETF asserting authority over names that ICANN normally controls. RFC 6761, published the same month as the mDNS standards in February 2013, uses IANA's Special-Use Domain Names registry to take a TLD off the table permanently. There is no legal way for ICANN to delegate `.local` to a registry. Eleven years of Mac OS X had been running on a TLD that did not, technically, exist. The RFC legitimised what was already running on millions of machines.

The Avahi name is a Madagascar woolly lemur. Trent Lloyd suggested *Avahi* — genus *Avahi*, species *Avahi laniger*, endemic to Madagascar — when he and Lennart Poettering started the project in 2004, in keeping with freedesktop.org's pattern of whimsical animal codenames. The project logo is a stylised lemur. Some sources mistakenly translate the name from Latin; *avahi* is the Malagasy root.

Stuart Cheshire is also famous for writing *Bolo*. Before zero-configuration networking, he wrote a sixteen-player networked tank game on the BBC Micro in 1987 and ported it to the Macintosh in the early 1990s. Within Apple, *Bolo* is still a thing some old-timers will name-drop. His PhD dissertation at Stanford in 1998 invented Consistent Overhead Byte Stuffing (COBS) — the framing algorithm now widely used in embedded protocols. His IETF presentations are famous for animated polemics, most memorably his recurring "why mDNS instead of LLMNR" critique of Microsoft's alternative.

Wide-Area Bonjour is the abandoned cousin. Apple shipped a "Wide-Area Bonjour" feature in macOS — an attempt to do DNS-SD over unicast DNS with DNS UPDATE — and you can still see vestiges in `dns-sd -B`. It never gained adoption because it required co-operative DNS server admins. RFC 9665 retroactively makes that attempt official with proper FCFS naming and SIG(0) signing. The 2025 anycast address `2001:1::3/128` is the missing piece — a fixed registrar address so devices need no prior configuration at all.

The 2014 AirPlay device-name leak: iOS in 2013–2014 set a device's mDNS hostname to "John Smith's iPhone" by default. Visiting a public Wi-Fi network meant broadcasting your name. Apple later allowed the hostname to be randomised per-network as part of iOS's MAC randomisation features.

## Where this connects in the book

No book chapters in the encyclopedia currently reference mDNS or DNS-SD directly. The two adjacent stories the chapter authors are likely to write next are Apple's late-1990s scramble to replace AppleTalk's Name Binding Protocol with something IP-native (the origin story for Cheshire's work), and the rise of Matter as the discovery layer of the smart home from October 2022 onward.

If you want the human pioneers, the encyclopedia has separate episodes on Stuart Cheshire and on Lennart Poettering — Cheshire for the design of mDNS, DNS-SD, IPv4LL, NAT-PMP, PCP, DNS Push, the Discovery Proxy and SRP, plus the *Bolo* tank game and the COBS framing algorithm; Poettering for Avahi, PulseAudio and systemd, and the experience of working in open source under sustained personal attack.

## See also (other protocol episodes)

If you have heard the DNS episode, mDNS is the same wire format with the destination changed and two flag bits redefined. DNS uses unicast UDP/53 (or TCP/53, DoT, DoH) and a hierarchical, delegated authority model. mDNS uses multicast UDP/5353 to 224.0.0.251 or FF02::FB and has no central authority — names are claimed first-come-first-served and the cache-flush bit declares ownership. Same 12-byte header. Different jurisdiction.

The DHCP episode is the orthogonal half of the Zeroconf story. DHCP gives you an IP. mDNS gives you a name and a service. They cooperate (DHCP option 15 lists unicast DNS-SD browsing domains) but they are independent. A network with no DHCP server still works for mDNS thanks to IPv4 link-local (RFC 3927, also Cheshire) and IPv6 SLAAC.

The IPv6 episode matters because mDNS uses dual multicast addresses and dual MAC mappings — 224.0.0.251 / 01:00:5E:00:00:FB on IPv4, FF02::FB / 33:33:00:00:00:FB on IPv6. Matter is IPv6-only on the operational side, which is why "open up FF02::FB on UDP/5353" is the first thing on every Matter onboarding checklist.

The Wi-Fi episode is where mDNS lives and dies. Multicast on 802.11 is transmitted at the lowest basic rate (often 6 Mbps for 11a/g, sometimes lower for legacy). Every associated station must wake up to receive multicast frames after a DTIM beacon. Enterprise APs therefore enable IGMP and MLD snooping and multicast-to-unicast conversion — and routinely strip the very 224.0.0.251 / FF02::FB packets mDNS depends on. Cisco WLC mDNS Gateway, Aruba AirGroup and Aerohive Bonjour Gateway exist because the underlying link-local design does not survive the modern enterprise.

The UDP episode is the carrier. mDNS is "DNS shouted on UDP/5353." That is the entire story.

## Visual cues for image generation

- A 12-byte DNS header diagram with the QCLASS and RRCLASS fields blown up — the high bit of QCLASS labelled UNICAST-RESPONSE, the high bit of RRCLASS labelled CACHE-FLUSH, lower 15 bits in both showing IN (1)
- Five-state lifecycle as a circular flow: Probing (3 queries, 250 ms apart) → Announcing (2 responses, 1 s apart, cache-flush bit) → Live → Defending → Goodbye (TTL=0), with timing annotations on every arrow
- Swimlane diagram of an iPhone discovering an AirPlay speaker: PTR query for `_airplay._tcp.local`, random 20–120 ms wait, PTR response with `Living Room._airplay._tcp.local`, then SRV+TXT+AAAA queries, then a TCP SYN to port 7000
- Stack diagram of Matter commissioning: BLE GAP advertisement, PASE credential transfer, Wi-Fi join, then mDNS announces `_matterc._udp` with a discriminator `D=`, then operational mode flips to `_matter._tcp`
- Map of an enterprise floor with two SSIDs on different VLANs and an mDNS gateway in the middle, illustrating how Cisco WLC `mdns-sd` / Aruba AirGroup whitelist exactly 224.0.0.251 and FF02::FB to bridge link-local across the VLAN boundary
- Timeline ribbon from 2002 Rendezvous on Mac OS X 10.2 → 2005 Bonjour rename → February 2013 RFC 6762 / 6763 → June 2020 RFC 8765 / 8766 → June 2025 RFC 9665 SRP, with the SRP anycast address `2001:1::3/128` highlighted

## Sources

**RFCs**

- [RFC 6762 — Multicast DNS](https://www.rfc-editor.org/rfc/rfc6762)
- [RFC 6763 — DNS-Based Service Discovery](https://www.rfc-editor.org/rfc/rfc6763)
- [RFC 9665 — Service Registration Protocol for DNS-Based Service Discovery](https://datatracker.ietf.org/doc/rfc9665/)

**Papers**

- [Christian Rossow, "Amplification Hell: Revisiting Network Protocols for DDoS Abuse," NDSS 2014](https://www.ndss-symposium.org/ndss2014/ndss-2014-programme/amplification-hell-revisiting-network-protocols-ddos-abuse/)
- [Stute et al., "Disrupting Continuity of Apple's Wireless Ecosystem Security," USENIX Security 2021](https://www.usenix.org/conference/usenixsecurity21/presentation/stute)

**Vendor and engineering**

- [Apple Developer — Bonjour](https://developer.apple.com/bonjour/)
- [Microsoft Windows Firewall best-practices configuration (Windows 11 24H2 baseline)](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/best-practices-configuring)
- [Connectivity Standards Alliance — Matter](https://csa-iot.org/all-solutions/matter/)
- [Cisco PSIRT — WLC mDNS DoS advisory cisco-sa-wlc-mdns-dos-4hv6pBGf](https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-wlc-mdns-dos-4hv6pBGf)
- [PyPI — zeroconf (canonical Python implementation)](https://pypi.org/project/zeroconf/)

**News and tracking**

- [NVD — CVE-2024-52616 (Avahi predictable DNS transaction IDs)](https://nvd.nist.gov/vuln/detail/CVE-2024-52616)

**Wikipedia**

- [Multicast DNS — Wikipedia](https://en.wikipedia.org/wiki/Multicast_DNS)
