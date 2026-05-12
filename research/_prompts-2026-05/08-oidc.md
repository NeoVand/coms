===== PROTOCOL · OIDC · OpenID Connect =====

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
distilled into one document. Surface-level "what is OIDC" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — Brad Fitzpatrick's OpenID 1.0 (2005) born out of
  LiveJournal, the URL-as-identity era, the 2008 OpenID 2.0 stretch, the
  collapse-and-rebuild as OpenID Connect 1.0 layered atop OAuth 2.0 in
  February 2014, the Sakimura/Bradley/Jones/Campbell architect group, the
  OpenID Foundation governance, the slow grinding migration from SAML SSO
  inside enterprises, FAPI 1.0 (2018) and FAPI 2.0 (2024) for open banking.
- Mechanics deep enough that someone could re-implement a minimal OIDC
  Relying Party (RP) and OpenID Provider (OP) after reading: discovery,
  the Authorization Code + PKCE flow, ID Token validation, the
  Authorization Code vs Implicit vs Hybrid distinction (and why Implicit
  is dead), Request Objects, PAR, DPoP, JARM, CIBA.
- Real failures and famous incidents — the 2017 Cure53 audit findings,
  Spotify's OAuth/OIDC mixup-attack class, the perennial "JWT alg=none"
  classic, the 2023 GitHub OAuth-app-misuse incidents, the long history
  of broken PKCE implementations, and the IdP-mixup attacks documented
  by Mainka, Mladenov, Schwenk et al.
- Connections to adjacent protocols — explain crisply that **OIDC is to
  OAuth 2.0 what HTTP is to TCP**: strictly layered on top, adding an
  identity layer the underlying spec lacks. SAML 2.0 as the federated
  predecessor it is steadily replacing in enterprise SSO. TLS as a
  mandatory floor. JWT (RFC 7519), JWS (7515), JWE (7516), JWK (7517)
  as the supporting JOSE primitives. PKCE, PAR, DPoP.
- 2024–2026 developments — FAPI 2.0 final (January 2024), OAuth 2.1
  consolidation draft progress, RFC 9700 (OAuth 2.0 Security Best
  Current Practice, January 2025), DPoP wider adoption, the explosion
  of OpenID for Verifiable Credentials (OID4VCI, OID4VP) driven by the
  EU Digital Identity Wallet mandate (eIDAS 2.0, in force May 2024),
  SD-JWT VCs, CIBA decoupled flows for call centres and physical retail.
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
standards body (IETF datatracker, OpenID Foundation specs site). Past
passes have left 121 `[needs source]` markers across 46 reports — please
try harder this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how OpenID Connect relates
to these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, **OAuth 2.0**

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, **ACME**, email-auth (DKIM/SPF/DMARC), **SAML**,
**LDAP**, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **OpenID Connect (OIDC)** — the identity
layer on top of OAuth 2.0 that turned "delegated authorization" into
"delegated authentication + identity." OIDC adds the **ID Token** (a
signed JWT asserting *who the user is*), a Discovery document
(`/.well-known/openid-configuration`), a UserInfo endpoint, a standard
set of claims (`sub`, `iss`, `aud`, `exp`, `iat`, `nonce`, `email`,
`name`), and a coherent set of flows (Authorization Code with PKCE,
Hybrid, Implicit-deprecated, CIBA, Device Authorization).

OIDC 1.0 was published in February 2014 by the OpenID Foundation. The
architect group included **Nat Sakimura** (Nomura Research Institute,
later OIDF chair), **John Bradley** (Yubico, formerly Ping Identity),
**Mike Jones** (then Microsoft, lead editor of JWT/JOSE), and **Brian
Campbell** (Ping Identity). The earlier OpenID 1.0 (2005) and 2.0
(2007–2008) were entirely different protocols — "URL as identity" —
that OIDC obsoleted in spirit if not by formal action.

