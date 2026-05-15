---
id: utilities-security/dns
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: DNS
synopsis: The internet's distributed phone book — designed by Paul Mockapetris in 1983.
podcast_target_minutes: 15
position_in_book: chapter 55 of 75
listening_order:
  prev: realtime-av/moq-transport
  next: utilities-security/tls
related_protocols: [dns, udp, tcp, ftp, http3, bgp]
related_pioneers: [paul-mockapetris, jon-postel]
related_outages: [facebook-2021]
related_frontier: []
related_rfcs: [9499, 882, 1034, 7686, 1035, 9460]
images: []
visual_cues:
  - "Hierarchical tree with the 13 root server clusters at top, TLD nodes (.com, .org, .net, .edu, .gov, .mil, .int) below, and authoritative servers branching to leaf domains."
  - "1983 SRI-NIC HOSTS.TXT file being downloaded by FTP to hundreds of hosts, each labelled with a sync arrow — the unscalable picture DNS replaced."
  - "Timeline of 4 October 2021: 15:39 backbone collapse, 15:40 BGP withdrawals, 15:42 DNS SERVFAIL, 15:50 apps dark, 16:00 badge readers fail, 21:00 backbone restored."
  - "Resolver tree showing a stub resolver at a laptop talking to an ISP recursive resolver, which walks root, .com TLD, then example.com authoritative — with a 30x query surge bar overlaid for the Facebook outage."
  - "Side-by-side: classic DNS over UDP/53 in cleartext vs. DoT on 853 vs. DoH on 443, with a small inset showing the centralisation tradeoff to Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9, NextDNS."
---

# Part IX, Chapter — DNS

## The hook
DNS has no checksum at the application layer. It relies entirely on the UDP or TCP checksum underneath it. A single bit-flip can sneak through if the UDP checksum somehow validates. Forty years of internet, a billion hostnames, and the canonical glossary for all of it is RFC 9499, published in March 2024.

## The story

### A Hierarchy You Cannot See
When you type `example.com` into a browser, the operating system needs an IP address. Before 1983, every host on ARPANET kept a flat file called HOSTS.TXT with all the mappings, distributed by FTP from the SRI-NIC. As the network grew past a few hundred hosts, that became absurd. Every change required every host to download the whole file.

Paul Mockapetris at USC ISI was asked by Jon Postel to design something better. He published RFC 882 and 883 in November 1983. The first server was called Jeeves and ran on TOPS-20. Then RFC 1034 and 1035 in 1987 finalised the architecture we still use. Both Mockapetris and Postel each have their own episode in the pioneers section.

The first six top-level domains were `.edu`, `.gov`, `.com`, `.mil`, `.org`, and `.net`, with `.int` added shortly after. The design has held for forty years across a billion hostnames. The key insight is that caching does almost all the work. Most lookups are answered by your ISP's resolver from cache. Only fresh queries walk the tree.

There is a rare carve-out worth knowing. IANA reserved `.onion` as a Special-Use Domain Name in RFC 7686 in 2015. It must not be looked up in public DNS. That is unusual because it sits outside ICANN's namespace. It was granted because the Tor protocol uses .onion as an internal addressing scheme rather than a public naming hierarchy, and the reservation prevents accidental DNS leakage of Tor traffic.

### The Kaminsky Moment, And Modern DNSSEC
In July 2008, Dan Kaminsky disclosed CVE-2008-1447. He turned every recursive resolver in the world into a cache-poisoning target by abusing in-bailiwick referrals plus the small 16-bit DNS transaction ID. The disclosure was coordinated across all major DNS vendors. The patch added source-port randomisation as the immediate mitigation. The deeper fix is DNSSEC, which adds cryptographic signatures to DNS responses. DNSSEC has been deploying glacially ever since.

Then in February 2024 came KeyTrap, CVE-2023-50387, CVSS 7.5. ATHENE researchers Heftrig, Schulmann, Vogel, and Waidner disclosed inherent DNSSEC validation complexity attacks. BIND, Unbound, PowerDNS, and Knot all patched. The trouble is that the underlying DNSSEC RFCs themselves are the issue. DNSSEC is conceptually right and operationally fragile.

