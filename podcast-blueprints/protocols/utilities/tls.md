---
id: tls
type: protocol
name: Transport Layer Security
abbreviation: TLS
etymology: "[T]ransport [L]ayer [S]ecurity"
category: utilities-security
year: 1999
rfc: RFC 8446
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - foundations/encryption-basics
  - story-of-the-internet/the-quic-redesign
  - layer-2-3/ipv6
  - layer-2-3/bgp
  - transport/tcp
  - transport/quic
  - web-api/http3
  - web-api/mcp-and-a2a
  - realtime-av/webrtc
  - realtime-av/sip-and-sdp
  - utilities-security/tls
  - utilities-security/ssh
  - utilities-security/email-stack
  - patterns-failures/patterns
  - famous-outages/mitnick-1994
  - famous-outages/china-telecom-2010
  - frontier/post-quantum
  - frontier/ipv6-mostly
  - how-to-learn-more/rfcs-to-read
  - how-to-learn-more/books
related_protocols: [tcp, http1, http2, http3, quic, websockets, smtp, ftp, dns, imap, oauth2, ipsec, ip, ipv6, wireguard, cellular, bluetooth, nfc, uwb]
related_pioneers: [taher-elgamal]
related_outages: []
related_frontier: []
related_rfcs: [8446, 5246, 8996, 9325, 9001, 9147, 9849, 8701, 8705, 8555, 6066, 7919, 9162, 9420, 9345, 9460, 8461]
related_journeys: [url-bar, wire-to-web]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Full_TLS_1.3_Handshake.svg/500px-Full_TLS_1.3_Handshake.svg.png
    caption: The TLS 1.3 handshake — reduced from two round trips in TLS 1.2 to just one. The client sends supported cipher suites and key shares in ClientHello; the server responds with its choices, certificate, and Finished message — then encrypted data flows immediately.
    credit: Image — Wikimedia Commons / Public Domain
visual_cues:
  - "A side-by-side timing diagram of the TLS 1.2 versus TLS 1.3 handshake. TLS 1.2 takes two full round-trips before the first byte of application data; TLS 1.3 takes one. The third lane shows 0-RTT resumption with application data flying inside the very first message."
  - "A wire-format breakdown of a single TLS record: a five-byte header (ContentType, legacy version 0x0303, length) on top, the encrypted fragment in the middle, and the sixteen-byte GCM authentication tag at the bottom. Beside it, the AEAD nonce being formed by XORing the static IV with the record sequence number."
  - "The TLS 1.3 key schedule as a tree: an Early Secret on top fed by an optional PSK, branching into a Handshake Secret derived from the (EC)DHE shared secret, then a Master Secret with leaves for client and server application traffic keys. Each branch labelled HKDF-Extract or HKDF-Expand-Label."
  - "A world map of post-quantum adoption at end of 2025. Big arrows for Cloudflare edge (~52% of TLS 1.3 hybrid PQ), Apple iOS 26 (>25% of iPhone requests), Chrome 131. A small grey arrow for the lagging ~3.7% of origins that actually accept X25519MLKEM768."
  - "A timeline of certificate validity collapsing under CA/Browser Forum Ballot SC-081v3: 398 days today, 200 days on 15 March 2026, 100 days on 15 March 2027, 47 days on 15 March 2029. A second line shows DCV reuse falling to 10 days. The y-axis is a single label: 'manual renewal is no longer an option.'"
  - "A diagram of the Heartbleed bug: a malicious heartbeat request claims a 64 KiB payload but supplies almost no data. The server, missing one length check, copies 64 KiB of its own memory back to the attacker — including private keys and session tickets."
---

# TLS — Transport Layer Security

## In one breath

TLS is the encrypted tunnel that wraps almost everything moving between a browser and a server: every HTTPS request, most API calls, most email between mail servers, every WebSocket, every gRPC channel. It guarantees three things — that the data cannot be read in transit, that it cannot be modified without detection, and that the server is the one whose certificate it presents. By the end of 2025 around 71% of all web requests on Cloudflare were TLS 1.3, and more than half of those connections were already protected by post-quantum hybrid key agreement. If you run software that touches the internet, this is the protocol your application is silently leaning on.

## The pitch (cold-open)

In 1994 a Netscape engineer named Taher Elgamal sketched a way to encrypt a credit-card form on the web. Version 1 was so broken it never shipped; version 2 was broken before launch; version 3 survived just long enough for Microsoft and Netscape to fight over it, and in 1999 a developer named Tim Dierks renamed it TLS so the IETF could pretend it was new. Thirty-one years later that same protocol — now in version 1.3, post-quantum hybrid by default on iOS and in Chrome, with the destination hostname finally encrypted — is what stands between your password and the open internet. Every two years somebody breaks it spectacularly. This episode is about how it works on the wire today, what fails in production, and why the whole web is being forced onto 47-day certificates by 2029.