Related protocols and standards likely connected to OIDC that you should
verify and expand on:

  - **OAuth 2.0** (RFC 6749, RFC 6750) — the substrate; OIDC literally
    re-uses the authorize/token endpoints and adds the `openid` scope
  - **JWT / JOSE** — RFC 7519 (JWT), 7515 (JWS), 7516 (JWE), 7517 (JWK),
    7518 (JWA) — the ID Token is a signed JWT
  - **PKCE** (RFC 7636, September 2015) — now mandatory for all OAuth
    public clients per RFC 9700
  - **PAR** (Pushed Authorization Requests, RFC 9126, September 2021)
  - **DPoP** (Demonstrating Proof of Possession, RFC 9449, September 2023)
  - **JAR / JARM** — JWT-Secured Authorization Request and Response
  - **CIBA** (Client Initiated Backchannel Authentication, FAPI-CIBA)
  - **FAPI 1.0** (final 2021) and **FAPI 2.0** (final January 2024)
  - **SAML 2.0** — the federated SSO predecessor; OIDC is steadily
    replacing it in consumer and modern enterprise contexts
  - **TLS 1.2/1.3** — mandatory transport
  - **OAuth 2.1** (draft-ietf-oauth-v2-1) — consolidates 2.0 + PKCE +
    9700 + drops Implicit and ROPC
  - **OpenID for Verifiable Credentials** (OID4VCI, OID4VP) — the EU
    Digital Identity Wallet mandate driver
  - **SD-JWT** (Selective Disclosure JWT, draft on track for RFC)
  - **Kerberos** — OIDC's enterprise SSO peer in the on-prem world
  - **LDAP** — directory backing the IdP user store in virtually every
    enterprise deployment

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., Relying Party / RP, OpenID Provider / OP, ID Token, Access
  Token, Refresh Token, claim, scope, nonce, `sub`, `iss`, `aud`,
  Authorization Code flow, Implicit flow, Hybrid flow, Discovery,
  Dynamic Registration, JWKS endpoint, PKCE, code_verifier,
  code_challenge, PAR, DPoP, JARM, CIBA, FAPI, SD-JWT, verifiable
  credential, holder/issuer/verifier)
- [ ] **≥4** dated entries on the history timeline (2005 → 2026)
- [ ] Full ID Token claim layout (header/payload/signature, every
  standard claim with description) AND Authorization Request
  parameter layout
- [ ] OIDC session state machine in mermaid `stateDiagram-v2`:
      unauthenticated → authenticating → authenticated → token-refresh
      → logout
- [ ] A sequence diagram of the Authorization Code + PKCE flow with
      ID Token issuance and UserInfo call (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale
      numbers, and dates (Google Sign-In >billion users, Apple Sign-In,
      Microsoft Entra ID, Okta, Auth0, Ping Identity, Keycloak,
      Authentik/Authelia, AWS Cognito, GCP Identity Platform)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Nat Sakimura, John Bradley, Mike Jones, Brian Campbell, Justin
      Richer, Aaron Parecki, Dick Hardt for OAuth backstory, Eve
      Maler for SAML→OIDC backstory)
- [ ] **≥3** RFCs / OIDF specs with number, year, status, and
      notable-section pointers (OIDC Core, OIDC Discovery, RFC 7519
      JWT, RFC 9126 PAR, RFC 9449 DPoP, RFC 9700 BCP, FAPI 2.0)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (Cure53 OIDC audit 2017, JWT alg=none class 2015,
      IdP-mixup attacks Mainka/Mladenov/Schwenk 2017, GitHub OAuth
      app misuse 2023, Spotify OAuth/OIDC mixup, Okta breach Oct 2023)
- [ ] **≥3** fun facts / anecdotes with sources (Brad Fitzpatrick's
      LiveJournal origin, the "OpenID 2.0 is dead, long live OIDC"
      narrative pivot, Mike Jones's relentless JWT editorship,
      "claim" as a term borrowed from SAML, the renaming of Azure
      AD to Microsoft Entra ID in July 2023)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (always validate `iss`/`aud`/`exp`/`nonce`, never trust UserInfo
      without an Access Token, the front-channel logout trap, the
      RP-Initiated Logout vs Back-Channel Logout vs Session Management
      mess, PKCE on public clients always, never accept `alg=none`)
- [ ] **≥3** Wireshark / capture-tool filter examples (HTTPS so use
      mitmproxy/Burp/Charles instead; `http.request.uri contains
      authorize`, `http.request.uri contains token`, mitmproxy filters
      for JWT inspection, jwt.io and `jwt-cli` debugging moves)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (RFC 9700 publication Jan 2025, FAPI 2.0 final Jan 2024, eIDAS
      2.0 in force May 2024, EU Digital Identity Wallet rollout
      milestones, OAuth 2.1 draft-12+, OID4VCI/OID4VP progress,
      DPoP adoption stats from Okta/Microsoft)
- [ ] **≥1** 2025–2026 frontier development (Verifiable Credentials /
      EU Digital Identity Wallet, OAuth 2.1 ratification, FAPI 2.0
      Australian CDR / UK Open Banking adoption, CIBA + DPoP
      composition)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (Authorization Code + PKCE
      end-to-end, including Discovery and ID Token validation)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* OIDC makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: HTTP redirects (`302`/`303`), TLS,