The 2023 to 2024 milestones are worth listing. `.com`, `.net`, and `.edu` all rolled DNSSEC algorithm 8 to 13, ECDSA P-256, in Q3 and Q4 of 2023. ZONEMD from RFC 8976 was added to the root zone in September 2023 with SHA-384 from 6 December 2023. RFC 9619, published in 2024 under the title "QDCOUNT Is (Usually) One," formally constrained a 38-year ambiguity in RFC 1035.

And then there is RFC 9460, from November 2023, which introduced SVCB and HTTPS resource records. These enable apex aliasing, HTTP/3 advertisement, and critically, the publication of Encrypted Client Hello keys. Cloudflare turned ECH on by default in 2023. Firefox 119 enabled ECH by default. The HTTPS resource record is what tells the browser "this site speaks h3" before the first connection. The mechanics of HTTP/3 itself belong in the HTTP/3 episode.

### The Facebook 2021 Cascade and the DoH Centralisation Debate
On 4 October 2021, Meta's edge DNS servers were configured to withdraw their BGP advertisements when they could not reach the data centres. A backbone change took down DNS. `facebook.com` returned SERVFAIL globally. Employees could not even badge into offices because the access systems also depended on internal Facebook DNS. The outage ran roughly seven hours. Cloudflare's 1.1.1.1 saw thirty times normal query load as resolvers retried. This is the canonical case study of DNS as a single point of failure, and we devote a full chapter to it in the Famous Outages part of the book.

The DNS-over-HTTPS centralisation debate is the other contemporary fight. In 2018 the UK's ISPA briefly nominated Mozilla as "Internet Villain" over DoH, because application-controlled DoH shifts DNS visibility away from local ISPs and toward a small number of large public resolvers — Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9, and NextDNS. The privacy benefit is real. The centralisation tradeoff is also real. Most browsers now ship DoH on by default with user opt-out.

Two more incidents to remember from 2025. AWS Route 53 and DynamoDB hit a DNS race on 19 and 20 October 2025. Microsoft Azure Front Door had a DNS outage on 29 October 2025.

The frontier sits in two places. The DELEG working group's `draft-ietf-deleg-08` from March 2026 introduces new DELEG and DELEGPARAM resource record types meant to make delegations extensible — specifically to let parents express that a child speaks DoT or DoQ on a non-default port. Post-quantum DNSSEC prototypes in BIND, Unbound, NSD, and CoreDNS were measured at the IETF 123 hackathon in July 2025. NIST finalised ML-DSA, ML-KEM, and SLH-DSA on 13 August 2024, and FN-DSA — Falcon — was submitted as draft FIPS 206 on 28 August 2025.

## The figures

### Paul Mockapetris
Mockapetris designed DNS in 1983 at USC's Information Sciences Institute. He wrote RFC 882 and 883, then RFC 1034 and 1035 in 1987. The hierarchical, distributed, cacheable architecture he chose scaled the internet from a few hundred hosts to billions. Without DNS, every device would still be looking up addresses in a single text file someone updated by hand. He continues to advise on naming, anti-abuse, and DNS security through ThreatSTOP and the IETF. Internet Hall of Fame in 2012, IEEE Internet Award in 2003, ACM SIGCOMM Award in 2005. There is a full Mockapetris pioneer episode.

### Jon Postel
Postel edited the foundational TCP/IP RFCs — RFC 791 for IPv4 in September 1981, RFC 792 for ICMP, RFC 793 for TCP, and RFC 768 for UDP in August 1980, three pages, the most spartan and durable spec in networking. He served as RFC Editor for nearly three decades. With David Reed in 1978 he argued for splitting the original monolithic TCP into IP plus a separate transport layer, the architectural decision that made UDP and decades later QUIC possible. He was IANA's first steward, running it single-handedly from his ISI office. The Robustness Principle — be conservative in what you send, be liberal in what you accept — appeared in his RFC 760 introduction. Internet Hall of Fame in 2012, IEEE Internet Award in 1999. The Postel pioneer episode covers the rest.

### The Facebook Disappearance
On 4 October 2021, a routine maintenance command on Meta's global backbone took down its DNS, then its websites, then its employees' badge readers, all because the safety mechanism worked exactly as designed. Around six hours dark; three billion users affected; Facebook, Instagram, WhatsApp, and Oculus all gone. The full account is its own chapter in the Famous Outages part of the book.