## How it actually works

TLS sits between a transport like TCP and an application like HTTP. The application keeps writing bytes; TLS encrypts them, frames them as records, and feeds them to TCP. The handshake at the top of every connection negotiates which cipher to use, exchanges keys via Diffie-Hellman, and proves the server's identity with a certificate. Five steps cover the whole 1-RTT TLS 1.3 case.

The client sends a ClientHello. Inside is a list of supported cipher suites, a 32-byte random value, and — speculatively, because the client does not yet know what the server will pick — one or more key shares. In TLS 1.3 the client guesses x25519 will work and sends the public half right there in the first packet. The cipher suite list typically includes `TLS_AES_256_GCM_SHA384`, `TLS_AES_128_GCM_SHA256`, and `TLS_CHACHA20_POLY1305_SHA256`. Extensions in the same message carry the SNI (the hostname the client wants), the supported_versions list (the real version negotiation, hidden here for middlebox reasons we will get to), and ALPN (the next-layer protocol the client wants — `h2`, `http/1.1`, `h3`).

The server responds with a ServerHello picking the cipher suite and providing its own key share. Both sides now have everything they need to derive the handshake traffic keys. From here, every server message is already encrypted under those handshake keys: an EncryptedExtensions block, the server's X.509 certificate chain, a CertificateVerify (a signature over the running transcript hash that proves the server holds the private key for that certificate), and a Finished message — an HMAC over the entire handshake transcript so far.

The client validates the certificate chain against its trust store (correct hostname, not expired, signed by a CA the system trusts), checks the CertificateVerify signature, derives the application traffic keys, and sends its own Finished. From that point on, application data flows under AES-GCM or ChaCha20-Poly1305 with sixteen-byte authentication tags on every record. Total cost: one round-trip from ClientHello to first application byte.

If the client has a session ticket from a previous connection, it can do better still. TLS 1.3 0-RTT lets it encrypt early data under a key derived from the resumption secret and bundle that data into the very first message. Cost: zero round-trips. Catch: 0-RTT data has no forward secrecy and is potentially replayable, which is why most browsers only allow it for safe, idempotent requests like GET.

### Header at a glance

A TLS record on the wire is five bytes of header followed by the encrypted fragment.

- **ContentType (1 byte).** 22 for handshake, 23 for application_data, 21 for an alert, 20 for a no-op ChangeCipherSpec. After the handshake, every encrypted record uses 23 — the real type lives inside the plaintext, just before the authentication tag.
- **legacy_record_version (2 bytes).** Hard-coded 0x0303, which means "TLS 1.2." It always says TLS 1.2 even on TLS 1.3 connections. The real version is in the supported_versions extension.
- **length (2 bytes).** Plaintext is capped at 16,384 bytes; ciphertext at that plus 256.
- **fragment.** The encrypted payload, with a 16-byte GCM authentication tag concatenated at the end. The five-byte header is the AEAD's associated data, so any tampering with it breaks decryption. The nonce is built by XORing the 64-bit record sequence number into the static IV — reusing a (key, nonce) pair under GCM is catastrophic, so each direction has its own counter starting at zero.

### State machine in three sentences

TLS does not have a TCP-style finite state machine; it has a handshake that completes in one or two round-trips and then drops into bulk record encryption. The interesting state is the key schedule (Early Secret, Handshake Secret, Master Secret derived through HKDF-Extract and HKDF-Expand-Label, each binding to the running transcript hash) plus a small set of post-handshake messages: NewSessionTicket for resumption, KeyUpdate for rekeying without renegotiation, and post-handshake Certificate flows for on-demand client auth. Renegotiation as TLS 1.2 knew it is gone — that whole class of attacks went with it.

### Reliability, security, and the middlebox camouflage

TLS 1.3 enforces forward secrecy by removing static-RSA key transport: the only way to do non-PSK key exchange is (EC)DHE, so compromising a server's long-term key tomorrow cannot decrypt sessions captured today. It mandates AEAD ciphers — AES-128-GCM, AES-256-GCM, ChaCha20-Poly1305 — and removes everything that gave the 2010s their alphabet soup of attacks: RC4, 3DES, MD5, SHA-1, RSA key transport, every CBC mode. Each of those had a published attack: BEAST, CRIME, BREACH, Lucky 13, FREAK, Logjam, ROBOT.

The wire format hides all of this behind a deliberate camouflage. ClientHello.legacy_version is 0x0303. The legacy_session_id is a non-empty 32 bytes that fakes session resumption. Both sides send a no-op ChangeCipherSpec record after the first flight. None of these are real protocol features — they are there because early TLS 1.3 drafts broke roughly 3% of users when middleboxes parsed the version field and dropped anything that was not 1.2. The protocol is technically clean; the encoding is a deliberate disguise. The chapter on TLS in the book covers the politics of how that came about; we will not retread it here.