HTTPS, cookies vs tokens, the same-origin and cross-origin model,
front-channel vs back-channel, base64url, JSON, public-key
cryptography (RSA, ECDSA, Ed25519), HMAC, JWT vs opaque tokens,
JOSE family (JWS/JWE/JWK/JWA), claim, scope, audience, issuer,
subject, nonce, state parameter, PKCE, OAuth 2.0 grant types,
the four OAuth roles (resource owner, client, authorization server,
resource server) plus the two OIDC roles (Relying Party, OpenID
Provider), Identity Provider (IdP), Service Provider (SP — SAML
term), federation, SSO.

## History and story

The five-act story:

1. **Pre-OpenID (1999–2005)** — Microsoft Passport (1999), the
   SXIP and Liberty Alliance efforts, SAML 2.0 finalised 2005, the
   "URL as identity" idea brewing in the LiveJournal community.
2. **OpenID 1.0 (2005) and 2.0 (2007–2008)** — Brad Fitzpatrick's
   May 2005 OpenID 1.0 announcement, Dick Hardt's pitch at OSCON
   2005 ("Identity 2.0"), the YADIS discovery merge, OpenID 2.0
   published December 2007, the brief enthusiasm of 2008–2010
   when MySpace, Yahoo, AOL, and Google all became OpenID
   providers, the eventual realisation that OpenID 2.0 was a
   custom-XML monstrosity and that nobody wanted "URL-as-identity"
   anyway.
3. **OAuth happens (2007–2012)** — Twitter's OAuth 1.0 work in 2007,
   IETF OAuth WG formation 2008, RFC 5849 (OAuth 1.0a) April 2010,
   the Eran Hammer resignation drama 2012, RFC 6749/6750 (OAuth 2.0)
   October 2012.
4. **OIDC architect group (2011–2014)** — Sakimura/Bradley/Jones/
   Campbell convening, the OIDF formation, the deliberate decision
   to build on OAuth 2.0 not replace it, OIDC 1.0 published
   25 February 2014.
5. **The modern era (2014–2026)** — FAPI 1.0 (2018), Apple "Sign in
   with Apple" forced on App Store apps (June 2019), Microsoft Azure
   AD becoming Entra ID (July 2023), FAPI 2.0 final (January 2024),
   RFC 9700 BCP (January 2025), the EU Digital Identity Wallet
   mandate, OID4VC.

Tell the actual narrative — name names, give years, describe the
rooms (mostly OIDF Workshops adjacent to RSA Conference, and IETF
OAuth WG meetings). Mention the politics — David Recordon's
contributions, why Yahoo dropped OpenID, why Google's "Sign in
with Google" took until OIDC to become reliable, why "Login with
Facebook" never became OIDC-compliant.

## How it actually works

Cover, in this order:

1. **Discovery** — `GET https://op.example.com/.well-known/openid-configuration`
   returns a JSON document with all endpoints + supported algorithms +
   JWKS URI. Explain `issuer`, `authorization_endpoint`, `token_endpoint`,
   `userinfo_endpoint`, `jwks_uri`, `id_token_signing_alg_values_supported`.
2. **Client registration** — Static vs Dynamic Client Registration
   (RFC 7591).
3. **The Authorization Code + PKCE flow** — step-by-step, including
   `code_verifier`/`code_challenge` derivation, `state` and `nonce`,
   the redirect to `/authorize`, user authentication at OP, the
   redirect back with `?code=...`, the back-channel POST to
   `/token`, the response with `access_token` + `id_token` +
   `refresh_token`.
4. **ID Token structure** — Header (`alg`, `kid`), payload (`iss`,
   `sub`, `aud`, `exp`, `iat`, `nonce`, `auth_time`, `acr`, `amr`,
   `azp`), signature. Every claim defined.
5. **ID Token validation** — the seven mandatory checks per OIDC
   Core §3.1.3.7.
6. **UserInfo endpoint** — GET with the Access Token, returns
   additional claims.
7. **Other flows** — Hybrid, CIBA, Device Authorization (RFC 8628),
   why Implicit is deprecated.
8. **Logout** — RP-Initiated Logout, Front-Channel Logout,
   Back-Channel Logout (the three competing specs and the mess
   they create).
9. **Security extensions** — PKCE, PAR (RFC 9126), DPoP (RFC 9449),
   JARM, mTLS client auth (RFC 8705).

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of Authorization Code + PKCE + ID Token + UserInfo
2. State diagram of an OIDC RP session lifecycle
3. ID Token JWT layout as a table with each header + claim field,
   plus an Authorization Request parameter layout

## Deep connections to other protocols

Cover each related protocol listed in the topic. Emphasise:

