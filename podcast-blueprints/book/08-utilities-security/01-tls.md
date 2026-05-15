---
id: utilities-security/tls
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: TLS
synopsis: From SSL 1.0 (never released) to post-quantum hybrid by default in iOS 26.
podcast_target_minutes: 15
position_in_book: chapter 56 of 75
listening_order:
  prev: utilities-security/dns
  next: utilities-security/ssh
related_protocols: [tls]
related_pioneers: [taher-elgamal, eric-rescorla]
related_outages: []
related_frontier: [ech-rfc-9849, pq-tls-x25519mlkem768]
related_rfcs: [2246, 8446]
images: []
visual_cues:
  - "Timeline 1994 to 2025: SSL 1.0 (never shipped), SSL 2.0, SSL 3.0, TLS 1.0, 1.1, 1.2, 1.3, then PQ hybrid by default in iOS 26."
  - "Heartbleed diagram: client sends a Heartbeat with a tiny payload but a 64 KiB length field; server bleeds 64 KiB of memory back."
  - "TLS 1.3 ClientHello cosplay: legacy_version=0x0303, fake session_id, real version hidden in supported_versions extension, no-op ChangeCipherSpec record after the first flight."
  - "Cert lifetime cliff: 398 days today, 200 days on 15 March 2026, 100 days on 15 March 2027, 47 days on 15 March 2029."
  - "Cloudflare PQ adoption curve: <2% iPhone share to 11% in four days after iOS 26, past 25% by December 2025, ~52% of all TLS 1.3 to Cloudflare by end of 2025."
---

# Part IX, Chapter — TLS

## The hook
"TLS, not SSL, was Microsoft's price for IETF participation — a face-saving rename so it didn't look like the IETF was rubber-stamping Netscape." That's Tim Dierks in 2014, finally explaining the most consequential branding compromise in internet history. The protocol that puts the lock icon in your browser is a 30-year-old Netscape design, renamed for political cover, then rebuilt twice — and as of 2025 it's quietly the largest post-quantum migration ever attempted on a live network.

## The story

### SSL 1.0 Never Shipped
The first version of SSL never left the building. Taher Elgamal designed it at Netscape in 1994 to make e-commerce on the early web possible, and his colleagues — Phil Karlton, Paul Kocher, and others — tore it apart in internal review before anyone outside Netscape ever saw it. SSL 2.0 shipped in 1995 and had its own problems. SSL 3.0, in 1996, was a from-scratch rewrite by Paul Kocher, and that one survived for over a decade.

In January 1999 the IETF took ownership and published RFC 2246 — TLS 1.0. The rename was Microsoft's price for participating. As Tim Dierks put it years later, it was a face-saving move so it didn't look like the IETF was rubber-stamping Netscape. In practice TLS 1.0 was, as engineers liked to say, "really SSL 3.1." Then 1.1 in 2006, 1.2 in 2008, and finally 1.3 in August 2018 — RFC 8446, edited by Eric Rescorla over five years and twenty-eight drafts.

TLS 1.3 was the first version to break wire compatibility. Out went RC4, 3DES, MD5, SHA-1, and RSA key exchange. The handshake collapsed from two round-trips to one, or zero on resumption. And authenticated encryption — AEAD — became the only legal cipher mode. How that handshake actually works on the wire is a job for the TLS protocol episode; this is the chapter on how we got here.

There is one wire fact worth pulling out, because everyone gets it wrong. A TLS 1.3 ClientHello sets `legacy_version` to 0x0303 — that's TLS 1.2. The real version is hidden inside a `supported_versions` extension. The legacy session ID field is non-empty, faking session resumption. And both sides send a no-op ChangeCipherSpec record after their first flight. None of this is for security. It's all because middleboxes on the open internet broke when they saw an honest TLS 1.3 wire format. The protocol is technically clean. The wire encoding is a deliberate camouflage so it can sneak past the boxes.

### Heartbleed, DigiNotar, GREASE
Three TLS incidents shaped the modern field.

Heartbleed, CVE-2014-0160, April 2014. Independent discovery by Neel Mehta of Google Security and the Codenomicon team in Finland. One missing length check in OpenSSL's Heartbeat extension let any client read up to 64 kilobytes of server memory per request — including private keys, session keys, and passwords. About 17% of the trusted web was vulnerable. Heartbleed was the direct cause of the Linux Foundation's Core Infrastructure Initiative, Google's BoringSSL fork, OpenBSD's LibreSSL fork, and Amazon's s2n-tls. One bug, four forks, a new funding model for critical open-source — that's one of the incidents covered in the Famous Outages part of the book.