## Where it shows up in production

Cloudflare terminates TLS at the edge for every site behind it — billions of handshakes per second. As of end-2025 it reports roughly 71% of all requests are TLS 1.3, and around 52% of those carry X25519MLKEM768 hybrid post-quantum key agreement by default. ECH (Encrypted Client Hello, RFC 9849) is enabled for around 70% of Cloudflare-fronted zones. Cloudflare turned PQ key agreement on by default for client-facing connections in October 2022 and rolled it out broadly through 2024.

Apple shipped iOS 26, iPadOS 26, macOS Tahoe 26, and visionOS 26 in September 2025 with X25519MLKEM768 default-on across Network.framework, the system TLS stack. Within four days the share of post-quantum-secured iPhone requests jumped from under 2% to 11%. By December 2025 it was over 25%. That is the fastest deployment of a new TLS feature in the protocol's history, and it is entirely a function of one vendor flipping a default at scale.

Google Chrome 124 made hybrid post-quantum key agreement default in April 2024 (then codepoint 0x6399, X25519Kyber768). After NIST published FIPS 203 on 13 August 2024, Kyber's final-form rename forced a new TLS codepoint, 0x11EC for X25519MLKEM768, and Chrome 131 in November 2024 switched to it. Firefox 132, Edge 131, and OpenJDK (JEP 527) followed within months.

Let's Encrypt issues TLS certificates for around 470 million active domains, dominating the public web; it renews about 3 million certificates per day, all via the ACME protocol it invented (RFC 8555). Akamai turned on PQ key agreement to-origin on 30 June 2025. OpenSSL 3.5 LTS, released 8 April 2025, made `X25519MLKEM768 + X25519` the default keyshare and is supported until April 2030. Microsoft added X25519MLKEM768 in Windows 11 24H2 / Server 2025. Apple's Network.framework, Java's JSSE, Schannel, BoringSSL, rustls, s2n-tls — every major TLS stack has the post-quantum codepoint now.

The asymmetry is the story. Around 52% of TLS 1.3 connections to Cloudflare are PQ — but only around 3.7% of *origins* support X25519MLKEM768. Browsers and CDNs are years ahead; the long tail of nginx, Apache, IIS, and proprietary HTTP servers behind small load balancers is still catching up. The post-quantum migration is going to be defined by how long that tail takes to retire.

## Things that go wrong

**Heartbleed, April 2014.** A missing length check in OpenSSL's Heartbeat extension let any client send a heartbeat request claiming a 64-kilobyte payload while supplying only a few bytes. The server happily copied 64 kilobytes of its own memory back to the attacker — including private keys, session keys, and passwords. Independent discovery by Neel Mehta of Google Security and the Codenomicon team in Finland; OpenSSL 1.0.1g patched it on 7 April 2014. Around 17% of the trusted web was vulnerable. The direct downstream consequences were the Core Infrastructure Initiative, Google's BoringSSL fork, OpenBSD's LibreSSL fork, and Amazon's s2n-tls. The chapter on TLS in the book takes the long version of this story; here the lesson is the one Dan Kaminsky wrote at the time — the most-important security primitive on the internet was being maintained by a handful of volunteers on roughly $2,000 a year in donations.

**DigiNotar, August 2011.** A small Dutch CA owned by VASCO ran its CA servers on a single Windows domain reachable from the public internet, with the same password on every box, antivirus disabled, and no central logging. An Iran-linked attacker — the same person who had breached Comodo earlier in 2011 — minted 531 fraudulent certificates for 344 domains including `*.google.com`, `*.mozilla.org`, and `*.torproject.org`, then used them to MITM around 300,000 Iranian Gmail users. Google caught it because Chrome had pinned its own certificates; an Iranian user nicknamed "alibo" filed the bug. DigiNotar was bankrupt within a month. The cryptography never failed — the trust model did. Certificate Transparency, CAA records, the eventual distrust of Symantec in 2018, and ultimately the move to short-lived certificates we are seeing now were all written because of DigiNotar. The chapter on TLS in the book carries the full story.

**goto fail, February 2014.** A duplicated `goto fail;` line in `SSLVerifySignedServerKeyExchange` in `libsecurity_ssl/lib/sslKeyExchange.c` made iOS and OS X 10.9 silently accept any server's signed key exchange — full MITM on every Safari HTTPS connection for around 17 months before Apple shipped the patch. Adam Langley's writeup at imperialviolet.org is still the cleanest explanation of how a single duplicated line of C took out a vendor's entire HTTPS surface.

