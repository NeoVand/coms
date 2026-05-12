===== PROTOCOL · ACME · Automatic Certificate Management Environment =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs, books,
engineering blog posts, conference talks, and podcasts on this topic, all
distilled into one document. Surface-level "what is ACME" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the J. Alex Halderman / Peter Eckersley / James
  Kasten origin paper, the 2012–2014 work that became Let's Encrypt, the
  founding of ISRG, the April 2016 ACMEv1 public launch, the March 2019
  RFC 8555 (ACMEv2) milestone, the long campaign to drive certificate
  lifetimes down (1 year → 398 days → 90 days → Apple's March 2025
  proposal for 47 days by 2029), the 2024 CA/Browser Forum politics
  around shorter lifetimes, the Sectigo/Google Trust Services ACME
  rollouts, the Sunlight CT-log redesign.
- Mechanics deep enough that someone could re-implement a minimal ACME
  client after reading: the account-creation step, the JOSE-based
  request signing, ordering, identifier authorization, the three
  challenge types (HTTP-01, DNS-01, TLS-ALPN-01), finalization, and
  certificate retrieval.
- Real failures and famous incidents — the **3.05 million-cert mass
  revocation event of March 2020**, the **DST Root CA X3 expiry of
  30 September 2021** that took out curl, openssl 1.0.x, IoT devices
  and ancient Android, the 2022 Let's Encrypt CAA-rechecking-bug
  revocation, the OCSP-Must-Staple incidents, the recurring ACME
  client implementation bugs.
- Connections to adjacent protocols — TLS as the use case (without
  ACME, ubiquitous TLS would not exist), DNS (DNS-01 challenge),
  HTTP (HTTP-01 challenge), JOSE/JWT/JWS (wire format), OAuth 2.0
  (External Account Binding pattern), CT logs, OCSP/CRL/CRLite,
  the broader PKI/Web PKI / CA/B Forum world.
- 2024–2026 developments — Apple's **March 2025 ballot proposal**
  for 47-day cert lifetimes, Multi-Perspective Issuance Corroboration
  (MPIC) deployment becoming mandatory March 2025, Sunlight CT logs
  rolling out at Let's Encrypt, ACME Device Attestation for IoT,
  ACME-EAB (External Account Binding) production use at Google Trust
  Services and ZeroSSL, the broader CA/Browser Forum policy push.
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older
sources as suspect and verify them against the current state. Define every
term you use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or
DOI. Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL,
USENIX, NDSS), archive.org for older or dead links, and the relevant
standards body (IETF datatracker, CA/Browser Forum, Let's Encrypt's own
community forum and post archives). Past passes have left 121
`[needs source]` markers across 46 reports — please try harder this round,
but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how ACME relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — **TLS**, SSH, **DNS**, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, **OpenID Connect**, email-auth (DKIM/SPF/DMARC),
SAML, LDAP, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **ACME — Automatic Certificate Management
Environment** — the JSON-over-HTTPS protocol that automates the request,
validation, issuance, renewal, and revocation of X.509 certificates from
a Certificate Authority. ACME is what makes "free TLS for every domain
on the Internet" tractable: instead of a human filing a CSR, paying a
CA, and proving domain control by email or DNS, an ACME client
automatically demonstrates control via one of three challenge types
and pulls back a fresh certificate.

ACME began as an academic paper in 2014–2015 by **J. Alex Halderman**
(University of Michigan), **Peter Eckersley** (EFF, 1979–2022), **James
Kasten** (Michigan), and the early **Josh Aas / Daniel McCarney** team
that became ISRG / Let's Encrypt. The public beta launched
**3 December 2015**, general availability **12 April 2016**. ACMEv2
followed as **RFC 8555** in **March 2019**, adding wildcard support and
the DNS-01 challenge as a first-class flow. As of late 2025, Let's
Encrypt alone has issued >5 billion certs lifetime, with >500 million
active.

