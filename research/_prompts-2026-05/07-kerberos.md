===== PROTOCOL · KERBEROS · Kerberos =====

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
distilled into one document. Surface-level "what is Kerberos" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — MIT Project Athena 1983–1991, Jerome Saltzer and
  Jeffrey Schiller architecting it, Steve Miller and Clifford Neuman as
  early implementers, the three-headed-dog naming, V4 closed-source
  (1989), V5 (RFC 1510 in 1993, RFC 4120 in 2005 with the modern
  ASN.1 encoding), Microsoft's Windows 2000 adoption as AD's primary
  auth (1999), the long Heimdal vs MIT vs Windows implementation
  divergence.
- Mechanics deep enough that someone could re-implement a minimal
  Kerberos client after reading: AS-REQ / AS-REP / TGS-REQ / TGS-REP
  / AP-REQ / AP-REP, the ticket structure, the authenticator, session
  keys, the PA-ENC-TIMESTAMP pre-authentication, PKINIT, FAST, the
  GSS-API mapping, SPNEGO (HTTP Negotiate), the KDC and KRBTGT
  service-account role.
- Real failures and famous incidents — MS14-068 (the November 2014
  "Sunday morning" KDC elevation bug), golden-ticket and silver-ticket
  attacks (Mimikatz, Sean Metcalf's research at adsecurity.org),
  Kerberoasting (Tim Medin's 2014 DerbyCon talk), AS-REP roasting,
  the 2022 Conti leaks showing constant Kerberos abuse in ransomware,
  the LSARPC + KRBTGT relay attacks, NoPac (CVE-2021-42278 /
  CVE-2021-42287), the PrintNightmare-adjacent Kerberos relay work
  (DFSCoerce, PetitPotam).
- Connections to adjacent protocols — LDAP (joint AD pairing,
  already in this pass), DNS (KDC discovery via SRV records), TLS
  (alternative trust model), OAuth 2.0 (already covered — token vs
  ticket), SAML and OIDC (federation comparison), GSS-API, SPNEGO,
  SSH (GSSAPI-with-MIC), NFS (sec=krb5).
- 2024–2026 developments — PQ Kerberos (RFC drafts late 2024 onward),
  CBC-mode deprecation finally landing in production stacks, RFC 8636
  (anti-DES BCP), modern hybrid Kerberos+OIDC patterns, the slow
  Windows Hello / Modern Auth migration, NTLM end-of-life
  announcements, MIT Kerberos and Heimdal recent releases.
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
body (IETF KITTEN WG, Microsoft Learn, the MIT Kerberos consortium
archives). Past passes have left 121 `[needs source]` markers across 46
reports — please try harder this round, but never invent a source to avoid
one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how Kerberos relates to
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
mDNS/DNS-SD, OpenID Connect, ACME, email-auth (DKIM/SPF/DMARC),
**SAML, LDAP** (both heavily related), SNMP, Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **Kerberos** — the ticket-based network
authentication protocol born at MIT Project Athena in the 1980s, named
for the three-headed dog (client / server / KDC), still the primary
authentication mechanism inside every Windows Active Directory in 2026.

Kerberos V4 (the first public version, 1989) was closed-source for export
control reasons; Kerberos V5 (RFC 1510 in 1993, completely rewritten as
RFC 4120 in 2005 with proper ASN.1 encoding) is the canonical modern
version. Microsoft adopted V5 in Windows 2000 as Active Directory's
primary authentication protocol, displacing NTLM, and that adoption
turned a research-lab protocol into the foundation of enterprise IT for
the next quarter-century.

The story has three intertwined strands: the academic origin (MIT,
Saltzer, Schiller, Miller, Neuman); the Microsoft adoption strand
(Active Directory, NTLM-vs-Kerberos, the Heimdal vs MIT vs Windows
implementation split); and the security-research strand (the 2014
Mimikatz era, Tim Medin's Kerberoasting, Sean Metcalf's adsecurity.org
work, the long stream of CVEs).

Related protocols and standards likely connected to Kerberos that you
should verify and expand on:

  - **LDAP** (in this same pass) — joint Active Directory pairing.
    Kerberos authenticates, LDAP carries directory data; SASL/GSSAPI
    ties them together.
  - **DNS** (already in the encyclopedia) — KDC discovery via SRV
    records (_kerberos._tcp.REALM, _kpasswd._udp.REALM).
  - **TLS** (already in the encyclopedia) — alternative trust model
    (PKI vs realm KDC). Often layered together for HTTPS Negotiate
    auth.
  - **OAuth 2.0** (already covered) — token-vs-ticket model
    comparison.
  - **OpenID Connect / SAML** (this pass) — federation comparison.
  - **GSS-API** (RFC 2743) — the generic security-service API
    Kerberos implements.
  - **SPNEGO** (RFC 4178) — HTTP Negotiate auth wrapping GSSAPI.
  - **SSH** (already in the encyclopedia) — GSSAPI-with-MIC auth.
  - **NFS** — sec=krb5, sec=krb5i, sec=krb5p.
  - **NTLM** — the predecessor Microsoft auth protocol, finally
    being phased out.
  - **PKINIT** — public-key extension for AS-REQ.

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced (realm, principal,
  KDC, AS, TGS, TGT, service ticket, session key, authenticator,
  pre-authentication, PA-ENC-TIMESTAMP, PKINIT, FAST, KRBTGT account,
  GSSAPI, SPNEGO, mutual authentication, forwardable ticket,
  proxiable ticket, renewable ticket, constrained delegation, S4U2Self,
  S4U2Proxy, etype, salt, kvno)
- [ ] **≥4** dated entries on the history timeline (1983 → 2026)
- [ ] Full AS-REQ / AS-REP / TGS-REQ / TGS-REP / AP-REQ / AP-REP
      message format (ASN.1 sketch; bit/byte structure is awkward but
      provide the field list with types)
- [ ] Kerberos exchange state machine (mermaid `stateDiagram-v2`):
      no-creds → AS exchange → TGT-held → TGS exchange → service-ticket
      → AP exchange → authenticated session
- [ ] A sequence diagram of a full Kerberos auth (mermaid
      `sequenceDiagram`): client → AS-REQ → AS-REP (TGT) → TGS-REQ
      → TGS-REP (service ticket) → AP-REQ to service → AP-REP
- [ ] **≥5** named real-world deployments with org names, scale numbers,
      and dates (every Microsoft AD on Earth — millions of orgs; MIT
      Athena still running; every Hadoop / HDFS / Hive / Impala cluster;
      FreeIPA; Heimdal in BSD / Apple ecosystem; Apple Open Directory
      until ~2010; Apache Kafka with SASL/GSSAPI; every university SSO)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Jerome Saltzer with Saltzer-Schroeder principles context;
      Jeffrey Schiller; Steve Miller; Clifford Neuman as one of the V5
      architects; John Kohl as V5 editor; Sam Hartman / Greg Hudson as
      modern MIT Kerberos leads; Love Hörnquist Åstrand for Heimdal)
- [ ] **≥3** RFCs with number, year, status, and notable-section
      pointers — minimum RFC 4120 (V5 core), RFC 4121 (GSS-API
      mechanism), RFC 6113 (FAST), RFC 8636 (anti-DES BCP), and
      ideally RFC 8062 (PKINIT anonymity), RFC 6803 (Camellia),
      RFC 4556 (PKINIT)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (MS14-068 November 2014, NoPac CVE-2021-42278/42287,
      golden-ticket via DCSync after KRBTGT compromise, Kerberoasting,
      the 2022 Conti leaks)
- [ ] **≥3** fun facts / anecdotes with sources (the three-headed-dog
      naming, the V4 export-control story, the Microsoft "extended"
      PAC controversy of 2000, the Mimikatz origin, the "skeleton key"
      attack)
- [ ] **≥3** practical pitfalls with concrete tuning advice (clock
      skew tolerance default 5min, ticket lifetime defaults, KRBTGT
      password rotation policy, the realm-name case-sensitivity trap,
      DNS reverse-lookup dependency, the encryption-type negotiation
      pitfalls, the "always use FAST" recommendation)
- [ ] **≥3** Wireshark / capture-tool filter examples (`kerberos`,
      `kerberos.msg_type`, `kerberos.realm`, plus how to use Rubeus or
      kinit for live testing)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (PQ Kerberos drafts, CBC-mode deprecation in MIT 1.21+, the
      Windows Server 2025 Kerberos changes, Heimdal 8.x releases,
      NTLM EOL announcements)
- [ ] **≥1** 2025–2026 frontier development (post-quantum Kerberos
      drafts, hybrid PQ key-establishment, Windows Modern Auth
      migration, NTLM end-of-life)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (full Kerberos auth)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* Kerberos makes sense.
Cover: authentication vs authorisation, symmetric vs asymmetric crypto,
hash functions, HMAC, AES (and the legacy DES / RC4-HMAC story), Kerberos
realm (administrative authentication domain), principal (named entity
in a realm — user or service), KDC (Key Distribution Center, with its
two sub-components AS and TGS), TGT (Ticket-Granting Ticket), service
ticket, session key, authenticator, the KRBTGT service account
(literally named krbtgt), key version number (kvno), encryption type
(etype) negotiation, salt, the GSS-API and SPNEGO wrapping model,
SASL, ASN.1 / DER encoding (since Kerberos messages are ASN.1).

Concepts specific to Kerberos: pre-authentication (PA-ENC-TIMESTAMP),
FAST (Flexible Authentication Secure Tunneling, RFC 6113), PKINIT
(public-key initial auth, RFC 4556), constrained delegation (S4U2Self,
S4U2Proxy), forwardable/proxiable/renewable tickets, anonymous
tickets, realm trust (transitive, non-transitive, one-way), keytab
file, cross-realm trust.

## History and story

**Origin: MIT Project Athena, 1983–1991.** Athena was a joint
MIT/DEC/IBM project funded with $50M (mostly from DEC and IBM) to
build a campus-wide distributed computing environment. The
authentication problem — how does a Sun workstation know that the
person at the keyboard is who they claim to be when the keyboard is
in a public Athena cluster — drove the Kerberos design. Jerome
Saltzer (the MIT professor whose 1975 paper with Schroeder gave us the
Saltzer-Schroeder principles of computer security) provided the
intellectual foundation. Jeffrey Schiller was the Athena Network
Manager who pushed the protocol into existence. Steve Miller and
Clifford Neuman did much of the early implementation.

The protocol design draws explicitly from Needham-Schroeder (1978),
adapting that idea into a workable production protocol with the KDC
as trusted third party. The three-headed-dog naming comes from Greek
mythology — Cerberus guarded the gates of Hades; in Kerberos the
three "heads" are the client, the server, and the KDC.

**V4 (1989).** Closed-source, US-export-restricted, used 56-bit DES
exclusively. Limited to single-realm deployments; cross-realm support
was rough. V4 ran for years inside MIT and academic institutions.

**V5 (RFC 1510, September 1993).** A complete redesign with ASN.1
encoding for extensibility, cross-realm trust, forwardable/renewable
tickets, multiple encryption types, and pre-authentication. RFC 1510
was eventually obsoleted by RFC 4120 in July 2005 (the modern
canonical text).

**Microsoft Windows 2000 (1999/2000).** Microsoft chose Kerberos V5
as the primary auth protocol for Active Directory, displacing NTLM.
The 2000-era controversy over Microsoft's "extended" PAC (Privilege
Attribute Certificate) data inside the ticket was significant — early
Microsoft documentation hinted the PAC was proprietary, generating
fears of vendor lock-in. Microsoft eventually published the PAC
format (now MS-PAC).

