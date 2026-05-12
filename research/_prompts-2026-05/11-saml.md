===== PROTOCOL · SAML · Security Assertion Markup Language =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, specs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is SAML" content
already exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the OASIS Security Services Technical Committee
  beginnings in 2001, Eve Maler shepherding SAML 1.0 (2002) and 1.1 (2003),
  the convergence with Liberty Alliance ID-FF and Internet2 Shibboleth that
  produced SAML 2.0 in March 2005, the long IdP-vs-SP shootout era,
  the 2010s SaaS explosion (Okta 2009, OneLogin, Ping Identity) that made
  SAML the lingua franca of enterprise SSO, and the slow but real OIDC
  migration that began in earnest after 2016.
- Mechanics deep enough that someone could re-implement a minimal SAML
  Service Provider after reading: the AuthnRequest/Response XML schema,
  XML Signature, XML Encryption, the HTTP-Redirect and HTTP-POST bindings,
  the Web Browser SSO profile, SP-initiated vs IdP-initiated flows,
  metadata exchange.
- Real failures and famous incidents — the SAML signature-wrapping
  family (Duong + Rizzo 2011 onward), Roland Bischofberger / Cure53
  audits, the 2024 GitHub SAML private-key leak, Okta's 2022 "0ktapus"
  breach with SAML token reuse, the 2017 SAML Raider tool, the 2023
  Microsoft Storm-0558 attack (Outlook key compromise enabling SAML/OIDC
  token forgery), the broader "identity-firms-as-targets" era.
- Connections to adjacent protocols — OAuth 2.0 (the eternal "use which
  when" question), OIDC (the modern replacement story), Kerberos (the
  on-prem alternative), LDAP (the directory backing the IdP), SOAP
  (SAML's XML wire format ancestry), HTTPS (mandatory transport).
- 2024–2026 developments — SAML in "managed decline": most new auth
  deploys OIDC; FedRAMP and other regulated sectors stuck on SAML;
  the spec freeze; the "SAML 3.0" zombie that won't happen; the
  Storm-0558-fueled push for hardware-bound signing and shorter token
  lifetimes; Microsoft's deprecation of SAML token signing certificate
  long lifetimes; the NIST SP 800-63-4 revision touching SAML profiles.
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
USENIX), archive.org for older or dead links, and the relevant standards
body (OASIS, IETF datatracker, NIST, Kantara Initiative). Past passes have
left 121 `[needs source]` markers across 46 reports — please try harder
this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how SAML relates to
these — what it depends on, what depends on it, what it competes with,
what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, **Kerberos**, **OpenID Connect**, ACME, email-auth
(DKIM/SPF/DMARC), **LDAP**, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **SAML — Security Assertion Markup Language**
— the XML-based federated-identity protocol that has been the de facto
enterprise SSO standard for two decades. SAML 2.0 was approved as an OASIS
Standard in March 2005 and is, remarkably, **still the dominant version in
2026** — twenty-one years later, with no successor having shipped from
OASIS. SAML expresses authentication, authorization, and attribute
statements as digitally signed XML "assertions" that an Identity Provider
(IdP) issues to a Service Provider (SP) on behalf of a browser-driven
user. Every enterprise SaaS — Salesforce, Workday, Slack, Zoom, GitHub
Enterprise, ServiceNow, Atlassian — supports SAML SSO as table stakes.