Related protocols and standards likely connected to ACME that you should
verify and expand on:

  - **TLS 1.2 / 1.3** — the protocol whose certificates ACME provisions
  - **HTTP/1.1, HTTP/2, HTTP/3** — the transport for ACME itself, and
    for the HTTP-01 challenge
  - **DNS** — DNS-01 challenge mechanism, CAA records
  - **JOSE / JWS / JWK** — every ACME request is a JWS-signed payload
  - **OAuth 2.0** — the External Account Binding pattern borrows JWS
    style and is conceptually similar
  - **PKIX** — RFC 5280, X.509, the certificate format itself
  - **CT (Certificate Transparency)** — RFC 9162, CT logs every cert
    Let's Encrypt issues, Sunlight is the new tile-based log format
  - **OCSP / CRL / CRLite** — revocation mechanisms ACME-issued certs
    rely on
  - **DTLS** — TLS-ALPN-01 challenge runs over TLS, but ACME itself
    doesn't use DTLS
  - **DNSSEC** — recommended for DNS-01 challenge security

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., Certificate Authority, Registration Authority, CSR, X.509,
  ACME server / ACME client, account, order, authorization,
  identifier, challenge, HTTP-01, DNS-01, TLS-ALPN-01, JWS,
  finalize, OCSP, CRL, CRLite, CAA, CT log, Sunlight, MPIC,
  External Account Binding, wildcard, intermediate, root,
  cross-sign, Baseline Requirements)
- [ ] **≥4** dated entries on the history timeline (2012 → 2026)
- [ ] Full ACME message-flow layout (account creation, newOrder,
      authorization, challenge, finalize, certificate fetch) AND
      a JWS request structure showing protected/payload/signature
- [ ] ACME order state machine in mermaid `stateDiagram-v2`:
      pending → ready → processing → valid (or invalid)