**ROBOT, December 2017.** Hanno Böck, Juraj Somorovsky, and Craig Young showed that the original 1998 Bleichenbacher RSA padding-oracle attack still worked on production TLS stacks from F5, Citrix, Cisco, Radware, BouncyCastle, and WolfSSL. The punchline of the paper was a message signed with `facebook.com`'s private key. The recommendation was to deprecate RSA key transport — which TLS 1.3 had already done.

**Let's Encrypt DST Root CA X3 expiry, 30 September 2021.** The IdenTrust root that cross-signed Let's Encrypt expired at 14:01:15 UTC. Older Android, OpenSSL versions before 1.1.0, Sophos UTM, Stripe webhook clients, Roku, and Heroku Redis broke. Catchpoint flagged the failures on 29 September. The actual cause was not Let's Encrypt — it was that "we are still running OpenSSL 1.0.x in 2021" turned out to be a viable production posture for an enormous number of devices. Root expiration is calendar-driven; it was foreseeable years out. The lesson lives on in every CA's runbook now: schedule root rollovers like rocket launches.

**Microsoft Teams (2020), Spotify (2020), Cisco WebEx (2018).** All of these had multi-hour outages because someone forgot to renew a certificate. Even huge organisations forget. The cure is no longer "add it to the calendar" — it is automated issuance via ACME, with monitoring on certificate expiry and alerts at 30 days out.

## Common pitfalls (for the practitioner)

**Certificate expiry is the single most common TLS outage.** Symptom: at exactly 00:00 some day, a service starts returning TLS errors and stops accepting connections. Cure: never allow an "important" cert that a human has to renew by hand. ACME with Let's Encrypt or your CA of choice. Monitor expiry at least 30 days out. Treat ACME failures as P1.

**0-RTT resumption is replayable.** Symptom: an idempotent operation that succeeded once succeeds twice; a non-idempotent one (POST) silently fires twice. Cure: only allow 0-RTT for safe, idempotent methods like GET and HEAD. Cap `max_early_data_size`. Track ticket reuse; servers should reject duplicate tickets within their bounded clock-skew window.

**Mixed content on HTTPS pages.** Symptom: a page loads over HTTPS, includes one script tag with an `http://` URL, and the browser blocks it or warns. Cure: serve every dependency over HTTPS. HSTS plus a CSP `upgrade-insecure-requests` directive catches most accidental regressions.

**Missing or out-of-order intermediate certificates.** Symptom: works in Chrome (which fetches missing intermediates), fails in curl, fails in Java. Cure: serve the full intermediate chain in the right order; never serve the root. Confirm with `openssl s_client -connect host:443 -showcerts` and SSL Labs.

**STARTTLS downgrade on SMTP/IMAP.** Symptom: silent loss of confidentiality when an active attacker strips the `250 STARTTLS` line. Cure: prefer implicit-TLS ports (465 for SMTP submission, 993 for IMAP); for inter-MTA SMTP, deploy MTA-STS (RFC 8461) with `mode: enforce` so receivers refuse to fall back to plaintext.

**Wrong SNI versus certificate SAN, wildcard certs that do not cover the apex, mTLS truststore containing the wrong CA, OCSP-must-staple set on a server that does not actually staple.** Each of these is a self-inflicted handshake failure and the fix is configuration discipline. Mozilla's SSL Configuration Generator gives you a baseline you can copy.

**No forward secrecy.** Symptom: in `openssl s_client` output, no `Server Temp Key:` line. You have static-RSA. Cure: disable RSA key exchange and require ECDHE.

## Debugging it

`openssl s_client -connect host:443 -tls1_3 -servername host` is the workhorse. Use `-groups X25519MLKEM768` on OpenSSL 3.5+ to force a specific named group and confirm whether your origin actually supports the post-quantum codepoint. `openssl x509 -noout -text` on the served certificate inspects every extension.

Wireshark with the `tls` dissector decodes records on the wire. To decrypt traffic from Chrome or Firefox, set the `SSLKEYLOGFILE` environment variable before launching the browser; Wireshark imports the NSS keylog format and decrypts everything. For server-side captures you need the server's session keys, which most stacks can be configured to export.

`testssl.sh` is the open-source CLI scanner that walks every cipher and version. Qualys SSL Labs (`ssllabs.com/ssltest`) is the public-facing equivalent; Hardenize is Ivan Ristić's successor service. `mitmproxy`, Burp, and `tlsfuzzer` are the active testing tools.

JA3 and JA4 fingerprints hash the ClientHello extension list to identify the client stack — useful for abuse detection, useful when you are debugging "why does Java reject this connection but curl accept it." `curl -v --tls13-ciphers ... --tls-max 1.3` lets you compare client behaviours from the command line.

`nmap --script ssl-enum-ciphers -p 443 example.com` enumerates supported ciphers for a single host.

## What's changing in 2026

