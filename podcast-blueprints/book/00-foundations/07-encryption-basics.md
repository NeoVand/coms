---
id: encryption-basics
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Encryption Basics
synopsis: What HTTPS actually protects — and what it doesn't.
podcast_target_minutes: 15
position_in_book: 8 of 75
listening_order:
  prev: foundations/client-server-p2p
  next: foundations/ai-protocols
related_protocols: [wifi, tls]
related_pioneers: []
related_outages: []
related_frontier: [pq-tls-x25519mlkem768]
related_rfcs: [8446]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Asymmetric_Cryptography.svg/500px-Asymmetric_Cryptography.svg.png
    caption: Public-key cryptography — sender encrypts with the recipient's public key; only the matching private key can decrypt.
    credit: Diagram — Wikimedia Commons / public domain
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Digital_certificates_chain_of_trust.png/500px-Digital_certificates_chain_of_trust.png
    caption: The X.509 chain of trust — a root CA signs an intermediate, which signs the leaf certificate your server presents.
    credit: Diagram — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "A browser address bar zoomed in on the padlock icon, with a callout arrow pointing to it labelled 'this means: bytes on the wire are unreadable.' A second arrow crossed out, labelled 'this does NOT mean: the server is honest.'"
  - "Side-by-side comparison: a single key labelled 'AES-256 / ChaCha20-Poly1305 — 10 Gbps per core' next to a paired public/private key labelled 'RSA-2048 / X25519 — 1000x slower.' Caption: symmetric is fast, asymmetric makes strangers possible."
  - "A TLS handshake split-screen — left side a slow asymmetric key exchange (a few hundred bytes), right side a fast symmetric data flow (gigabytes), connected by an arrow labelled 'shared secret.'"
  - "A three-link X.509 certificate chain rendered as nested signed envelopes: example.com -> DigiCert TLS Hybrid ECC SHA384 -> DigiCert Global Root G3, with the root marked 'pre-installed in your browser.'"
  - "A timeline of post-quantum rollout: Chrome 116 (Aug 2023, behind a flag), Chrome 124 (Apr 2024, default), NIST FIPS 203 (Aug 2024), iOS 26 / macOS Tahoe (Sep 2025, default on), Cloudflare ~52% PQ by Dec 2025."
---

# Part I, Chapter — Encryption Basics

## The hook

Without encryption, every byte you send across the internet is readable by anyone on the path — your ISP, the coffee-shop Wi-Fi router, every backbone carrier in between. The padlock icon in your browser bar means a single specific thing: the bytes between your browser and the server are unreadable to anyone else. It says nothing about whether the server on the other end is honest. Encryption is a property of the channel, not of either endpoint. This chapter is about what TLS actually gives you, and what it deliberately doesn't.

## The story

### What HTTPS Actually Protects

The padlock confirms one thing — that your traffic is encrypted to *some* server that proved it owned the certificate for the hostname you typed. It does not confirm the operator is honest, that your data is safe once it lands, or that the site isn't a phishing page that obtained a perfectly valid certificate. The mental model engineers need is small and precise: TLS — the protocol behind HTTPS — provides three guarantees, and only three.

**Confidentiality**: nobody on the path can read your bytes. **Integrity**: nobody can modify them without you noticing. **Authenticity**: you can verify the server is who its certificate claims it is. That's it. There is no non-repudiation. There is no end-to-end encryption beyond the channel — once the bytes arrive, the server decrypts them and does whatever it wants. There is no guarantee about how that server stores or processes your data afterwards. Knowing exactly what TLS gives you is the first step in not over-trusting it.

### Symmetric vs Asymmetric — The Core Distinction

Two families of encryption exist, with opposite trade-offs.

Symmetric encryption uses one key for both encrypting and decrypting. AES-256 and ChaCha20-Poly1305 are the modern standards. Both are extraordinarily fast — a current x86 CPU with AES-NI hardware acceleration encrypts at over 10 gigabits per second per core. The catch is key distribution. Both endpoints have to know the same secret key without an attacker learning it. If two parties have never met, they cannot just send the key over the network — anyone watching would steal it. For centuries, this was the unsolved problem of cryptography.