Related protocols and standards likely connected to SAML that you
should verify and expand on:

  - **OAuth 2.0** — the API-authorization counterpart; "SAML vs OAuth"
    is the perennial confusion. Note SAML 2.0 Bearer Assertion grant
    (RFC 7522) and the SAML-OAuth bridging story.
  - **OpenID Connect** — the modern SAML replacement built on OAuth
    2.0 + JWT. Cover OIDC's CIBA, the migration story.
  - **Kerberos** — the on-prem SSO alternative; the AD FS "kerberos
    behind, SAML in front" pattern.
  - **LDAP / Active Directory** — the user directory most SAML IdPs
    sit on top of.
  - **SOAP** — SAML's wire format is XML; SAML 1.x assumed SOAP for
    backchannel; explain the lineage.
  - **HTTPS / TLS** — mandatory transport; SAML's threat model
    presumes TLS for confidentiality and IdP authentication.
  - **WS-Federation / WS-Trust** — the Microsoft-camp parallel that
    AD FS originally pushed.
  - **JWT** — the OIDC token format that displaced SAML assertions.
  - **SCIM** — the cloud-era user-provisioning protocol often paired
    with SAML for joiner/mover/leaver.
  - **XML Signature / XML Encryption** — the underlying crypto specs
    and their long history of signature-wrapping vulnerabilities.

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., IdP, SP, RP, assertion, subject, NameID, AuthnRequest,
  AuthnResponse, AttributeStatement, AuthnContextClassRef, binding,
  profile, metadata, federation, circle of trust, holder-of-key,
  bearer assertion, ECP, SLO, Artifact binding, XML-DSig, EntityID,
  ACS URL, RelayState)
- [ ] **≥4** dated entries on the history timeline (2001 → 2026)
- [ ] Full SAML 2.0 AuthnRequest and AuthnResponse XML message layout
      with field-by-field annotation (issuer, ID, IssueInstant,
      Destination, Signature, Subject, Conditions, AuthnStatement,
      AttributeStatement)
- [ ] SAML SP / IdP session state machine (mermaid `stateDiagram-v2`)
- [ ] Sequence diagram of SP-initiated Web Browser SSO with HTTP-POST
      binding (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (Okta multi-billion auth flows/year, Microsoft Entra ID
      [formerly Azure AD], Ping Identity, OneLogin, Auth0, ADFS,
      Shibboleth + InCommon federation linking US universities, eduGAIN
      federating 80+ national identity federations worldwide,
      Salesforce, Workday, Slack, Zoom, GitHub Enterprise)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Eve Maler — "Mother of SAML", SAML co-founder, ForgeRock;
      RL "Bob" Morgan — Internet2 Shibboleth, RIP 2012;
      Hal Lockhart — OASIS SSTC chair, BEA/Oracle;
      Scott Cantor — Shibboleth technical lead, Ohio State;
      Tom Scavo — InCommon federation; Phil Hunt — Oracle federation;
      Prateek Mishra — early SAML editor)
- [ ] **≥3** specs with version, year, status, and notable-section
      pointers (SAML 1.0 OASIS 2002, SAML 1.1 OASIS 2003, SAML 2.0 OASIS
      March 2005 — Core, Bindings, Profiles, Metadata, Conformance —
      plus the SAML 2.0 Metadata Interoperability Profile and the
      Errata; note SAML has **no IETF RFC equivalent**, only related
      RFCs like RFC 7522 SAML 2.0 Bearer Assertion Grant)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (XML Signature Wrapping family — Duong + Rizzo 2011 and
      Somorovsky 2012; the 2018 Duo Labs "SAML implementation
      vulnerabilities" wave; GitHub Enterprise SAML key leak 2024;
      Okta 0ktapus breach 2022 with SAML token reuse; Microsoft
      Storm-0558 attack 2023 enabling SAML/OIDC token forgery;
      CVE-2023-32315 Openfire SAML auth bypass; CVE-2024-45409 Ruby
      OmniAuth-SAML signature-bypass)
- [ ] **≥3** fun facts / anecdotes with sources (Eve Maler's "Mother
      of SAML" title and her later Venn diagram of identity protocols;
      Bob Morgan's Shibboleth ancient-Hebrew-password naming reference
      to Judges 12:5–6; the OASIS SSTC "two-camp" merger story;
      the "SAML 1.2 that never was"; SAML Raider as the canonical
      attacker tool; the InCommon federation's "membership = trust" model)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (clock-skew tolerance — NotBefore / NotOnOrAfter pitfalls;
      signature-validation order [sign-then-encrypt vs encrypt-then-sign];
      Assertion vs Response signing; metadata refresh discipline;
      RelayState handling; certificate rotation gotchas; SHA-1
      deprecation cliff; canonicalization method choice)