DigiNotar, August 2011. An Iran-linked attacker compromised a Dutch certificate authority and issued 531 fraudulent certs for 344 domains, including `*.google.com`. Those certs were used in a real man-in-the-middle attack against roughly 300,000 Iranian Gmail users. DigiNotar was bankrupt within a month. The structural fix — make every publicly-trusted certificate logged to append-only Merkle-tree logs that anyone can audit — became Certificate Transparency.

GREASE, RFC 8701, January 2020. David Benjamin at Google reserved sentinel values like 0x0A0A and 0x1A1A across the cipher-suite, named-group, signature, ALPN, and version registries. Chrome injects one at random into every ClientHello so any server or middlebox that crashes on an unknown value is found before that brittleness ossifies. GREASE is the reason TLS 1.3 deployment didn't get blocked by another decade of middleboxes that couldn't tolerate a value they hadn't seen before.

Two more incidents to name. goto fail, CVE-2014-1266 — a duplicated `goto fail;` line in iOS and OS X 10.9 made Safari silently accept any server's signed key exchange. Full MITM on every Safari HTTPS connection for about 17 months. And ROBOT, December 2017 — a 19-year-old Bleichenbacher attack still let researchers sign messages with facebook.com's private key in 2017, affecting F5, Citrix, Cisco, Radware, BouncyCastle, and WolfSSL. Old vulnerabilities don't die; they wait.

### The Post-Quantum Migration Is Mostly Done
By the end of 2025, more than half of all TLS 1.3 connections to Cloudflare carried post-quantum hybrid key agreement — the X25519MLKEM768 construction, classical and lattice-based stitched together. Within four days of Apple shipping iOS 26 in September 2025, the share of post-quantum-secured iPhone requests jumped from under 2% to 11%, and past 25% by December 2025.

There is a wonderful piece of standards drama buried in those numbers. NIST published FIPS 203 on 13 August 2024, and the rename from Kyber to ML-KEM literally invalidated TLS code point 0x6399 in favor of 0x11EC — ML-KEM-768. Every browser, every server, every load balancer had to redeploy because the wire format changed under them. Chrome 116 in August 2023 had shipped X25519Kyber768 behind a flag; Chrome 124 made it default in April 2024; Chrome 131 switched to the new code point in November 2024. Firefox 132, Edge 131, and OpenJDK followed.

OpenSSL 3.5 LTS, released 8 April 2025, made X25519MLKEM768 plus X25519 the default keyshare and is supported until April 2030. And Encrypted Client Hello — the long-promised fix that finally encrypts the SNI so middleboxes and ISPs can't see which site you're visiting — was published as RFC 9849 in 2025 after twenty-five drafts. Cloudflare deploys ECH for about 70% of the websites it fronts.

There's one more frontier to flag. The CA/Browser Forum passed Ballot SC-081v3 on 11 April 2025 — Apple-sponsored, 29 yes, 0 no — phasing certificate lifetimes down to 200 days on 15 March 2026, 100 days on 15 March 2027, and 47 days on 15 March 2029. Domain-control validation reuse falls to 10 days in the same window. Manual renewal is no longer an option. Every certificate operation has to be automated by 2029.

And as a reminder of why automation matters: the Let's Encrypt DST Root CA X3 expiry on 30 September 2021 broke older Android, OpenSSL versions before 1.1.0, Sophos UTM, Stripe webhook clients, Roku, and Heroku Redis. Root expiration is a calendar-driven incident. It should have been forecast. It now serves as the canonical case for why root rollovers must be scheduled like rocket launches.

## The figures

### Taher Elgamal
Designed SSL at Netscape between 1994 and 1996 — the protocol that made encrypted commerce on the open web possible and seeded what later became TLS. SSL 3.0, the version POODLE eventually killed, was the one the IETF took over as TLS 1.0 in RFC 2246 in January 1999, after that Microsoft–Netscape standards horsetrade. Elgamal also invented the Elgamal encryption algorithm in 1985 — one of the earliest practical public-key schemes — which underpins Diffie–Hellman key exchange and DSA signatures. He's often called the Father of SSL. RSA Lifetime Achievement Award in 2009; Internet Hall of Fame in 2024. There's a dedicated episode on him in the Pioneers part of the book.

### Eric Rescorla
Edited TLS 1.3 — RFC 8446, August 2018 — through a five-year, twenty-eight-draft redesign that dropped the insecure cipher suites, fused the handshake to one round-trip, and made AEAD mandatory. He also designed the middlebox-compatibility hacks — the legacy_version field, the fake ChangeCipherSpec — that let TLS 1.3 actually deploy on the open internet despite roughly 3% of middleboxes parsing the version field. Author of *SSL and TLS: Designing and Building Secure Systems*, the standard practitioner's text from 2000. Continues to chair IETF working groups on TLS, OAuth, and encrypted DNS. The reason your browser's HTTPS handshake takes one round-trip in 2026 instead of two. Also has his own pioneer episode.

