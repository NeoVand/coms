---
id: frontier/post-quantum
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: Post-Quantum TLS
synopsis: X25519MLKEM768 default in iOS 26 and Chrome — the first deployed post-quantum protocol on the public web.
podcast_target_minutes: 15
position_in_book: chapter 74 of 75
listening_order:
  prev: famous-outages/att-mobility-2024
  next: frontier/l4s-everywhere
related_protocols: [tls, tcp]
related_pioneers: []
related_outages: []
related_frontier: [ech-rfc-9849, pq-tls-x25519mlkem768]
related_rfcs: []
images: []
visual_cues:
  - "A line chart from August 2025 to December 2025 showing iOS post-quantum traffic share climbing from <2% to >25%, with a vertical marker at the iOS 26 release in September."
  - "Side-by-side handshake diagrams — classic X25519 ClientHello on the left, X25519MLKEM768 hybrid ClientHello on the right, with the 1184-byte public key visibly spilling past the 1460-byte TCP MSS line."
  - "A wire-format inspector showing TLS codepoint 0x6399 (Kyber768) crossed out and 0x11EC (X25519MLKEM768) highlighted, dated 13 August 2024."
  - "An asymmetry diagram — 52% of browser-to-edge connections in green, 3.7% of edge-to-origin connections in red — with Cloudflare and Akamai logos in the middle."
  - "A timeline of TLS certificate validity cliffs — 398 days today, 200 on 15 March 2026, 100 on 15 March 2027, 47 on 15 March 2029."
---

# Part XII, Chapter — Post-Quantum TLS

## The hook
Within four days of iOS 26 shipping in September 2025, post-quantum traffic share went from under 2% to 11%. By December 2025 it was over 25%. The cryptographic community shipped useful primitives years before the hardware threat materialised — and the deployment ecosystem rolled them out in months. This is the story of the first post-quantum protocol that actually shows up in your packet captures.

## The story

### Harvest Now, Decrypt Later
A working quantum computer of useful size — perhaps 4096 logical qubits — could break the elliptic-curve key agreement that secures essentially all modern TLS. How TLS 1.3 actually negotiates that key in one round trip is the TLS episode — for now, just remember that the security of every HTTPS connection rests on math that a future quantum computer might unwind.

Estimates of when such a machine arrives range from "ten years" to "never." But the threat is not in the future. An adversary recording your encrypted traffic today can store it indefinitely and decrypt it whenever a working quantum computer arrives. That threat model has a name: harvest now, decrypt later. HNDL, or sometimes SNDL. It is the single sentence that drives this entire chapter.

For data that needs to stay secret for decades — state secrets, medical records, long-lived contracts, identity documents — the threat is real now. Governments and large enterprises started planning the migration in the late 2010s. The standards finally landed in 2024.

### NIST FIPS 203 and the Codepoint Disruption
On 13 August 2024, NIST published FIPS 203 — the final-form rename of Kyber, now called ML-KEM, the Module-Lattice Key Encapsulation Mechanism. The rename was not cosmetic. It forced a new TLS codepoint, 0x11EC, for the hybrid called X25519MLKEM768. The old codepoint, 0x6399 for Kyber768, was invalidated. Every browser, every server, every load balancer had to redeploy because the wire format had changed.

The deployment trick is hybrid. Combine the existing X25519 elliptic-curve key exchange with ML-KEM-768 in such a way that an attacker has to break both. The hybrid combines 192-bit classical security with NIST Category-3 post-quantum security. It eliminates the harvest-now-decrypt-later window without sacrificing classical security if ML-KEM itself turns out to have an unexpected weakness. Belt and braces, on the wire.

Browser deployment moved fast. Chrome 124, in April 2024, made the older X25519Kyber768 default. Chrome 131, in November 2024, switched to the renamed X25519MLKEM768. Firefox 132 followed. Edge 131 followed. OpenJDK shipped JEP 527. And then OpenSSL 3.5 LTS, on 8 April 2025, made `X25519MLKEM768 + X25519` its default keyshare. That is the moment post-quantum stopped being a browser feature and started being a server feature.

### Apple's Cliff — Under 2% to 25% in 90 Days
Apple iOS 26, iPadOS 26, macOS Tahoe 26, and visionOS 26 all shipped in September 2025. Every one of them turned X25519MLKEM768 on by default for all TLS 1.3 connections in Network.framework. Within four days, the iOS post-quantum traffic share went from under 2% to 11%. By December 2025 it was over 25%. Apple's scale combined with the default-on shipping pattern is the fastest deployment of a new TLS feature in the protocol's history.

### The Asymmetry — Browsers Ahead, Origins Behind
By the end of 2025, around 52% of all TLS 1.3 connections to Cloudflare carried post-quantum hybrid key agreement. But only about 3.7% of origins support X25519MLKEM768. The asymmetry is the story.

The browser-to-edge handshake is now post-quantum on a majority of human web traffic. The edge-to-origin leg is the new frontier. Akamai rolled out post-quantum to-origin on 30 June 2025. Cloudflare enabled post-quantum key agreement by default for client connections all the way back in October 2022. The long pole is the server side. Every nginx, Apache, IIS, and proprietary HTTP server eventually needs an OpenSSL 3.5 or newer build with X25519MLKEM768 support, and then explicit configuration to actually enable it.

