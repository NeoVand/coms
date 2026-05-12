===== PROTOCOL · LDAP · Lightweight Directory Access Protocol =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is LDAP" content
already exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the X.500 / DAP heritage (CCITT 1988, far too
  heavy for the early-90s Internet), Tim Howes + Mark Smith + Steve Kille
  at the University of Michigan in 1993 designing LDAP as a "lightweight
  front-end to X.500", LDAPv2 (RFC 1487 in 1993), LDAPv3 (RFC 2251 in
  1997 → the modern RFC 4510–4519 family in 2006), Netscape Directory
  Server's commercial pivot (AOL/Sun/Oracle chain of acquisitions),
  Microsoft Active Directory's 2000 launch on LDAPv3, the OpenLDAP and
  389 Directory Server (Red Hat) open-source camps, the slow eclipse by
  SCIM/OIDC for cloud-era directory.
- Mechanics deep enough that someone could implement a minimal LDAP
  client after reading: the ASN.1 BER-encoded PDUs, the bind/search/
  modify operation set, DN syntax, filter syntax, schema, controls
  and extensions, StartTLS vs LDAPS, SASL bind mechanisms (EXTERNAL,
  GSSAPI, DIGEST-MD5, PLAIN).
- Real failures and famous incidents — the 2022 Microsoft "Bronze Bit" /
  sAMAccountName Spoofing (CVE-2021-42278 + CVE-2021-42287), the long
  history of LDAP injection (OWASP Top-10 staple), Mimikatz's
  LDAP-based DCSync, the Log4Shell LDAP-injection-as-amplifier role
  (CVE-2021-44228 used JNDI/LDAP for RCE), AD enumeration via LDAP
  queries (BloodHound's foundational data source), the 2024–25
  NTLM-to-LDAP relay attacks (PetitPotam, drsuapi family).
- Connections to adjacent protocols — Kerberos (the canonical AD
  pairing), SAML (IdP backing), OAuth 2.0 (federated-LDAP via SCIM
  bridges), TLS (StartTLS, LDAPS on 636), SCIM (the cloud-era
  successor for provisioning), Active Directory (LDAP's biggest
  deployment by far), DNS (SRV records for DC discovery).
- 2024–2026 developments — Microsoft's 2024 LDAP signing and channel-
  binding default-on mandates (the long-delayed ADV190023 follow-
  through), the SCIM 2.0 explosion replacing LDAP for cloud directory
  sync, "LDAP-as-a-service" managed offerings (Microsoft Entra Domain
  Services, JumpCloud, Foxpass), the slow Channel Binding adoption
  push, post-quantum considerations for LDAP-over-TLS.
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
body (IETF datatracker, Microsoft Learn, OpenLDAP project archives). Past
passes have left 121 `[needs source]` markers across 46 reports — please
try harder this round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how LDAP relates to
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
(DKIM/SPF/DMARC), **SAML**, SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **LDAP — Lightweight Directory Access
Protocol** — the read-mostly, hierarchical, schema-driven directory
protocol that runs on TCP port 389 (or 636 for LDAPS) and is the
backing store for nearly every enterprise's authentication and
authorization. LDAP was born at the University of Michigan in 1993 as a
deliberately lightweight successor to the heavyweight X.500 DAP, and
LDAPv3 (RFC 2251, 1997 — re-issued as the RFC 4510–4519 family in
2006) remains the current version in 2026 with **no successor in
progress**. LDAP is the wire protocol for Microsoft Active Directory,
OpenLDAP, 389 Directory Server, FreeIPA, Apple Open Directory, and
nearly every legacy enterprise's "single source of truth".

Related protocols and standards likely connected to LDAP that you
should verify and expand on:

  - **Kerberos** — the canonical AD pairing; LDAP authenticates, Kerberos
    grants tickets; explain GSSAPI/SASL bind with Kerberos.
  - **SAML** — IdP backing; almost every SAML IdP reads users from an
    LDAP directory.
  - **OAuth 2.0 / OIDC** — federated equivalents; the cloud-era
    bridging story.
  - **TLS** — LDAPS on 636 (legacy) and StartTLS on 389 (RFC 4511 +
    4513); ALPN considerations.
  - **SCIM** — the cloud-era successor for cross-domain identity
    provisioning; replacing LDAP for SaaS sync.
  - **DNS** — SRV records (`_ldap._tcp.dc._msdcs.<domain>`) for AD
    domain-controller discovery; cite the AD DNS topology.
  - **DHCP** — sometimes paired in user-environment discovery.
  - **NTP** — Kerberos requires tight clock sync, so AD requires NTP;
    LDAP indirectly does.
  - **ASN.1 / BER** — LDAP's encoding heritage from X.500.
  - **X.500 / DAP** — the abandoned ancestor.

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., DN, RDN, DIT, entry, attribute, objectClass, schema, syntax,
  matching rule, base DN, scope, filter, control, extension, bind,
  unbind, search, compare, add, modify, modifyDN, delete, abandon,
  extended operation, referral, alias, StartTLS, LDAPS, SASL, SASL
  mechanism, simple bind, anonymous bind, root DSE, sub-tree refresh,
  syncrepl, replication, schema attribute, structural objectClass,
  auxiliary objectClass, abstract objectClass)