- **OAuth 2.0** — "OIDC is to OAuth 2.0 what HTTP is to TCP."
  Identical authorize/token endpoints; OIDC is recognised by the
  `openid` scope; the ID Token is the *only* essential addition.
- **SAML 2.0** — federated SSO predecessor; assertions (XML signed)
  vs ID Tokens (JWT signed). Enterprise still runs lots of SAML;
  most new green-field deployments are OIDC.
- **JWT (RFC 7519) + JOSE** — the ID Token *is* a JWT. Explain
  signing algorithms (RS256, ES256, EdDSA), the alg=none classic
  attack, when to use JWE encryption.
- **TLS** — non-negotiable transport floor.
- **PKCE / PAR / DPoP** — OAuth extensions that protect OIDC flows.
- **Kerberos** — enterprise SSO ancestor; OIDC for the web,
  Kerberos for the LAN; many enterprises bridge them via IdP
  integration (AD FS, Entra ID).
- **LDAP** — almost every IdP user store is LDAP-backed (Active
  Directory, OpenLDAP, FreeIPA).
- **WebAuthn / FIDO2** — increasingly the *authentication factor*
  inside an OIDC flow.
- **OID4VCI / OID4VP** — the verifiable-credentials evolution that
  re-uses OIDC's authorization model but inverts the trust direction.

## Real-world deployment

Major implementations — named libraries, named OPs, named platforms:

- **OPs (SaaS)** — Okta (~18,000 customers), Auth0 (acquired by Okta
  2021, ~100M MAU as of 2024), Microsoft Entra ID (formerly Azure AD,
  >700M MAU), Ping Identity, ForgeRock, Curity, JumpCloud.
- **OPs (self-hosted)** — Keycloak (Red Hat), Authentik, Authelia,
  Dex, Ory Hydra, Zitadel, Gluu.
- **Consumer OPs** — Google Sign-In (>1B users), Sign in with Apple
  (mandatory for App Store apps using third-party login since 2019,
  ~1.5B Apple ID holders), Facebook Login (proprietary OAuth, not
  OIDC-compliant), LINE Login, Microsoft Personal Accounts.
- **Cloud-provider OPs** — AWS Cognito, GCP Identity Platform,
  Azure AD B2C.
- **RP libraries** — `oidc-client-ts` (browser), `next-auth` /
  `Auth.js`, `pyoidc`, `pyOIDC`, `Authlib` (Python), `node-openid-client`,
  `Spring Security OAuth2`, MSAL libraries from Microsoft.

Real numbers: how many sites use "Sign in with Google" (~9M as of
2024 per BuiltWith), what % of Fortune 500 publishes OIDC discovery,
the FAPI deployment in UK Open Banking (~7M monthly authenticated
users) and Australian Consumer Data Right.

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **JWT `alg=none` (2015)** — auth0 / Tim McLean blog post
  "Critical Vulnerabilities in JSON Web Token Libraries"
  (March 2015). Libraries trusted the `alg` header from
  attacker-controlled JWTs and accepted "none" or HMAC-with-public-key
  confusion attacks.
- **IdP-Mixup attack (2014–2017)** — Mainka, Mladenov, Schwenk
  "On the security of modern Single Sign-On Protocols," USENIX
  Security 2017. A malicious OP can poison the discovery a client
  uses for a different OP.
- **Cure53 OIDC audit (2017)** — sponsored by OIDF, found a number
  of common implementation issues.
- **Spotify OAuth Authorization Code injection (multiple, 2016–2019)**
  — class of bugs where attackers replay codes across clients.
- **Microsoft Account/Azure AD token confusion (CVE-2018-8417)** and
  the recurring "wreckage" of multi-tenant validation pitfalls.
- **Okta October 2023 support-portal breach** — adjacent to OIDC
  but devastating because of HAR-file token theft.
- **GitHub OAuth app abuse (April 2022 and recurring 2023)** — stolen
  OAuth tokens from Heroku and Travis CI used to clone private repos.
- **Sign-in-with-Apple bug (May 2020)** — Bhavuk Jain's $100,000
  bounty: the JWT signing was performed regardless of whether the
  user actually owned the email claimed.
- **Salt Labs OAuth research (2022–2023)** — covering Booking.com,
  Grammarly, Vidio.

## Fun facts and anecdotes

- The OIDC 1.0 spec dropped on **25 February 2014** at the OIDF
  Mountain View workshop — a date Sakimura still references in talks.
- The "URL as identity" idea died not because it was bad but because
  nobody wanted to remember a URL like `https://brad.livejournal.com`
  as their login. Email became the practical identifier.