- [ ] **≥3** Wireshark / capture-tool filter examples (HTTPS makes raw
      packet capture hard — cover SAML-tracer browser plugin, Burp Suite
      SAML Raider extension, `tcp.port == 443 and tls.handshake`,
      decoding `SAMLRequest` / `SAMLResponse` query params, browser
      devtools network tab inspection)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Storm-0558 fallout and Microsoft's signing-key hardening 2024;
      GitHub SAML key leak Jan 2024; CVE-2024-45409 OmniAuth-SAML
      Sep 2024; NIST SP 800-63-4 draft revisions touching federation;
      OASIS SSTC effective dormancy; Okta + Microsoft FedRAMP High
      SAML profile updates; Shibboleth v5 release 2024; Keycloak SAML
      improvements; the rise of "SAML-to-OIDC bridge" appliances)
- [ ] **≥1** 2025–2026 frontier development (post-Storm-0558 hardware-
      backed signing key push; SAML decline metrics; OIDC migration
      tooling; FedRAMP and CJIS sector SAML lock-in; the lingering
      "SAML 3.0" rumor that won't happen)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (SP-initiated SSO with
      HTTP-POST binding, ending in attribute consumption)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* SAML makes sense. For
each: a one- or two-sentence definition and a link to a clear authoritative
explainer. Cover: HTTP redirect vs HTTP POST, browser session cookies,
HTTPS/TLS, XML namespaces, XML Signature, XML Encryption,
canonicalization (Exclusive XML Canonicalization c14n), Base64, X.509
certificate, public-key signature, federation, trust anchor, IdP, SP, RP,
assertion, claims, NameID and NameID formats, AuthnContext, binding
(HTTP-Redirect, HTTP-POST, HTTP-Artifact, SOAP, PAOS), profile (Web
Browser SSO, ECP, Single Logout, Identity Provider Discovery),
metadata, EntityID, ACS URL, RelayState, holder-of-key vs bearer
confirmation, SLO (Single Logout), back-channel vs front-channel.

## History and story

Origin in OASIS 2001 with the formation of the Security Services Technical
Committee (SSTC); the two parent camps — the **S2ML** push from
Netegrity/VeriSign and the **AuthXML** push from Securant — merging into
SAML 1.0 in November 2002; SAML 1.1 in September 2003 fixing
interoperability flaws; the parallel development of **Liberty Alliance
ID-FF** at Sun + 30+ founders (2001) and **Internet2 Shibboleth**
(launched 2003) for higher-education federation; the convergence
project that produced **SAML 2.0** in March 2005, harmonising
Liberty ID-FF 1.2, Shibboleth 1.3, and SAML 1.1 into a single profile-
based standard. The 2005–2010 "enterprise federation" era driven by
ADFS launches; the 2009–2015 SaaS explosion (Okta 2009, OneLogin 2009,
Ping Identity older but cloud-pivot, Auth0 2013) that made SAML the
default enterprise SSO substrate; the slow rise of OAuth 2.0 (2012)
and **OpenID Connect 1.0** (Feb 2014) that gradually displaced SAML
for greenfield work; SAML's quiet entrenchment in regulated sectors
(FedRAMP, CJIS, HIPAA, education via InCommon/eduGAIN). The 2017+
"SAML is legacy" framing that has nonetheless failed to depose SAML
from existing deployments. The OASIS SSTC effectively going dormant
after 2012, with the spec frozen and only errata trickling through.

Version-history table with what changed in each release — SAML 1.0 →
1.1 → 2.0 → (frozen). Mention how SAML 2.0 fundamentally restructured
into Core/Bindings/Profiles/Metadata/Conformance documents.

## How it actually works

Sub-sections covering:

1. **Architecture** — IdP, SP, user-agent (browser); the asymmetric
   trust model; the "no direct IdP-SP communication" front-channel
   norm.