**The 47-day certificate cliff.** CA/Browser Forum Ballot SC-081v3 passed on 11 April 2025, sponsored by Apple, 29 yes / 0 no. Public TLS certificate validity collapses from 398 days to 200 days on 15 March 2026, 100 days on 15 March 2027, and 47 days on 15 March 2029. Domain Control Validation reuse falls to 10 days in the same window. Manual renewal stops being viable for any organisation running more than a handful of certificates. The effect is to force the entire web onto ACME-style automation.

**Encrypted Client Hello shipped as RFC 9849.** Published in 2025 after 25 drafts. ECH closes the long-standing TLS metadata leak where the SNI extension exposed the destination hostname in plaintext. Cloudflare deploys it for around 70% of its zones; Mozilla and Chrome ship it gated by HTTPS DNS records (RFC 9460) so the client learns the server's ECH key over an encrypted DNS channel before connecting. Russia is already partly blocking ECH by inspecting the outer SNI — censorship resistance and metadata privacy turn out to be the same engineering problem.

**Post-quantum hybrid is now the client-side default.** X25519MLKEM768 (codepoint 0x11EC) is default in Chrome 131 and later (November 2024), Firefox 132, Edge 131, OpenJDK 25, OpenSSL 3.5 LTS (April 2025), and Apple iOS 26 / iPadOS 26 / macOS Tahoe 26 / visionOS 26 (September 2025). The 2024 Kyber to ML-KEM rename literally invalidated the old codepoint 0x6399 — every client and server had to redeploy because the wire format changed. The chapter on Post-Quantum TLS in the book takes the deeper version of this story; the protocol-level point is that hybrid combines X25519 and ML-KEM-768 such that an attacker has to break both, eliminating the harvest-now-decrypt-later window without sacrificing classical security if ML-KEM turns out to have an unexpected weakness.

**Pure post-quantum signatures are not yet feasible for the web.** ML-DSA-44 certs run around 5 KB and ML-DSA-65 around 9 KB; today's RSA-2048 cert is 1 to 1.4 KB and an ECDSA P-256 cert is around 700 to 900 bytes. Cloudflare's Merkle Tree Certificates work in the IETF PLANTS WG is the most-discussed path. Expect 2027–2028 before pure-PQ TLS authentication is realistic at production scale.

**Active drafts in the IETF TLS WG (May 2026).** `draft-ietf-tls-rfc8446bis` is the in-progress refresh of TLS 1.3 itself (draft-14, dated September 2025). Trust Expressions for shrinking handshakes; renewal of the certificate-compression registry; hybrid PQ key-exchange profile drafts. `draft-michel-ssh3` is an experimental SSH-equivalent over HTTP/3 + QUIC.

**Delegated credentials (RFC 9345, July 2023).** Short-lived (≤7-day) credentials signed by the long-lived cert. Reduces private-key exposure for CDNs that need to terminate TLS at hundreds of edge sites without distributing the long-term key everywhere.

## Fun facts (host material)

**SSL 1.0 was never released.** Taher Elgamal designed it at Netscape in 1994; Phil Karlton, Paul Kocher, and others tore it apart in internal review before it shipped. SSL 2.0 (1995) was almost immediately broken — Ian Goldberg and David Wagner reverse-engineered Netscape's PRNG and recovered session keys in seconds because Netscape was seeding it from PID and time-of-day. SSL 3.0 (1996) was a redesign by Paul Kocher with Phil Karlton and Alan Freier, and it survived for over a decade before POODLE finally killed it in 2014.