- [ ] **≥4** dated entries on the history timeline (1988 X.500 → 1993
      U-Michigan → 1997 LDAPv3 → 2006 RFC 4510–4519 → 2024 Microsoft
      LDAP-signing mandates)
- [ ] Full LDAPv3 PDU layout (ASN.1 BER-encoded) with the LDAPMessage
      envelope and SearchRequest / SearchResultEntry / BindRequest
      operation fields
- [ ] LDAP connection / session state machine (mermaid `stateDiagram-v2`):
      TCP-connected → unauthenticated → bound → operation-in-progress →
      bound → unbind
- [ ] Sequence diagram of a typical LDAP search (TCP connect →
      StartTLS → SASL bind → search → unbind) (mermaid `sequenceDiagram`)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (every Microsoft Active Directory on Earth — Microsoft
      reports ~600M+ users in Entra ID, the LDAP-protocol cloud version;
      FreeIPA in major Linux estates; 389 DS as Red Hat IdM backing;
      OpenLDAP across Debian/Ubuntu/etc.; Apple Open Directory in
      legacy macOS server fleets; Oracle Internet Directory; Novell
      eDirectory still kicking in healthcare/government; university
      directories like Stanford / MIT / Caltech)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Tim Howes — original LDAP author at U-Mich, later Netscape,
      Loudcloud, Opsware, then HP; Mark Smith — LDAP co-author at U-Mich;
      Steve Kille — Isode founder, X.400/X.500 archivist, LDAP
      contributor; Mark Wahl — LDAPv3 editor; Kurt Zeilenga — long-
      running OpenLDAP architect; Howard Chu — OpenLDAP chief architect,
      LMDB inventor; Andrew Bartlett — Samba 4 AD lead)
- [ ] **≥3** RFCs with number, year, status, and notable-section pointers
      (4510 Technical Spec roadmap, 4511 Protocol, 4512 Information
      model, 4513 Authentication methods + StartTLS, 4514 DN string
      representation, 4515 Filter, 4516 URL, 4517 Syntaxes, 4518
      String prep, 4519 Schema)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (CVE-2021-42278/42287 sAMAccountName Spoofing /
      "Bronze Bit" Dec 2021; Log4Shell CVE-2021-44228 JNDI/LDAP
      RCE amplifier Dec 2021; CVE-2017-9248 Telerik LDAP-injection;
      CVE-2022-30135 Active Directory RCE; the 2024 PetitPotam +
      drsuapi NTLM-to-LDAP relay chain; the 2025 Kerberoasting +
      LDAP-enumeration via BloodHound combos)