- **Mike Jones** edited so many JOSE/JWT/OIDC specs that his
  IETF AUTH48 emails became a meme.
- **Brad Fitzpatrick** went on to Google (Camlistore, Go) and never
  worked on OIDC itself.
- The renaming of Azure AD to **Microsoft Entra ID** in **July 2023**
  broke half the SEO of the OAuth/OIDC ecosystem.
- Apple's "Sign in with Apple" mandate forced thousands of iOS apps to
  ship OIDC integration with about six months' notice in 2019–2020.
- The `nonce` parameter in OIDC was a late addition specifically
  because OAuth 2.0 had no replay-attack defence at the token level.
- **OID4VCI's** spec page on the OIDF site has been edited more in
  2024–2025 than in the previous five years combined — that's how
  fast EU Digital Identity Wallet is reshaping the space.

## Practical wisdom

What an engineer actually needs to know:

- **Always validate** all seven mandatory ID Token checks per OIDC
  Core §3.1.3.7: signature, `iss`, `aud`, `azp` if multi-aud, `exp`,
  `iat`, `nonce`. Use a library — never roll your own.
- **PKCE is mandatory for every public client.** Even confidential
  clients now per RFC 9700. The `S256` method only; never `plain`.
- **State parameter is non-optional** — CSRF protection on the
  authorization request.
- **Never use Implicit flow** in 2026. Use Authorization Code + PKCE.
- **The UserInfo endpoint claims are the source of truth** for changing
  attributes; ID Token claims are a snapshot at auth time.
- **RP-Initiated Logout, Front-Channel Logout, and Back-Channel
  Logout are three different specs** — pick one and document it.
- **Rotate signing keys** via the `jwks_uri` and respect `kid`.
- **DPoP** if you need sender-constrained tokens (RFC 9449).
- **PAR** if you need to keep authorization request parameters off
  the URL (large requests, banking).
- **Token caching** — never cache an ID Token past its `exp`;
  Access Tokens have their own lifetime.
- **The Authorization Server discovery metadata is signed only if
  using `signed_metadata`** — most deployments fetch over TLS only.

Wireshark/Burp/mitmproxy filter examples: HTTPS so TLS-intercept is
required.

## Pioneers and key contributors

- **Nat Sakimura** — Nomura Research Institute, OIDF Chair since 2011.
  Co-author of OIDC Core, FAPI, CIBA, OID4VC. Drove the FAPI work
  out of Japan/UK/Australia open banking. Wikipedia/homepage URL.
- **John Bradley** — Yubico, formerly Ping Identity. Co-author of
  OIDC, JWT, FAPI. Long-time IETF OAuth WG fixture.
- **Mike Jones** — Self Issued Consulting (formerly Microsoft until
  2022), lead editor of RFC 7515 (JWS), 7516 (JWE), 7517 (JWK), 7519
  (JWT), 8259, and a list of others. His personal blog at
  self-issued.info is the canonical changelog of JOSE evolution.
- **Brian Campbell** — Ping Identity. Long-time editor of OIDC and
  related specs; one of the most active voices in the OAuth WG.
- **Justin Richer** — Bespoke Engineering. Author of *OAuth 2 in
  Action* (Manning 2017), co-editor of RFC 9700, GNAP work.
- **Aaron Parecki** — Okta, runs oauth.net, author of *OAuth 2.0
  Simplified*, IETF OAuth WG co-chair.
- **Brad Fitzpatrick** — original OpenID 1.0 (2005), LiveJournal,
  Google, now solo. Not directly an OIDC contributor but the
  spiritual ancestor.
- **Dick Hardt** — "Identity 2.0" advocate, SXIP, later Amazon,
  later authored the OAuth 2.0 RFC editor draft.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated.

- **Authoritative specs** — OIDC Core 1.0 (with errata set 2,
  December 2023), Discovery 1.0, Dynamic Client Registration 1.0,
  RP-Initiated Logout 1.0, FAPI 2.0 Security Profile (January 2024),
  CIBA 1.0, OID4VCI/OID4VP latest drafts, RFC 7519/7515/7516/7517,
  RFC 7636 (PKCE), RFC 9126 (PAR), RFC 9449 (DPoP), RFC 9700 (BCP
  January 2025), OAuth 2.1 draft.
- **Books** — *OAuth 2 in Action* (Richer & Sanso, Manning 2017),
  *OAuth 2.0 Simplified* (Parecki, 2024 update), *Solving Identity
  Management in Modern Applications* (Wilson & Hingnikar, Apress
  2nd ed. 2023).