### RFC 1035 — Domain Names — Implementation and Specification
Published by Mockapetris in 1987. It is the implementation companion to RFC 1034 and specifies the wire format, resource record types, and message encoding that every DNS implementation has followed for thirty-eight years. Internet Standard.

## What you'd see in the simulator
The simulator traces how a domain name like `example.com` gets resolved through the hierarchical DNS system. Press play and your laptop's stub resolver hands the query to your ISP's recursive resolver. The recursive resolver checks its cache first; on a miss, it walks the tree. It asks a root server which TLD server handles `.com`. It asks the `.com` TLD server which authoritative server handles `example.com`. It asks that authoritative server for the A record. The IP comes back, the recursive resolver caches the answer for the TTL, and your laptop gets its address. In real life the whole walk usually takes ten to fifty milliseconds, and a cache hit takes under one.

## What it taught the industry
Three lessons stuck. First, caching is the architecture. The tree only works because almost nobody walks it. Second, DNS is the load-bearing wall of every other protocol on top, which is why a 2021 BGP mistake at Meta cascaded into badge readers. Build DNS on a separate failure domain from the products that depend on it. Third, the tradeoff between privacy and centralisation is permanent. DoH protects the query from your ISP, but it concentrates visibility into a handful of public resolvers. There is no clean answer; there is only a choice.

## Listening order
- **Before this chapter:** *MoQ Transport — the realtime-AV section closes with media-over-QUIC, then we pivot from moving bytes to naming the destinations.*
- **After this chapter:** *TLS — once you can find a host by name, the next question is whether the channel to it is private and authentic.*

## Where to go deeper
- The UDP episode covers why DNS lookups ride port 53 with an 8-byte header and no retransmission — speed beats reliability when the payload fits in one packet.
- The TCP episode is where DNS falls back when responses outgrow the UDP path, and where reliable delivery for zone transfers lives.
- The FTP episode explains the protocol that distributed HOSTS.TXT from SRI-NIC before DNS replaced the whole arrangement.
- The HTTP/3 episode picks up the SVCB and HTTPS resource record story — how DNS now advertises h3 and ECH keys before the first connection.
- The BGP episode covers the routing layer that withdrew Meta's prefixes in 2021 and made `facebook.com` return SERVFAIL worldwide.

## Visual cues for image generation
- A hierarchical tree diagram: 13 root server clusters at the top, TLD nodes for `.com`, `.org`, `.net`, `.edu`, `.gov`, `.mil`, `.int` below, then authoritative servers, then individual hostnames as leaves.
- A 1983 contrast image: the SRI-NIC HOSTS.TXT file being FTP'd out to hundreds of hosts, with sync arrows everywhere, captioned "what DNS replaced."
- A timeline of 4 October 2021 in UTC: 15:39 backbone collapse, 15:40 BGP withdrawals, 15:42 SERVFAIL, 15:50 apps dark, 16:00 badge readers fail, 21:00 backbone restored, 21:05 DNS prefixes return.
- A resolver path diagram showing stub resolver, recursive resolver, root, TLD, and authoritative servers, with a 30× query-surge bar overlaid to mark the Facebook outage spike on 1.1.1.1.
- A side-by-side of cleartext DNS on UDP 53, DoT on 853, and DoH on 443, with a small inset diagram of the centralisation toward Cloudflare, Google, Quad9, and NextDNS.

## Sources
- [Cloudflare — Understanding how Facebook disappeared from the Internet](https://blog.cloudflare.com/october-2021-facebook-outage/)
- [Meta Engineering — More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/)
- [Wikipedia — 2021 Facebook outage](https://en.wikipedia.org/wiki/2021_Facebook_outage)
- [Wikipedia — Paul Mockapetris](https://en.wikipedia.org/wiki/Paul_Mockapetris)
- [Wikipedia — Jon Postel](https://en.wikipedia.org/wiki/Jon_Postel)
- [Wikipedia — Robustness principle](https://en.wikipedia.org/wiki/Robustness_principle)
- [RFC 9499 — DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499)
- [RFC 882 — Domain Names — Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc882)
- [RFC 1034 — Domain Names — Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034)
- [RFC 1035 — Domain Names — Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 7686 — The ".onion" Special-Use Domain Name](https://www.rfc-editor.org/rfc/rfc7686)
- [RFC 9460 — Service Binding and Parameter Specification via the DNS](https://www.rfc-editor.org/rfc/rfc9460)