- [ ] **≥3** fun facts / anecdotes with sources (the "Lightweight" in
      LDAP referring to comparison with X.500 DAP not to small data;
      the U-Mich slapd legacy living on in OpenLDAP; the
      "RFC 4510–4519 was originally meant to be RFC 2251 + co. cleanup"
      story; Microsoft's choice to put their entire empire on LDAPv3 +
      Kerberos in 2000 rather than a proprietary protocol; the
      "anonymous bind" default that haunted thousands of orgs;
      Howard Chu's parallel invention of LMDB as a side-quest)
- [ ] **≥3** practical pitfalls with concrete tuning advice
      (referral handling traps, paging/VLV for large result sets,
      filter escaping for injection prevention, the difference between
      `objectClass=*` vs `objectClass=user` in performance, indexing
      strategies, replication lag on multi-master, SASL mechanism
      selection, certificate validation when using LDAPS/StartTLS,
      MaxPageSize and MaxResultSetSize on AD)
- [ ] **≥3** Wireshark / capture-tool filter examples (`ldap`,
      `ldap.messageID`, `ldap.bind.dn`, `tcp.port == 389 or tcp.port == 636`,
      `ldap.search.filter`, plus how to decrypt LDAPS captures with
      the server key in Wireshark)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Microsoft's ADV190023 LDAP signing and channel binding **becoming
      default-on** in 2024 Windows Server updates; SCIM 2.0 growth;
      Entra Domain Services managed-LDAP expansion; OpenLDAP 2.6
      maintenance; 389 DS 3.x releases; Samba 4.20 + AD compatibility
      improvements; PetitPotam follow-on patches; the rise of
      JumpCloud / Foxpass managed LDAP; NTLM deprecation timeline
      affecting LDAP-Kerberos pairings)
- [ ] **≥1** 2025–2026 frontier development (SCIM displacing LDAP for
      cloud directory sync; managed LDAP services; the NTLM-deprecation
      cliff and its impact on LDAP signing; post-quantum LDAP-over-TLS;
      eBPF-based LDAP observability)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (LDAP search flow with
      StartTLS and SASL/EXTERNAL bind)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* LDAP makes sense. For
each: a one- or two-sentence definition and a link to a clear authoritative
explainer. Cover: TCP, port 389 and port 636, TLS, StartTLS, X.500, ASN.1,
BER encoding, hierarchy/tree, namespace, schema, attribute, objectClass
(structural / auxiliary / abstract), DN (Distinguished Name) and RDN
(Relative DN), DIT (Directory Information Tree), entry, base DN, scope
(base / one / sub), filter syntax, matching rule, control, extension,
referral, alias, root DSE, replication (multi-master vs single-master),
SASL, GSSAPI, simple bind, anonymous bind, syncrepl, schema syntax,
LDIF (LDAP Data Interchange Format).

## History and story