- [ ] A sequence diagram of HTTP-01 challenge end-to-end issuance
      (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale
      numbers, and dates (Let's Encrypt >500M active certs, ZeroSSL,
      Buypass Go SSL, Google Trust Services, Cloudflare Origin CA,
      AWS Certificate Manager Private CA, Caddy built-in, certbot,
      acme.sh, cert-manager in Kubernetes, Traefik)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (J. Alex Halderman, Peter Eckersley, Josh Aas, James Kasten,
      Daniel McCarney, Roland Shoemaker, Ben Wilson, the broader
      ISRG board)
- [ ] **≥3** RFCs with number, year, status, and notable-section
      pointers (RFC 8555 ACMEv2, RFC 8737 TLS-ALPN-01, RFC 8738 IP
      identifiers, RFC 9447 Authority Token, RFC 9448 TNAuthList,
      plus the CA/B Forum Baseline Requirements)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (Let's Encrypt 3.05M-cert mass revocation March 2020,
      DST Root CA X3 expiry 30 September 2021 breaking curl/OpenSSL
      1.0.x/legacy Android, the 2022 CAA rechecking bug, the OCSP
      Must-Staple incidents)
- [ ] **≥3** fun facts / anecdotes with sources (Pebble the test
      server, "Boulder" as Let's Encrypt's CA software name, the
      naming references — Boulder/Pebble, the 2015 cross-sign with
      IdenTrust DST Root CA X3 that became its own crisis, the
      *Let's Encrypt* xkcd reference, the "Big Green Padlock" pre-2017
      browser UI war)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (rate limits — 50 certs per registered domain per week, 5
      duplicate certs per week; CAA records breaking unexpectedly;
      renewing at 60 days not 89; the HTTP-01 redirect trap; the
      DNS-01 wildcard CNAME delegation pattern; certbot vs acme.sh
      vs Caddy auto-renewal differences)
- [ ] **≥3** Wireshark / capture-tool filter examples (`http.host ==
      "acme-v02.api.letsencrypt.org"`, `tls.handshake.extension.type
      == 16` for ALPN-01 detection, mitmproxy capture of JWS
      payloads)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (CA/B Forum SC-063 47-day proposal by Apple March 2025, MPIC
      mandatory March 2025, Sunlight CT logs rollout, ACME-EAB
      production at ZeroSSL/Google Trust Services, Let's Encrypt
      crossing 500M active certs, the IETF ACMEbis work)
- [ ] **≥1** 2025–2026 frontier development (47-day cert lifecycle,
      Sunlight CT logs, ACME Device Attestation for IoT, ACME for
      S/MIME client certs)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (HTTP-01 challenge,
      end-to-end issuance)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* ACME makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: TLS, X.509 certificate, public key,
private key, CSR (Certificate Signing Request), Certificate Authority,
Registration Authority, Web PKI, root store, intermediate certificate,
cross-sign, fingerprint, chain, OCSP, OCSP stapling, OCSP Must-Staple,
CRL, CRLite, CAA record, CT log, SCT (Signed Certificate Timestamp),
Sunlight, JWS, JOSE, nonce (ACME-specific anti-replay), JWK, account
URL, Baseline Requirements, CA/Browser Forum, MPIC, wildcard cert,
SAN, leaf certificate.

## History and story

The story arc:

1. **Pre-2015** — Symantec, GoDaddy, Comodo, GlobalSign dominate CA
   issuance at $50–500 per cert per year. EFF starts pushing for
   "Encrypt All the Things" in 2013. Mozilla's Observatory, Google's
   HTTPS-everywhere push.
2. **2012–2015 origin** — J. Alex Halderman's Michigan group + Peter
   Eckersley at EFF + Josh Aas at Mozilla design ACME. The seminal
   paper "Let's Encrypt: An Automated Certificate Authority to
   Encrypt the Entire Web" (CCS 2019, but design dates from 2014–2015).
   ISRG founded **May 2013**. First cert issued **14 September 2015**.
3. **2015–2019** — Public beta December 2015. GA April 2016. ACMEv1
   widely used. Wildcard support and the RFC 8555 (ACMEv2) march
   together; published **March 2019**.
4. **2019–2024** — Wildcard certs go mainstream. Caddy ships ACME
   built-in (default since 2015 internally, GA 2017). cert-manager
   becomes the de-facto Kubernetes way to do TLS. **September 2021**:
   DST Root CA X3 expires and the internet briefly catches fire.
   **March 2020**: 3.05M-cert mass revocation.
5. **2024–2026** — The CA/B Forum cert-lifetime ratchet. Apple's
   March 2025 **SC-063v3** ballot proposing 47-day lifetimes by 2029
   passes the discussion phase. MPIC mandatory from 15 March 2025.
   Sunlight CT logs at Let's Encrypt. ACME-EAB production deployments.

Tell the actual narrative — name names, give years, describe the rooms
(mostly CA/B Forum F2F meetings and the IETF ACME WG sessions). Mention
Peter Eckersley's tragic September 2022 death and the way the ACME
community has carried his work forward.

## How it actually works

Cover, in this order:

1. **The actors** — ACME server (the CA, e.g., Let's Encrypt's Boulder
   software at `acme-v02.api.letsencrypt.org`), ACME client (certbot,
   acme.sh, lego, Caddy, cert-manager, etc.), the validated server
   (the web server proving domain control).
2. **Account creation** — client generates an account key, POSTs
   `newAccount` with a JWS using that key. Server returns an account
   URL.
3. **Order creation** — client POSTs `newOrder` listing the identifiers
   (domains) it wants certified. Server returns an order with one
   authorization URL per identifier.
4. **Authorization** — for each identifier, the server offers one or
   more challenges (HTTP-01, DNS-01, TLS-ALPN-01). The client picks
   one and signals readiness.
5. **Challenge mechanics** — go deep on each:
   - **HTTP-01** — client serves a token at
     `http://example.com/.well-known/acme-challenge/{token}`
     with the body `{token}.{thumbprint}`. Server fetches it from
     **multiple network perspectives** (MPIC since March 2025).
   - **DNS-01** — client provisions a TXT record at
     `_acme-challenge.example.com` with the base64url SHA-256 of
     `{token}.{thumbprint}`. Required for wildcard certs.
   - **TLS-ALPN-01** (RFC 8737) — client serves a special cert via
     ALPN extension `acme-tls/1` on port 443.
6. **Finalize** — client POSTs the CSR to the order's `finalize` URL.
   Server validates the CSR matches the authorized identifiers.
7. **Certificate retrieval** — client polls the order until status =
   `valid`, then GETs the certificate URL.
8. **JWS request format** — every client → server message is a
   JWS object with `protected` (alg/nonce/url/jwk-or-kid), `payload`
   (the JSON request), and `signature` headers. Anti-replay via
   per-request nonces from `newNonce`.
9. **Renewal** — clients simply repeat the flow. **Best practice:
   renew at 1/3 of lifetime remaining** (e.g., day 60 of 90).
10. **Revocation** — POST to `revokeCert` with either the account key
    or the certificate's private key signing the JWS.

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of HTTP-01 challenge end-to-end (account → order
   → authz → challenge → finalize → cert)
2. State diagram of an ACME order (pending → ready → processing →
   valid / invalid)
3. Table of the ACME JSON resource types with their fields and a
   schematic of the JWS-Flattened wire format

## Deep connections to other protocols

Cover each related protocol listed in the topic. Pay particular
attention to:

- **TLS** — ACME's entire purpose. Without ACME, the Web PKI would
  still be hand-curated. Trace the percentage of HTTPS-enabled
  websites (Mozilla Telemetry, Cloudflare Radar) from ~30% in 2015
  to ~95% by 2024–2025.
- **DNS** — DNS-01 challenge mechanics. Discuss CAA records (RFC
  8659) and their interaction with ACME — CAA's `accounturi` and
  `validationmethods` extensions (RFC 8657).
- **HTTP** — HTTP-01 challenge mechanics. The "no HTTPS redirect on
  `/.well-known/acme-challenge/`" gotcha.
- **JOSE / JWS / JWK** — every wire message. ACME re-uses the IETF
  JOSE stack but with **JWS-Flattened JSON** rather than compact form.
- **OAuth 2.0** — the **External Account Binding** (EAB) pattern in
  RFC 8555 §7.3.4 lets a CA bind an ACME account to a pre-existing
  paid account via HMAC; conceptually similar to OAuth's client
  authentication.
- **PKIX / X.509** — the certs themselves; RFC 5280.
- **CT (Certificate Transparency)** — RFC 9162. Every Let's Encrypt
  cert is logged to at least two CT logs; Sunlight (tile-based CT)
  is the 2024–2025 redesign reducing CT-log operating cost ~10×.
- **OCSP / CRL / CRLite** — revocation. **Let's Encrypt is
  decommissioning OCSP in 2025**, citing the cost and the privacy
  problem; that's a major shift worth flagging.
- **DNSSEC** — strongly recommended for DNS-01 but not enforced by
  ACME itself.

## Real-world deployment

Major implementations:

- **CAs running ACME** — Let's Encrypt (Boulder; >500M active certs
  as of late 2025), ZeroSSL, Buypass Go SSL, Google Trust Services
  (production ACME from March 2024), Sectigo (commercial ACME),
  HARICA, Entrust (after their distrust drama), Amazon Trust
  Services (for AWS Certificate Manager — internal only).