- **Papers** — Mainka, Mladenov, Schwenk "On the security of modern
  SSO protocols" USENIX 2017; Fett, Küsters, Schmitz "A
  comprehensive formal security analysis of OAuth 2.0" CCS 2016;
  Lodderstedt et al. on OAuth threat model.
- **Engineering blogs** — Okta Developer blog, Auth0 blog (still
  active under Okta), Curity Resource Library (excellent FAPI
  content), Microsoft Identity blog, the Cloudflare Zero Trust blog.
- **YouTube** — OIDF Workshops, Identiverse (annual conference, all
  talks on YouTube), Aaron Parecki's OAuth talks, the Justin Richer
  "OAuth in Action" talks, the FIDO Authenticate conference channel.
- **Podcasts** — *Identity Unlocked* (Vittorio Bertocci until his
  passing 2023, now hosted by Auth0), *Identity North*, *The Identity
  Show* (Indykite).
- **Courses** — Auth0's "OAuth 2.0 and OpenID Connect" course
  (free), Curity's free training, Pluralsight courses.
- **Tools** — `jwt.io`, `oidcdebugger.com`, Curity's OAuth Tools,
  Postman OAuth helpers, `kc-auth-cli`, the OpenID Foundation's
  conformance test suite.

## Where things are heading (2025–2026 frontier)

- **OAuth 2.1** — consolidating OAuth 2.0 + PKCE + RFC 9700 +
  dropping Implicit and Resource Owner Password Credentials.
  Draft -12+ as of 2026; expected RFC status by late 2026.
- **FAPI 2.0** final (January 2024) — adopted by Australian CDR,
  UK Open Banking, Brazilian Open Finance.
- **EU Digital Identity Wallet (EUDIW)** — eIDAS 2.0 regulation in
  force May 2024, mandatory member-state wallet apps by 2026.
  OID4VCI and OID4VP are the issuance and presentation specs.
- **SD-JWT VC** — Selective Disclosure JWT Verifiable Credential
  draft on track for RFC; Microsoft, Mattr, Yes.com shipping.
- **DPoP adoption** — Microsoft Entra rolled out 2024, Okta in
  preview 2025.
- **CIBA + DPoP composition** for call-centre and physical retail
  flows.
- **Identity Wallets** — Google Wallet, Apple Wallet, IBM Verify,
  Microsoft Authenticator all racing to be EUDIW-compliant.

## Hooks for the article, infographic, and podcast

- A 60-second narrated hook
- A striking statistic — "Sign in with Google has been used by over
  one billion people across nine million sites"
- A "pause and think" moment — "Every time you click 'Sign in with',
  your browser executes a four-actor protocol designed by a working
  group that included the inventor of JWT, the chair of the OpenID
  Foundation, and a Ping Identity engineer — and the entire thing
  fits inside RFC sub-section 3.1"
- A failure-story arc (the Sign-in-with-Apple May 2020 bug is
  excellent — clean setup, simple mistake, $100K bounty resolution)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: oidc