Asymmetric encryption uses two keys that are mathematically paired: a public key you give out freely, and a private key you keep on your server. Anything encrypted with the public key can only be decrypted with the private key, and vice versa. RSA-2048, X25519 over an elliptic curve, and the post-quantum ML-KEM-768 are the modern examples. The strength of asymmetric crypto is that two strangers can establish trust — I send you my public key over an open channel, you encrypt your secret with it, only I can read what you sent. The cost is brutal: asymmetric encryption is roughly a thousand times slower than symmetric for the same security level.

The combination is what makes the modern web tractable. You use slow asymmetric crypto once at the start of the connection to safely agree on a fast symmetric key, then use the symmetric key for all the bulk data. The slow operation is amortised across the whole conversation. The handshake is a few hundred bytes; the data behind it can be gigabytes. How TLS actually choreographs that exchange — the ClientHello, the key share, the Finished messages — is the front half of the TLS episode.

### Certificates and the Trust Chain

Asymmetric encryption alone is not enough. If a server hands you "here's my public key, encrypt to me," nothing prevents an attacker from intercepting the connection and handing you *their* public key — the classic man-in-the-middle attack. You'd encrypt to the attacker, who would decrypt, re-encrypt to the real server, and read everything in transit.

The fix is certificates. A certificate is a public key plus identity information — the hostname `example.com`, an expiration date, and so on — all signed by a Certificate Authority, a CA, using the CA's private key. Your browser ships with the public keys of around a hundred trusted root CAs already installed. When example.com hands you a certificate, your browser verifies the signature using the CA's public key. If the signature is valid, you know the certificate genuinely binds that public key to that hostname.

The certificate chain is usually two or three deep. A typical leaf might read `example.com`, signed by `DigiCert TLS Hybrid ECC SHA384`, signed by `DigiCert Global Root G3`. Only the root is pre-installed in your browser. The intermediate ships in the chain the server sends. The leaf is the actual hostname certificate. Each link is a digital signature your browser verifies. The PKI — the Public Key Infrastructure — is the entire global apparatus that makes this work: root CAs, audit requirements, browser inclusion programs, certificate transparency logs.

When the system breaks, the consequences are network-wide. It has broken, repeatedly — DigiNotar in 2011, Symantec in 2017, multiple smaller incidents in between. A compromised CA can issue a valid-looking certificate for any domain on the planet. That is why Certificate Transparency, specified in RFC 6962, now requires every issued certificate to be publicly logged. It makes rogue issuance discoverable, even if not preventable.

### Why TLS 1.3 Banned Everything Weak

TLS 1.3, published as RFC 8446 in 2018, was the first version to break wire compatibility with its predecessors. It removed RC4. It removed 3DES. It removed MD5, SHA-1, RSA key exchange, and every CBC-mode cipher. What remained was a short list: ChaCha20-Poly1305 and AES-GCM for the bulk encryption, X25519 and ECDH for the key exchange. The cleanup was overdue. Every weak cipher TLS still allowed had been weaponised in a published attack — BEAST, CRIME, BREACH, Lucky 13, FREAK, Logjam, ROBOT. Each was a paper, a CVE, and an emergency patch cycle. TLS 1.3 also reduced the handshake to one round-trip for new connections and zero for resumptions — substantially faster than 1.2. The full mechanism of that handshake is the TLS episode.

### The Post-Quantum Frontier

The cryptography securing every TLS connection today — X25519 ECDH for key exchange, EdDSA or RSA for signatures — is vulnerable to quantum computers that can run Shor's algorithm at scale. No such machine exists yet. Current devices are at a few thousand noisy qubits. You need millions of error-corrected qubits to break X25519. But the threat is not future tense.