- **ACME clients** — certbot (EFF, the canonical), acme.sh (Stanley
  Zheng, shell-script powerhouse), lego (Go), Caddy (built-in),
  Traefik (built-in), cert-manager (Kubernetes), win-acme (Windows),
  Posh-ACME (PowerShell), nginx-certbot, dehydrated.
- **Test servers** — Pebble (Let's Encrypt's testing server),
  staging-v02.api.letsencrypt.org.
- **At scale** — Cloudflare uses ACME upstream for Universal SSL
  (>30M zones); Shopify, Heroku, Fly.io, Render, Vercel, Netlify
  all use ACME under the hood for customer custom domains.

Real numbers: Let's Encrypt's transparency report, the Firefox HTTPS
share from Mozilla Telemetry, Cloudflare's daily ACME issuance
volume, the size of typical ACME response (single account creation
~2KB, full cert issuance round trip ~10–20s typical).

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **The 3.05 million-cert mass revocation (March 4, 2020)** — bug
  in Boulder's CAA-rechecking code allowed certs to be issued when
  the CAA record had changed mid-flight; revocation triggered, but
  ISRG ultimately chose not to fully revoke because of operator
  impact.
- **DST Root CA X3 expiry (30 September 2021)** — the cross-sign
  that bootstrapped Let's Encrypt's trust expired. Modern systems
  fine; legacy systems (Android <7.1.1, curl 7.20.0–7.78.0 with
  default OpenSSL 1.0.x, very old Macs and IoT firmware) broke
  HTTPS to every Let's Encrypt-secured site. Daniel Stenberg
  documented the breakage in a famous blog post. Let's Encrypt had
  signalled the expiry for >2 years; many firmware vendors hadn't
  updated.
- **The 2022 CAA-recheck bug** — small revocation following Boulder
  code audit.
- **OCSP Must-Staple incidents** — every few years, an outage
  cascades because OCSP responders are down and Must-Staple kicks in.
- **The 2023 "ACME-Quirky-Client" incidents** — clients hammering
  Boulder at rate-limit-edge cases.
- **Cloudflare's BoringSSL DTLS bug (2023)** — adjacent, but worth
  mentioning for the ALPN-01 ecosystem.
- **Apple Mail's wrong-cert error (2024)** — adjacent.

## Fun facts and anecdotes