name: OpenID Connect
abbreviation: OIDC
categoryId: <recommend — likely a new "identity" category alongside OAuth2/SAML/Kerberos/LDAP, or fold into utilities-security>
port: none (uses 443 over HTTPS)
year: 2014
rfc: OpenID Connect Core 1.0 (OIDF spec, errata set 2 December 2023)
standardsBody: industry-consortium (OpenID Foundation, with IETF for sibling RFCs)
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency: "100–500ms for full Authorization Code flow", throughput: "n/a — interactive", overhead: "ID Token ~700–1500 bytes JWT" }
connections: [oauth2, tls, saml-references-if-added, kerberos, ldap, jwt-jose-glossary]
links: { wikipedia: "https://en.wikipedia.org/wiki/OpenID_Connect", spec: "https://openid.net/specs/openid-connect-core-1_0.html", official: "https://openid.net" }
image: <Wikimedia URL — OIDC logo or flow diagram>
```

### A.2 Header / wire-format layout

Provide BOTH:
- **ID Token JWT layout** — header (`alg`, `kid`, `typ`), payload
  (`iss`, `sub`, `aud`, `exp`, `iat`, `nbf?`, `auth_time?`, `nonce?`,
  `acr?`, `amr?`, `azp?`, `email?`, `email_verified?`, `name?`,
  custom claims), signature.
- **Authorization Request parameter table** — `response_type`,
  `client_id`, `redirect_uri`, `scope` (must include `openid`),
  `state`, `nonce`, `code_challenge`, `code_challenge_method`,
  `prompt`, `max_age`, `acr_values`, `login_hint`, `request`, `request_uri`.

### A.3 State machine

OIDC RP session lifecycle in mermaid `stateDiagram-v2`:
Unauthenticated → Authorizing (redirect to OP) → AuthCodeReceived →
TokenExchange → Authenticated → TokenRefresh (loop) → LoggedOut.

### A.4 Code example

- `python` — `authlib` doing Authorization Code + PKCE end-to-end
- `javascript` — `oidc-client-ts` in a SPA OR `next-auth` server-side
- `cli` — `curl` doing discovery + token endpoint exchange with PKCE
- `wire` — Discovery JSON, Authorization Request URL, Token Response
  JSON, decoded ID Token (header.payload.signature) — sectioned dump

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. FAPI 2.0 final (January 2024), eIDAS
2.0 (May 2024), Microsoft Entra ID rebrand (July 2023 — outside
window but contextual), RFC 9700 BCP (January 2025), OAuth 2.1 draft
-12+, OID4VCI/OID4VP milestones, DPoP rollout.

### A.6 Real-world deployments

≥5 named: Google Sign-In (>1B users), Microsoft Entra ID (>700M MAU),
Apple Sign in with Apple (~1.5B Apple ID holders), Okta+Auth0
(~18,000 customers, ~100M end-users), Keycloak (Red Hat, top-cited
self-hosted OP), UK Open Banking FAPI deployment (~7M MAU).

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

For OIDC the relevant "sysctls" are mostly library-level: token
lifetime defaults (`access_token` 5–60 min; `refresh_token` rolling
or absolute; `id_token` short and validated against `exp`), JWKS
caching TTL (~12 hours typical), clock-skew tolerance (60s typical).

### A.9 Wireshark hints ≥3

Since OIDC is always over TLS, use Burp/mitmproxy/Charles to MITM,
or use browser devtools. Filters include
`http.request.uri contains "authorize"`, `http.request.uri contains
"token"`, mitmproxy `~u openid-configuration`.

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Nat Sakimura, Mike Jones, John Bradley with full bios.

### A.12 Spec records ≥3

OIDC Core 1.0, OIDC Discovery 1.0, FAPI 2.0 Security Profile, RFC
7519 (JWT), RFC 9126 (PAR), RFC 9449 (DPoP), RFC 9700 (BCP). Plus
OAuth 2.0 RFC 6749 as the underlying.

### A.13 New glossary concepts

≥12 — Relying Party, OpenID Provider, ID Token, JWT, JWS, JWE, JWK,
JWKS endpoint, Discovery, claim, scope, nonce, state, PKCE, PAR,
DPoP, FAPI, CIBA, SD-JWT, Verifiable Credential, holder, issuer,
verifier.

### A.14 Frontier entry

Two strong candidates: EU Digital Identity Wallet / OID4VC, and
OAuth 2.1 ratification. Provide one of each with metrics.

### A.15 Journey suggestion

"How 'Sign in with Google' actually works" — a 5–6 step journey
covering Discovery → Authorization Request → User auth at OP →
Code redemption → ID Token validation → UserInfo call.

### A.16 Comparison pair

"OIDC vs SAML 2.0" and "OIDC vs OAuth 2.0 (and why they're not
interchangeable)" — both worth comparison cards.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "Brad Fitzpatrick types a blog post" (May 2005 LiveJournal
  origin)
- Timeline: 2005 → 2007 (OpenID 2.0) → 2012 (OAuth 2.0) → 2014 (OIDC)
  → 2019 (Sign in with Apple) → 2024 (FAPI 2.0 + eIDAS 2.0) → 2025
  (RFC 9700)
- Callout: "Why OIDC is to OAuth what HTTP is to TCP"
- Pioneers section embedded: Sakimura + Bradley + Jones + Campbell
- Diagram: the Authorization Code + PKCE + ID Token flow
- Image: Wikimedia of an early OpenID logo or the OIDF logo

### A.18 Famous-incident references + new outage proposals

References + new proposals. Strong candidates for new outage records:
- Sign-in-with-Apple JWT bug (May 2020) — security category
- JWT alg=none (March 2015) — protocol-design
- Okta support-portal HAR theft (October 2023) — adjacent
- Microsoft Storm-0558 (July 2023) — key-signing breach with
  cross-tenant token impact, very OIDC-adjacent

### A.19 Embedded media

Highest-signal: OIDF Workshop talks, Identiverse keynotes, Aaron
Parecki's OAuth + OIDC YouTube playlist, Vittorio Bertocci's
*Identity Unlocked* podcast archive.

### A.20 Prerequisites

```
concepts: [tls, http-redirect, base64url, public-key-crypto, jwt, cookie-vs-token, federation, sso]
protocols: [oauth2, tls, http-1-1, dns]
```

### A.21 Name highlight

```
"[Open]ID [C]onnect"  (OIDC)
```
Or `"OpenID [C]onnect"` if the OIDC abbreviation pattern fits the UI.

### A.22 Diagram-definitions entry

Annotated sequence diagram for Discovery → Authorization Code + PKCE
→ Token Exchange → ID Token validation → UserInfo call. 10–14 step
annotations; explain *what* each request/response is and *why* the
reader is seeing it.

### A.23 Category placement

Strong recommendation: **propose a new "identity" category** covering
OAuth 2.0, OIDC, SAML, Kerberos, LDAP coming in this same pass.
Suggested:

```
id: identity
name: Identity & Access
color: <suggest a hex — gold/amber range works well visually>
glowColor: <complementary>
description: Authentication, authorization, federation, and directory protocols that answer "who is this principal and what may they do."
icon: <lucide-react icon name, e.g., "key-round" or "user-check">
```

---

# Appendix B — Simulator step list

Author **one** simulation — Authorization Code + PKCE + ID Token +
UserInfo end-to-end (the modern recommended flow).

```
title: "OIDC Authorization Code + PKCE Flow"
description: "Watch a SPA sign a user in via Google, validate the ID Token, and call UserInfo."
actors:
  - { id: "rp", label: "Relying Party (SPA)", icon: "browser", position: "left" }
  - { id: "ua", label: "User-Agent (Browser)", icon: "user", position: "center-left" }
  - { id: "op", label: "OpenID Provider (Google)", icon: "shield-check", position: "right" }