An adversary recording your encrypted traffic *today* can store it indefinitely and decrypt it whenever a working quantum computer arrives. The strategy has a name: harvest now, decrypt later. For data that needs to stay secret for decades — state secrets, medical records, long-lived contracts — the threat is real now, even if the hardware isn't.

The fix is rolling out fast. NIST finalised post-quantum standards in August 2024 — ML-KEM, ML-DSA, SLH-DSA. The deployed solution is hybrid: combine the existing X25519 with the new ML-KEM-768 such that an attacker has to break both to recover the key. The named cipher X25519MLKEM768 is now the default in Chrome 124 and later, in Cloudflare's TLS termination, and in iOS 26. By the end of 2026, most TLS handshakes on the internet will be post-quantum-secure. The deployment lesson is worth pausing on: the cryptography community shipped useful primitives years before the hardware threat materialised, and the deployment ecosystem rolled them out in months.

## The figures

### Frontier — Post-Quantum Hybrid TLS (X25519MLKEM768)

Chrome 116 in August 2023 shipped X25519Kyber768 behind a flag. Chrome 124 in April 2024 made it default. NIST published FIPS 203 — ML-KEM, formerly Kyber — on the 13th of August 2024, which forced a new TLS codepoint, 0x11EC, for X25519MLKEM768. Chrome 131 in November 2024 switched to it; Firefox 132, Edge 131, and OpenJDK via JEP 527 followed.

Apple iOS 26 and macOS Tahoe 26, in September 2025, turned X25519MLKEM768 on by default for all TLS 1.3 in Apple's Network.framework. Within four days, iOS post-quantum traffic share went from under 2 percent to 11 percent, and to over 25 percent by December 2025. By the end of 2025, around 52 percent of all TLS 1.3 requests to Cloudflare carried PQ key agreement. The lattice-based KEM is twice the size of X25519 alone, so the handshake costs a few extra TCP packets — measurable, but not user-visible. The full launch entry lives on the Frontier page.

### RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3

Published in 2018 by Eric Rescorla as a Proposed Standard. It obsoletes RFCs 5077, 5246, and 6961 — effectively the entire previous TLS specification. The notable sections are §5 (the Record Protocol that frames every encrypted message), §7.1 (the HKDF-Extract / HKDF-Expand-Label key schedule), and Appendix D.4 (the middlebox-compatibility hacks that make TLS 1.3 look like TLS 1.2 on the wire so that ossified network gear lets it through). It is the document every modern TLS implementation cites.

## Listening order

- **Before this chapter:** *Client-Server vs Peer-to-Peer* — that chapter sets up where the trust boundaries actually sit in a connection, which is exactly the question encryption answers next: the channel between two endpoints is what TLS protects, and nothing else.
- **After this chapter:** *Protocols for AI Agents* — once you understand what HTTPS does and doesn't guarantee, the question of how autonomous agents authenticate themselves to services and to each other becomes the next frontier.

## Where to go deeper

- The TLS episode picks up the mechanism story — the 1-RTT handshake, the cipher suites, certificate validation, session resumption, what it costs in production today. If you wanted the *why* of the padlock, this chapter; if you want the *how* of every TLS extension in 2026, the TLS episode.
- The Wi-Fi episode is the wireless counterpart — WPA2 and WPA3 add encryption and a 4-way handshake on top of 802.11 because every station within range can hear every frame. Same problem as the open internet, scoped to a single radio cell.
- The post-quantum hybrid TLS launch on the Frontier page tracks the rollout numbers in real time — Chrome, Firefox, Apple, Cloudflare, OpenJDK — as X25519MLKEM768 marches from "behind a flag" to "the default everywhere."

## Visual cues for image generation

(See frontmatter `visual_cues` block.)

## Sources

- [Cloudflare — The state of the post-quantum internet in 2025](https://blog.cloudflare.com/pq-2025/)
- [NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism Standard](https://csrc.nist.gov/pubs/fips/203/final)
- [RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