- **Boulder** is Let's Encrypt's Go-and-Python ACME CA implementation;
  **Pebble** is its tiny Go test server. The naming gag: "boulder"
  is a big rock, "pebble" is a tiny one.
- The 2015 cross-sign with **IdenTrust's DST Root CA X3** was the
  only way Let's Encrypt could be trusted by existing browsers on
  day one — it took years for ISRG Root X1 to be widely embedded.
  When DST Root CA X3 expired six years later, that decision came
  back to bite the legacy ecosystem.
- **Peter Eckersley** (1979–2022) was responsible for *HTTPS
  Everywhere*, *Privacy Badger*, *Panopticlick*, and ACME. He died
  unexpectedly on **2 September 2022**.
- The first Let's Encrypt cert was issued for `helloworld.letsencrypt.org`
  on **14 September 2015**.
- **Caddy** (Matt Holt, 2015) was the first popular web server to
  ship ACME-by-default — making HTTPS literally zero-config.
- The CA/Browser Forum's votes on cert lifetimes are *legendary*
  for the Apple/Google vs. mid-tier CA tension. The Apple March 2025
  ballot to push lifetime to 47 days passed despite vocal CA
  opposition.
- The ACME spec almost wasn't a spec — for over a year ACMEv1 was
  "what Let's Encrypt does" with no IETF standardisation, leading
  to ACMEv2 / RFC 8555 normalising the wire format.

## Practical wisdom

What an engineer actually needs to know:

- **Rate limits** at Let's Encrypt: 50 certs per registered domain
  per week, 5 duplicate certs per week, 300 new orders per account
  per 3 hours. Hitting these in CI is a common foot-gun.
- **Renew at 1/3 of lifetime remaining** — for 90-day certs, that
  means renew at day 60. Cron daily but skip if not due. With
  shorter lifetimes (47 days proposed), this becomes critical
  automation rather than nice-to-have.
- **CAA records** — set `0 issue "letsencrypt.org"` to lock down
  who can issue. But don't forget to add the new CA to your CAA if
  you migrate.
- **HTTP-01 redirect trap** — if your `/.well-known/acme-challenge/`
  path 301s to HTTPS, the chain breaks because the cert isn't valid
  yet. Most clients handle this but legacy reverse proxies don't.
- **DNS-01 wildcard pattern** — delegate `_acme-challenge` via CNAME
  to a sub-zone the client controls (e.g., `acme.example.com`); this
  lets you do wildcards with a locked-down secondary zone.
- **MPIC interactions** — since March 2025, your HTTP-01 endpoint
  must be reachable from multiple network perspectives. If you're
  behind weird DNS-based geo-routing, validation can flake.
- **Account key vs cert key** — keep them separate; account key is
  the long-lived ACME identity, cert key rotates per renewal.
- **Don't redeploy on every renewal** — write certs to a stable
  path and reload the web server (`nginx -s reload`, etc.).
- **Caddy / cert-manager / Traefik** automate all of this. Roll
  your own only if you have a hard reason.

Wireshark/capture filter examples:

- `http.host == "acme-v02.api.letsencrypt.org"` — capture the ACME
  control channel
- `tls.handshake.extensions_alpn_str == "acme-tls/1"` — detect
  TLS-ALPN-01 challenges
- mitmproxy `~u .well-known/acme-challenge` — capture HTTP-01
  challenges
- `dns.qry.name contains "_acme-challenge"` — capture DNS-01
  challenges

## Pioneers and key contributors

- **J. Alex Halderman** (1981– ) — University of Michigan professor,
  co-founder of ISRG, lead of the academic ACME work. Election
  security research, ZMap, Censys. Wikipedia link.
- **Peter Eckersley** (1979–2022) — EFF Chief Computer Scientist
  emeritus, co-founder of Let's Encrypt, HTTPS Everywhere, Privacy
  Badger, Panopticlick. Died unexpectedly September 2022. EFF
  tribute page.
- **Josh Aas** (?– ) — Executive Director of ISRG; previously at
  Mozilla. The operational leader of Let's Encrypt.
- **James Kasten** — Michigan / Let's Encrypt; co-author of the
  original Let's Encrypt paper (CCS 2019).
- **Daniel "cpu" McCarney** — long-time Let's Encrypt engineer,
  Rustls maintainer.
- **Roland Shoemaker** — Let's Encrypt early engineer, later Go
  team security lead.