2. **Assertion structure** — `<saml:Assertion>` containing `<Issuer>`,
   `<Signature>`, `<Subject>` with `<NameID>` and `<SubjectConfirmation>`,
   `<Conditions>` with NotBefore/NotOnOrAfter and AudienceRestriction,
   `<AuthnStatement>` with AuthnInstant + AuthnContextClassRef, and
   `<AttributeStatement>` carrying claims.
3. **Protocol messages** — `<AuthnRequest>` from SP, `<Response>` from
   IdP wrapping the Assertion, `<LogoutRequest>` / `<LogoutResponse>`,
   `<ArtifactResolve>` / `<ArtifactResponse>`.
4. **Bindings** — HTTP-Redirect (GET, used for short AuthnRequests via
   `SAMLRequest` query param + DEFLATE compression + URL-Base64),
   HTTP-POST (form auto-submitted via JavaScript with Base64-encoded
   `SAMLResponse` field), HTTP-Artifact (small artifact passed via
   URL, then resolved over back-channel SOAP), SOAP (for back-channel
   only), PAOS (for ECP/non-browser clients).
5. **Profiles** — Web Browser SSO (the canonical profile; SP- vs IdP-
   initiated), Enhanced Client or Proxy (ECP) for non-browser clients,
   Single Logout (rarely fully working in practice), IdP Discovery,
   Assertion Query/Request, Name Identifier Management.
6. **Metadata** — `<EntityDescriptor>` with `<SPSSODescriptor>` /
   `<IDPSSODescriptor>` containing endpoints, certificates,
   NameIDFormats supported, AttributeConsumingService entries; the
   metadata-aggregator pattern; SAML 2.0 Metadata Interoperability
   Profile for trust establishment via signed metadata.
7. **Security model** — XML Signature over the Assertion (and/or
   Response); optional XML Encryption of Assertion/NameID/Attribute;
   AudienceRestriction; SubjectConfirmation methods (bearer most
   common, holder-of-key in regulated sectors); replay protection via
   ID + IssueInstant + InResponseTo.

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of SP-initiated SSO with HTTP-Redirect →
   HTTP-POST binding (browser-driven)
2. State diagram of SP-side session (no-session → AuthnRequest-pending
   → assertion-validated → authenticated → SLO-pending → logged-out)
3. SAML Assertion XML structure as a labelled tree-table

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **OAuth 2.0 vs SAML** — the canonical "use which when": OAuth for
  API delegation, SAML for browser SSO; mention RFC 7522 SAML Bearer
  Grant as the bridge.
- **OpenID Connect vs SAML** — the modern replacement story; OIDC's
  JSON/JWT over OAuth 2.0 vs SAML's XML/XMLDSig; what SAML still does
  that OIDC barely does (rich AttributeStatements, AuthnContext,
  ECP).
- **Kerberos** — the on-prem SSO alternative; the AD FS "Kerberos at
  the IdP, SAML on the wire" pattern.
- **LDAP / Active Directory** — almost every SAML IdP backs onto an
  LDAP directory; explain the AD FS / Azure AD architecture.
- **SOAP** — SAML 1.x's wire format ancestry; SAML 2.0 still uses
  SOAP for back-channel bindings.
- **WS-Federation / WS-Trust** — the Microsoft camp's parallel
  federation framework; ADFS spoke both for years.
- **JWT / JOSE** — the OIDC token format that displaced SAML
  Assertions, with very different signing/canonicalization story.
- **SCIM** — cloud-era provisioning to complement SAML SSO.
- **TLS** — mandatory transport; SAML threat model assumes TLS.

## Real-world deployment

Major implementations — named libraries (Shibboleth IdP/SP, SimpleSAMLphp,
Keycloak, ADFS, Microsoft Entra ID, Okta, Ping, OneLogin, Auth0, ForgeRock
AM, Gluu, WSO2 Identity Server, Spring Security SAML, OneLogin python-saml,
ruby-saml, OmniAuth-SAML, python3-saml, node-saml). Named federations:
**InCommon** (US higher-education research, ~1100 institutions),
**eduGAIN** (interfederating 80+ national federations worldwide),
**UK Access Management Federation**, **SWITCHaai** (Switzerland), the
US **eAuth** federal initiative. Named SaaS: Salesforce, Workday, Slack,
Zoom, GitHub Enterprise, ServiceNow, Atlassian, Box, Dropbox, AWS SSO
(now IAM Identity Center). Scale: Okta processes tens of billions of
auth flows/year; Microsoft Entra ID handles >1 trillion auths/year (most
OIDC now, but SAML still a meaningful share). **Minimum 5 named
deployments with metrics.**

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **XML Signature Wrapping** — the foundational SAML attack class
  (Somorovsky et al., NDSS 2012); the long tail of XSW variants;
  why XML's flexibility made this nearly inevitable.