**Implementation divergence:**
- **MIT Kerberos** — the reference open-source implementation,
  permissively licensed, run by the MIT Kerberos Consortium since
  ~2007. Current lead: Greg Hudson. Earlier modern era leadership:
  Sam Hartman.
- **Heimdal** — independent open-source implementation started in
  the late 1990s by Assar Westerlund and Johan Danielsson at KTH
  Stockholm; later led by Love Hörnquist Åstrand. Used by Apple
  (macOS shipped Heimdal-derived Kerberos for many years) and in
  the BSDs.
- **Microsoft Windows** — Microsoft's own implementation inside
  LSA/MSV1_0/Kerberos.dll.

**Security research era (2014–present).** Mimikatz (Benjamin
Delpy) made Kerberos attack techniques accessible. Tim Medin's
2014 DerbyCon talk introduced Kerberoasting. Sean Metcalf's
adsecurity.org systematised the attack tree. The November 2014
MS14-068 KDC elevation bug exposed how brittle the trust model
could be. NoPac (2021) showed sAMAccountName impersonation was
still possible decades in. The 2022 Conti leaks revealed
ransomware operators relying heavily on Kerberos abuse.

**2024–2026.** Post-quantum Kerberos drafts began emerging in late
2024 in the IETF KITTEN working group. CBC-mode encryption types
are finally being deprecated (MIT 1.21 dropped support; Windows
Server 2025 deprecating). NTLM end-of-life announcements continue.