userInputs:
  - { id: "clientId", label: "client_id", type: "text", defaultValue: "demo-client-123" }
  - { id: "scope", label: "scope", type: "text", defaultValue: "openid profile email" }
  - { id: "pkceMethod", label: "PKCE method", type: "select", options: ["S256"], defaultValue: "S256" }
steps:
  - id: discovery
    label: "Discovery"
    description: "RP fetches /.well-known/openid-configuration to learn endpoints."
    fromActor: rp
    toActor: op
    duration: 900
    highlight: [issuer, authorization_endpoint, token_endpoint, jwks_uri]
    layers:
      - HTTPS: { method: "GET", path: "/.well-known/openid-configuration" }
      - TLS: { version: "1.3" }
  - id: pkce-gen
    label: "Generate code_verifier + code_challenge"
    description: "RP generates random 43–128 char verifier, S256-hashes to challenge."
    fromActor: rp
    toActor: rp
    duration: 600
    highlight: [code_verifier, code_challenge]
  - id: authz-redirect
    label: "Authorization Request"
    description: "Browser redirected to /authorize with state, nonce, code_challenge."
    fromActor: ua
    toActor: op
    duration: 1200
    highlight: [client_id, redirect_uri, scope, state, nonce, code_challenge]
    layers:
      - HTTPS: { method: "GET", path: "/authorize" }
  - id: user-auth
    label: "User authenticates at OP"
    description: "User enters password / passkey / MFA at Google."
    fromActor: ua
    toActor: op
    duration: 1500
    highlight: [user-credentials]
  - id: code-redirect
    label: "Authorization Response (302)"
    description: "OP redirects browser back to RP with ?code=...&state=..."
    fromActor: op
    toActor: ua
    duration: 900
    highlight: [code, state]
  - id: token-exchange
    label: "Token Request"
    description: "RP POSTs to /token with code + code_verifier + client_id."
    fromActor: rp
    toActor: op
    duration: 1000
    highlight: [grant_type, code, code_verifier, client_id]
    layers:
      - HTTPS: { method: "POST", path: "/token", body: "form-encoded" }
  - id: token-response
    label: "Token Response"
    description: "OP returns access_token + id_token + refresh_token JSON."
    fromActor: op
    toActor: rp
    duration: 900
    highlight: [id_token, access_token, refresh_token, expires_in]
  - id: id-token-validate
    label: "Validate ID Token"
    description: "RP verifies signature via JWKS, checks iss/aud/exp/nonce."
    fromActor: rp
    toActor: rp
    duration: 1100
    highlight: [iss, aud, exp, nonce, signature]
  - id: userinfo
    label: "UserInfo Call"
    description: "RP calls /userinfo with the Access Token for fresh claims."
    fromActor: rp
    toActor: op
    duration: 800
    highlight: [authorization-bearer, sub, email, name]
  - id: session-cookie
    label: "Session established"
    description: "RP sets its own session cookie; flow complete."
    fromActor: rp
    toActor: ua
    duration: 700
    highlight: [Set-Cookie]
```

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
