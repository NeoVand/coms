---
prompt_source: deep-research-prompts.txt:865-1036 (CATEGORY · UTILITIES / SECURITY)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/9f1eccf8-5f18-4723-a4c0-98c8a402bf8c
research_mode: claude.ai Research
---

# Utilities / Security: The Invisible Infrastructure

*A research report for engineers, prepared 5 May 2026. All claims are sourced; where a claim could not be verified, it is flagged `[needs source]`.*

---

## Prerequisites and glossary

Before any of the protocols in this group make sense, a reader needs the following primitives. Each is paired with a current authoritative explainer.

- **Bit / byte / packet / frame.** A *packet* is the unit at the Internet (IP) layer; a *frame* is the link-layer envelope. See Cloudflare Learning, "What is a packet?" ([https://www.cloudflare.com/learning/network-layer/what-is-a-packet/](https://www.cloudflare.com/learning/network-layer/what-is-a-packet/)).
- **OSI vs. TCP/IP layering.** OSI's 7-layer model (physical, data link, network, transport, session, presentation, application) is taught; TCP/IP's 4-layer (link, internet, transport, application) is reality. Most "utilities/security" protocols live at L7 with deep hooks into L4. See Cloudflare, "What is the OSI model?" ([https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)).
- **TCP vs UDP vs QUIC.** TCP gives reliable, ordered, congestion-controlled byte streams. UDP gives best-effort datagrams. QUIC (RFC 9000) is a UDP-based, encrypted, multiplexed transport that merges transport and TLS handshakes. ([https://www.rfc-editor.org/info/rfc9000](https://www.rfc-editor.org/info/rfc9000))
- **Symmetric vs asymmetric cryptography.** Symmetric (AES, ChaCha20) shares a secret; asymmetric (RSA, ECDSA, Ed25519, ML-DSA) uses a keypair. Modern protocols use asymmetric for *authentication and key exchange*, symmetric for *bulk encryption*. Reference: Boneh & Shoup, *A Graduate Course in Applied Cryptography* v0.6, 2023 ([https://toc.cryptobook.us/](https://toc.cryptobook.us/)).
- **AEAD (Authenticated Encryption with Associated Data).** Encrypt-and-MAC primitive (AES-GCM, ChaCha20-Poly1305) that protects confidentiality *and* integrity in one operation. Used in TLS 1.3, SSH, WireGuard, NTS, QUIC. RFC 5116 ([https://www.rfc-editor.org/info/rfc5116](https://www.rfc-editor.org/info/rfc5116)).
- **Diffie–Hellman / ECDHE.** Key-agreement scheme that lets two parties derive a shared secret over a public channel. *Ephemeral* DH gives forward secrecy.
- **Forward secrecy.** Compromise of long-term keys today does not decrypt yesterday's recorded sessions.
- **PKI and X.509.** Public Key Infrastructure binds a name to a key via a *certificate* signed by a CA. X.509 is the certificate format. RFC 5280 ([https://www.rfc-editor.org/info/rfc5280](https://www.rfc-editor.org/info/rfc5280)).
- **Hash functions and MACs.** SHA-256/SHA-3 produce fixed-length digests; HMAC keys a hash for integrity.
- **Nonce / IV.** A "number used once" that prevents replay and keystream reuse. AEAD modes fail catastrophically on nonce reuse.
- **TTL / lease / cache.** Time-to-live values bound how long a resolver, ARP entry, or DHCP binding may be reused.
- **Resolver, recursive vs authoritative (DNS terminology).** A *stub* asks; a *recursive resolver* walks the tree; an *authoritative server* owns the zone.
- **Trust anchor.** A root key/certificate hard-coded in a relying party (browser root store, DNSSEC root KSK, etc.).
- **MITM, replay, downgrade, amplification.** The four canonical network attacks every member of this group must defend against.
- **Zero Trust.** A design principle, popularised by NIST SP 800-207 (2020), that abolishes the network perimeter and authenticates every request ([https://csrc.nist.gov/pubs/sp/800/207/final](https://csrc.nist.gov/pubs/sp/800/207/final)).
- **Post-quantum cryptography (PQC).** Cryptography believed secure against Shor's algorithm. NIST finalised three standards in August 2024: FIPS 203 (ML-KEM, formerly Kyber), FIPS 204 (ML-DSA, formerly Dilithium), FIPS 205 (SLH-DSA, formerly SPHINCS+) ([https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)). [arxiv](https://arxiv.org/pdf/2404.13544)

---

## The arc of the group

There was no single "Utilities/Security" group declared in any RFC. It is a retrospective category for the protocols that make the rest of the Internet usable: they answer *who am I talking to?*, *what time is it?*, *what's my address?*, *is this the real server?*, *can I trust this name?*. Their architects mostly worked in a tight community of US research institutions between 1971 and 1999.

**1971 – FTP at MIT.** Abhay Bhushan publishes RFC 114, the File Transfer Protocol, the first standalone application protocol over the ARPANET. ([https://www.rfc-editor.org/info/rfc114](https://www.rfc-editor.org/info/rfc114)) Browsers Chrome 95 (Oct 2021) and Firefox 90 (July 2021) finally removed FTP support, citing its plaintext design. ([https://www.theregister.com/2021/10/20/ftp_chrome_95/](https://www.theregister.com/2021/10/20/ftp_chrome_95/); [https://www.theregister.com/2021/07/21/firefox_ends_ftp_support/](https://www.theregister.com/2021/07/21/firefox_ends_ftp_support/)) [How-To Geek](https://www.howtogeek.com/744569/chrome-and-firefox-killed-ftp-support-heres-an-easy-alternative/)

**1981–83 – sendmail and SMTP at UC Berkeley.** Eric Allman wrote *delivermail* (1979) and then *sendmail*, shipping with 4.1c BSD in 1983 — the first BSD with TCP/IP. SMTP itself was specified by Jon Postel in RFC 821 (1982). At its peak around 1996, sendmail ran ~80% of the Internet's reachable mail servers. ([https://en.wikipedia.org/wiki/Sendmail](https://en.wikipedia.org/wiki/Sendmail); [https://www.internethalloffame.org/inductee/eric-allman/](https://www.internethalloffame.org/inductee/eric-allman/)) Allman also wrote *syslog*, originally a sendmail debug log that became the de facto Unix logging protocol (later RFC 5424). [Wikipedia + 2](https://en.wikipedia.org/wiki/Sendmail)

**1983 – DNS at USC ISI.** Paul Mockapetris, working under Jon Postel, replaced the centralized HOSTS.TXT file with a distributed, hierarchical name system in RFC 882 / RFC 883 (Nov 1983), updated in RFC 973 (Jan 1986), then re-issued as the still-current RFC 1034/1035 in November 1987. ([https://en.wikipedia.org/wiki/Domain_Name_System](https://en.wikipedia.org/wiki/Domain_Name_System); [https://www.internethalloffame.org/inductee/paul-mockapetris/](https://www.internethalloffame.org/inductee/paul-mockapetris/)) [USC Viterbi | School of Engineering](https://viterbischool.usc.edu/news/2003/06/isi-marks-20th-anniversary-of-domain-name-system/)[Wikipedia](https://en.wikipedia.org/wiki/Domain_Name_System)

**1985 – NTP at the University of Maryland / Delaware.** David L. Mills designed the *Fuzzball* router and the Network Time Protocol; NTP was first deployed in 1985 on the 56 kbps NSFNET backbone built from six Fuzzballs. NTPv4 (RFC 5905, 2010) is the current revision. Mills died on 17 January 2024 at 85. ([https://www.theregister.com/2024/01/23/david_mills_obit/](https://www.theregister.com/2024/01/23/david_mills_obit/); [https://eecs.engin.umich.edu/stories/remembering-alum-david-mills-who-brought-the-internet-into-perfect-time](https://eecs.engin.umich.edu/stories/remembering-alum-david-mills-who-brought-the-internet-into-perfect-time)) [Umich](https://eecs.engin.umich.edu/stories/remembering-alum-david-mills-who-brought-the-internet-into-perfect-time)[The Register](https://www.theregister.com/2024/01/23/david_mills_obit/)

**1986 – IMAP at Stanford.** Mark Crispin invents IMAP at the Stanford Knowledge Systems Lab as a successor to POP, allowing server-side mailboxes. He continued to maintain UW IMAP at the University of Washington from 1988 to 2008 and died in December 2012. The IMAP4rev1 base spec is RFC 3501 (2003); IMAP4rev2 is RFC 9051 (2021). ([https://en.wikipedia.org/wiki/Mark_Crispin](https://en.wikipedia.org/wiki/Mark_Crispin)) [Wikipedia + 3](https://en.wikipedia.org/wiki/Mark_Crispin)

**1993 – DHCP at Bucknell / IETF.** Ralph Droms's DHCP (RFC 1531/2131) replaces the static-address BOOTP world. ([https://www.rfc-editor.org/info/rfc2131](https://www.rfc-editor.org/info/rfc2131))

**1995 – SSH in Helsinki.** Tatu Ylönen at Helsinki University of Technology writes SSH-1 in response to a password-sniffing attack on his network and releases it as free software in July 1995; by year-end 20,000 users in 50 countries are running it. He chose port 22 because it sat between telnet (23) and FTP (21), and asked IANA for it. OpenBSD's OpenSSH (1999) becomes the dominant implementation. ([https://en.wikipedia.org/wiki/Secure_Shell](https://en.wikipedia.org/wiki/Secure_Shell); [https://machaddr.substack.com/p/ssh-the-origins-of-how-tatu-ylonen](https://machaddr.substack.com/p/ssh-the-origins-of-how-tatu-ylonen)) [O'Reilly + 2](https://www.oreilly.com/library/view/ssh-the-secure/0596008953/ch01s05.html)

**1994–99 – SSL/TLS at Netscape and the IETF.** Taher Elgamal, Netscape's chief scientist 1995–98, designs SSL 1.0 (never released), then SSL 2.0 (Feb 1995, with Navigator 1.1) and SSL 3.0 (1996, with Paul Kocher). The IETF takes over and renames it TLS 1.0 (RFC 2246, January 1999). Elgamal and Kocher won the 2019 Marconi Prize for the work. ([https://en.wikipedia.org/wiki/Taher_Elgamal](https://en.wikipedia.org/wiki/Taher_Elgamal)) [Grokipedia + 3](https://grokipedia.com/page/Taher_Elgamal)

**2008 – the Kaminsky moment.** On 8 July 2008, Dan Kaminsky coordinates a multi-vendor patch for a fundamental DNS cache-poisoning flaw (CVE-2008-1447): a 16-bit transaction ID plus a fixed source port made forging delegation responses easy. The fix added source-port randomization, raising the entropy to ~32 bits, and accelerated the long campaign for DNSSEC. ([https://kb.isc.org/docs/aa-00924](https://kb.isc.org/docs/aa-00924); [https://en.wikipedia.org/wiki/Dan_Kaminsky](https://en.wikipedia.org/wiki/Dan_Kaminsky)) [SEC Consult](https://sec-consult.com/blog/detail/taking-over-a-country-kaminsky-style/)[ISC](https://kb.isc.org/docs/aa-00924)

**2018 – TLS 1.3.** RFC 8446, edited by Eric Rescorla (Mozilla), publishes after four years and 28 drafts. It removes RSA key transport, makes ephemeral DH and AEAD mandatory, encrypts most of the handshake, and introduces 1-RTT and 0-RTT modes. ([https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)) [Cloudflare + 3](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)

**2024 – generational change.** David Mills dies in January 2024 ([https://www.theregister.com/2024/01/23/david_mills_obit/](https://www.theregister.com/2024/01/23/david_mills_obit/)); NIST publishes the first three post-quantum standards in August 2024 ([https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)); the XZ Utils backdoor (CVE-2024-3094) nearly compromises every systemd-based SSH server in the world ([https://en.wikipedia.org/wiki/XZ_Utils_backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor)). The "invisible infrastructure" becomes very visible.

The architects share a pattern: small academic teams (BBN, USC ISI, MIT Athena, Berkeley CSRG, Helsinki UT, Cambridge), heavy IETF participation, source-available reference implementations (BIND, sendmail, OpenSSH, OpenSSL), and a persistent under-resourcing problem that XZ made impossible to ignore.

---

## Members and their roles

**Verified original list:**

- **TLS — Transport Layer Security (1999, current TLS 1.3 = RFC 8446, 2018).** The default confidentiality and authentication layer for TCP and (via DTLS / QUIC) UDP. An engineer reaches for TLS whenever bytes traverse an untrusted path and the application speaks TCP.
- **SSH — Secure Shell (1995, SSH-2 standardized RFC 4251–4254, 2006).** Interactive remote shell, file transfer (SFTP/SCP), and arbitrary tunneling, all keyed by host and user public keys. Niche: human-driven and machine-driven server administration; what Tatu Ylönen called "the protocol that runs every data center".
- **DNS — Domain Name System (1983, RFC 1034/1035).** Hierarchical, cache-friendly mapping of names to records (A, AAAA, MX, TXT, SRV, HTTPS/SVCB, etc.). Niche: the only globally distributed database that every device on the Internet trusts and queries before doing anything else.
- **DHCP — Dynamic Host Configuration Protocol (1993, RFC 2131; DHCPv6 RFC 8415).** Hands out IP address, gateway, DNS resolver, NTP server, and a thousand option codes via leases. Niche: bootstrap; the very first conversation a new device has on a LAN.
- **NTP — Network Time Protocol (1985, NTPv4 RFC 5905).** Hierarchical clock-discipline algorithm tolerating asymmetric latency. Niche: keeping a fleet within milliseconds of UTC so that TLS certificates, Kerberos tickets, log timestamps, and TOTP codes work at all.
- **SMTP — Simple Mail Transfer Protocol (RFC 821, 1982; current RFC 5321).** Server-to-server email transport, command/response over TCP. Niche: the one protocol that every organisation still federates over the open Internet.
- **FTP — File Transfer Protocol (1971, RFC 959).** Two-channel (control/data) byte transfer. Niche today: legacy. Production traffic has migrated to SFTP (over SSH), FTPS (FTP-over-TLS), HTTPS, or object storage. Browsers removed it in 2021.
- **IMAP — Internet Message Access Protocol (1986, IMAP4rev1 RFC 3501; IMAP4rev2 RFC 9051, 2021).** Client/server mailbox access with server-side state, search, and folders. Niche: "the mailbox lives on the server" — distinct from POP3, where mail is downloaded and deleted.
- **OAuth 2.0 (RFC 6749, 2012; security BCP RFC 9700, January 2025).** Delegated authorization framework: a user grants a client limited access to resources at a server, brokered via tokens, without sharing credentials. Niche: third-party app authorization and (with OIDC) federated login. [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)[IETF](https://datatracker.ietf.org/doc/rfc9700/)

**Members the user missed that clearly belong:**

- **Kerberos (RFC 4120, 2005; v4 1989, v5 1993).** Symmetric-key SSO via tickets, born of MIT Project Athena in the 1980s. Still the auth fabric of every Active Directory domain. ([https://kerberos.org/docs/index.html](https://kerberos.org/docs/index.html)) [WireX](https://wirexsystems.com/resource/protocols/kerberos/)[Grokipedia](https://grokipedia.com/page/Kerberos_(protocol))
- **LDAP (RFC 4511, 2006).** Lightweight Directory Access Protocol — the X.500 descendant that backs corporate user directories.
- **RADIUS (RFC 2865) and Diameter (RFC 6733).** AAA: authenticate Wi-Fi, VPN, and ISP subscribers.
- **SNMP (RFC 3411 series) and syslog (RFC 5424).** The two oldest network-management/observability protocols.
- **DNSSEC (RFC 4033/4034/4035).** Cryptographic signatures over DNS records — the *only* defence against Kaminsky-class poisoning. The 2024-26 root KSK rollover is in progress; KSK-2024 was published 11 January 2025 with 91.3% resolver uptake by March 2025. ([https://blog.verisign.com/security/2024-2026-root-zone-ksk-rollover-initial-observations/](https://blog.verisign.com/security/2024-2026-root-zone-ksk-rollover-initial-observations/)) [Dnsafrica](https://www.resource.dnsafrica.org/2025/03/19/the-2024-2026-root-zone-ksk-rollover-initial-observations-and-early-trends-circleid/)[Verisign](https://blog.verisign.com/security/2024-2026-root-zone-ksk-rollover-initial-observations/)
- **DoT (RFC 7858) / DoH (RFC 8484) / DoQ (RFC 9250).** Encrypted DNS transports. Quad9 enabled both DoH3 and DoQ globally in 2026. ([https://quad9.net/news/blog/quad9-enables-dns-over-http-3-and-dns-over-quic/](https://quad9.net/news/blog/quad9-enables-dns-over-http-3-and-dns-over-quic/)) [blog](https://blog.massapi.com/posts/2026-03-30-1750-quad9-enables-dns-over-http3-and-dns-over-quic/)
- **ACME (RFC 8555).** Let's Encrypt's certificate-issuance protocol. Let's Encrypt issued >10 M certificates per day in late 2025 and announced a roadmap to 45-day certificate lifetimes by Feb 2028. ([https://letsencrypt.org/2025/12/02/from-90-to-45](https://letsencrypt.org/2025/12/02/from-90-to-45); [https://letsencrypt.org/2025/12/09/10-years](https://letsencrypt.org/2025/12/09/10-years)) [Let's Encrypt](https://letsencrypt.org/2025/12/09/10-years)[Certkit](https://www.certkit.io/blog/45-day-certificates)
- **IPsec (RFC 4301) and WireGuard.** Network-layer VPN tunnels. WireGuard, by Jason Donenfeld, was merged into the Linux 5.6 kernel on 28 January 2020 and remains famous for being ~4 kLOC. ([https://en.wikipedia.org/wiki/WireGuard](https://en.wikipedia.org/wiki/WireGuard)) [Wikipedia](https://en.wikipedia.org/wiki/WireGuard)[FOSDEM](https://archive.fosdem.org/2017/interviews/jason-a-donenfeld/)
- **NTS — Network Time Security (RFC 8915, October 2020).** TLS-1.3 key establishment plus AEAD-authenticated NTP packets. Cloudflare and Netnod run public NTS servers; chrony, NTPsec, and ntpd-rs implement it. ([https://blog.cloudflare.com/nts-is-now-rfc/](https://blog.cloudflare.com/nts-is-now-rfc/)) [Internet Society](https://www.internetsociety.org/blog/2020/10/nts-rfc-published-new-standard-to-ensure-secure-time-on-the-internet/)
- **Roughtime (draft-ietf-ntp-roughtime, in WGLC 2024–25).** Authenticated *rough* time + a malfeasance-reporting ecosystem, by Adam Langley/Watson Ladd; useful for IoT devices that don't yet know what time it is. ([https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/](https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/)) [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-roughtime-12)[RIPE Labs](https://labs.ripe.net/author/robert-allen/roughtime-securing-time-for-iot-devices/)
- **OAuth 2.1 (draft-ietf-oauth-v2-1) and GNAP (RFC 9635, October 2024).** OAuth 2.1 is OAuth 2.0 with the insecure flows removed. GNAP is a clean-slate successor. ([https://oauth.net/gnap/](https://oauth.net/gnap/); [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) [Descope](https://www.descope.com/blog/post/oauth-2-0-vs-oauth-2-1)[IETF](https://datatracker.ietf.org/doc/html/draft-ietf-gnap-core-protocol)
- **OpenID Connect, SAML 2.0, FIDO2 / WebAuthn / passkeys.** The federation and passwordless layer. WebAuthn Level 3 working draft published 27 January 2025 ([https://www.w3.org/TR/webauthn-3/](https://www.w3.org/TR/webauthn-3/)). The FIDO Alliance reports >1 billion passkeys created and 8 of the top 10 sites supporting them as of 2025. ([https://www.1password.community/blog/random-but-memorable/the-state-of-passkeys-in-2025/163464](https://www.1password.community/blog/random-but-memorable/the-state-of-passkeys-in-2025/163464)) [W3C](https://www.w3.org/TR/passkey-endpoints/)[1Password](https://www.1password.community/blog/random-but-memorable/the-state-of-passkeys-in-2025/163464)
- **mTLS, JOSE/JWT, SCRAM, SASL, X.509, OCSP, Certificate Transparency (RFC 6962 / RFC 9162).** The plumbing of identity. Let's Encrypt operates the new Static-CT-API "Sycamore" and "Willow" logs based on Filippo Valsorda's Sunlight design and is shutting down its RFC-6962 logs in February 2026. ([https://letsencrypt.org/2025/08/14/rfc-6962-logs-eol](https://letsencrypt.org/2025/08/14/rfc-6962-logs-eol); [https://sunlight.dev/](https://sunlight.dev/)) [Let's Encrypt](https://letsencrypt.org/docs/ct-logs/)
- **RPKI (RFC 6480 series; ROA profile RFC 9582, 2024).** Cryptographic origin validation for BGP. ~54% of IPv4 routes and ~52% of IPv6 routes were ROA-covered by end of 2024; ~70% of IP traffic now goes to RPKI-valid destinations. ([https://manrs.org/2025/01/rpki-growth-2024/](https://manrs.org/2025/01/rpki-growth-2024/); [https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/](https://nanog.org/stories/articles/rpki-rov-deployment-reaches-major-milestone/)) [MANRS](https://manrs.org/2025/01/rpki-growth-2024/)
- **DKIM (RFC 6376), SPF (RFC 7208), DMARC (RFC 7489), MTA-STS (RFC 8461), TLS-RPT (RFC 8460), BIMI.** Email authentication. Google and Yahoo enforced DMARC for bulk senders (≥5,000/day) starting 1 February 2024; Microsoft followed 5 May 2025; Gmail tightened to outright rejection in November 2025. ([https://dmarcian.com/yahoo-and-google-dmarc-required/](https://dmarcian.com/yahoo-and-google-dmarc-required/); [https://powerdmarc.com/google-and-yahoo-email-authentication-requirements/](https://powerdmarc.com/google-and-yahoo-email-authentication-requirements/)) [Security Boulevard + 2](https://securityboulevard.com/2025/11/google-and-yahoo-updated-email-authentication-requirements-for-2025/)
- **JMAP (RFC 8620 / 8621, 2019).** Fastmail's JSON-over-HTTP successor to IMAP and SMTP submission. Cyrus IMAP shipped JMAP support in 3.8.3 (May 2024). ([https://jmap.io/](https://jmap.io/)) [JMAP + 2](https://jmap.io/)
- **mDNS / DNS-SD, ARP / NDP, mTLS in service meshes (Istio, SPIFFE/SPIRE).** Local discovery and east–west authentication.

**Excluded (don't belong):** OSPF, IS-IS (interior routing — separate group); BGP itself (routing, though RPKI is a security overlay); MQTT/AMQP/CoAP (messaging); RTP/SRTP/SIP (real-time media); HTTP/gRPC (web/API). LLMNR is excluded because Microsoft began disabling it by default in Windows 11 22H2 due to spoofing risks. [needs source for exact 22H2 default change]

---

## Internal taxonomy

A useful matrix has six axes:

| Axis | Naming | Time | Config | Authn/Authz | Encryption / channel | Transport of data |
|---|---|---|---|---|---|---|
| Members | DNS, mDNS, DNS-SD, LDAP | NTP, NTS, PTP, Roughtime | DHCP, DHCPv6, RA | Kerberos, RADIUS, OAuth, OIDC, SAML, FIDO2/WebAuthn, SCRAM/SASL | TLS, DTLS, SSH, IPsec, WireGuard, ECH, mTLS | SMTP, IMAP, JMAP, FTP/SFTP, ACME |

Cross-cutting axes:

- **Stateful (TCP-based: SSH, IMAP, SMTP, LDAP, FTP control) vs stateless (UDP-based: DNS, NTP, DHCP, original Kerberos, syslog).**
- **Push vs pull:** SMTP pushes, IMAP/POP/JMAP pull, DHCP request/offer is pull-with-broadcast.
- **Connection-oriented vs datagram:** TLS over TCP vs DTLS over UDP vs QUIC.
- **Unicast vs multicast/broadcast:** DHCP, mDNS, NDP rely on link-local multicast; everything else unicast.
- **Caching hierarchies:** DNS resolvers → authoritative; NTP stratum 0 → 1 → 2; CT log monitors → logs; OCSP responders → CAs.
- **Trust roots:** browser/OS root store (TLS), DNSSEC root KSK, RPKI Trust Anchor Locator per RIR, organisational AD (Kerberos), federation IdP (SAML/OIDC).

**Decision tree for engineers:**

1. *Need to give a thing a name?* DNS (global), mDNS/DNS-SD (LAN), LDAP (corporate directory).
2. *Need to authenticate humans?* OIDC + WebAuthn/passkeys for new builds; SAML if integrating with enterprise; Kerberos if you live in AD.
3. *Need to authenticate machines/services?* mTLS with SPIFFE IDs in a mesh; OAuth 2.0 client-credentials for APIs; SSH host keys for shell. [Teleport](https://goteleport.com/blog/how-to-secure-microservices-spiffe-istio/)
4. *Need to encrypt a TCP byte stream?* TLS 1.3.
5. *Need to encrypt UDP / build a tunnel?* QUIC if it's app-layer; WireGuard or IPsec if it's a network tunnel.
6. *Need to know the time?* NTP with NTS authentication; Roughtime as a sanity check; PTP if you need sub-microsecond.
7. *Need to ship config?* DHCP/DHCPv6, plus RA for IPv6.
8. *Need to issue certificates?* ACME (RFC 8555).

---

## How this group interacts with other protocol groups

This group is the *connective tissue*. It sits mostly at L7 but reaches downward.

- **With the link/internet layer (Ethernet, Wi-Fi, IP, ARP, NDP):** DHCP and SLAAC bootstrap addresses; ARP/NDP resolve them on the wire. RPKI is a security overlay on BGP. Without ARP, even DNS can't get its first packet out. Kaminsky-class poisoning, ARP spoofing, and BGP hijack are the same attack at three different layers.
- **With transport (TCP/UDP/QUIC):** TLS rides TCP; DTLS and QUIC ride UDP. QUIC merges the TCP and TLS handshakes into one round-trip and is now the substrate for HTTP/3, DoQ, and (in drafts) MASQUE-based SSH. [Quad9](https://quad9.net/news/blog/quad9-enables-dns-over-http-3-and-dns-over-quic/)
- **With web/API protocols (HTTP, gRPC, GraphQL):** OAuth/OIDC, JWT, mTLS and ACME are the security fabric. HTTP/3 is a TLS+QUIC composite. ECH (Encrypted Client Hello) hides the SNI by piggybacking on DNS HTTPS records (RFC 9460, Nov 2023) — a direct dependency of DNS on TLS and vice versa. ([https://blog.cloudflare.com/announcing-encrypted-client-hello/](https://blog.cloudflare.com/announcing-encrypted-client-hello/))
- **With messaging/IoT (MQTT, AMQP, CoAP):** They reuse TLS or DTLS, and increasingly OAuth-bearer tokens; CoAP-over-DTLS adds NTP/Roughtime dependence for cert-validity windows.
- **With real-time media (RTP, SRTP, WebRTC, SIP):** WebRTC negotiates DTLS-SRTP keys; SIP commonly uses TLS for signaling; STUN/TURN sit alongside.
- **Bidirectional dependencies (the famous loops):** TLS depends on accurate time; NTS depends on TLS to bootstrap (chicken-and-egg, partially solved by leap-of-faith first sync); DNSSEC depends on RSA/ECDSA, which depend on time; ACME depends on DNS (DNS-01) or HTTP (HTTP-01); WebPKI depends on CT logs; CT logs depend on the WebPKI they audit. The "invisible infrastructure" is a graph, not a stack.

---

## Common patterns and failure modes

**Recurring patterns**

- **Three-way handshake / challenge-response / nonces.** TCP SYN-SYNACK-ACK; TLS ClientHello-ServerHello-Finished; SSH KEXINIT exchange; Kerberos TGT request; OAuth PKCE challenge.
- **Heartbeats and keep-alives.** TLS heartbeat (the Heartbleed surface), SSH keep-alives, BGP hold timers, NTP polling.
- **Sliding windows and exponential backoff.** TCP, DNS retry, ACME polling.
- **Leases and TTLs.** DHCP leases, DNS TTLs, OAuth access tokens, Kerberos ticket lifetimes, certificate validity, NTS cookies.
- **Certificate chains and trust anchors.** WebPKI, code-signing, DNSSEC, RPKI all share the structure.
- **Caching hierarchies.** DNS resolver tree, OCSP/CRL distribution, CT log shards.
- **Fallback chains and downgrade attacks.** STARTTLS in SMTP/IMAP, "TLS_FALLBACK_SCSV" in TLS, SSH cipher negotiation. Each fallback is an attack surface — see POODLE, FREAK, Logjam, DROWN, ROBOT.
- **Content negotiation / capability advertisement.** EHLO in SMTP, CAPABILITY in IMAP, ALPN in TLS, DNSSEC OK bit, ECH GREASE.

**Group-wide failure modes**

- **Cache poisoning** (DNS Kaminsky, ARP, web cache).
- **MITM** (any STARTTLS, any opportunistic-encryption protocol).
- **Replay** (NTP without NTS, Kerberos without ticket-lifetime check).
- **Downgrade** (POODLE on SSL 3.0 → TLS, STARTTLS-stripping in SMTP, SNI sniffing pre-ECH).
- **DDoS amplification.** DNS, NTP (monlist), memcached, SSDP, CLDAP — any UDP query that returns much more than it asks for. The 2016 Mirai/Dyn attack reached ~1 Tbps. ([https://en.wikipedia.org/wiki/DDoS_attacks_on_Dyn](https://en.wikipedia.org/wiki/DDoS_attacks_on_Dyn)) [New Jersey Cybersecurity](https://www.cyber.nj.gov/threat-landscape/malware/botnets/mirai)
- **Time-shift attacks.** Set the clock back 10 years, every certificate is valid again. NTS exists because of this.
- **Hijacking.** BGP, DNS, certificate misissuance — all forms of "say something authoritative you weren't authorized to say." See Squarespace 2024, DigiNotar 2011, ComodoHacker 2011.
- **Key compromise.** Heartbleed (2014, CVE-2014-0160) leaked TLS private keys from up to ~17% of secure web servers via a missing bounds-check on a heartbeat extension. ([https://en.wikipedia.org/wiki/Heartbleed](https://en.wikipedia.org/wiki/Heartbleed)) [Wikipedia](https://en.wikipedia.org/wiki/Heartbleed)[CISA](https://www.cisa.gov/news-events/alerts/2014/04/08/openssl-heartbleed-vulnerability-cve-2014-0160)
- **Supply-chain compromise.** XZ Utils 5.6.0/5.6.1 (CVE-2024-3094, CVSS 10.0): a multi-year social-engineering campaign by "Jia Tan" planted a backdoor in liblzma that hooked sshd via systemd; caught by Microsoft's Andres Freund chasing a 500 ms SSH login regression on Debian sid in March 2024. As of August 2025 Binarly still found ~35 backdoored Docker Hub images. ([https://en.wikipedia.org/wiki/XZ_Utils_backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor); [https://thehackernews.com/2025/08/researchers-spot-xz-utils-backdoor-in.html](https://thehackernews.com/2025/08/researchers-spot-xz-utils-backdoor-in.html)) [Wikipedia + 2](https://en.wikipedia.org/wiki/XZ_Utils_backdoor)

---

## Industry timeline

- **1971–82:** FTP, telnet, SMTP — plaintext era.
- **1983–92:** DNS, NTP, IMAP, SNMP, Kerberos, BGP — distributed-systems era.
- **1993–99:** DHCP, SSH, SSL/TLS — security-retrofit era.
- **2000–10:** SPF (2006), DKIM (2007), DMARC (2012), TLS 1.1/1.2, OAuth 1/2, IPv6 NDP, DNSSEC root signed in 2010.
- **2011–18:** Snowden → encrypted everything: HTTPS Everywhere, Let's Encrypt (2015), TLS 1.3 (2018), HTTP/2, DoH/DoT, CT (RFC 6962, then RFC 9162 in 2021).
- **2019–23:** WireGuard mainline (2020), QUIC (RFC 9000, 2021), NTS (RFC 8915, 2020), HTTP/3 (RFC 9114, 2022), DoQ (RFC 9250, 2022), passkeys announced (May 2022).
- **Last 24 months (2024–26) — what changed:**
- NIST finalises FIPS 203/204/205 in August 2024.
- Cloudflare reports ~38% of human HTTPS traffic uses hybrid X25519+ML-KEM-768 by March 2025 ([https://blog.cloudflare.com/post-quantum-cryptography-ubiquity/](https://blog.cloudflare.com/post-quantum-cryptography-ubiquity/); figure as quoted in [https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)). [Intelligent Living](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)
- AWS deploys ML-KEM hybrid PQ key exchange to KMS, ACM and Secrets Manager (Mar 2025), with a 2026 deprecation of the pre-standard CRYSTALS-Kyber. ([https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/)) [AWS](https://aws.amazon.com/blogs/security/ml-kem-post-quantum-tls-now-supported-in-aws-kms-acm-and-secrets-manager/)
- Microsoft brings ML-KEM and ML-DSA to Windows Server 2025 / Windows 11 in Nov 2025. ([https://techcommunity.microsoft.com/blog/microsoft-security-blog/post-quantum-cryptography-apis-now-generally-available-on-microsoft-platforms/4469093](https://techcommunity.microsoft.com/blog/microsoft-security-blog/post-quantum-cryptography-apis-now-generally-available-on-microsoft-platforms/4469093)) [Microsoft Community Hub](https://techcommunity.microsoft.com/blog/microsoft-security-blog/post-quantum-cryptography-apis-now-generally-available-on-microsoft-platforms/4469093)
- RFC 9700 (OAuth 2.0 Security BCP) published January 2025; deprecates Implicit and ROPC, mandates PKCE for *all* clients. ([https://datatracker.ietf.org/doc/rfc9700/](https://datatracker.ietf.org/doc/rfc9700/)) [WorkOS](https://workos.com/blog/oauth-best-practices)[Scalekit](https://www.scalekit.com/blog/oauth-2-0-best-practices-rfc9700)
- GNAP published as RFC 9635 in October 2024. [OAuth](https://oauth.net/gnap/)
- WebAuthn Level 3 Working Draft, 27 Jan 2025; Credential Exchange Protocol/Format being defined by FIDO Alliance.
- Cloudflare turns ECH on by default for all zones late 2024; Russia begins targeted blocking in November 2024. ([https://adguard-dns.io/en/blog/encrypted-client-hello-misconceptions-future.html](https://adguard-dns.io/en/blog/encrypted-client-hello-misconceptions-future.html)) [AdGuard DNS](https://adguard-dns.io/en/blog/encrypted-client-hello-misconceptions-future.html)
- Let's Encrypt: 6-day short-lived certs in production 2025; classic profile drops to 64 days (Feb 2027) then 45 days (Feb 2028); RFC-6962 logs go read-only 30 Nov 2025, full shutdown 28 Feb 2026. [Let's Encrypt](https://letsencrypt.org/2025/12/02/from-90-to-45)
- DNSSEC root KSK rollover begins (KSK-2024 published 11 Jan 2025; first signing Oct 2026; KSK-2017 revocation early 2027). [Verisign](https://blog.verisign.com/security/2024-2026-root-zone-ksk-rollover-initial-observations/)[Verisign](https://blog.verisign.com/security/2024-2026-root-zone-ksk-rollover-initial-observations/)
- DMARC enforcement at Gmail/Yahoo (Feb 2024), Microsoft (5 May 2025), Gmail outright rejection from November 2025.
- 2024 CrowdStrike Channel File 291 incident (19 July 2024) crashes ~8.5 M Windows endpoints — a vivid demonstration that "security utility" software now *is* critical infrastructure. ([https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages](https://en.wikipedia.org/wiki/2024_CrowdStrike-related_IT_outages)) [Messageware](https://www.messageware.com/what-caused-the-crowdstrike-outage-a-detailed-breakdown/)[Tufin](https://www.tufin.com/blog/lasting-impact-of-crowdstrike-update-outage)
- Salt Typhoon (PRC MSS): compromise of nine US telcos' CALEA/lawful-intercept systems disclosed October 2024; Treasury sanctions Sichuan Juxinhe in January 2025. ([https://www.congress.gov/crs-product/IF12798](https://www.congress.gov/crs-product/IF12798); [https://en.wikipedia.org/wiki/Salt_Typhoon](https://en.wikipedia.org/wiki/Salt_Typhoon)) [U.S. Senate Committee on Commerce, Science, & Transportation](https://www.commerce.senate.gov/2025/12/experts-agree-u-s-communications-networks-remain-vulnerable-following-salt-typhoon-hack)[Wikipedia](https://en.wikipedia.org/wiki/2024_global_telecommunications_hack)
- July 2024 Squarespace DNS hijack drains DeFi front-ends (Compound, Celer, Pendle, Unstoppable) via an OAuth-migration flaw on ex-Google-Domains accounts. ([https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/](https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/))

**Who is doing the pushing today.** Cloudflare (PQ TLS, ECH, NTS, Roughtime, RPKI, time service); Google (Chrome PQ, passkeys, BoringSSL, CT, ACME); Apple (passkeys, 47-day cert proposal Oct 2024); Microsoft (passkeys, PQ Windows, DMARC); AWS (PQ, mTLS); Meta (ECH, mTLS); the IETF working groups TLS, DNSOP, DPRIVE, OAuth, ACME, NTP, SIDROPS; ISRG/Let's Encrypt; NLnet Labs (Unbound, Knot, Routinator); ISC (BIND); the OpenSSH and OpenSSL projects; Filippo Valsorda's Geomys (Sunlight CT, age, mkcert).

---

## Recommended learning paths (current as of 2026)

**Suggested order:** start at the wire and work up: TCP/IP → DNS → DHCP → NTP → SMTP/IMAP → TLS → SSH → OAuth/OIDC/passkeys → DNSSEC/CT/RPKI → post-quantum and Zero Trust.

**Specifications (RFCs and drafts, with section pointers):**

- TLS 1.3 — RFC 8446 §4 handshake, §5 record layer ([https://www.rfc-editor.org/info/rfc8446](https://www.rfc-editor.org/info/rfc8446)) (2018).
- HTTP semantics — RFC 9110 (2022). HTTP/3 — RFC 9114 (2022). QUIC — RFC 9000 (2021).
- DNS — RFC 1034/1035 (1987), RFC 9499 terminology (2024).
- DNSSEC — RFC 4033/4034/4035; ROA profile RFC 9582 (2024).
- DoH RFC 8484, DoT RFC 7858, DoQ RFC 9250 (2022).
- NTPv4 RFC 5905 (2010); NTS RFC 8915 (2020); Roughtime draft-ietf-ntp-roughtime (2024–26).
- DHCPv4 RFC 2131; DHCPv6 RFC 8415 (2018).
- SSH RFC 4251–4254 (2006).
- SMTP RFC 5321; IMAP4rev2 RFC 9051 (2021); JMAP RFC 8620/8621 (2019).
- OAuth 2.0 RFC 6749, Security BCP RFC 9700 (Jan 2025), OAuth 2.1 draft-ietf-oauth-v2-1-15 (Mar 2026), GNAP RFC 9635 (Oct 2024).
- ACME RFC 8555 (2019); CT RFC 9162 (2021); X.509 RFC 5280; OCSP RFC 6960.
- WebAuthn L2 (W3C REC, Apr 2021); WebAuthn L3 WD (27 Jan 2025) at [https://www.w3.org/TR/webauthn-3/](https://www.w3.org/TR/webauthn-3/).
- DMARC RFC 7489; DKIM RFC 6376; SPF RFC 7208; MTA-STS RFC 8461; TLS-RPT RFC 8460.

**Books (with chapters):**

- *Bulletproof TLS and PKI* (Ivan Ristić, 2nd ed. 2022 with continuing newsletter "Feisty Duck"; ch. 2 "Protocol", ch. 9 "Performance", ch. 13 "Configuration"). [https://www.feistyduck.com/books/bulletproof-tls-and-pki/](https://www.feistyduck.com/books/bulletproof-tls-and-pki/)
- *DNS and BIND* (Cricket Liu and Paul Albitz, 5th ed., O'Reilly, 2006 — still the canonical reference; supplement with NLnet Labs blog and *Hands-On DNSSEC* materials).
- *Cryptography Engineering* (Ferguson, Schneier, Kohno, Wiley, 2010). Ch. 12 "Cryptographic protocols" is the right entry point.
- *A Graduate Course in Applied Cryptography* (Boneh & Shoup), v0.6, 2023. Free at [https://toc.cryptobook.us/](https://toc.cryptobook.us/).
- *Computer Security* (Ross Anderson), 3rd ed., 2020 — full PDF free at [https://www.cl.cam.ac.uk/~rja14/book.html](https://www.cl.cam.ac.uk/~rja14/book.html). Ch. 5 "Cryptography", Ch. 22 "Networks".
- *TCP/IP Illustrated, Vol. 1*, Stevens/Fall, 2nd ed. 2011 — for the layering discipline.
- *Network Time Protocol on Earth and in Space*, David Mills, 2nd ed., CRC, 2011.
- *SSH, the Secure Shell: The Definitive Guide*, Barrett/Silverman/Byrnes, O'Reilly, 2nd ed. 2005 (still accurate for protocol; supplement with OpenSSH release notes).
- *Real-World Cryptography*, David Wong, Manning, 2021.

**Academic papers (DOI / stable URL):**

- Mockapetris & Dunlap, "Development of the Domain Name System", SIGCOMM 1988 ([https://dl.acm.org/doi/10.1145/52324.52338](https://dl.acm.org/doi/10.1145/52324.52338)).
- Mills, "Internet Time Synchronization: The Network Time Protocol", IEEE TComm 1991.
- Rescorla et al., "The Messaging Layer Security (MLS) Protocol", RFC 9420 (2023).
- Aas et al., "Let's Encrypt: An Automated Certificate Authority to Encrypt the Entire Web", ACM CCS 2019 ([https://dl.acm.org/doi/10.1145/3319535.3363192](https://dl.acm.org/doi/10.1145/3319535.3363192)).
- Donenfeld, "WireGuard: Next Generation Kernel Network Tunnel", NDSS 2017 ([https://www.wireguard.com/papers/wireguard.pdf](https://www.wireguard.com/papers/wireguard.pdf)).
- Chung et al., "RPKI is Coming of Age", IMC 2019.
- "RoVista", IMC 2023 ([https://dl.acm.org/doi/10.1145/3618257.3624806](https://dl.acm.org/doi/10.1145/3618257.3624806)).

**Long-form blog posts (2024–26 where possible):**

- Cloudflare blog on ECH ([https://blog.cloudflare.com/announcing-encrypted-client-hello/](https://blog.cloudflare.com/announcing-encrypted-client-hello/)), PQ ubiquity (2025), NTS ([https://blog.cloudflare.com/nts-is-now-rfc/](https://blog.cloudflare.com/nts-is-now-rfc/)), TLS 1.3 ([https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/](https://blog.cloudflare.com/rfc-8446-aka-tls-1-3/)).
- Let's Encrypt: "10 Years of Let's Encrypt" (Dec 2025, [https://letsencrypt.org/2025/12/09/10-years](https://letsencrypt.org/2025/12/09/10-years)), "From 90 to 45" (Dec 2025).
- Filippo Valsorda's "A different CT log" → Sunlight ([https://filippo.io/a-different-CT-log](https://filippo.io/a-different-CT-log)).
- AWS post-quantum migration plan ([https://aws.amazon.com/security/post-quantum-cryptography/](https://aws.amazon.com/security/post-quantum-cryptography/)).
- NLnet Labs blog (Routinator, Krill, Unbound).
- APNIC's annual "RPKI year in review" (Job Snijders, latest 20 Feb 2026).
- Google Online Security Blog on passkeys (passwordless ecosystem).

**YouTube / talks (creator + title):**

- Computerphile: "Heartbleed", "DNS", "Diffie-Hellman", "TLS Handshake".
- LiveOverflow: HTTP/2 desync, certificate-transparency demos.
- DEF CON 16 (2008): Dan Kaminsky, "Black Ops 2008: It's the End of the Cache as We Know It".
- Black Hat USA 2014: Codenomicon team on Heartbleed.
- Real World Crypto 2024–25: PQ in TLS sessions.
- IETF YouTube: DNSOP, TLS, OAuth working-group meetings.

**Podcasts (specific episodes):**

- *Security, Cryptography, Whatever* — "WireGuard with Jason Donenfeld" (2021); 2024 PQC episode with Sophie Schmieg.
- *Risky Business* — weekly (Patrick Gray); the XZ episodes from April 2024 are essential listening.
- *Cryptography FM* — Nadim Kobeissi's series, especially the TLS-1.3 and SPHINCS+ episodes.
- *Security Now!* — Steve Gibson's coverage of Heartbleed, Kaminsky, XZ.
- IETF "What's New" podcast.

**Free university courses:**

- Stanford CS 155 *Computer and Network Security* (Boneh/Mitchell), spring offerings, syllabus public.
- MIT 6.5660 (formerly 6.858) *Computer Systems Security*, Kaashoek/Zeldovich.
- Princeton COS 432 *Information Security*, Felten/Mayer.
- UC Berkeley CS 161 *Computer Security*, current offering.
- CMU 18-487 *Introduction to Computer Security*.
- Coursera *Cryptography I* — Dan Boneh, still the gold-standard intro ([https://www.coursera.org/learn/crypto](https://www.coursera.org/learn/crypto)), reviewed and minor-updated through 2024.

**Hands-on tools (with last-update note):**

- Wireshark (latest stable 4.4.x, 2025) — [https://www.wireshark.org](https://www.wireshark.org).
- badssl.com — TLS edge-case test page, occasionally maintained, last refresh 2024.
- DNSViz ([https://dnsviz.net](https://dnsviz.net)) — DNSSEC visualizer, NSF-maintained, updated 2025.
- ssllabs.com (Qualys) — server test, partially deprecated, replaced by Hardenize and SSL Labs for ECH/PQ in 2025.
- internet.nl — Dutch IPv6/DNSSEC/DMARC/STARTTLS test, regularly updated.
- Mozilla Observatory and HSTS Preload list.
- Cloudflare's `cdn-cgi/trace`, `1.1.1.1/help`, and `pq.cloudflareresearch.com`.
- isbgpsafeyet.com (Cloudflare RPKI check, last entry Aug 2025: Bell Canada). [Isbgpsafeyet](https://isbgpsafeyet.com/)
- crt.sh (CT log search).

**Conferences worth following:** USENIX Security, NDSS, ACM CCS, IEEE S&P (Oakland), IMC, SIGCOMM, Real World Crypto, Black Hat, DEF CON, IETF, KubeCon, QUIC.dev Summit, Authenticate (FIDO Alliance), Time Appliances Project workshops.

---

## Where things are heading (2025–2026 frontier)

1. **Post-quantum migration in TLS.** Hybrid X25519+ML-KEM-768 (TLS group `0x11EC`) is now the de-facto standard between major browsers (Chrome 124+, Firefox 132+, Safari from 18.2) and large CDNs. Cloudflare targets full PQ across its product suite by 2029. ML-DSA in certificate chains is the next, harder step (signature-size pain). HQC was selected by NIST in March 2025 as a backup KEM. ([https://eprint.iacr.org/2025/2052](https://eprint.iacr.org/2025/2052); [https://www.keysight.com/blogs/en/tech/nwvs/2025/08/05/post-quantum-handshakes](https://www.keysight.com/blogs/en/tech/nwvs/2025/08/05/post-quantum-handshakes)) [Cloudflare](https://developers.cloudflare.com/ssl/post-quantum-cryptography/)[Keysight](https://www.keysight.com/blogs/en/tech/nwvs/2025/08/05/post-quantum-handshakes)
2. **PQ in SSH and DNSSEC.** OpenSSH supports `sntrup761x25519-sha512` and ML-KEM hybrids in 9.9 (2024) and 10.x (2025–26); DNSSEC is wrestling with ML-DSA's signature size in algorithm-agility drafts in SIDROPS.
3. **Encrypted Client Hello (ECH).** Currently at draft-ietf-tls-esni-25, deployed by Cloudflare (default on Free zones), Fastly, Meta. Keys distributed via DNS HTTPS RRs (RFC 9460). Russia and China are actively interfering. ([https://www.petsymposium.org/foci/2025/foci-2025-0016.pdf](https://www.petsymposium.org/foci/2025/foci-2025-0016.pdf)) [Feisty Duck](https://www.feistyduck.com/newsletter/issue_127_encrypted_client_hello_approved_for_publication)
4. **DNS over QUIC & HTTP/3.** Quad9 and Cloudflare both run DoQ on UDP/853 and DoH3 in production by 2026.
5. **NTS adoption and Roughtime.** NTS is in Cloudflare, Netnod, time.nl, ntpd-rs, chrony, NTPsec. Systemd-timesyncd still does not support it. Roughtime's RFC is in WGLC; expected publication 2026. NTS extensions for NTPv5 and PTP are early drafts. [Law Explained India](https://anweshadas.in/how-to-use-network-time-security-on-your-system/)
6. **OAuth 2.1 / GNAP / OpenID Federation.** OAuth 2.1 (-15, March 2026) consolidates authcode+PKCE; GNAP (RFC 9635) provides a clean alternative; OpenID Federation 1.0 (final Oct 2025) is reshaping wallet ecosystems.
7. **Passkeys / WebAuthn 3 / Credential Exchange.** Eight of the top ten sites support passkeys; >1 B passkeys created. NIST SP 800-63-4 (final July 2025) recognises synced passkeys at AAL2. FIDO's Credential Exchange Protocol/Format is the antidote to vendor lock-in. [1Password](https://www.1password.community/blog/random-but-memorable/the-state-of-passkeys-in-2025/163464)
8. **Zero Trust and mTLS in service meshes.** Istio, Linkerd and Cilium ship SPIFFE-compatible identity by default; SPIRE-issued X.509-SVIDs typically have 1-hour TTLs. Workload identity is replacing the perimeter. ([https://www.haproxy.com/blog/zero-trust-mtls-automation-with-haproxy-and-spiffe-spire](https://www.haproxy.com/blog/zero-trust-mtls-automation-with-haproxy-and-spiffe-spire)) [Medium](https://medium.com/@h.stoychev87/kubernetes-service-mesh-625e2ec1bf13)[Petronellatech](https://petronellatech.com/blog/machine-identity-is-the-new-perimeter-mtls-spiffe-for-zero-trust/)
9. **RPKI deployment and ASPA.** ROA coverage of routes >54%, traffic ~70%; ASPA (Autonomous System Provider Authorization) skyrocketing in 2025, RIPE NCC and ARIN signers live. ASPA goes general-availability across all five RIRs by end of Q2 2026 per APNIC. [APNIC Blog](https://blog.apnic.net/2026/02/20/rpkis-2025-year-in-review/)
10. **Email transport hardening.** DMARC enforcement universal among bulk senders by 2025; MTA-STS and TLS-RPT adoption growing; BIMI Common Mark Certificates (CMC) launched 2025 by Google.
11. **Static-CT API.** Replaces RFC 6962 logs with cheaper, more available logs (Sectigo CF_CTile, Cloudflare Azul, Let's Encrypt Sycamore/Willow); RFC-6962 logs being decommissioned through 2026. [Let's Encrypt](https://letsencrypt.org/2025/08/14/rfc-6962-logs-eol)
12. **Likely obsolete in five years.** Plain FTP, plain SMTP/IMAP without TLS, NTP without NTS where it matters, OCSP (replaced by CRLs+ARI at Let's Encrypt), RSA-2048 long-term certs (NIST deprecates by 2030, CNSA 2.0 mandates PQ for new acquisitions in 2027). [IACR](https://eprint.iacr.org/2025/2052.pdf)
13. **Where the money/research is.** Cloudflare, Google, Microsoft and AWS each have large PQ teams; ISRG runs Let's Encrypt and Prossimo (memory-safe rewrites: ntpd-rs, sudo-rs); Germany's Sovereign Tech Fund (>€209k to WireGuard 2023, continuing 2024–25) and the EU's NGI/NLnet are funding NLnet Labs, OpenSSH and others. [Wikipedia](https://en.wikipedia.org/wiki/WireGuard)

---

## Hooks for the article, infographic and podcast

**60-second narrated hook (for the ear):**

> "Every single second, your laptop has a half-dozen quiet conversations you never asked it to have. It asks 'what time is it?' It asks 'where is google.com?' It asks 'is the certificate on this site really google's?' It asks 'who exactly am I?' The protocols that answer those questions weren't designed in a board room. They were designed by a guy in Helsinki who'd just been hacked, by a blind professor in Delaware who loved clocks, by a Berkeley student trying to send mail between two campus computers. None of them imagined they were laying down the plumbing for the entire global economy. And in March 2024, a Microsoft engineer noticed that his laptop was taking half a second longer to log in than usual — and uncovered a state-actor backdoor, two years in the making, hidden in a compression library that almost every Linux server in the world depends on. This is the story of the Invisible Infrastructure: the protocols nobody thinks about until they break, the people who built them, and the very recent moment we all started realising they were running on goodwill."

**Striking statistic:**

> By March 2025, approximately 38% of human HTTPS traffic on Cloudflare's network used hybrid post-quantum (X25519 + ML-KEM-768) handshakes — a transition that began a competition in 2016 and was effectively invisible to users. Source: [https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/), citing Cloudflare Radar ([https://blog.cloudflare.com/post-quantum-cryptography-ubiquity/](https://blog.cloudflare.com/post-quantum-cryptography-ubiquity/)). [Intelligent Living](https://www.intelligentliving.co/quantum-hybrid-tls-ml-kem-browser/)

**Pause-and-think moment:**

> The XZ Utils backdoor (CVE-2024-3094) was discovered because Andres Freund, a PostgreSQL developer at Microsoft, was annoyed that an SSH login on Debian sid took ~500 ms instead of the usual ~100 ms. A 0.4-second performance regression is the only thing that stood between us and what Alex Stamos called "the most widespread and effective backdoor ever planted in any software product." The "Jia Tan" persona had been a trusted maintainer for over two years, in a project run, like much of the open-source security stack, by an unpaid volunteer. Source: [https://en.wikipedia.org/wiki/XZ_Utils_backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor), [https://www.elastic.co/security-labs/500ms-to-midnight](https://www.elastic.co/security-labs/500ms-to-midnight). [SoftwareSeni](https://www.softwareseni.com/the-xz-utils-backdoor-cve-2024-3094-and-the-multi-year-social-engineering-campaign-behind-it/)[Wikipedia](https://en.wikipedia.org/wiki/XZ_Utils_backdoor)

**Failure-story arc — DigiNotar, 2011 (clean dramatic sequence):**

- *Setup:* A Dutch notary services firm with deep PKIoverheid government contracts ran a CA whose web servers in the DMZ were poorly segregated from its CA-issuing infrastructure. ([https://www.enisa.europa.eu/sites/default/files/all_files/Operation_Black_Tulip_v2.pdf](https://www.enisa.europa.eu/sites/default/files/all_files/Operation_Black_Tulip_v2.pdf))
- *Mistake:* On 17 June 2011 an attacker (later self-styled "ComodoHacker", same persona behind the March 2011 Comodo RA breach) entered through the public-facing webserver and pivoted to the certificate-issuing servers by 1 July 2011. On 10 July 2011 a wildcard `*.google.com` certificate was issued to the attacker. [Wikipedia](https://en.wikipedia.org/wiki/DigiNotar)
- *Consequence:* Beginning ~28 August 2011, that certificate was used in a man-in-the-middle attack against ~300,000 Iranian Gmail users, intercepting Gmail authentication to enable surveillance. Over 500 fraudulent certificates were ultimately issued (including for windowsupdate.com, mozilla.org, cia.gov). Google Chrome's pinning of `*.google.com` — code Adam Langley had shipped earlier that year — flagged the bad cert when an Iranian user filed a Chrome bug, which is how the attack was discovered. [Dark Reading](https://www.darkreading.com/cyberattacks-data-breaches/comodo-hacker-takes-credit-for-massive-diginotar-hack)[Substack](https://rohittamma.substack.com/p/the-hack-that-changed-the-internets)
- *Resolution:* Browsers blacklisted the DigiNotar root within days; the Dutch government took over operational control on 3 September 2011; DigiNotar declared bankruptcy on 20 September 2011. The incident catalysed Certificate Transparency (Laurie/Langley/Kasper, RFC 6962, 2013), HSTS preload lists, the demise of static cert pinning (HPKP) in favour of dynamic CT logs, and ultimately the Web PKI's modern audit regime. ([https://en.wikipedia.org/wiki/DigiNotar](https://en.wikipedia.org/wiki/DigiNotar); [https://threatpost.com/final-report-diginotar-hack-shows-total-compromise-ca-servers-103112/77170/](https://threatpost.com/final-report-diginotar-hack-shows-total-compromise-ca-servers-103112/77170/)) [Wikipedia](https://en.wikipedia.org/wiki/DigiNotar)

Alternative arcs of comparable cleanness: **Kaminsky 2008** (a researcher discovers the protocol-level flaw, calls Vixie, summons Microsoft+Cisco+ISC to a secret Microsoft-campus meeting, ships coordinated patches July 8 2008, gives the Black Hat talk August 7); **Mirai/Dyn 2016** (a teenager building a Minecraft DDoS tool ends up taking Twitter offline); **Heartbleed 2014** (a single missing bounds-check in OpenSSL exposed up to 17% of secure web servers); **CrowdStrike 2024** (a single bad config file at 04:09 UTC on 19 July 2024 takes 8.5 M Windows machines offline, blue-screening airline check-in counters worldwide); **Salt Typhoon 2024–25** (PRC operators sit inside the lawful-intercept systems of nine US telcos for ≥18 months, weaponising the very wiretap capability we built into the network). [Wikipedia + 3](https://en.wikipedia.org/wiki/Dan_Kaminsky)

---

## Caveats

- Adoption percentages (PQ TLS share, RPKI coverage, DMARC enforcement, passkey usage) come from individual vendors' telemetry (Cloudflare Radar, Kentik, NIST RPKI Monitor, FIDO Alliance Index). Cross-vendor numbers vary; treat single-source numbers as directional.
- Several drafts cited (OAuth 2.1, Roughtime, ECH, DNS-PERSIST-01) had not been published as RFCs at time of writing; draft IDs change.
- The Squarespace 2024 root cause is partially contested: researchers (Monahan/Samczsun/Mohawk) and Squarespace's own post-mortem disagree on whether email-only signup or OAuth-migration was the primary vector.
- The CrowdStrike incident is included as a "security utility" failure because Falcon is a kernel-mode security agent, not because it is a network protocol; readers may reasonably argue it is out-of-scope.
- This report deliberately excludes BGP/OSPF/IS-IS proper, MQTT/AMQP/CoAP, and RTP/SIP, treating them as adjacent groups; RPKI is included only as the security overlay on BGP.
- The 38% PQ-TLS figure is reported by Cloudflare itself; independent measurement (e.g., Keysight ATI 2025-15 and the SoK in IACR ePrint 2025/2052) is broadly consistent but uses different denominators.
- Where ages or dates are derived from secondary sources (Wikipedia, vendor blogs), I have prioritised primary sources (RFC editor, IETF datatracker, vendor security advisories, NIST publications) where available.