- **Duong + Rizzo's SAML talks** — 2011 attacks on SAML and XML
  Encryption.
- **CVE-2018-XXXX Duo Labs / OneLogin / OmniAuth wave** — the 2018
  family of SAML library bugs where XML comment injection bypassed
  signature validation.
- **CVE-2023-32315 Openfire SAML auth bypass**.
- **CVE-2024-45409 OmniAuth-SAML signature-bypass** (Sep 2024).
- **GitHub Enterprise SAML key disclosure 2024** — accidental leak
  of an IdP signing private key.
- **Okta 0ktapus / Scatter Spider breach 2022** — SAML session token
  theft and reuse against multiple downstream tenants.
- **Microsoft Storm-0558 / July 2023** — Chinese-state actor stole a
  consumer-account MSA signing key and forged tokens against Outlook,
  exposing weak signing-key isolation in cloud IdPs; the broader
  CSRB report and Microsoft Secure Future Initiative response.
- **Bluebox / Andrew Hoog 2014 Google Apps SAML bypass**.

## Fun facts and anecdotes

The "Mother of SAML" nickname for Eve Maler and her famous "identity
protocols Venn diagram"; Bob Morgan's Shibboleth name drawing on
Judges 12 in the Hebrew Bible ("pronounce 'shibboleth' — by your
accent we'll know if you're one of us"); the OASIS SSTC's 2001 merger
of the S2ML and AuthXML camps; the "there will never be SAML 3.0"
running joke at IIW; SAML Raider as the canonical attacker plug-in
for Burp Suite; the InCommon federation's "membership IS trust" model;
why Single Logout almost never works in practice; the "SAML and OAuth
sound similar but solve different problems" eternal recurring blog
post genre; the AD FS-vs-Shibboleth holy wars of the late 2000s.

## Practical wisdom

What an engineer actually needs to know to use SAML well — clock-skew
tolerance (NotBefore / NotOnOrAfter with 1–5 min slack), why you must
validate **the entire chain** (Response signature OR Assertion
signature — but configure which); sign-then-encrypt vs encrypt-then-
sign ordering; metadata refresh discipline (daily vs hourly); the
RelayState round-trip and the open-redirect risk if unvalidated;
certificate rotation strategies (rolling overlap window); SHA-1
deprecation; canonicalization method selection (always exclusive
c14n); replay caching against the assertion ID; AudienceRestriction
must equal the SP's EntityID; the "two certs" pattern (signing vs
encryption); the metadata-driven trust model vs hand-configured trust;
Single Logout failure recovery patterns. Include **at least 3
Wireshark/SAML-tracer/equivalent capture filter examples**.

## Pioneers and key contributors

- **Eve Maler** — "Mother of SAML", OASIS SAML co-founder, ForgeRock
  CTO, later Venn-diagram-of-identity fame; UMA architect.
- **RL "Bob" Morgan** (1956–2012) — Internet2 Shibboleth lead, U-Washington;
  posthumous IIW lifetime contribution.
- **Hal Lockhart** — OASIS SSTC chair, BEA Systems / Oracle, long-running
  SAML editor.
- **Scott Cantor** — Shibboleth Project technical lead, Ohio State,
  enormous body of practical SAML / Shibboleth software work.