Origin in **CCITT X.500 (1988)** as a heavyweight OSI directory service
running over DAP/DSP/DOP; the U-Michigan team — **Tim Howes, Mark Smith,
Steve Kille** — designing LDAP in 1993 as a "lightweight" client-side
front-end to X.500 over TCP/IP; **LDAPv2 (RFC 1487, 1993)** as the first
spec; the U-Michigan SLAPD reference server influencing every later
implementation; **LDAPv3 (RFC 2251, December 1997)** as the major
revision (referrals, SASL, extensibility); the **2006 RFC 4510–4519
re-issue** that cleanly replaced RFC 2251 with a numbered family
covering Protocol, Information Model, Authentication Methods, DN syntax,
Filter, URL, Syntaxes, String Prep, Schema. The **Netscape Directory
Server** commercial origin (Howes + Smith → Netscape), the AOL/iPlanet/
Sun/Oracle acquisition chain. **Microsoft Active Directory** launching
on LDAPv3 in February 2000 with Windows 2000 Server, making LDAP the
most-deployed protocol you've never heard of. The **OpenLDAP** project
(forked from U-Mich slapd, 1998+, Howard Chu's reign), the **Fedora /
389 Directory Server** lineage from Netscape→Red Hat, the **FreeIPA**
identity management stack. The slow eclipse: SCIM 2.0 (RFC 7643–7644,
Sep 2015) taking over cloud directory provisioning; OIDC + SAML
abstracting LDAP behind cloud IdPs.

Version history table: LDAPv2 → LDAPv3 → (the spec stable for 19 years).

## How it actually works

Cover:

1. **Information model** — the DIT as a hierarchical tree; entries
   identified by DN; attributes typed by schema; objectClass driving
   what attributes are allowed/required; subschema subentry under
   root DSE.
2. **Naming** — DN syntax (RFC 4514): `cn=Tim Howes,ou=People,dc=umich,dc=edu`;
   reserved characters; UTF-8.
3. **Protocol** — ASN.1-defined LDAPMessage envelope with messageID and
   operation choice; the ten core operations (bind, unbind, search,
   compare, add, modify, modifyDN, delete, abandon, extended); how
   LDAP is **request-multiplexed** over a single TCP connection.
4. **Search** — base DN + scope + filter + attributes; filter syntax
   (`(&(uid=tim)(memberOf=cn=admins,ou=Groups,dc=example,dc=com))`);
   intermediate SearchResultEntry messages + final SearchResultDone.
5. **Authentication** — simple bind (DN + password, please don't),
   anonymous bind, SASL bind with mechanisms (EXTERNAL for mTLS,
   GSSAPI for Kerberos, DIGEST-MD5 — deprecated, PLAIN for SASL-only,
   SCRAM-SHA-256 modern).
6. **Transport security** — LDAPS on 636 (TLS-from-byte-zero, legacy)
   vs StartTLS on 389 (RFC 4511 extended operation); modern stance.
7. **Controls and extensions** — paged results (RFC 2696), server-
   side sort (RFC 2891), VLV virtual list view, password policy
   controls; LDAP URL form (RFC 4516).
8. **Replication** — syncrepl (RFC 4533 LDAP Content Sync), AD's
   multi-master replication with USN tracking, OpenLDAP delta-
   syncrepl.
9. **Schema** — attribute types with OIDs, syntaxes (Directory
   String, IA5String, GeneralizedTime, DN), matching rules
   (caseIgnoreMatch, distinguishedNameMatch), objectClass kinds.

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of TCP connect → StartTLS → SASL/GSSAPI bind →
   search → unbind
2. State diagram of LDAP connection/session lifecycle
3. LDAPMessage ASN.1 BER PDU layout (envelope + operation) as a
   labelled table

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:
- **Kerberos** — GSSAPI SASL bind; the AD canonical pairing; mutual
  authentication via Kerberos service ticket for the LDAP SPN
  (`ldap/dc01.contoso.com`).
- **TLS** — StartTLS extended op vs LDAPS-from-start; cert validation
  and channel binding tokens.
- **SAML / OIDC** — almost every IdP backs onto LDAP; the IdP reads
  user attributes via LDAP search.
- **SCIM** — cloud-era replacement for cross-domain provisioning;
  RFC 7643 (schema) + RFC 7644 (protocol).
- **DNS** — SRV records (`_ldap._tcp.dc._msdcs.<domain>`) for AD
  domain-controller discovery; the `dc=` DNS-rooted naming convention.
- **NTP** — Kerberos clock-sync requirements transitively constrain
  LDAP-via-GSSAPI deployments.
- **X.500 / DAP** — the abandoned ancestor; the legacy of OIDs,
  schemas, naming.
- **ASN.1 / BER** — the encoding heritage.

## Real-world deployment

Major implementations — **OpenLDAP** (every Linux distro's option;
Howard Chu's slapd), **389 Directory Server** (Red Hat IdM / FreeIPA
backing), **Microsoft Active Directory** (the elephant in the room),
**Samba 4 AD** (Andrew Bartlett's open AD-compatible DC), **Apple
Open Directory** (legacy macOS Server, deprecated), **Oracle
Internet Directory**, **Oracle Unified Directory**, **Novell
eDirectory** (still in healthcare / government), **ApacheDS**,
**OpenDJ / ForgeRock Directory Services**, **JumpCloud**, **Foxpass**,
**Microsoft Entra Domain Services** (managed AD-as-a-service).
Named libraries: OpenLDAP libldap, Mozilla LDAP SDK (defunct),
python-ldap, ldap3 (python), Apache Directory Studio, ldapjs (Node),
.NET System.DirectoryServices, Java JNDI / UnboundID LDAP SDK.
Scale: Microsoft Entra ID at >600M users (the cloud LDAP-equivalent
slice), every Fortune 500 running AD with ≥1M LDAP queries/sec at
peak DC, university directories like Stanford/MIT serving every
campus auth event. **Minimum 5 named deployments with metrics.**

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **CVE-2021-42278 + CVE-2021-42287 sAMAccountName Spoofing / "Bronze
  Bit"** (Dec 2021) — Kerberos S4U + LDAP combined to forge KRBTGT
  tickets; Microsoft hotpatch.
- **CVE-2021-44228 Log4Shell** (Dec 2021) — JNDI/LDAP-based RCE; LDAP
  as the **exfiltration / payload retrieval channel** for arbitrary
  Java class loading; not strictly an LDAP bug but the most
  consequential LDAP-adjacent vuln in history.
- **PetitPotam + NTLM-to-LDAP relay chain** (2021 onward) — coercing
  authentication then relaying NTLM creds to LDAP-without-signing
  to escalate to Domain Admin; Microsoft's response with LDAP
  signing/channel-binding mandates.
- **CVE-2022-30135 AD LDAP-based RCE** (Jun 2022).
- **CVE-2023-28310 Microsoft Exchange / LDAP RCE** (May 2023).
- **The "anonymous bind" decades-long footgun** — countless orgs
  exposed their entire directory unauthenticated.
- **Mimikatz DCSync** — abusing LDAP's `drsuapi` extended ops to
  replicate password hashes from a DC.
- **BloodHound enumeration** (SpecterOps, 2017+) — LDAP queries
  mapping the entire AD attack graph in minutes.

## Fun facts and anecdotes

The "Lightweight" in LDAP referring to comparison with X.500 DAP, not
to any lightness of LDAP itself ("LDAP is a thousand-page protocol
called Lightweight"); the U-Mich slapd legacy still echoing inside
OpenLDAP; Howard Chu's LMDB origin as a side-quest while optimizing
OpenLDAP's backend; the RFC 4510 family's "let's just renumber the
mess of RFC 2251 errata" decision; Microsoft's 2000 choice to put
the entire Active Directory empire on standard LDAPv3 + Kerberos
rather than a proprietary protocol — arguably the most consequential
single bet on an open IETF standard in history; the "anonymous bind
default that ate the world" — RFC 4513 explicitly tries to fix it;
the legacy of OIDs in X.500 schemas living forever (`2.5.4.3` =
`cn`).

## Practical wisdom

What an engineer actually needs to know to use LDAP well — paged
searches (always set pagedResultsControl >= 1000 entries on AD);
filter escaping for injection prevention (`(`, `)`, `*`, `\`, NUL);
the difference between `objectClass=*` and `objectClass=user` in
performance; indexing strategies (always index uid, cn, mail,
member, memberOf, sAMAccountName on AD); replication lag and the
strong-vs-eventual consistency model; SASL mechanism choice
(EXTERNAL for mTLS in service-to-service, GSSAPI for AD-joined,
SCRAM-SHA-256 modern); StartTLS vs LDAPS — modern practice is
**either**, but never plain 389 without TLS; certificate validation
gotchas; MaxPageSize / MaxResultSetSize on AD (1000 / 262144
defaults); referral handling traps (chase vs return); the `ALLDOMAINS`
referral trap in cross-forest; LDAP signing and channel-binding now
default-on as of Windows Server 2025. Include **at least 3
Wireshark/tcpdump capture filter examples**.

## Pioneers and key contributors

- **Tim Howes** — original LDAP author at U-Michigan; later Netscape
  Directory Server founding engineer; Loudcloud + Opsware + HP; the
  most-cited LDAP person.
- **Mark Smith** — LDAP co-author at U-Mich; long-running directory
  industry presence.
- **Steve Kille** — Isode founder; X.400/X.500/LDAP IETF veteran
  ("the man who archived OSI"); LDAPv3 contributor.
- **Mark Wahl** — LDAPv3 editor; Critical Angle / Sun.
- **Kurt Zeilenga** — long-running OpenLDAP architect, ACL and
  syncrepl work.
- **Howard Chu** — OpenLDAP chief architect; LMDB inventor; the
  "OpenLDAP can outperform any commercial directory" data-driven
  campaign.
- **Andrew Bartlett** — Samba 4 AD lead; the person who reverse-
  engineered enough of Microsoft AD to ship a compatible DC.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated or
published. Highlight any resource that is current as of 2024–2026. Cover:

- Authoritative specifications — RFC 4510 (roadmap) and the rest of
  the family; RFC 4533 syncrepl; RFC 2696 paged results; RFC 4515
  filter; the Microsoft `[MS-ADTS]`, `[MS-ADCAP]`, `[MS-DRSR]` open-
  spec documents.
- Books — *Understanding and Deploying LDAP Directory Services*
  (Howes/Smith/Good, 2nd ed); *LDAP System Administration* (Carter,
  O'Reilly); *Active Directory* (Desmond/Richards/Allen, 5th ed,
  O'Reilly); *Pro Active Directory Certificate Services* (Komar).
- Academic papers — Howes' original "The Lightweight Directory Access
  Protocol" papers; BloodHound papers from SpecterOps.
- Long-form engineering blog posts — Microsoft Learn AD documentation,
  TrustedSec / SpecterOps / Trimarc Security blogs on AD/LDAP
  security, Will Schroeder's "From Domain User to DA" series.
- YouTube videos — Sean Metcalf's BSides / DEF CON talks, Will
  Schroeder DerbyCon talks, Black Hat AD attack series.
- Podcasts — *The Most Wanted Group Policy*, *Risky Business* AD
  segments.
- Free courses — Microsoft Learn AD modules, SpecterOps free
  BloodHound CE labs.
- Hands-on tools — Apache Directory Studio, ldapsearch / ldapmodify,
  ldp.exe, ADSI Edit, JXplorer, BloodHound CE, PingCastle, Purple
  Knight.

## Where things are heading (2025–2026 frontier)

SCIM 2.0 displacing LDAP for cloud directory sync; managed LDAP
services (Entra Domain Services, JumpCloud, Foxpass) absorbing on-
prem AD workloads; the **NTLM deprecation cliff** (Microsoft's
2027 timeline) forcing the LDAP-Kerberos pairing into hardened
configurations; LDAP signing and channel binding finally default-on
as of Windows Server 2025; post-quantum considerations for LDAP-
over-TLS (Kyber/ML-KEM rollouts); eBPF-based LDAP observability;
the "directory-as-a-service" market consolidation.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook
- A striking statistic that captures importance, with source
- A "pause and think" moment
- A failure-story arc (Log4Shell or PetitPotam-NTLM-LDAP relay work well)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: ldap
name: Lightweight Directory Access Protocol
abbreviation: LDAP
categoryId: <recommend — likely the proposed "identity" category alongside SAML/OIDC/OAuth2/Kerberos, OR utilities-security>
port: 389 (LDAP), 636 (LDAPS)
year: 1993 (LDAPv2); 1997 (LDAPv3)
rfc: RFC 4510 (and family 4511–4519)
standardsBody: ietf
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency, throughput, overhead }
connections: <kerberos, saml, oidc, tls, dns, ntp, oauth2>
links: { wikipedia, official (datatracker.ietf.org/wg/ldapbis), spec }
image: <Wikimedia URL — LDAP DIT tree diagram>
```

### A.2 Header / wire-format layout

Provide the ASN.1 BER-encoded **LDAPMessage** structure as an
annotated table:
- SEQUENCE { messageID INTEGER, protocolOp CHOICE { bindRequest,
  bindResponse, unbindRequest, searchRequest, searchResEntry,
  searchResDone, modifyRequest, ..., extendedReq, extendedResp,
  intermediateResponse }, controls [0] Controls OPTIONAL }
- Then a representative SearchRequest decomposition (baseObject,
  scope, derefAliases, sizeLimit, timeLimit, typesOnly, filter,
  attributes)

### A.3 State machine

LDAP connection state machine in mermaid `stateDiagram-v2`:
TcpConnected → (StartTLS?) → Unauthenticated → Bound →
OperationInProgress → Bound → Unbound.

### A.4 Code example

- `python` — using `ldap3` to connect, StartTLS, SASL bind with
  Kerberos, paged search
- `javascript` — Node.js `ldapjs` client doing simple bind +
  search
- `cli` — `ldapsearch -H ldaps://dc01 -Y GSSAPI -b "dc=example,dc=com" "(uid=tim)"`,
  `ldapmodify`, `ldapwhoami`, Microsoft `dsquery`, `Get-ADUser`
- `wire` — sectioned dump: TCP connect, StartTLS extended op, Bind
  with SASL/EXTERNAL, SearchRequest, SearchResultEntry,
  SearchResultDone, Unbind

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. Windows Server 2025 LDAP signing
default-on, SCIM 2.0 adoption growth, OpenLDAP 2.6 release notes,
Samba 4.20 features, PetitPotam follow-on patches, NTLM deprecation
timeline.

### A.6 Real-world deployments

≥5 named: Microsoft Entra ID / AD (>600M users), every Fortune 500
on-prem AD, FreeIPA in Red Hat estates, OpenLDAP in Debian/Ubuntu
fleets, Apple Open Directory legacy, Stanford/MIT university
directories, JumpCloud cloud-LDAP customers.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

### A.9 Wireshark hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Tim Howes with full bio, Howard Chu, Mark Wahl, Steve Kille.

### A.12 RFC records ≥3

RFC 4510 (roadmap), 4511 (Protocol), 4513 (Authentication +
StartTLS), 4515 (Filter), 4519 (Schema), RFC 2696 (Paged Results),
RFC 4533 (syncrepl), plus the historic RFC 1487 (LDAPv2) and RFC
2251 (LDAPv3).

### A.13 New glossary concepts

≥10 — DN, RDN, DIT, objectClass, attribute, schema, base DN, scope,
filter, control, extension, bind (simple/SASL/anonymous), StartTLS,
LDAPS, syncrepl, referral, root DSE, LDIF.

### A.14 Frontier entry

"LDAP being eclipsed by SCIM and cloud directories, but the install
base is permanent" as a frontier entry with metrics (Windows Server
2025 LDAP signing default-on rollout, SCIM 2.0 enterprise adoption
%, managed-LDAP market growth).

### A.15 Journey suggestion

"How your enterprise login works" — LDAP at the directory →
Kerberos for tickets → SAML/OIDC at the cloud boundary → SCIM for
sync.

### A.16 Comparison pair

"LDAP vs SCIM" (the on-prem directory vs cloud provisioning) and
"OpenLDAP vs Active Directory" (the two dominant implementations).

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries (narrative / timeline / callout /
diagram / image / pioneers). Strong candidates:
- Narrative: "1993, University of Michigan: a lightweight front for
  a heavyweight directory" (Tim Howes' team)
- Timeline: 1988 X.500 → 1993 LDAPv2 → 1997 LDAPv3 → 2000 AD launch
  → 2006 RFC 4510 family → 2021 Log4Shell → 2024 default-on signing
- Callout: "Microsoft's 2000 LDAP-Kerberos bet — the open-standards
  win of the decade"
- Image: Wikimedia of an early Netscape Directory Server or U-Mich
  slapd
- Diagram: DIT tree with sample DNs
- Pioneers: Howes + Chu + Bartlett mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely Log4Shell already exists) +
new proposals. Strong candidates for new outage records:
- CVE-2021-42278 sAMAccountName Spoofing / Bronze Bit (Dec 2021) —
  protocol-design
- PetitPotam + NTLM-to-LDAP relay chain (2021–2024) — security
- Log4Shell LDAP/JNDI as RCE channel (Dec 2021) — software-bug
  (cross-reference existing outage if present)

### A.19 Embedded media

Highest-signal: Sean Metcalf's DEF CON talks on AD/LDAP, Will
Schroeder's BlackHat talks, SpecterOps BloodHound walkthroughs, the
Microsoft AD architecture videos.

### A.20 Prerequisites

```
concepts: [tcp, tls, asn1, hierarchy, schema, encoding, public-key-cryptography]
protocols: [tcp, tls, dns, kerberos]
```

### A.21 Name highlight

```
"[L]ightweight [D]irectory [A]ccess [P]rotocol"  (LDAP)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for TCP connect → StartTLS → SASL/GSSAPI
bind → paged search → unbind. 10–14 step annotations; explain *what*
each PDU is and *why* the reader is seeing it (e.g., "StartTLS is
an LDAP-level extended operation — it asks the server to upgrade
this same TCP connection to TLS, rather than opening a fresh TLS
socket like LDAPS").

### A.23 Category placement

Strong recommendation: **propose a new "identity" category** to hold
LDAP alongside SAML, OAuth 2.0, OpenID Connect, and Kerberos coming
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

Author a simulation of an **LDAP search with StartTLS and SASL/GSSAPI
bind** (the canonical AD case). Provide 6–10 steps in the shape:

```
title: "LDAP Search (StartTLS + Kerberos Bind)"
description: "Watch a client open a TCP connection, upgrade to TLS, bind with a Kerberos ticket, search for a user, and unbind."
actors:
  - { id: "client", label: "LDAP Client (Workstation)", icon: "laptop", position: "left" }
  - { id: "server", label: "LDAP Server (Domain Controller)", icon: "server", position: "right" }
userInputs:
  - { id: "baseDN", label: "Base DN", type: "text", defaultValue: "dc=contoso,dc=com" }
  - { id: "filter", label: "Filter", type: "text", defaultValue: "(sAMAccountName=tim)" }
steps:
  - id: tcpconn
    label: "TCP SYN/SYN-ACK/ACK"
    description: "Client opens TCP to port 389 on the DC."
    fromActor: client
    toActor: server
    duration: 800
    highlight: [port, sport, dport]
    layers:
      - IP: { src: "10.0.0.5", dst: "10.0.0.10" }
      - TCP: { sport: 49152, dport: 389, flags: "SYN" }
  - id: starttls
    label: "StartTLS Extended Op"
    description: "Client sends extendedReq with OID 1.3.6.1.4.1.1466.20037 to upgrade."
    fromActor: client
    toActor: server
    duration: 1200
    highlight: [messageID, requestName]
    layers:
      - TCP: { dport: 389 }
      - LDAP: { op: "extendedReq", oid: "1.3.6.1.4.1.1466.20037" }
  - id: tlshandshake
    label: "TLS 1.3 Handshake"
    description: "ClientHello / ServerHello / Finished — channel upgraded."
    ...
  - id: bind
    label: "SASL Bind (GSSAPI)"
    description: "Client wraps a Kerberos AP-REQ in the SASL credentials field."
    ...
  - id: bindresp
    label: "BindResponse success"
    description: "Server validates ticket against ldap/dc01.contoso.com SPN."
    ...
  - id: search
    label: "SearchRequest"
    description: "Base DN, scope=subtree, filter=(sAMAccountName=tim), attrs=[cn,mail,memberOf]."
    ...
  - id: result
    label: "SearchResultEntry"
    description: "Server streams matching entries."
    ...
  - id: done
    label: "SearchResultDone"
    description: "Server signals the search is complete with success."
    ...
  - id: unbind
    label: "UnbindRequest + TCP FIN"
    description: "Client closes the bind and the connection."
    ...
```

The layers should reflect: IP → TCP → TLS (after StartTLS) → LDAP.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