Version / extension milestones table:
- 1983–1991: MIT Athena project
- 1988: V4 first appears
- 1993: V5 RFC 1510
- 1999: Windows 2000 ships with Kerberos
- 2005: RFC 4120 (V5 canonical)
- 2008: RFC 5021 (TCP transport extensions)
- 2011: RFC 6113 (FAST)
- 2017: RFC 8062 (PKINIT anonymity)
- 2020: RFC 8636 (anti-DES BCP)
- 2024+: PQ Kerberos drafts

## How it actually works

The full exchange:

1. **AS-REQ** (Authentication Service Request) — client → KDC's AS.
   Carries the client principal name, requested service (TGS), and
   either pre-auth (PA-ENC-TIMESTAMP encrypted with client's
   long-term key derived from password) or PKINIT (signed with
   client's X.509 cert). Pre-auth was added to defeat AS-REP
   roasting attacks against the client's long-term key.
2. **AS-REP** (Authentication Service Reply) — KDC → client. Carries
   the TGT (Ticket-Granting Ticket — encrypted to the KDC's KRBTGT
   key, opaque to client) plus the session key for the TGT (encrypted
   to the client's long-term key).
3. **TGS-REQ** (Ticket-Granting Service Request) — client → KDC's
   TGS. Carries the TGT + an authenticator (timestamp encrypted with
   the TGT session key) + the target service name.
4. **TGS-REP** (Ticket-Granting Service Reply) — KDC → client.
   Carries the service ticket (encrypted to the service's long-term
   key) plus a fresh session key (encrypted to the TGT session key).
5. **AP-REQ** (Application Request) — client → service. Carries the
   service ticket + a fresh authenticator (timestamp encrypted with
   service session key).
6. **AP-REP** (Application Reply, optional, for mutual auth) — service
   → client. Carries a fresh timestamp from the authenticator,
   encrypted with the service session key.

The ticket structure: realm, sname, enc-part (encrypted with the
service's long-term key, containing flags, key, crealm, cname, transited
realms, authtime, starttime, endtime, renew-till, caddr, authorization-
data — including Microsoft's PAC).

Cross-realm: realm A's KRBTGT/B account holds a key shared with realm
B; presenting an AS-REQ to A for service in B yields a referral TGT
for B, which the client then presents to B's TGS.

Encryption types (etypes): historically DES-CBC-CRC (etype 1, deprecated),
DES-CBC-MD5 (etype 3, deprecated), RC4-HMAC (etype 23, deprecated),
AES128-CTS-HMAC-SHA1-96 (etype 17), AES256-CTS-HMAC-SHA1-96 (etype 18),
the modern SHA-2-based AES (RFC 8009: etype 19, 20), Camellia (RFC 6803).

FAST (RFC 6113) — tunnels the AS exchange inside an armor key derived
from anonymous PKINIT or another mechanism, defeating offline brute-
force against the client's long-term key.

GSS-API wrapping: applications speak GSS-API; the Kerberos GSS-API
mechanism (RFC 4121) handles the AP-REQ / AP-REP exchange and provides
per-message integrity / confidentiality. SPNEGO (RFC 4178) lets
applications negotiate between GSS-API mechanisms (typically Kerberos
or NTLM). HTTP "Negotiate" auth is SPNEGO over HTTP.

Provide **three** diagrams in mermaid-compatible text:
1. A sequence diagram of full Kerberos auth (AS → TGS → AP exchanges)
   (`sequenceDiagram`)
2. A state diagram of client credential state
   (`stateDiagram-v2`): no-creds → has-TGT → has-service-ticket →
   authenticated-session
3. A ticket structure layout (table form) showing the enc-part fields
   and the authorization-data / PAC structure

## Deep connections to other protocols

Cover each related protocol listed in the topic. Pay particular attention
to:

- **LDAP** — the joint Active Directory pairing. Kerberos handles
  authentication; LDAP carries the directory data. They are bound via
  SASL/GSSAPI (LDAP bind using GSS-SPNEGO). Active Directory is, in
  spec terms, "LDAP + Kerberos + SMB + DNS-SD glue".
- **DNS** — KDC discovery via SRV records: `_kerberos._tcp.REALM`,
  `_kerberos._udp.REALM`, `_kpasswd._tcp.REALM`. DNS-driven realm
  determination from a user's email-style principal is standard.
  Also: reverse DNS dependency for service principal name (SPN)
  resolution — historically a source of breakage.
- **TLS** — alternative trust model: PKI / X.509 vs realm / KDC.
  Often layered together (HTTPS with Negotiate / GSSAPI auth). PKINIT
  bridges them by using X.509 to bootstrap a Kerberos exchange.
- **OAuth 2.0** — token-vs-ticket model. Both are bearer-credential
  patterns at heart; Kerberos tickets have audience binding via the
  service-key encryption, OAuth tokens have JWT audience claims.
  Discuss the philosophical comparison.
- **OpenID Connect / SAML** — federation models. Kerberos cross-realm
  trust is the "old" federation; OIDC and SAML are the web-native
  successors.
- **GSS-API** — the generic auth API; Kerberos is the
  most-implemented GSS-API mechanism.
- **SPNEGO** — HTTP Negotiate auth (the browser-and-windows-domain
  thing).
- **SSH** — `GSSAPIAuthentication yes` enables Kerberos SSH login.
- **NFS** — sec=krb5 (auth), sec=krb5i (integrity), sec=krb5p
  (privacy / encrypted).
- **NTLM** — predecessor in Windows-land. Still common as fallback;
  end-of-life announced.
- **MS-PAC** — Microsoft's authorization-data extension inside the
  Kerberos ticket carrying group SIDs and other authz info; the heart
  of countless attacks.

## Real-world deployment

Major implementations — named:
- **MIT Kerberos** (krb5) — the reference. Current lead: Greg Hudson.
  Recent releases: 1.21 (2023), 1.22 (2024).
- **Heimdal** — KTH-origin, used heavily on macOS, FreeBSD, NetBSD,
  some Linux distros. Current lead: Love Hörnquist Åstrand and team.
- **Microsoft Windows** — proprietary, the dominant deployed
  Kerberos by raw count.
- **FreeIPA** — Red Hat's identity-management stack bundling MIT
  Kerberos + 389 Directory + DNS + Dogtag CA.
- **Apple Open Directory** — Heimdal-based, used through ~2010,
  declining since.
- **Samba** — Heimdal- and MIT-based, providing AD-compatible
  Kerberos to non-Windows systems.

Real numbers:
- Number of Active Directory installations globally (Microsoft has
  not published a precise figure for years — estimate from public
  statements)
- Number of FreeIPA installations (Red Hat / IBM customer base)
- Kerberos auths per second at hyperscale enterprises
- Hadoop / Cloudera deployments using SASL/GSSAPI

Specific deployments:
- **Every Microsoft Active Directory on Earth** — millions of
  organisations.
- **MIT Athena** — still running in 2026 (cite the MIT IS&T page).
- **Every major Hadoop / Spark / HDFS / Hive / Impala cluster** —
  SASL/GSSAPI security with Kerberos is the standard.
- **Apple Open Directory** — historical, ~2003–2010.
- **NASA, Department of Defense, every major US government
  installation** — Kerberos-backed CAC / PIV smartcard auth via
  PKINIT.
- **Universities** — MIT, Stanford, CMU, Carnegie Mellon's pioneering
  deployments.
- **Apache Kafka** — SASL_GSSAPI auth in production at Uber,
  LinkedIn, etc.

## Failure modes and famous incidents

**MS14-068 (November 2014).** A KDC validation bug allowed forging
of PAC contents — any domain user could promote themselves to Domain
Admin. The patch landed during Thanksgiving week ("Sunday morning"
in the security blogosphere). Microsoft Security Bulletin
MS14-068, KB3011780. Investigate the technical root cause
(PAC signature verification with wrong algorithm).

**Golden ticket attack.** If you compromise the KRBTGT account
password hash (typically via DCSync after Domain Admin), you can
forge arbitrary TGTs valid for the realm's KRBTGT key lifetime
(default 10 years). Mimikatz `kerberos::golden`. The defensive
play is double KRBTGT password rotation (the famous
"reset-krbtgt-twice" PowerShell script).

**Silver ticket attack.** Compromise of a service account's password
hash allows forging service tickets for that specific service without
ever talking to the KDC. Stealthier than golden tickets because no
4769 event is logged on the KDC.

**Kerberoasting (Tim Medin, DerbyCon 2014).** Any authenticated user
can request a service ticket for any SPN; the ticket's enc-part is
encrypted with the service account's long-term key. Offline crack the
ticket, recover the password. Mitigation: long random passwords on
service accounts, AES-only etypes, gMSA / Managed Service Accounts.

**AS-REP roasting.** If a user has `DONT_REQ_PREAUTH` set, the
AS-REP comes back encrypted with the user's long-term key — offline
crackable. Mitigation: never disable pre-authentication.

**NoPac (CVE-2021-42278 / CVE-2021-42287, November 2021).** A
combination of sAMAccountName spoofing and KDC ticket validation
issues allowed any domain user to impersonate Domain Admin. Patched
November 2021. Investigate root cause.

**The 2022 Conti leaks.** Internal Conti documentation revealed
constant Kerberos abuse — Kerberoasting, golden tickets, silver
tickets, NoPac — as standard tradecraft.

**BronzeBit (CVE-2020-17049).** Kerberos constrained delegation
attack.

**The "Skeleton Key" malware (2014).** Modified the LSASS process
on a DC to accept a hardcoded password for any account.

CVEs to look up:
- CVE-2014-6324 (MS14-068)
- CVE-2020-17049 (BronzeBit)
- CVE-2021-42278 / 42287 (NoPac)
- CVE-2022-37967 (KrbRelayUp wave)
- CVE-2024-21426 (recent SMB/Kerberos)
- Multiple MIT Kerberos and Heimdal CVEs (search MITRE)

Each told as setup → mistake → consequence → resolution.

## Fun facts and anecdotes

The **three-headed-dog naming.** From Greek mythology (Cerberus
guarded the underworld); the three heads map to client / server /
KDC. The mythology persists in implementation naming: the `krbtgt`
account, the `kinit` / `kdestroy` lifecycle.

The **V4 export-control story.** US Export Administration
Regulations made shipping DES-based crypto outside the US illegal
for years. MIT had to maintain a parallel "Bones" (deboned —
stripped of crypto) version for international distribution. The
release of V5 source code internationally took until the late 1990s.

The **Microsoft "extended" PAC controversy of 2000.** Microsoft
initially declined to fully document the PAC inside the ticket's
authorization-data. The fear was a proprietary extension would
let Microsoft fork Kerberos. Eventually the PAC format was
documented (MS-PAC) under the Open Specifications Promise.

The **Mimikatz origin.** Benjamin Delpy released Mimikatz in 2011
as a research tool; by 2014 it had become the standard tool for
post-exploitation Kerberos attacks. Delpy famously gave a
EuroSec talk demonstrating Golden Tickets live on stage.

The **"krbtgt password is never rotated" cultural problem.**
For years Active Directory deployments shipped with KRBTGT
passwords that had been set during initial AD promotion and
never rotated. Microsoft eventually published the
`Reset-KrbTgt-Password.ps1` script.

The **MIT Athena name choice** — "Athena" for the Greek goddess
of wisdom; "Kerberos" for the dog at the door; the project's name
puns thread through MIT computing for decades.

## Practical wisdom

What an engineer actually needs to know to use Kerberos well:

- **Clock skew tolerance** defaults to ±5 minutes. NTP is mandatory.
  Most Kerberos breakage is a clock issue.
- **KRBTGT password rotation.** Microsoft now recommends rotating
  twice yearly. Use `New-KrbtgtKeys.ps1` (or equivalent on non-Windows
  realms). After a security incident, rotate twice in quick
  succession (the 10-hour grace plus full domain replication wait).
- **Encryption type negotiation.** Pin to AES-only — disable RC4-HMAC
  (etype 23) and certainly DES. Windows policy: `Network security:
  Configure encryption types allowed for Kerberos`. In MIT krb5,
  `allow_weak_crypto = false`.
- **Use FAST.** RFC 6113 FAST armors the AS exchange against offline
  attacks on the user's password-derived key. `krb5.conf` enables it.
- **The realm-name case-sensitivity trap.** Realm names are
  case-sensitive in MIT Kerberos / Heimdal but case-insensitive in
  Windows. `EXAMPLE.COM` and `example.com` are not the same realm.
  Canonicalise to upper-case.
- **Reverse DNS dependency.** Many Kerberos clients try reverse DNS
  on the service host to construct the SPN. If reverse DNS lies,
  auth fails. Modern krb5 (`rdns = false`) disables this; do it.
- **Service Principal Name (SPN) hygiene.** Duplicate SPNs across
  accounts is a common AD problem (`setspn -X` finds them).
- **Ticket lifetime tuning.** TGT lifetime default is 10 hours;
  service tickets default 10 hours. Renewable lifetime default 7
  days. For high-security environments shorten these.
- **gMSA / Group Managed Service Accounts** for any service account
  on Windows — automatic 30-day password rotation, no manual
  KRBTGT-style risk.
- **Detection.** Event ID 4769 on the KDC logs every service ticket
  issuance. Pattern-mine for Kerberoasting (etype 23 requests for
  service accounts).

Include **at least 3 Wireshark/tcpdump capture filter examples**:
- `kerberos` — all Kerberos traffic
- `kerberos.msg_type == 10` — AS-REQ only
- `kerberos.msg_type == 12` — TGS-REQ only
- `kerberos.msg_type == 14` — AP-REQ
- `tcpdump -i eth0 'port 88'` — at the L4 level (Kerberos on tcp/udp 88)

## Pioneers and key contributors

- **Jerome H. Saltzer** (1939–) — MIT professor, co-author of the
  1975 Saltzer-Schroeder principles of computer security paper.
  Provided the intellectual foundation for Kerberos and the Athena
  security architecture. Turing Award? Wikipedia URL.
- **Jeffrey I. Schiller** (1958–) — MIT Network Manager during
  Athena, pushed Kerberos into existence. Long-running IETF
  Security Area Director. Full bio.
- **Steve P. Miller** — early MIT Athena implementer, V4 author.
- **B. Clifford Neuman** (–) — one of the key V5 architects, later
  USC professor. Co-author of RFC 4120.
- **John T. Kohl** — V5 editor; co-author of RFC 1510 and the
  early V5 design.
- **Sam Hartman** — long-running MIT Kerberos lead during the
  2000s–2010s era; IETF Security Area Director.
- **Greg Hudson** — current MIT Kerberos technical lead.
- **Love Hörnquist Åstrand** — long-time Heimdal lead.
- **Benjamin Delpy** (1982–) — Mimikatz creator (security-research
  side of the Kerberos story).
- **Tim Medin** — Kerberoasting discoverer (DerbyCon 2014).
- **Sean Metcalf** — adsecurity.org, systematic AD/Kerberos
  attack research.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated
or published. Highlight any resource that is current as of 2024–2026.
Cover:

- **Authoritative specifications** — RFC 4120 (V5 core, 2005, with
  section pointers: §3 message exchanges, §5 message specifications,
  §6 encryption and checksum spec), RFC 4121 (GSS-API mechanism),
  RFC 4178 (SPNEGO), RFC 4556 (PKINIT), RFC 6113 (FAST), RFC 6803
  (Camellia), RFC 8009 (AES-SHA2), RFC 8062 (PKINIT anonymity),
  RFC 8636 (anti-DES BCP), MS-PAC / MS-KILE Microsoft Open
  Specifications.
- **Books** — Garman, *Kerberos: The Definitive Guide* (O'Reilly,
  2003) — still the canonical intro; Neuman & Ts'o, *Kerberos: An
  Authentication Service for Open Network Systems* (foundational
  paper, IEEE Communications 1994); Sean Metcalf's adsecurity.org
  content packaged as a guide; Microsoft's *Active Directory
  Internals* by Sakari Kouti / Mika Seitsonen.
- **Academic papers** — Saltzer & Schroeder, "The Protection of
  Information in Computer Systems" (1975); Needham & Schroeder,
  "Using Encryption for Authentication in Large Networks of
  Computers" (CACM 1978); Steiner, Neuman, Schiller, "Kerberos: An
  Authentication Service for Open Network Systems" (USENIX 1988);
  Bellovin & Merritt, "Limitations of the Kerberos Authentication
  System" (USENIX 1991).
- **Long-form engineering blog posts** — adsecurity.org (Sean
  Metcalf), SpecterOps blog (Will Schroeder, Lee Chagolla-Christensen),
  Microsoft Open Specifications PAC docs, the FreeIPA docs.
- **YouTube videos** — Sean Metcalf's BSides / Black Hat talks on
  AD attacks, Tim Medin's original Kerberoasting talk (DerbyCon
  2014), Benjamin Delpy's Mimikatz talks.
- **Podcasts** — Risky Business (regular Kerberos attack coverage),
  SANS Internet Storm Center.
- **Free university courses** — MIT 6.857 (Network and Computer
  Security), Stanford CS 155 — Kerberos-relevant lectures.
- **Hands-on tools** — Rubeus (C# Kerberos toolkit, SpecterOps),
  Impacket's GetUserSPNs / GetNPUsers / getTGT / getST scripts,
  Mimikatz, MIT krb5 toolchain (`kinit`, `klist`, `kvno`, `kadmin`),
  Heimdal equivalents, Wireshark with Kerberos dissector,
  PowerShell `AccountManagement` and ActiveDirectory modules.

## Where things are heading (2025–2026 frontier)

- **Post-Quantum Kerberos.** IETF KITTEN working group drafts
  started appearing in late 2024 for PQ key establishment in
  Kerberos. The challenge: ticket sizes balloon dramatically with
  PQ signatures. Watch draft-ietf-kitten-pquip-pqkerb or successors.
- **CBC-mode deprecation.** RFC 8636 marked DES dead; the natural
  next step is CBC-mode AES deprecation in favor of GCM / SHA-2
  modes (RFC 8009). MIT krb5 1.21+ removes single-DES; Windows
  Server 2025 deprecates RC4-HMAC by default.
- **NTLM end-of-life.** Microsoft has announced NTLM deprecation
  multiple times; Windows Server 2025 and Windows 11 24H2 push the
  timeline. Kerberos is the universal replacement.
- **Modern Auth migration.** Microsoft's "Modern Auth" (OAuth 2.0 /
  OIDC / Entra ID) is replacing Kerberos for cloud-attached
  workloads. Hybrid identity (AD + Entra ID) is the steady state.
- **Hybrid Kerberos + OIDC patterns.** Several large enterprises now
  bridge on-prem Kerberos and OIDC tokens; investigate the
  architectures (Microsoft's "primary refresh token" model, the
  way SAP / Oracle apps bridge).

## Hooks for the article, infographic, and podcast

- A 60-second narrated hook: "every login to every Windows computer
  in every enterprise on Earth runs Kerberos — a protocol named for
  a Greek mythological dog and built by MIT grad students in 1985".
- A striking statistic: scale of AD deployments globally (estimate
  with source), or number of Kerberos auths per second at scale.
- A "pause and think" moment: that the canonical V5 RFC was rewritten
  in 2005 and the protocol is still the keystone of enterprise auth
  21 years later, with source.
- A failure-story arc: MS14-068 — setup (KDC validation of PAC),
  mistake (allowing weak signature alg), consequence (any user →
  Domain Admin), resolution (the Thanksgiving 2014 patch and the
  industry-wide KRBTGT rotation campaign).

---

# Appendix A — Encyclopedia-ready structured-data extracts

### A.1 Protocol record candidate

```
id: kerberos
name: Kerberos
abbreviation: KRB
categoryId: utilities-security (or new "identity" category — see A.23)
port: 88/tcp + 88/udp (KDC), 464/tcp+udp (kpasswd)
year: 1988 (V4 public), 1993 (V5 RFC 1510), 2005 (RFC 4120 canonical)
rfc: RFC 4120 (V5), RFC 4121 (GSS-API), RFC 6113 (FAST)
standardsBody: ietf (MIT-origin)
oneLiner: Ticket-based network authentication via a trusted Key Distribution Center — the keystone of every Active Directory.
overview: <2–3 paragraphs of polished prose>
howItWorks: 4–6 steps as { title, description } — AS exchange, TGS exchange, AP exchange, ticket structure
useCases: 5–7 bullet items — Windows logon, Hadoop / Spark security, NFS sec=krb5, SSH GSSAPI, HTTP Negotiate, IPA / FreeIPA enterprise auth
performance: { latency: "1–3 RTTs to KDC for initial auth", throughput: "limited by KDC capacity", overhead: "tickets cached for hours" }
connections: [ldap, dns, tls, oauth2, openid-connect, saml, ssh]
links: { wikipedia, rfc, official (MIT Kerberos) }
image: <Wikimedia URL — Cerberus mythological image or MIT Kerberos logo>
```

### A.2 Header / wire-format layout

Kerberos messages are ASN.1 / DER encoded. Provide:
- AS-REQ structure (KDC-REQ): pvno, msg-type, padata, req-body
  (kdc-options, cname, realm, sname, from, till, rtime, nonce,
  etype, addresses, enc-authorization-data, additional-tickets).
- AS-REP structure: similarly.
- TGS-REQ / TGS-REP analogous.
- AP-REQ: pvno, msg-type, ap-options, ticket, authenticator.
- Ticket structure: tkt-vno, realm, sname, enc-part (encrypted to
  service key, containing flags, key, crealm, cname, transited,
  authtime, starttime, endtime, renew-till, caddr, authorization-data).

### A.3 State machine

```
stateMachine:
  title: Kerberos Client Credential Lifecycle
  mermaid: |
    stateDiagram-v2
      [*] --> NoCredentials
      NoCredentials --> AS_Request: kinit
      AS_Request --> NoCredentials: PA failure
      AS_Request --> HasTGT: AS-REP received
      HasTGT --> TGS_Request: need service ticket
      TGS_Request --> HasServiceTicket: TGS-REP received
      HasServiceTicket --> Authenticated: AP-REQ accepted
      HasTGT --> Renewed: krenew within renew-till
      HasTGT --> NoCredentials: TGT expired
      Authenticated --> NoCredentials: kdestroy
  states: [...]
```

### A.4 Code example

A minimal working example in **3 languages + a wire-format dump**:
- `python` — using `gssapi` library to authenticate to a service
- `javascript` — Node.js using `kerberos` package (server-side
  HTTP Negotiate)
- `cli` — `kinit user@REALM`, `klist`, `kvno service/host`, `kdestroy`;
  `klist -e` to see etypes; `Rubeus.exe asktgt` for Windows
- `wire` — sectioned dump: AS-REQ (with PA-ENC-TIMESTAMP), AS-REP
  (with TGT + session key), TGS-REQ, TGS-REP (with service ticket),
  AP-REQ (with authenticator)

### A.5 Recent changes (dated, 2024–2026)

Minimum 5 dated entries — PQ Kerberos draft progression, MIT 1.22
release, Heimdal 8.x release, Windows Server 2025 Kerberos
deprecations, NTLM EOL announcements.

### A.6 Real-world deployments

≥5 named: Microsoft Active Directory (every enterprise), MIT
Athena, FreeIPA, Apache Hadoop / Kafka with SASL/GSSAPI, Apple
Open Directory (historical), university SSO systems.

### A.7 Fun facts ≥3

### A.8 Practical wisdom

Pitfalls: clock skew (>5min = auth fails), KRBTGT rotation,
RC4-HMAC enabled, realm case-sensitivity, reverse-DNS dependency,
duplicate SPNs, missing pre-auth (AS-REP roasting). Tools: MIT
krb5 toolchain, Heimdal, Rubeus, Impacket scripts, Wireshark.

### A.9 Wireshark hints ≥3

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Jerome Saltzer (full bio), Jeffrey Schiller, Clifford
Neuman, plus modern: Greg Hudson, Love Hörnquist Åstrand.

### A.12 RFC records ≥3

RFC 4120 (V5, 2005, Proposed Standard), RFC 4121 (GSS-API
mechanism, 2005), RFC 6113 (FAST, 2011), RFC 8636 (anti-DES,
2019, BCP), RFC 4556 (PKINIT, 2006), RFC 8062 (PKINIT anonymity,
2017), RFC 8009 (AES-SHA2, 2016).

### A.13 New glossary concepts ≥10

realm, principal, KDC, AS, TGS, TGT, service ticket, session
key, authenticator, pre-authentication, PA-ENC-TIMESTAMP, PKINIT,
FAST, KRBTGT, GSSAPI, SPNEGO, kvno, etype, salt, forwardable
ticket, renewable ticket, S4U2Self, S4U2Proxy, PAC, keytab,
realm trust.

### A.14 Frontier entry

Post-Quantum Kerberos as a frontier entry with metrics (draft
progress, ticket-size impact) and sources.

### A.15 Journey suggestion

"How a Windows logon works" — a 5–7 step journey: NTP sync →
DNS SRV for KDC → AS-REQ with PA-ENC-TIMESTAMP → AS-REP →
TGS-REQ for desktop → AP-REQ → LDAP query for group SIDs (via
the PAC) → desktop session.

### A.16 Comparison pair

"Kerberos vs OAuth 2.0" (ticket vs token, enterprise vs web).
Optional second: "Kerberos vs SAML" or "Kerberos vs OIDC".

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "1983, MIT, Project Athena begins" — the Athena origin
- Timeline: 1978 (Needham-Schroeder) → 1983 (Athena) → 1988
  (V4) → 1993 (V5 RFC 1510) → 1999 (Windows 2000) → 2005
  (RFC 4120) → 2014 (MS14-068) → 2024+ (PQ Kerberos)
- Callout: "The three-headed dog and why it has three heads"
- Image: Wikimedia of Cerberus mythological art OR the MIT
  Kerberos logo
- Diagram: the AS / TGS / AP three-phase exchange
- Pioneers section embedded: Saltzer + Schiller + Neuman

### A.18 Famous-incident references + new outage proposals

Propose new outage records:
- MS14-068 (November 2014) — security category, named cast
  including Microsoft, the discoverers (Tom Maddock at Qualys)
- Conti leaks revealing Kerberos abuse (2022) — security
- NoPac (2021) — security, with CVE-2021-42278 / 42287

### A.19 Embedded media

Highest-signal: Sean Metcalf's BlackHat / BSides talks on AD
attacks, Tim Medin's original Kerberoasting DerbyCon talk,
Benjamin Delpy's Mimikatz live demos, the MIT Kerberos
Consortium technical webinars.

### A.20 Prerequisites

```
concepts: [authentication, authorization, symmetric-crypto, hash-function, hmac, session-key, dns-srv, asn1, gss-api]
protocols: [tls, dns, ldap, oauth2]
```

### A.21 Name highlight

```
"[K]erberos"  (KRB)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for a fresh Kerberos auth from kinit
through accessing a service — AS exchange → TGS exchange → AP
exchange. 10–14 step annotations explaining what each message
carries and why.

### A.23 Category placement

Strong candidate to **propose a new "identity" category** covering
Kerberos alongside OAuth 2.0 (already in utilities-security),
OpenID Connect (this pass), SAML (this pass), LDAP (this pass).
Suggested:

```
id: identity
name: Identity & Access
color: <hex; suggest amber/rose range, well-separated from existing>
glowColor: <complementary>
description: Authentication and authorisation protocols — how parties prove who they are.
icon: <lucide-react icon name, e.g., "key-round" or "user-check">
```

Alternative: keep in **utilities-security** alongside TLS and SSH.
Recommend the new "identity" category to better surface the
auth-protocol cluster.

---

# Appendix B — Simulator step list

Author one simulation: **Kerberos Full Authentication — kinit through
service access**.

```
title: "Kerberos: From kinit to Authenticated Service Access"
description: "Watch a client run kinit, obtain a TGT, request a service ticket, and authenticate to a service."
actors:
  - { id: "client", label: "Client (alice@EXAMPLE.COM)", icon: "laptop", position: "left" }
  - { id: "kdc", label: "KDC (AS + TGS)", icon: "shield", position: "center" }
  - { id: "service", label: "Service (host/web.example.com)", icon: "server", position: "right" }
userInputs:
  - { id: "principal", label: "User principal", type: "text", defaultValue: "alice@EXAMPLE.COM" }
  - { id: "service", label: "Service principal", type: "text", defaultValue: "HTTP/web.example.com" }
  - { id: "etype", label: "Encryption type", type: "select", options: ["aes256-cts-hmac-sha1-96", "aes128-cts-hmac-sha1-96", "rc4-hmac"], defaultValue: "aes256-cts-hmac-sha1-96" }
  - { id: "useFast", label: "Use FAST armoring", type: "boolean", defaultValue: true }
steps:
  - id: asreq
    label: "AS-REQ"
    description: "Client sends AS-REQ with PA-ENC-TIMESTAMP encrypted under alice's long-term key."
    fromActor: client
    toActor: kdc
    duration: 1200
    highlight: [cname, sname=krbtgt/EXAMPLE.COM, PA-ENC-TIMESTAMP, etype]
    layers:
      - IP: { src: client_ip, dst: kdc_ip }
      - TCP/UDP: { dst: 88 }
      - Kerberos: { msg-type: 10 (AS-REQ), pa-data: PA-ENC-TIMESTAMP, sname: "krbtgt/EXAMPLE.COM" }
  - id: asrep
    label: "AS-REP"
    description: "KDC returns the TGT (encrypted to KRBTGT key) and the TGT session key (encrypted to alice's key)."
    fromActor: kdc
    toActor: client
    duration: 1200
    highlight: [ticket, enc-part, session-key]
    layers:
      - Kerberos: { msg-type: 11 (AS-REP), ticket: { sname: "krbtgt/EXAMPLE.COM", enc-part: <opaque> }, enc-part: <encrypted to alice key> }
  - id: tgsreq
    label: "TGS-REQ"
    description: "Client presents the TGT + authenticator, requesting a ticket for HTTP/web.example.com."
    fromActor: client
    toActor: kdc
    duration: 1200
    highlight: [ticket (TGT), authenticator, sname=HTTP/web.example.com]
    layers:
      - Kerberos: { msg-type: 12 (TGS-REQ), ticket: TGT, authenticator: <encrypted to TGT session key>, sname: "HTTP/web.example.com" }
  - id: tgsrep
    label: "TGS-REP"
    description: "KDC issues the service ticket (encrypted to HTTP service key) and a new session key."
    fromActor: kdc
    toActor: client
    duration: 1200
    highlight: [service-ticket, new-session-key]
    layers:
      - Kerberos: { msg-type: 13 (TGS-REP), ticket: service-ticket, enc-part: <encrypted to TGT session key> }
  - id: apreq
    label: "AP-REQ"
    description: "Client presents the service ticket + authenticator to the web service over HTTP Negotiate."
    fromActor: client
    toActor: service
    duration: 1200
    highlight: [ticket (service), authenticator, mutual-auth flag]
    layers:
      - HTTP: { Authorization: "Negotiate <base64-SPNEGO>" }
      - SPNEGO: { mechanism: Kerberos }
      - Kerberos: { msg-type: 14 (AP-REQ), ticket: service-ticket, authenticator: <encrypted to service session key> }
  - id: aprep
    label: "AP-REP (mutual auth)"
    description: "Service decrypts the ticket, validates the authenticator, returns AP-REP for mutual auth."
    fromActor: service
    toActor: client
    duration: 1200
    highlight: [enc-part with timestamp]
    layers:
      - HTTP: { 200 OK, WWW-Authenticate: "Negotiate <base64-AP-REP>" }
      - Kerberos: { msg-type: 15 (AP-REP), enc-part: <timestamp echoed, encrypted to service session key> }
  - id: session
    label: "Authenticated session"
    description: "Both sides share a fresh session key; mutual authentication complete."
```

Optionally a second simulation: **Cross-realm referral** (alice@A.EXAMPLE
accessing service in B.EXAMPLE through the trust path A → A's
krbtgt/B → B's TGS).

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