The cost is bytes on the wire. ML-KEM ciphertext is 1088 bytes. The public key is 1184 bytes. Most of the compatibility pain comes from larger ClientHellos exceeding a single TCP maximum segment size, which means the handshake spans multiple packets and any middlebox that mishandled the second one breaks the connection. How TCP picks that segment size in the SYN exchange is the TCP episode. ML-KEM-768 shared-secret derivation runs in around 30 microseconds on a modern x86 core — performance is not the concern here. Wire compatibility is.

### What Comes After Key Agreement
Pure post-quantum signatures are not yet feasible for the web. An ML-DSA-44 certificate is around 5 kilobytes. ML-DSA-65 is around 9 kilobytes. Cloudflare's Merkle Tree Certificates work, in the IETF's PLANTS working group, is the most-discussed path forward. Expect 2027 or 2028 before pure post-quantum TLS authentication is realistic at scale.

Encrypted Client Hello was published as RFC 9849 in 2025 after 25 IETF drafts. Cloudflare deploys it for around 70% of the websites it fronts. And Russia is already partly blocking it by inspecting the outer ClientHello's SNI field — the PETS FOCI 2025 paper documented the technique. Censorship resistance and metadata privacy turn out to be the same problem.

Then there is the 47-day-cert cliff. The CA/Browser Forum's Ballot SC-081v3, sponsored by Apple, passed on 11 April 2025 with a 29-yes, 0-no vote. It phases TLS certificate validity down from 398 days today, to 200 days on 15 March 2026, to 100 days on 15 March 2027, to 47 days on 15 March 2029. Domain-control validation reuse falls to 10 days. Manual renewal is no longer an option. The entire web is moving to ACME-style automation. The deployment story for cryptography in the next five years is automation as much as algorithms.

## The figures

### Post-Quantum Hybrid TLS (X25519MLKEM768)
The headline frontier entry of the chapter. Chrome 116 shipped X25519Kyber768 behind a flag in August 2023. Chrome 124 made it default in April 2024. NIST's FIPS 203 publication in August 2024 forced the rename and the new codepoint 0x11EC. Apple turned it on by default across iOS 26 and macOS Tahoe in September 2025, and within months over half of TLS 1.3 connections to Cloudflare were carrying the hybrid. The lattice-based KEM is roughly twice the size of X25519 alone, so the handshake costs a few extra TCP packets — measurable on a stopwatch, invisible to a user.

### Encrypted Client Hello Published as RFC 9849
The other 2025 TLS frontier shipment. ECH hides the SNI and the rest of the ClientHello fields that previously let middleboxes and ISPs see which site you were visiting. It took 25 IETF drafts to land. The architecture: the server publishes an ECHConfig in DNS via the HTTPS resource record; the client encrypts the inner ClientHello to that key and wraps it in an outer ClientHello that uses a generic `cloudflare-ech.com` SNI. From the network's perspective, every fronted site looks the same. Cloudflare has it on for around 70% of the sites it fronts. Chrome and Firefox both support it.

## What it taught the industry
Three lessons. First, the harvest-now-decrypt-later threat model worked: it gave standards bodies, browsers, and OS vendors a deadline that wasn't tied to anyone successfully building a quantum computer. Second, hybrids are how you ship a new primitive on the public web — combine it with the proven thing so a flaw in either one isn't fatal. Third, default-on at the OS level is the single biggest lever in cryptographic deployment. iOS 26 moved more bytes to post-quantum in four days than years of opt-in flags and enterprise pilots.

The remaining work is unglamorous: getting OpenSSL 3.5 into every origin server, getting middleboxes to stop choking on multi-packet ClientHellos, and replacing manual certificate renewal with automation in time for the 47-day cliff in 2029.

## Listening order

- **Before this chapter:** *AT&T Mobility 2024 — the last famous-outages chapter, a reminder that even the most boring infrastructure can take a continent off the air.*
- **After this chapter:** *L4S Everywhere — the next frontier entry, where the story shifts from cryptography to congestion and a new kind of low-latency internet.*

## Where to go deeper
- The TLS episode picks up the mechanism story — how the 1-RTT handshake works, where the keyshare extension lives in the ClientHello, and how cipher suite negotiation actually flows.
- The TCP episode covers the maximum segment size negotiation in the SYN exchange — the same MSS that now constrains how big a post-quantum ClientHello can grow before fragmentation bites.

## Visual cues for image generation
- A line chart from August 2025 through December 2025 showing iOS post-quantum traffic share climbing from under 2% to over 25%, with a vertical marker at the iOS 26 release in September.
- Side-by-side handshake diagrams — classic X25519 ClientHello on the left, X25519MLKEM768 hybrid on the right — with the 1184-byte public key visibly spilling past the 1460-byte TCP MSS line.
- A wire-format inspector showing TLS codepoint 0x6399 for Kyber768 crossed out and 0x11EC for X25519MLKEM768 highlighted, dated 13 August 2024.
- A two-column asymmetry diagram — 52% of browser-to-edge connections in green, 3.7% of edge-to-origin connections in red — with Cloudflare and Akamai labels in the middle.
- A timeline of TLS certificate validity cliffs — 398 days today, 200 days on 15 March 2026, 100 days on 15 March 2027, 47 days on 15 March 2029.

## Sources
- [Cloudflare — PQ 2025](https://blog.cloudflare.com/pq-2025/)
- [NIST FIPS 203 (ML-KEM)](https://csrc.nist.gov/pubs/fips/203/final)
- [Feisty Duck — ECH approved for publication](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication.html)
- [CIS — security control changes due to ECH](https://www.cisecurity.org/insights/blog/security-control-changes-due-to-tls-encrypted-clienthello)