### Encrypted Client Hello Published as RFC 9849
ECH hides the SNI and other ClientHello fields that previously let middleboxes and ISPs see which site you were visiting. The architecture: the server publishes an ECHConfig in DNS via the HTTPS resource record; the client encrypts the inner ClientHello to that key and wraps it in an outer ClientHello that uses a generic `cloudflare-ech.com` SNI. From the network's perspective, every fronted site looks the same.

### Post-Quantum Hybrid TLS (X25519MLKEM768)
By end of 2025, about 52% of TLS 1.3 connections to Cloudflare carry post-quantum hybrid key exchange, and it's on by default in iOS 26 and macOS Tahoe. The lattice-based KEM is roughly twice the size of X25519 alone, so the handshake costs a few extra TCP packets — measurable but not user-visible.

### RFC 2246 — The TLS Protocol Version 1.0
T. Dierks and C. Allen, January 1999. The IETF's first TLS spec — the one that renamed SSL 3.1 to TLS 1.0. Marked historic; obsoleted by RFC 4346.

### RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3
E. Rescorla, August 2018, proposed standard. Obsoletes 5077, 5246, and 6961. Key sections to know by name: §5 the Record Protocol, §7.1 the key schedule built on HKDF-Extract and HKDF-Expand-Label, and Appendix D.4 — the middlebox-compatibility hacks that make a TLS 1.3 handshake look, on the wire, like TLS 1.2.

## What you'd see in the simulator
The simulator runs the TLS 1.3 handshake. You'd press play and see the client send a ClientHello carrying its supported cipher suites, named groups, and a key share. The server picks a cipher, picks a group, sends back its ServerHello with its own key share, and then — already encrypted — its certificate, a CertificateVerify signature, and a Finished message. The client checks the signature against its trust store, sends its own Finished, and that's it: one round-trip, both sides have keys, and application data starts flowing. If the simulator lets you toggle resumption, you'd see a second connection skip the asymmetric crypto entirely and start sending data in zero round-trips. The mechanism — exactly which keys are derived from which secrets, how AEAD nonces are constructed, how 0-RTT replay is prevented — is the heart of the TLS protocol episode.

## What it taught the industry
Three lessons stuck. First, wire compatibility with deployed middleboxes is a feature, not a sin — TLS 1.3's deliberate cosplay as TLS 1.2 is what let it deploy at all, and GREASE is what keeps that escape hatch open. Second, certificate authority trust has to be auditable in public — DigiNotar made Certificate Transparency mandatory, and the 47-day cert lifetime cliff makes manual cert handling impossible by 2029. Third, the post-quantum transition is not coming, it's mostly done — the migration ran on browsers and operating systems shipping new code points on a six-month cadence, not on a flag day, and the only flag day was NIST changing the algorithm name.

## Listening order
- **Before this chapter:** "DNS" — DNS is where ECHConfigs and HTTPS resource records get published, so it sets up the directory layer that the modern TLS handshake now leans on.
- **After this chapter:** "SSH" — the other ubiquitous transport-security protocol, designed by a different community for a different threat model, with its own handshake story.

## Where to go deeper
- The TLS protocol episode picks up the mechanism — record layer, HKDF key schedule, AEAD nonces, the 1-RTT and 0-RTT handshake flows, and the actual middlebox-compatibility hacks at the byte level.
- The QUIC episode covers what happens when you take the TLS 1.3 handshake and weld it into a transport that runs over UDP — same crypto, different round-trip story.
- The HTTP/2 and HTTP/3 episodes pick up ALPN — the TLS extension that lets your browser silently negotiate which version of HTTP it's about to speak.
- The Heartbleed chapter in the Famous Outages part of the book tells the full story of the bug, the disclosure, and the four OpenSSL forks that came out of it.
- The Taher Elgamal and Eric Rescorla pioneer episodes go deeper on the people behind SSL and TLS 1.3.

## Visual cues for image generation
- A 1994-to-2025 timeline of SSL/TLS versions, with SSL 1.0 marked "never shipped" and TLS 1.3 marked as the first wire-incompatible version.
- A side-by-side of a TLS 1.2 ClientHello and a TLS 1.3 ClientHello with the legacy_version, session_id, and supported_versions fields highlighted to show the camouflage.
- A Heartbleed diagram: a tiny client payload with a 64 KiB length field, and a server response leaking 64 KiB of private memory.
- A certificate-lifetime staircase from 398 days today down to 200, 100, and 47 days on the SC-081v3 schedule.
- A Cloudflare adoption curve for X25519MLKEM768 through 2025, with the iOS 26 launch marked and the jump from <2% to 11% in four days called out.