- **Tom Scavo** — InCommon Federation technical operations.
- **Prateek Mishra** — Netegrity / Oracle, early SAML 1.x editor.
- **Phil Hunt** — Oracle federation, later SCIM and OAuth 2.0 PoP work.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- Authoritative specifications — SAML 2.0 OASIS standard set
  (Core sstc-saml-core-2.0-os, Bindings, Profiles, Metadata,
  Conformance), the Metadata Interoperability Profile, SAML 2.0
  Errata Composite, RFC 7522 SAML Bearer Grant.
- Books — *Federated Identity Primer* (Mike Schwartz, Maciej Machulak),
  *Identity and Data Security for Web Development* (O'Reilly, Goodman
  & LeBlanc), *Solving Identity Management in Modern Applications*
  (Wilson + Hingnikar, Apress 2019 / 2nd ed).
- Academic papers — Somorovsky et al. "On Breaking SAML" (USENIX
  Security 2012), Mainka et al. "SAML XML Signature Wrapping"
  follow-ups, the Cure53 / OneLogin audit reports.
- Long-form engineering blog posts — Okta dev blog, Auth0 docs,
  Microsoft Entra ID identity blog, Cloudflare Zero Trust posts on
  SAML, Duo Labs research blog (the 2018 SAML wave).
- YouTube videos — IIW recordings, OWASP AppSec talks on SAML,
  Andrew Hoog's "SAML for Engineers", Identiverse keynotes.
- Podcasts — *Identity at the Center*, *The IDPro Podcast*.
- Free university courses — Stanford CS 244B / Berkeley CS 161 for
  the crypto foundations; the Shibboleth wiki training tracks.
- Hands-on tools — SAML-tracer browser extension, Burp Suite + SAML
  Raider, the SimpleSAMLphp test suite, Keycloak's local dev mode,
  samltest.id (the public SAML test IdP/SP service).

## Where things are heading (2025–2026 frontier)