- **Ben Wilson** — Mozilla CA Program; arbiter of CA distrust events.
- **Matt Holt** — Caddy creator; first to ship ACME-by-default.
- **Stanley Zheng** (aka *acme.sh* author) — shell-script ACME
  client that's wildly popular in DIY hosting.
- **Richard Barnes** — IETF ACME WG chair (with Salz, Camargo, etc.)
- **Tomofumi Hayashi / Jacob Hoffman-Andrews** — RFC 8555 co-editors.

## Learning resources (current as of 2026)

For each: URL, one-sentence description, level, year.

- **Specs** — RFC 8555 (ACMEv2, March 2019), RFC 8737 (TLS-ALPN-01,
  February 2020), RFC 8738 (IP identifier, February 2020), RFC 9447
  (Authority Token, August 2023), RFC 9448 (TNAuthList, June 2023),
  CA/Browser Forum Baseline Requirements (latest 2.0.x as of 2026).
- **Books** — *Bulletproof TLS and PKI* (Ivan Ristić, 2nd ed. 2022,
  excellent ACME chapter), *Network Security with OpenSSL* (older,
  still good reference).
- **Papers** — Aas et al. "Let's Encrypt: An Automated Certificate
  Authority to Encrypt the Entire Web" CCS 2019, Birge-Lee et al.
  "Bamboozling Certificate Authorities with BGP" USENIX 2018.