**The "TLS not SSL" rename was Microsoft's price for IETF participation.** In Tim Dierks's own 2014 account, the negotiation between Netscape and Microsoft (with Bruce Schneier, Paul Kocher, and Microsoft's Barbara Fox in the room) produced "some changes to SSL 3.0 (so it wouldn't look like the IETF was just rubberstamping Netscape's protocol), and we had to rename the protocol (for the same reason). And thus was born TLS 1.0 (which was really SSL 3.1)." RFC 2246 published it in January 1999.

**Harvest now, decrypt later.** An adversary recording your encrypted traffic today can store it indefinitely and decrypt it whenever a working quantum computer arrives. For data that needs to stay secret for decades — state secrets, medical records, long-lived contracts — the threat is real now, even if the hardware is not. That is why the post-quantum migration could not wait for a working quantum computer to materialise.

**GREASE is why TLS 1.3 actually deployed.** RFC 8701 ("Generate Random Extensions And Sustain Extensibility"), authored by David Benjamin at Google. Chrome injects a random reserved value (0x0A0A, 0x1A1A, ..., 0xFAFA) into the cipher-suite, named-group, signature, ALPN, and version registries on every ClientHello, so any server or middlebox that crashes on unknown values is detected before that brittleness ossifies. Without GREASE, TLS 1.3 deployment would probably have eaten another decade of middlebox compatibility hacks.

**The fake ChangeCipherSpec.** TLS 1.3 has no use for ChangeCipherSpec — it is a TLS 1.2 message. Both sides send it anyway, as a no-op, after their first flight, purely to fool middleboxes that thought they understood TLS 1.2 and would otherwise drop the connection. The legacy_session_id field in ClientHello is also non-empty for the same reason: middleboxes expected a session ID, so TLS 1.3 fakes one.

**The Kyber-to-ML-KEM rename invalidated a TLS codepoint.** When NIST finalised FIPS 203 on 13 August 2024, the algorithm was renamed and the wire format changed enough that codepoint 0x6399 (X25519Kyber768) had to be retired in favour of 0x11EC (X25519MLKEM768). Every browser, server, and load balancer that had shipped the old codepoint had to redeploy. Chrome 131 made the switch in November 2024.

## Where this connects in the book

- **Part Foundations, Chapter "What Is a Protocol?"** — the conceptual baseline: why every machine on the planet agrees to follow these.
- **Part Foundations, Chapter "The Layer Model"** — where TLS sits between transport and application, and why it does not fit cleanly into either.
- **Part Foundations, Chapter "Packets & Encapsulation"** — TLS records inside TCP segments inside IP packets inside Ethernet frames.
- **Part Foundations, Chapter "Ports & Sockets"** — port 443 versus 80, and the implicit-TLS versus STARTTLS pattern.
- **Part Foundations, Chapter "Reliability vs Speed"** — the round-trip cost TLS adds to TCP, and how QUIC eliminates it.
- **Part Foundations, Chapter "Encryption Basics"** — what HTTPS actually protects, and what it does not.
- **Part Story of the Internet, Chapter "The QUIC Redesign"** — the deeper version of why TLS 1.3 ended up folded into a new transport, and the structural lesson that encryption is what keeps a protocol evolvable.
- **Part Layer 2–3, Chapter "IPv6"** — and the recurring myth that IPv6 has built-in encryption (it does not; the encryption story for IPv6 is the same as for IPv4: TLS at the application layer).
- **Part Layer 2–3, Chapter "BGP"** — including the KlaySwap 2022 incident where a BGP hijack of Kakao's prefix obtained a valid TLS certificate via Domain Control Validation.
- **Part Transport, Chapter "TCP"** — the substrate TLS rides on, and the head-of-line blocking problem that motivates QUIC.
- **Part Transport, Chapter "QUIC"** — TLS 1.3 handshake messages embedded directly in QUIC's CRYPTO frames; the TLS record layer replaced by QUIC's packet-protection layer.
- **Part Web/API, Chapter "HTTP/3"** — the user-facing surface of TLS-in-QUIC: 1-RTT setup, 0-RTT resumption, and connection IDs that survive network changes.
- **Part Web/API, Chapter "MCP and A2A"** — the agent protocols that lean on TLS 1.3 + OAuth 2.0 rather than rolling their own scheme.
- **Part Real-time A/V, Chapter "WebRTC"** — DTLS doing the key exchange over UDP, then handing keys to SRTP for the actual media.
- **Part Real-time A/V, Chapter "SIP and SDP"** — TLS securing SIP signalling, and the `sips:` URI's hop-by-hop (not end-to-end) trust model that still trips engineers up.
- **Part Utilities & Security, Chapter "TLS"** — the long-form history this episode defers to: SSL 1.0, the IETF takeover, Heartbleed, DigiNotar, GREASE, and the post-quantum migration.
- **Part Utilities & Security, Chapter "SSH"** — the design alternative TLS lost to in remote-shell niches, and the curious fact that SSH (OpenSSH 10.0, April 2025) shipped post-quantum default-on six months before TLS did.
- **Part Utilities & Security, Chapter "The Email Stack"** — SMTP STARTTLS, MTA-STS, and the trust layer for mail.
- **Part How Networks Actually Behave, Chapter "Recurring Patterns"** — the patterns that show up across every protocol, including the encryption-versus-ossification dynamic.
- **Part Famous Outages, Chapter "Mitnick vs Shimomura 1994"** — pre-TLS, but the canonical story of why cleartext authentication had to die.
- **Part Famous Outages, Chapter "China Telecom 2010"** — the BGP hijack episode that, alongside DigiNotar, drove the realisation that the trust model below TLS was the actual problem.
- **Part Frontier, Chapter "Post-Quantum TLS"** — the deeper version of X25519MLKEM768, the iOS 26 cliff, the codepoint disruption, and the asymmetry between browser adoption and origin support.
- **Part Frontier, Chapter "IPv6-Mostly"** — including the recurring "but IPv6 has IPsec built in" myth and why TLS remains the answer either way.
- **Part How to Learn More, Chapter "RFCs Worth Reading"** — RFC 8446 is on the short list; Eric Rescorla's prose is held up as the model for how to write a security spec.
- **Part How to Learn More, Chapter "Books"** — Ivan Ristić's *Bulletproof TLS and PKI* and David Wong's *Real-World Cryptography* as the operator and engineer canon.

## See also (other protocol episodes)

If you have heard the SSH episode, the contrast with TLS is the contrast between two different bets on what the user should have to do. SSH bundles authentication, file transfer, port forwarding, and channel multiplexing into one protocol with Trust-On-First-Use keys; you remember a host fingerprint instead of trusting a hierarchy of CAs. TLS picked the opposite bet — pure encryption and authentication with a public PKI, and let every application build whatever it wants on top. TLS won the web because it did not require humans to manage keys; SSH won the server room because it did. Both are still right.

The OAuth episode is the complement, not the alternative. OAuth 2.0 handles authorisation — who can access what — and TLS handles encryption. They solve different problems, and OAuth requires TLS by definition. An OAuth deployment without TLS is broken (bearer tokens in cleartext). RFC 8705 layers them further: mTLS for OAuth uses TLS client certificates as a stronger client authentication and as the basis for certificate-bound access tokens.

The QUIC and HTTP/3 episodes are the same protocol from a different vantage point. QUIC is not "TLS over QUIC" — it is QUIC with TLS 1.3 handshake messages embedded directly in CRYPTO frames, the TLS record layer replaced by QUIC's packet protection (using the same AEADs and HKDF-derived keys), and TLS's KeyUpdate and ChangeCipherSpec disabled because QUIC has its own. The TCP episode covers the head-of-line blocking that motivated all of this; the QUIC episode covers the user-space transport that fixed it.

The WebRTC episode is the DTLS angle — TLS over datagrams, with DTLS 1.3 (RFC 9147, April 2022) doing the key exchange over UDP and handing keys to SRTP for the media. WebRTC is the largest deployment of DTLS on the planet.

The SMTP episode covers the messy reality of opportunistic TLS via STARTTLS — the largest-scale active-MITM hole on the internet for a decade, finally being closed by MTA-STS (RFC 8461). The IMAP, FTP, MQTT, AMQP, Kafka, gRPC, WebSocket, and XMPP episodes all share the same shape: a protocol that wraps in TLS to get encryption and authentication on top of whatever transport it already used.

## Visual cues for image generation

- A side-by-side timing diagram of the TLS 1.2 versus TLS 1.3 handshake. TLS 1.2 takes two full round-trips before the first byte of application data; TLS 1.3 takes one. The third lane shows 0-RTT resumption with application data flying inside the very first message.
- A wire-format breakdown of a single TLS record: a five-byte header (ContentType, legacy version 0x0303, length) on top, the encrypted fragment in the middle, and the sixteen-byte GCM authentication tag at the bottom. Beside it, the AEAD nonce being formed by XORing the static IV with the record sequence number.
- The TLS 1.3 key schedule as a tree: an Early Secret on top fed by an optional PSK, branching into a Handshake Secret derived from the (EC)DHE shared secret, then a Master Secret with leaves for client and server application traffic keys. Each branch labelled HKDF-Extract or HKDF-Expand-Label.
- A world map of post-quantum adoption at end of 2025. Big arrows for Cloudflare edge (~52% of TLS 1.3 hybrid PQ), Apple iOS 26 (>25% of iPhone requests), Chrome 131. A small grey arrow for the lagging ~3.7% of origins that actually accept X25519MLKEM768.
- A timeline of certificate validity collapsing under CA/Browser Forum Ballot SC-081v3: 398 days today, 200 days on 15 March 2026, 100 days on 15 March 2027, 47 days on 15 March 2029. A second line shows DCV reuse falling to 10 days. The y-axis is a single label: "manual renewal is no longer an option."
- A diagram of the Heartbleed bug: a malicious heartbeat request claims a 64 KiB payload but supplies almost no data. The server, missing one length check, copies 64 KiB of its own memory back to the attacker — including private keys and session tickets.

## Sources

**RFCs.**

- [RFC 8446 — TLS 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
- [RFC 5246 — TLS 1.2](https://datatracker.ietf.org/doc/html/rfc5246)
- [RFC 8996 — Deprecating TLS 1.0/1.1](https://datatracker.ietf.org/doc/rfc8996/)
- [RFC 9325 / BCP 195 — Recommendations for Secure Use of TLS/DTLS](https://datatracker.ietf.org/doc/bcp195/)
- [RFC 9001 — Using TLS to Secure QUIC](https://www.rfc-editor.org/rfc/rfc9001.pdf)
- [RFC 9147 — DTLS 1.3](https://datatracker.ietf.org/doc/rfc9147/)
- [RFC 9849 — TLS Encrypted Client Hello](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication)
- [RFC 8701 — GREASE](https://www.rfc-editor.org/info/rfc8701)
- [RFC 8705 — mTLS for OAuth](https://datatracker.ietf.org/doc/html/rfc8705)
- [RFC 8555 — ACME](https://datatracker.ietf.org/doc/html/rfc8555)
- [RFC 6066 — TLS Extensions and SNI](https://datatracker.ietf.org/doc/html/rfc6066)
- [RFC 7919 — FFDHE groups](https://datatracker.ietf.org/doc/html/rfc7919)
- [RFC 9162 — Certificate Transparency 2.0](https://datatracker.ietf.org/doc/html/rfc9162)
- [RFC 9420 — Messaging Layer Security](https://datatracker.ietf.org/doc/rfc9420/)
- [RFC 9345 — Delegated Credentials for TLS](https://www.rfc-editor.org/rfc/rfc9345.html)
- [RFC 9460 — SVCB / HTTPS DNS records](https://datatracker.ietf.org/doc/html/rfc9460)
- [RFC 8461 — MTA-STS](https://www.rfc-editor.org/rfc/rfc8461.html)

**Papers.**

- [Beurdouche et al., "A Messy State of the Union" (FREAK)](https://doi.org/10.1109/SP.2015.39)
- [Adrian et al., "Imperfect Forward Secrecy" (Logjam)](https://doi.org/10.1145/2810103.2813707)
- [Böck, Somorovsky, Young, "ROBOT"](https://eprint.iacr.org/2017/1189)
- [Aviram et al., "DROWN: Breaking TLS using SSLv2"](https://drownattack.com)
- [Niere et al., "Encrypted Client Hello in Censorship Circumvention" (PETS FOCI 2025)](https://www.petsymposium.org/foci/2025/foci-2025-0016.pdf)

**Vendor and engineering blogs.**

- [Cloudflare — RFC 8446 / TLS 1.3](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)
- [Cloudflare — Post-Quantum 2024](https://blog.cloudflare.com/pq-2024/)
- [Cloudflare — Post-Quantum 2025](https://blog.cloudflare.com/pq-2025/)
- [Cloudflare Radar — Year in Review 2025](https://radar.cloudflare.com/year-in-review/2025)
- [OpenSSL 3.5 Release](https://www.admin-magazine.com/News/OpenSSL-3.5-Released)
- [Apple — Quantum-Secure Networking in iOS 26](https://support.apple.com/en-us/122756)
- [OpenJDK JEP 527 — ML-KEM Key Exchange in TLS](https://openjdk.org/jeps/527)
- [Akamai — Post-Quantum Cryptography Implementation Considerations for TLS](https://www.akamai.com/blog/security/post-quantum-cryptography-implementation-considerations-tls)
- [Google Chrome — switch to ML-KEM](https://thehackernews.com/2024/09/google-chrome-switches-to-ml-kem-for.html)
- [Adam Langley — goto fail](https://www.imperialviolet.org/2014/02/22/applebug.html)
- [Tim Dierks — Security Standards and Name Changes](https://tim.dierks.org/2014/05/security-standards-and-name-changes-in.html)
- [Catchpoint — DST Root CA X3 Expiration Outage](https://www.catchpoint.com/blog/lessons-from-an-internet-outage-issues-caused-by-lets-encrypt-dst-root-ca-x3-expiration)
- [Let's Encrypt — DST Root CA X3 Expiration](https://letsencrypt.org/docs/dst-root-ca-x3-expiration-september-2021/)
- [DigiCert — 47-day TLS Certificate Lifetimes](https://www.digicert.com/blog/tls-certificate-lifetimes-will-officially-reduce-to-47-days)
- [AppViewX — CA/B Forum Votes Yes to 47-day Certificates](https://www.appviewx.com/blogs/certificate-validity-period-47-days/)
- [SSL Store — TLS 1.3 Approved](https://www.thesslstore.com/blog/tls-1-3-approved/)
- [TLS 1.3 — Every Byte Explained (Michael Driscoll)](https://tls13.xargs.org/)
- [Illustrated TLS 1.3 (GitHub)](https://github.com/syncsynchalt/illustrated-tls13)

**News and reference.**

- [Wikipedia — Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security)
- [Wikipedia — Heartbleed](https://en.wikipedia.org/wiki/Heartbleed)
- [Wikipedia — DigiNotar](https://en.wikipedia.org/wiki/DigiNotar)
- [Wikipedia — DROWN attack](https://en.wikipedia.org/wiki/DROWN_attack)
- [Robotattack.org](https://robotattack.org/)
- [NIST FIPS 203 (ML-KEM)](https://csrc.nist.gov/publications/detail/fips/203/final)
- [Chrome Status — X25519MLKEM768](https://chromestatus.com/feature/5572538108870656)