SAML is in "managed decline" — most new auth deploys OIDC; FedRAMP /
CJIS / HIPAA / education sectors stuck on SAML for the foreseeable;
OASIS SSTC effectively dormant; the recurring "SAML 3.0" zombie that
won't happen; the Storm-0558-fueled push for **hardware-bound signing
keys** in cloud IdPs (HSM-isolated, with key rotation hours not years);
shorter token lifetimes (15 min default vs the historical 1-hour);
the rise of "SAML-to-OIDC bridge" appliances (Okta, Ping, Microsoft
Entra all offer these). Metrics to chase: % of new SaaS integrations
in 2025 using OIDC vs SAML; SAML AuthN events per year at Microsoft
Entra ID vs OIDC; NIST SP 800-63-4 federation assurance levels.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook
- A striking statistic that captures importance, with source
- A "pause and think" moment
- A failure-story arc (Storm-0558 or SAML Signature Wrapping work well)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: saml
name: Security Assertion Markup Language
abbreviation: SAML
categoryId: <recommend — likely a new "identity" category alongside OAuth2/OIDC/Kerberos/LDAP, OR utilities-security>
port: none (rides HTTPS on 443)
year: 2002 (SAML 1.0); 2005 (SAML 2.0)
rfc: OASIS sstc-saml-core-2.0-os (no IETF RFC for core; related RFC 7522)
standardsBody: industry-consortium  (OASIS)
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency, throughput, overhead }
connections: <oauth2, oidc, kerberos, ldap, tls, https, soap>
links: { wikipedia, official (oasis-open.org saml), spec }
image: <Wikimedia URL — SAML flow diagram or Eve Maler photo>
```

### A.2 Header / wire-format layout

Provide the canonical **SAML 2.0 AuthnResponse** XML structure as an
annotated tree-table:
- `<samlp:Response>` with ID, Version, IssueInstant, Destination,
  InResponseTo, attributes
- `<saml:Issuer>` element
- `<ds:Signature>` (optional at Response level)
- `<samlp:Status>` with `<StatusCode>` value
- `<saml:Assertion>` with its own ID/Version/IssueInstant
  - `<saml:Issuer>`
  - `<ds:Signature>` (recommended at Assertion level)
  - `<saml:Subject>` with `<NameID>` and `<SubjectConfirmation>`
  - `<saml:Conditions>` with NotBefore, NotOnOrAfter,
    AudienceRestriction
  - `<saml:AuthnStatement>` with AuthnInstant, SessionIndex,
    AuthnContextClassRef
  - `<saml:AttributeStatement>` with `<Attribute>` children

### A.3 State machine

SP-side authentication state machine in mermaid `stateDiagram-v2`:
NoSession → AuthnRequestSent → AssertionReceived → AssertionValidated
→ Authenticated → SLORequested → LoggedOut.

### A.4 Code example

- `python` — using `python3-saml` (OneLogin) to build an SP and consume
  an AuthnResponse
- `javascript` — Node.js with `@node-saml/passport-saml` for an Express SP
- `cli` — `xmlsec1` to verify a signed Assertion; `openssl` for cert
  inspection; `saml2aws` for AWS CLI SAML login flow
- `wire` — sectioned dump: AuthnRequest (HTTP-Redirect query),
  AuthnResponse (HTTP-POST form payload, Base64-decoded XML), Logout
  Request

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. Storm-0558 + Microsoft Secure Future
Initiative response, GitHub SAML key leak Jan 2024, CVE-2024-45409
OmniAuth-SAML Sep 2024, Shibboleth IdP v5 release 2024, NIST SP
800-63-4 draft federation revisions, Okta hardware-key signing push,
FedRAMP rev 5 SAML profile updates.

### A.6 Real-world deployments

≥5 named: Okta (multi-billion auth flows/yr), Microsoft Entra ID
(SAML share of >1T auths/yr), Shibboleth via InCommon (~1100 US higher-ed
institutions), eduGAIN (80+ national federations), Salesforce/Workday/
Slack/Zoom/GitHub Enterprise enterprise SSO baselines.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark / SAML-tracer hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Eve Maler with full bio, RL "Bob" Morgan, Hal Lockhart, Scott
Cantor.

### A.12 Spec records ≥3

SAML 1.0 (OASIS 2002), SAML 1.1 (OASIS 2003), SAML 2.0 Core (OASIS
March 2005), SAML 2.0 Bindings, SAML 2.0 Profiles, SAML 2.0 Metadata,
SAML 2.0 Metadata Interoperability Profile, RFC 7522 SAML Bearer Grant.

### A.13 New glossary concepts

≥10 — IdP, SP, Assertion, NameID, AuthnContext, binding, profile,
metadata, EntityID, ACS URL, RelayState, SLO, ECP, AudienceRestriction,
SubjectConfirmation, XML Signature Wrapping.

### A.14 Frontier entry

"SAML in managed decline; Storm-0558-fueled hardware-bound signing push"
as a frontier entry with metrics (OIDC vs SAML new-deployment ratio,
HSM-isolated signing rollout, FedRAMP SAML lock-in).

### A.15 Journey suggestion

"How your enterprise SSO actually works" — a 4–5 step journey covering
LDAP/AD → Kerberos at the IdP → SAML over HTTPS → OAuth/OIDC for the
modern equivalent.

### A.16 Comparison pair

"SAML vs OIDC" (the canonical "use which when") and "SAML vs Kerberos"
(on-prem vs federated SSO).

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "OASIS 2001: two camps meet" (S2ML + AuthXML merger)
- Timeline: 2001 → 2002 (1.0) → 2003 (1.1) → 2005 (2.0) → 2014 (OIDC
  arrives) → 2023 (Storm-0558) → 2026 (managed decline)
- Callout: "Why SAML 2.0 is still the dominant version twenty-one years on"
- Image: Wikimedia photo of Eve Maler or the SAML flow diagram
- Diagram: SAML SP-initiated SSO sequence
- Pioneers: Eve Maler + Bob Morgan + Hal Lockhart mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely none) + new proposals.
Strong candidates for new outage records:
- Microsoft Storm-0558 (July 2023) — software-bug / security
- Okta 0ktapus / Scatter Spider (2022) — security
- XML Signature Wrapping disclosure cluster (2011–2012) — protocol-design
- GitHub SAML key leak (Jan 2024) — human-error / security

### A.19 Embedded media

Highest-signal: Identiverse keynote talks on SAML's decline, Eve Maler
interviews, the OWASP AppSecCali SAML attacks talk, samltest.id
playground.

### A.20 Prerequisites

```
concepts: [http, tls, xml, base64, public-key-cryptography, digital-signature, session, redirect, cookie]
protocols: [tls, https, oauth2, soap]
```

### A.21 Name highlight

```
"[S]ecurity [A]ssertion [M]arkup [L]anguage"  (SAML)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for SP-initiated Web Browser SSO with
HTTP-Redirect (for the AuthnRequest) and HTTP-POST (for the
AuthnResponse). 10–14 step annotations; explain *what* each message
is and *why* the reader is seeing it (e.g., "the browser is the
courier — neither IdP nor SP talk directly; the user's User-Agent
ferries the signed Assertion between them").

### A.23 Category placement

Strong recommendation: **propose a new "identity" category** to hold
SAML alongside OAuth 2.0, OpenID Connect, Kerberos, and LDAP coming
in this same pass. Suggested:

```
id: identity
name: Identity & Federation
color: <suggest a hex; an indigo or amber distinct from existing>
glowColor: <complementary>
description: Protocols for authentication, authorization, federation, and directory services.
icon: <lucide-react icon name, e.g., "key-round" or "shield-user">
```

If the new category isn't created, place under `utilities-security`.

---

# Appendix B — Simulator step list

Author a simulation of **SP-initiated Web Browser SSO** — the dominant
real-world flow. Provide 6–10 steps in the shape:

```
title: "SAML SP-Initiated SSO"
description: "Watch a browser get redirected from a SaaS app to an IdP, authenticate, and POST a signed assertion back."
actors:
  - { id: "browser", label: "Browser (User)", icon: "globe", position: "left" }
  - { id: "sp", label: "Service Provider (SaaS App)", icon: "cloud", position: "middle" }
  - { id: "idp", label: "Identity Provider (Okta/Entra)", icon: "shield", position: "right" }
userInputs:
  - { id: "entityId", label: "SP EntityID", type: "text", defaultValue: "https://app.example.com/saml/metadata" }
  - { id: "nameIdFormat", label: "NameID Format", type: "select", options: ["emailAddress", "persistent", "transient"] }
steps:
  - id: visit
    label: "GET /protected"
    description: "User navigates to a protected page; no session cookie present."
    fromActor: browser
    toActor: sp
    duration: 800
    highlight: [Cookie, URL]
    layers:
      - HTTP: { method: "GET", path: "/protected" }
      - TLS: { version: "1.3", sni: "app.example.com" }
  - id: redirect
    label: "302 Redirect with SAMLRequest"
    description: "SP builds an AuthnRequest, DEFLATE-compresses, URL-Base64s it, and 302s the browser to the IdP."
    fromActor: sp
    toActor: browser
    duration: 1200
    highlight: [Location, SAMLRequest, RelayState]
    layers:
      - HTTP: { status: 302, locationParam: "SAMLRequest=..." }
      - SAML: { msg: "AuthnRequest", binding: "HTTP-Redirect", issuer: "<SP EntityID>" }
  - id: authnrequest
    label: "GET /sso?SAMLRequest=..."
    description: "Browser follows redirect to IdP carrying compressed AuthnRequest."
    ...
  - id: login
    label: "User authenticates"
    description: "IdP shows password / MFA / Kerberos / WebAuthn challenge."
    ...
  - id: assertion
    label: "POST signed SAMLResponse"
    description: "IdP returns HTML form auto-submitting Base64-encoded Response to SP's ACS URL."
    ...
  - id: validate
    label: "SP validates signature, Conditions, Audience"
    description: "SP checks XML-DSig over Assertion, NotOnOrAfter, AudienceRestriction, InResponseTo."
    ...
  - id: session
    label: "SP issues session cookie"
    description: "SP redirects browser to original page with authenticated session."
    ...
```

The layers should reflect: TLS → HTTP → SAML (binding + message).

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