- **Blogs** — Let's Encrypt's announcements
  (https://letsencrypt.org/blog/), Daniel Stenberg's curl blog
  posts on the DST Root CA X3 saga, Ryan Sleevi's mailing-list
  comments on CA policy, Scott Helme's security blog.
- **YouTube** — Let's Encrypt + IETF talks, *Real World Crypto*
  ACME sessions, Halderman's lecture series.
- **Podcasts** — *Security, Cryptography, Whatever* episodes on
  CA policy, *Security Now* on revocation events.
- **Courses** — Stanford CS155 Computer and Network Security
  (lecture on Web PKI).
- **Tools** — certbot, acme.sh, lego, Caddy, cert-manager, Pebble
  (test server), Let's Encrypt's transparency report, CertSpotter
  (CT log monitoring), crt.sh.

## Where things are heading (2025–2026 frontier)

- **47-day cert lifetime by 2029** — Apple's SC-063v3 ballot
  (March 2025) passed CA/B Forum: ramp from 398 → 200 (March 2026)
  → 100 (March 2027) → 47 (March 2029). Automation becomes
  non-optional.
- **MPIC mandatory** since 15 March 2025 — issuance must be
  corroborated from multiple network perspectives to defeat
  BGP-hijack attacks.
- **Sunlight CT logs** — tile-based redesign, 10× cheaper to
  operate. Let's Encrypt running Sunlight in production from 2024.
- **OCSP wind-down at Let's Encrypt** — phased out 2025, replaced
  by short-lived certs and CRLite-style mechanisms.
- **ACME Device Attestation** — for IoT and per-device certs.
- **ACME for S/MIME client certs** — draft work for issuing
  end-user signing/encryption certs over ACME.
- **ACME-EAB** in commercial CA production at Google Trust
  Services and ZeroSSL.

## Hooks for the article, infographic, and podcast

- A 60-second narrated hook (the "DST Root CA X3 expiry breaks
  the internet" story arc works beautifully)
- A striking statistic — "Let's Encrypt issues more certificates in
  a single day than the entire pre-2015 commercial CA industry did
  in a year"
- A "pause and think" moment — every padlock in every browser
  address bar globally, ~95% of the time, was issued by a robot
  talking JSON to another robot over a protocol designed in a
  Michigan office and an EFF couch
- A failure-story arc (Let's Encrypt mass revocation March 2020 or
  the DST Root CA X3 expiry September 2021)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: acme
name: Automatic Certificate Management Environment
abbreviation: ACME
categoryId: utilities-security
port: 443 (HTTPS, but the well-known endpoint is at CA-chosen URL)
year: 2016
rfc: RFC 8555
standardsBody: ietf
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency: "~10–20s end-to-end for a fresh cert", throughput: "Let's Encrypt issues ~5M certs/day across global infra", overhead: "~5–20 KB of JWS traffic per cert" }
connections: [tls, dns, http-1-1, jwt-jose-glossary, oauth2]
links: { wikipedia: "https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment", rfc: "https://datatracker.ietf.org/doc/html/rfc8555", official: "https://letsencrypt.org/docs/" }
image: <Wikimedia URL — Let's Encrypt logo or ACME flow diagram>
```

### A.2 Header / wire-format layout

Provide:
- **JWS-Flattened request layout** — `protected` (alg, nonce, url,
  jwk or kid), `payload` (base64url JSON), `signature`.
- **ACME resource types** table — Directory, Account, Order,
  Authorization, Challenge, Certificate — each with key fields.
- **Challenge response payloads** for HTTP-01, DNS-01, TLS-ALPN-01.

### A.3 State machine

ACME order state in mermaid `stateDiagram-v2`:
pending → ready → processing → valid; with invalid as the failure
state from any other.

### A.4 Code example

- `python` — using `acme` library (the certbot library) to do a
  full HTTP-01 issuance
- `javascript` — `acme-client` (Node.js) doing the same
- `cli` — `certbot certonly --webroot` and `acme.sh --issue` examples
- `wire` — sectioned dump: newNonce response, newAccount JWS,
  newOrder response, challenge JSON, finalize, cert chain PEM

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries: Google Trust Services production ACME (March
2024), MPIC mandatory (15 March 2025), Apple SC-063v3 47-day
ballot passing (March 2025), Sunlight CT logs at Let's Encrypt
(2024–2025), OCSP wind-down at Let's Encrypt (2025), Let's Encrypt
crossing 500M active certs (late 2025).

### A.6 Real-world deployments

≥5 named: Let's Encrypt (>500M active certs), ZeroSSL, Buypass
Go SSL, Google Trust Services, Cloudflare Universal SSL using ACME
upstream, every cert-manager Kubernetes install, every Caddy/
Traefik deployment.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

"sysctls" for ACME are client-config items: renewal threshold (days
remaining), retry intervals, rate-limit awareness, key rollover
policy, account key backup.

### A.9 Wireshark hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including J. Alex Halderman, Peter Eckersley (with deceased years
1979–2022), Josh Aas with full bios.

### A.12 Spec records ≥3

RFC 8555 (ACMEv2), RFC 8737 (TLS-ALPN-01), RFC 8738 (IP), RFC 9447
(Authority Token), RFC 9448 (TNAuthList). Plus CA/B Forum Baseline
Requirements (latest 2.0.x).

### A.13 New glossary concepts

≥12 — Certificate Authority, CSR, X.509, account, order,
authorization, identifier, challenge, HTTP-01, DNS-01, TLS-ALPN-01,
JWS, finalize, OCSP, CAA, CT log, Sunlight, MPIC, EAB, wildcard,
Baseline Requirements.

### A.14 Frontier entry

Strong candidate: the **47-day cert lifetime** ramp. Provide metrics
(passed CA/B Forum ballot SC-063v3, March 2025; ramp dates 2026,
2027, 2029). Optionally a second entry for Sunlight CT.

### A.15 Journey suggestion

"How the green padlock got there" — a 5–6 step journey covering
domain control → ACME challenge → CA issuance → CT logging → TLS
handshake → browser trust UI.

### A.16 Comparison pair

"ACME vs. manual CA issuance" and "Let's Encrypt vs. commercial
CAs" — both compelling cards.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "Encrypt the entire web" — the EFF / Michigan / ISRG
  origin story
- Timeline: 2013 (ISRG) → 2015 (first cert) → 2016 (GA) → 2019 (RFC
  8555) → 2021 (DST Root CA X3 expiry) → 2024 (Google Trust
  Services ACME) → 2025 (47-day ballot + MPIC)
- Callout: "The cross-sign that gave Let's Encrypt life — and
  killed legacy clients six years later"
- Pioneers section: Halderman + Eckersley + Aas mini-bios
- Diagram: the JWS-Flattened request structure
- Image: Wikimedia of the Let's Encrypt logo OR the famous photo
  of the first cert issuance

### A.18 Famous-incident references + new outage proposals

Strong candidates for new outage records:
- DST Root CA X3 expiry (30 September 2021) — protocol-design,
  affects TLS broadly, named cast Daniel Stenberg / ISRG
- Let's Encrypt 3.05M-cert mass revocation (March 4, 2020) —
  software-bug
- (Optional) Entrust distrust (CA/B Forum, 2024) — adjacent

### A.19 Embedded media

Highest-signal: Halderman's *Computer Security* lecture series,
Let's Encrypt's own animated explainers, Caddy's "TLS by default"
demo videos, Daniel Stenberg's curl conference talks on the DST
Root CA X3 saga.

### A.20 Prerequisites

```
concepts: [tls, x509, public-key-crypto, dns-record, http, base64url, jwt]
protocols: [tls, dns, http-1-1]
```

### A.21 Name highlight

```
"[A]utomatic [C]ertificate [M]anagement [E]nvironment"  (ACME)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for full HTTP-01 issuance: newNonce →
newAccount → newOrder → authorization fetch → challenge response
provisioning → challenge POST → server validation → finalize → cert
retrieval. 10–14 step annotations.

### A.23 Category placement

Fits cleanly in **`utilities-security`** alongside TLS, SSH, DNS,
OAuth 2.0. No new category needed.

---

# Appendix B — Simulator step list

Author **one** simulation — an HTTP-01 challenge end-to-end issuance.

```
title: "ACME HTTP-01 Issuance"
description: "Watch a Caddy server obtain a Let's Encrypt cert via HTTP-01 from cold start to padlock."
actors:
  - { id: "client", label: "ACME Client (Caddy)", icon: "server", position: "left" }
  - { id: "ca", label: "ACME Server (Let's Encrypt)", icon: "shield-check", position: "right" }
  - { id: "validator", label: "Validation Probes (MPIC)", icon: "globe", position: "center-right" }
userInputs:
  - { id: "domain", label: "Domain", type: "text", defaultValue: "example.com" }
  - { id: "challenge", label: "Challenge type", type: "select", options: ["HTTP-01", "DNS-01", "TLS-ALPN-01"], defaultValue: "HTTP-01" }
  - { id: "keyType", label: "Key type", type: "select", options: ["ECDSA P-256", "RSA-2048", "Ed25519"], defaultValue: "ECDSA P-256" }
steps:
  - id: directory
    label: "GET /directory"
    description: "Client fetches the ACME directory to discover endpoints."
    fromActor: client
    toActor: ca
    duration: 700
    highlight: [newNonce, newAccount, newOrder]
    layers:
      - HTTPS: { method: "GET", path: "/directory" }
      - TLS: { version: "1.3" }
  - id: nonce
    label: "HEAD /newNonce"
    description: "Client gets an anti-replay nonce."
    fromActor: client
    toActor: ca
    duration: 500
    highlight: [Replay-Nonce]
  - id: account
    label: "POST /newAccount"
    description: "Client creates an account, JWS-signed by the new account key."
    fromActor: client
    toActor: ca
    duration: 900
    highlight: [protected, payload, signature, jwk]
    layers:
      - JWS: { alg: "ES256", typ: "JOSE+JSON" }
      - HTTPS: { method: "POST" }
  - id: order
    label: "POST /newOrder"
    description: "Client requests a cert for example.com — order returned with authorization URLs."
    fromActor: client
    toActor: ca
    duration: 900
    highlight: [identifiers, authorizations, finalize, status]
  - id: authz
    label: "GET authorization → challenge offer"
    description: "Server returns http-01 / dns-01 / tls-alpn-01 challenges with tokens."
    fromActor: ca
    toActor: client
    duration: 900
    highlight: [type, token, url, status]
  - id: provision
    label: "Provision challenge resource"
    description: "Client writes /.well-known/acme-challenge/{token} → {token}.{thumbprint}."
    fromActor: client
    toActor: client
    duration: 800
    highlight: [token, thumbprint]
  - id: notify
    label: "POST challenge URL (ready to validate)"
    description: "Client tells CA it's ready for validation."
    fromActor: client
    toActor: ca
    duration: 700
    highlight: [status: "pending → processing"]
  - id: validate
    label: "Multi-perspective HTTP fetch"
    description: "CA fetches the challenge resource from ≥3 network vantage points (MPIC)."
    fromActor: validator
    toActor: client
    duration: 1200
    highlight: [GET /.well-known/acme-challenge/, response-body]
  - id: finalize
    label: "POST /finalize with CSR"
    description: "Client submits the CSR; CA mints the cert."
    fromActor: client
    toActor: ca
    duration: 1000
    highlight: [csr, finalize, status: "ready → processing"]
  - id: cert
    label: "GET /cert URL"
    description: "Client downloads the PEM chain (leaf + intermediate)."
    fromActor: client
    toActor: ca
    duration: 700
    highlight: [BEGIN CERTIFICATE, chain]
```

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
