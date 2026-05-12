===== PROTOCOL · EMAIL-AUTH · SPF, DKIM, and DMARC =====

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
distilled into one document. Surface-level "what is SPF" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

This is a **bundled topic** — SPF, DKIM, and DMARC are three separate
protocols designed at different times by different people, but they're
deployed and reasoned about together. Treat the report as one document with
**a shared preamble (history, glossary, where-it-fits, threat model) and
three protocol-specific "How it actually works" subsections** — each with
its own TXT-record format, validation flow, and pitfalls. Include **two**
diagrams: one showing the combined SPF + DKIM + DMARC alignment evaluation
at the receiver, and one of the DMARC `rua`/`ruf` reporting flow.

Specifically I'm interested in:

- The actual narrative — **Meng Wong's SPF** drafts starting 2003,
  Microsoft's competing **Sender ID** (the 2004 "Sender ID war" that
  split the IETF), **Yahoo's DomainKeys** (2004) merging with **Cisco's
  Identified Internet Mail (IIM)** into DKIM (RFC 4871 in 2007,
  obsoleted by RFC 6376 in 2011), the 2007–2011 informal "DMARC"
  collaboration at Yahoo / Google / Microsoft / PayPal / Facebook /
  AOL / Bank of America / Comcast / LinkedIn that became RFC 7489 in
  2015, the seismic **Gmail + Yahoo "bulk sender" enforcement** of
  February 2024, and the DMARC 2.0 work (`draft-ietf-dmarc-dmarcbis`)
  in flight as of 2026.
- Mechanics deep enough that someone could re-implement minimal SPF /
  DKIM / DMARC verifiers after reading: TXT record parsing, the SPF
  `v=spf1` mechanisms (`a`, `mx`, `ip4`, `ip6`, `include`, `redirect`,
  `all`), DKIM's canonicalization + selector + signature + body-hash,
  DMARC's policy (`p=`/`sp=`/`pct=`/`adkim=`/`aspf=`/`rua=`/`ruf=`)
  and the **alignment** rule that ties Authentication-Results back
  to the From: header.
- Real failures and famous incidents — the 2020 Zhang/Hu **DKIM
  crypto-collision** research, the 2016 **DNC John Podesta phish**
  that exploited DMARC absence, the 2021 **FBI ic3.gov spoofed-email
  incident** where a misconfigured external email server let
  attackers send threatening mail with a valid FBI From: header,
  the 2024 Salesforce/Snowflake-related **SPF-passing-tenant
  phishing** waves, recurring **BIMI fraud** and VMC misuse.
- Connections to adjacent protocols — SMTP (already covered) is the
  protocol being defended; IMAP (already covered) is recipient-side;
  DNS is where every record lives; TLS shows up via MTA-STS and
  DANE; ACME provides the cert for MTA-STS; the "everyone has the
  email problem" frame extends to fediverse / Matrix / XMPP / MIMI.
- 2024–2026 developments — **Gmail + Yahoo bulk-sender mandates**
  effective February 2024 (5,000+ daily messages = mandatory SPF +
  DKIM + DMARC + one-click unsubscribe + low spam-complaint rate),
  **Microsoft 365's matching mandate** for May 2025, the
  **DMARCbis draft** progressing through IETF, **DKIM2 draft** for
  replay-attack resistance, **MTA-STS + TLS-RPT** wider deployment,
  **BIMI + VMC** rollouts at Gmail and Apple Mail.
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
standards body (IETF DMARC WG, M3AAWG, dmarc.org). Past passes have left
121 `[needs source]` markers across 46 reports — please try harder this
round, but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers the following 47 protocols
across 6 categories. Your report should explain how SPF/DKIM/DMARC
relate to these — what they depend on, what depends on them, what they
complement:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, **DNS**, DHCP, NTP, **SMTP**, FTP, **IMAP**, OAuth 2.0

Adjacent protocols being added in this same pass (mention if relevant):
Bluetooth/BLE, NAT-traversal (STUN/TURN/ICE), IPsec, WireGuard, OSPF,
mDNS/DNS-SD, Kerberos, OpenID Connect, **ACME**, SAML, LDAP, SNMP,
Matter+Thread, DTLS, PTP.

# Topic

The topic of this research is **email authentication** — the bundled
trio of **SPF**, **DKIM**, and **DMARC**, together with their close
neighbours **ARC** (Authenticated Received Chain, RFC 8617), **BIMI**
(Brand Indicators for Message Identification), **MTA-STS** (RFC 8461),
and **DANE for SMTP** (RFC 7672). These standards together attempt to
solve the foundational unsolved problem of SMTP: that the **From:**
header is not authenticated and anyone can claim to be anyone.

This is a **bundled report** because the three protocols are designed
to be used together, fail badly when deployed alone, and are
enforced jointly by every major receiver (Gmail, Yahoo, Microsoft 365,
Apple iCloud Mail, Proton, Fastmail). Treat the report as one
document:

- A shared **glossary**, **history**, **where-it-fits**, and **threat
  model**.
- **Three "How it actually works" subsections**, one each for SPF,
  DKIM, DMARC — each with its own TXT-record format, validation flow,
  and signature/lookup mechanics.
- A shared **deep connections**, **real-world deployment**, **failure
  modes**, **pioneers**, and **frontier** discussion.

Brief origins:

- **SPF (Sender Policy Framework)** — Meng Wong's drafts 2003–2004,
  RFC 4408 (April 2006, Experimental), RFC 7208 (April 2014, Proposed
  Standard, the current). Checks that the SMTP `MAIL FROM` (the
  envelope return path) comes from an IP authorised by the
  domain's TXT record.
- **DKIM (DomainKeys Identified Mail)** — merger of Yahoo's
  DomainKeys (2004, Mark Delany / Miles Libbey) and Cisco's IIM
  (2005, Jim Fenton), standardised as RFC 4871 (May 2007),
  obsoleted by RFC 6376 (September 2011, Dave Crocker / Tony
  Hansen / Murray Kucherawy as editors). Adds a cryptographic
  signature over selected headers + body, verified via a DNS
  public key published at `<selector>._domainkey.<domain>`.
- **DMARC (Domain-based Message Authentication, Reporting &
  Conformance)** — informally drafted at PayPal (Vijaya Jain) and
  refined with Yahoo, Google, Microsoft, AOL, Comcast, LinkedIn,
  Bank of America, Fidelity, and Facebook, public spec 30 January
  2012, IETF RFC 7489 (March 2015, Informational). DMARC adds
  **alignment** between SPF/DKIM identifiers and the **From:**
  header, plus **policy** (none/quarantine/reject), **reporting**
  (rua aggregate, ruf forensic).

Related protocols and standards likely connected that you should
verify and expand on:

  - **SMTP** (RFC 5321) — the protocol being defended
  - **IMAP / POP3** — recipient-side delivery
  - **DNS** — every record lives in TXT (and CNAME for some setups)
  - **DNSSEC** — strongly desired for record integrity
  - **TLS / MTA-STS / DANE** — adjacent transport-security stack
  - **ACME** — for MTA-STS HTTPS policy host certs
  - **ARC** (RFC 8617) — preserves DMARC results through forwarders
  - **BIMI** — brand logo display tied to DMARC enforcement
  - **VMC** (Verified Mark Certificate) — the x.509 issuance side of BIMI
  - **PSL** (Public Suffix List) — DMARC currently relies on it for
    organisational domain discovery, a sore spot DMARCbis addresses

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., envelope sender / MAIL FROM, header From / 5322.From,
  organisational domain, alignment — strict / relaxed, SPF
  mechanism, SPF qualifier, DKIM selector, canonicalization
  — simple / relaxed, signing scope, body hash, ARC chain,
  AAR / AMS / AS, BIMI, VMC, MTA-STS, DANE-SMTP, TLS-RPT,
  rua, ruf, aggregate report, forensic report, PSL,
  organisational-domain discovery, third-party signer)
- [ ] **≥4** dated entries on the history timeline (2003 → 2026)
- [ ] Full TXT-record format for each of SPF, DKIM, DMARC, plus
      the DKIM-Signature header field layout
- [ ] State diagram of an MTA's email-auth evaluation in mermaid
      `stateDiagram-v2` (parse headers → SPF check → DKIM check →
      DMARC lookup → alignment → policy decision)
- [ ] A sequence diagram of the receiver's combined SPF+DKIM+DMARC
      evaluation including DNS lookups (mermaid `sequenceDiagram`)
- [ ] **A second diagram** of the DMARC reporting flow (rua aggregate
      reports flowing from receiver to reporter SaaS)
- [ ] **≥5** named real-world deployments with org names, scale
      numbers, and dates (Gmail 3B users + Feb 2024 enforcement,
      Yahoo Mail Feb 2024 enforcement, Microsoft 365 May 2025
      enforcement, Apple iCloud Mail, SendGrid/Mailgun/Postmark/SES,
      Mimecast/Proofpoint filtering, Valimail/DMARCian/Red Sift,
      every Fortune 500 DMARC policy)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
      (Meng Wong, Mark Delany, Eric Allman, Dave Crocker, Murray
      Kucherawy, Vijaya Jain / PayPal DMARC team, Steve Jones at
      dmarc.org, Hadmut Danisch as historical SPF claimant)
- [ ] **≥3** RFCs with number, year, status, and notable-section
      pointers (RFC 7208 SPF, RFC 6376 DKIM, RFC 7489 DMARC, RFC
      8617 ARC, RFC 7960 DMARC interop with forwarders, RFC 8461
      MTA-STS, RFC 8460 TLS-RPT, RFC 8616 EAI internationalised
      considerations)
- [ ] **≥2** named failure incidents with year, org, root cause, and
      citation (FBI ic3.gov spoofed-email incident November 2021,
      DNC / John Podesta phishing 2016 exploiting absent DMARC, the
      2024 Salesforce-tenant phishing wave, the 2020 Zhang DKIM
      collision research, the 2018 Mailsploit work)
- [ ] **≥3** fun facts / anecdotes with sources (Meng Wong's solo
      origin, the Microsoft "Sender ID war" of 2004 that split
      the IETF over MARID and patent claims, Hadmut Danisch's
      parallel claim that *he* invented SPF first, the DMARC 30
      January 2012 launch coordinated across PayPal + Google +
      Yahoo + Microsoft, the BIMI "trillion-dollar logo problem")
- [ ] **≥3** practical pitfalls with concrete tuning advice (the
      10-DNS-lookup limit for SPF, the SPF flattening trap, DKIM
      key length 1024 vs 2048, selector rotation, the
      forwarding-breaks-SPF-and-DKIM problem and how ARC fixes it,
      "p=none" as a forever-state mistake, subdomain spoofing if
      you don't set `sp=reject`, third-party SaaS sending via
      SPF include chains)
- [ ] **≥3** Wireshark / capture-tool filter examples (since these
      are TXT-record DNS queries + SMTP exchanges: `dns.qry.name
      contains "_dmarc"`, `smtp.req.parameter`, `dns.txt`, plus
      header inspection in Thunderbird / Gmail's "Show original")
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
      (Gmail+Yahoo enforcement Feb 2024, Microsoft 365 enforcement
      May 2025, DMARCbis draft progressing, DKIM2 draft, BIMI
      adoption stats from Valimail/DMARCian, Apple Mail BIMI
      support iOS 16+, the Marriott/Bonvoy DMARC-related cleanup)
- [ ] **≥1** 2025–2026 frontier development (DMARCbis replacing PSL,
      DKIM2 replay-resistance, ARC adoption beyond Google, BIMI/VMC
      maturation, AI-generated phishing changing the threat model)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (combined SPF + DKIM +
      DMARC evaluation at receiver)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs before SPF/DKIM/DMARC make sense. For
each: one- or two-sentence definition + authoritative link. Cover:
SMTP envelope vs message-headers distinction, `MAIL FROM` (envelope
sender / 5321.From) vs `From:` header (5322.From), DNS TXT records,
DNS CNAME (used in SPF flattening and DKIM hosted setups), public-key
crypto (RSA, Ed25519), base64, body hash, canonicalization, MTA, MUA,
MSA, MDA, organisational domain, Public Suffix List, alignment —
strict vs relaxed, policy — none / quarantine / reject, aggregate vs
forensic reports, BIMI, VMC, ARC.

## History and story

The five-act story:

1. **The original sin (1981–2003)** — RFC 821 SMTP from Postel allows
   any sender to claim any From:. Open relays. The phenomenal rise
   of spam from 1995 onward. RFC 2554 SMTP AUTH (1999) and RFC 3207
   STARTTLS (2002) address transport, not identity.
2. **The SPF era and Sender ID war (2003–2006)** — **Meng Wong** at
   pobox.com publishes SPF drafts in 2003–2004. Microsoft proposes
   **Sender ID** with overlapping mechanisms and a patent licence
   the IETF could not accept. The IETF MARID WG dissolves September
   2004. Hadmut Danisch claims prior art with his "Reverse MX" 2003
   draft, leading to a long-running dispute. SPF eventually
   publishes as Experimental **RFC 4408 (April 2006)** and
   Proposed Standard **RFC 7208 (April 2014)**.
3. **The DKIM convergence (2004–2011)** — Yahoo's **DomainKeys**
   (2004, Mark Delany / Miles Libbey) and Cisco's **Identified
   Internet Mail** (2005, Jim Fenton) merge. Eric Allman of
   Sendmail joins the IETF DKIM WG. **RFC 4871 (May 2007)** is
   the first DKIM Proposed Standard; **RFC 6376 (September 2011)**
   obsoletes it. Dave Crocker, Tony Hansen, Murray Kucherawy as
   editors.
4. **The DMARC convergence (2007–2015)** — **Vijaya Jain** at PayPal
   builds an internal framework to coordinate with Yahoo and Google
   to stop PayPal-impersonation phishing. By 2011 it's a multi-org
   working group: PayPal, Yahoo, Google, Microsoft, AOL, LinkedIn,
   Comcast, Bank of America, Facebook, Fidelity. Public spec
   **30 January 2012**. IETF publishes Informational **RFC 7489**
   in **March 2015**. The IETF DMARC WG chartered 2014, still
   active in 2026 on the DMARCbis revision.
5. **The 2024 reckoning** — **Gmail and Yahoo announce in October
   2023**, effective **1 February 2024**, that any bulk sender
   (>5,000 messages/day) must: publish SPF + DKIM + DMARC with at
   least `p=none`, support one-click unsubscribe (RFC 8058), and
   keep spam-complaint rate <0.3%. **Microsoft 365 follows with a
   matching mandate effective May 2025**. Apple iCloud Mail
   tightens similarly. This is the moment DMARC moved from "nice
   to have for security teams" to "table stakes for any sender."

Tell the actual narrative — name names, give years, describe the
rooms (mostly IETF MARID/DKIM/DMARC WG sessions and M3AAWG
meetings). Mention the patent fight that killed Sender ID, the
PayPal-as-incubator role for DMARC, and the seismic 2024
deployment effect.

## How it actually works

Three subsections, one per protocol.

### How SPF actually works

- TXT record at the **bare domain** (`example.com`) with `v=spf1 ...`.
- Mechanisms: `a`, `mx`, `ip4:1.2.3.4`, `ip6:::1`, `include:_spf.google.com`,
  `redirect=...`, `exists:...`, `ptr` (deprecated).
- Qualifiers: `+` pass, `-` fail, `~` softfail, `?` neutral.
- Final mechanism is typically `-all` (reject all not listed) or
  `~all` (softfail).
- Evaluation: receiver looks up TXT, walks mechanisms in order
  against the **envelope sender** (5321.MAIL FROM) IP, returns a
  result: `pass`, `fail`, `softfail`, `neutral`, `temperror`,
  `permerror`, `none`.
- **The 10-DNS-lookup limit** (RFC 7208 §4.6.4) — `include`,
  `a`, `mx`, `redirect`, `exists`, `ptr` each cost a lookup;
  cumulative limit is 10. Exceeding → `permerror`.
- **`MAIL FROM`** is what's checked, NOT the `From:` header — this
  is why SPF alone fails to stop From: spoofing.
- Failure on forwarding: when an MTA forwards mail, the original
  envelope IP no longer matches — SRS (Sender Rewriting Scheme) is
  a workaround.

### How DKIM actually works

- Sender adds a `DKIM-Signature:` header with: `v=`, `a=` (algorithm,
  e.g., `rsa-sha256` or `ed25519-sha256`), `c=` (canonicalization,
  `simple/simple` or `relaxed/relaxed`), `d=` (signing domain),
  `s=` (selector, an arbitrary name), `h=` (signed header list),
  `bh=` (body hash, base64), `b=` (signature, base64).
- Public key published at TXT record
  `<selector>._domainkey.<domain>` with `v=DKIM1; k=rsa; p=<base64>`
  (or `k=ed25519`).
- Receiver: fetches public key via DNS, recomputes body hash,
  recomputes header hash, verifies signature. Result: `pass` or
  `fail`.
- **Canonicalization** matters: `relaxed` normalises whitespace
  and case in headers; `simple` is byte-exact. Most senders use
  `relaxed/relaxed`.
- **Selector rotation** — senders publish multiple selectors and
  rotate keys; old selectors retained until any in-flight signed
  mail has expired.
- **Body length** parameter `l=` is dangerous — allows appending.
  Modern best practice: omit.
- **Third-party signers** — a SaaS like SendGrid signs `d=sendgrid.net`,
  not your domain, which fails alignment. Solution: CNAME-published
  DKIM at `s1._domainkey.yourdomain → s1.sendgrid.net._domainkey...`.

### How DMARC actually works

- TXT record at `_dmarc.<domain>` with `v=DMARC1; p=...; rua=...`.
- Policy: `p=none` (monitor), `p=quarantine`, `p=reject`. `sp=`
  for subdomain policy (often missed). `pct=` for rollout
  percentage.
- **Alignment**: SPF and/or DKIM result must align to the **From:**
  header domain. Modes: `aspf=r` (relaxed, default — organisational
  domain match) or `aspf=s` (strict — exact match). Same for `adkim`.
- DMARC passes if **at least one** of SPF or DKIM passes AND
  aligns.
- **Reporting**: `rua=mailto:reports@example.com` for daily
  aggregate XML reports; `ruf=...` for forensic reports (rarely
  honoured because of privacy).
- **Organisational domain discovery** currently uses the **Public
  Suffix List**, which is fragile and DMARCbis is designing
  alternatives (`psd=` Public Suffix Domain mechanism).

Provide **two** diagrams in mermaid-compatible text:

1. Sequence diagram of receiver evaluation: receiver receives SMTP,
   does SPF lookup on `MAIL FROM` IP, computes DKIM verification,
   does DMARC lookup on `From:` org domain, checks alignment, applies
   policy.
2. DMARC reporting flow diagram: many sender domains → many receivers
   → daily aggregate XML reports → reporter SaaS (Valimail / DMARCian
   / Red Sift / EasyDMARC) → dashboard / forensics.

Plus a **table** showing for each of SPF/DKIM/DMARC: identifier
checked, where the record lives, what kind of record, what the
output result is.

## Deep connections to other protocols

Cover each related protocol listed in the topic. Pay particular
attention to:

- **SMTP** — the protocol being defended. Email-auth is a
  bolt-on retrofit, not a redesign. Talk about why a clean redesign
  has failed (Marshall Rose's work, the IM-vs-email tension, Matrix
  / XMPP / fediverse running into "the email problem" themselves).
- **DNS** — every record. CAA-style TXT records, the brittleness of
  TXT, the size and lookup-limit issues, DNSSEC's role.
- **IMAP** — recipient-side. Explain that DMARC results show up in
  the `Authentication-Results:` header set by the receiver MTA, and
  the MUA renders or filters based on it.
- **TLS / MTA-STS / DANE-SMTP / TLS-RPT** — the parallel transport
  authentication stack. Worth explaining MTA-STS depends on ACME
  for the policy-host cert.
- **ACME** — for MTA-STS policy hosts.
- **ARC** (RFC 8617) — the band-aid for forwarding. When a list
  server / forwarder breaks DKIM, ARC chains preserve the original
  authentication result.
- **BIMI / VMC** — brand-logo display tied to `p=quarantine` or
  `p=reject` enforcement plus a verified mark cert.
- **OAuth 2.0** — adjacent to "application sender" patterns
  (DKIM ATPS, etc.).
- The **"everyone has the email problem"** frame — XMPP, Matrix,
  Mastodon / ActivityPub, MIMI (the new IETF interoperable
  messaging effort) all confront the same trust-the-origin question
  that email-auth tries to solve retroactively.

## Real-world deployment

Major implementations:

- **Receivers** — Gmail (3B users, enforces all three since Feb
  2024), Yahoo Mail (~225M users), Microsoft 365 + Outlook.com,
  Apple iCloud Mail, Proton, Fastmail.
- **Sending platforms** — SendGrid (Twilio), Mailgun (Sinch),
  Postmark (Wildbit/ActiveCampaign), Amazon SES, Resend (the
  2023 newcomer that grew fast), Mailchimp.
- **Filtering / gateway** — Mimecast (Mimecast + Sentinel by Avast),
  Proofpoint, Barracuda, Microsoft Defender for Office 365, Google
  Workspace Advanced Protection.
- **DMARC SaaS** — Valimail, DMARCian, Red Sift OnDMARC,
  EasyDMARC, dmarc.global, Postmark DMARC Digest, MxToolbox.
- **Open-source verifiers** — OpenDKIM, OpenDMARC, OpenSPF /
  libspf2, mail-tester.com, learndmarc.com.

Real numbers: percent of Fortune 500 with DMARC `p=reject` (~50%
late 2025), percent of inbound mail at Gmail that's DKIM-signed
(>90%), the explosive growth of DMARC adoption Q4 2023 → Q2 2024
driven by Gmail/Yahoo enforcement.

## Failure modes and famous incidents

Tell each as setup → mistake → consequence → resolution:

- **DNC John Podesta phish (March 2016)** — gmail.com hosting,
  no DMARC enforcement at podesta@gmail. Spear phish disguised as
  Google alert was clicked, hillaryclinton.com domain spoofed in
  related campaigns, ultimately reshaping a US election.
- **FBI ic3.gov spoofed-email incident (November 13, 2021)** — an
  attacker exploited a vulnerable web app on a misconfigured FBI
  external email server (`eims.ic3.gov`) to send fake "urgent
  cybersecurity warning" emails from a legitimate FBI IP space
  that passed SPF and DKIM. Brian Krebs broke the story.
- **Mailsploit (December 2017)** — Sabri Haddouche showed
  encoded-word and null-byte tricks in From: headers that fooled
  ~33 mail clients into displaying spoofed sender names while
  DKIM still validated.
- **DKIM crypto research (2020)** — Zhang et al. (USENIX 2020) on
  weak-key and chosen-prefix collision risks; the perennial
  reminder to use ≥2048-bit RSA or Ed25519.
- **2024 Salesforce-tenant phishing wave** — SPF-passing tenants
  used to send phishing through legit infrastructure, exposing
  the "alignment-pass-but-malicious" gap.
- **Marriott / Bonvoy DMARC cleanup (2024)** — large enterprise
  that spent years moving p=none → p=reject across hundreds of
  third-party senders.
- **PayPal phishing (2010s)** — the original incubator for DMARC,
  with hundreds of thousands of fake PayPal emails per day in the
  pre-DMARC era.
- **BIMI fraud** — early VMC misuse cases where attackers
  registered "Apple Inc" variants to display Apple's logo on
  phishing campaigns; closed off by tighter VMC issuance vetting.

## Fun facts and anecdotes

- **Meng Wong** wrote the SPF draft initially solo at pobox.com.
  His decision to use TXT records (then a free-form catch-all) was
  later both praised (DNS deployability) and cursed (record-size
  and lookup-limit problems).
- The **2004 Microsoft Sender ID patent dispute** broke the IETF
  MARID WG and is a textbook case of "non-RAND patent terms killing
  a standard."
- **Hadmut Danisch** claimed publicly that SPF was actually his
  "Reverse MX" idea from 2003; the dispute went on for years on
  IETF mailing lists and Wikipedia talk pages.
- **DMARC's launch date of 30 January 2012** was coordinated as a
  joint press release among PayPal, Google, Yahoo, Microsoft, AOL,
  Comcast, Bank of America, Facebook, Fidelity, and LinkedIn — one
  of the rare moments in internet history where competitors
  publicly co-launched a security protocol.
- **Dave Crocker** (DKIM editor) is the same Dave Crocker who edited
  RFC 5322 (the email message format itself) and goes back to ARPA
  in the 1970s. His career arc spans the entire history of email.
- **BIMI's VMC requirement** has been called "the trillion-dollar
  logo problem" because the VMC industry is a profitable side-effect
  of DMARC enforcement.
- The DMARC aggregate XML report format is notoriously verbose; the
  *DMARCian* CEO Tim Draegen joked in a 2018 podcast that "we built
  a business on parsing other people's XML."

## Practical wisdom

What an engineer actually needs:

- **Start with p=none** to monitor, but **never live forever at
  p=none** — that's the most common DMARC failure mode.
- **Set `sp=reject`** on the organisational domain DMARC record, or
  attackers will simply spoof `*.yourdomain.com` subdomains.
- **The 10-DNS-lookup limit for SPF** is a frequent foot-gun. Use
  SPF "flattening" tools (Valimail, EasyDMARC) or `redirect=` to
  consolidate.
- **Use Ed25519 DKIM keys** where supported (Gmail, Microsoft 365
  support Ed25519). 2048-bit RSA is the safe floor.
- **Rotate DKIM selectors** every 6–12 months. Treat private keys
  as you would TLS private keys.
- **Forwarding breaks SPF and DKIM** — deploy **ARC** to preserve
  authentication results through mailing lists and forwarders.
- **Third-party senders** — keep an inventory; every SaaS that sends
  on your behalf needs SPF include + DKIM CNAME setup.
- **Aggregate reports (`rua=`)** are gold. Use a SaaS to parse
  them (Valimail, DMARCian, EasyDMARC) or roll your own with
  `parsedmarc` (open source).
- **Forensic reports (`ruf=`)** rarely deliver because of privacy
  concerns; don't depend on them.

Wireshark / capture filters (this is mostly DNS + SMTP + header
inspection in MUAs):

- `dns.qry.name contains "_dmarc"` — capture DMARC lookups
- `dns.qry.name contains "_domainkey"` — capture DKIM key lookups
- `dns.txt and dns.qry.name contains "spf"` — SPF record fetches
  (note: SPF records live at the bare zone, so this filter is
  approximate)
- In Gmail / Outlook: "Show original" to see
  `Authentication-Results:` and `DKIM-Signature:` headers
- `swaks` for crafting SMTP test messages

## Pioneers and key contributors

- **Meng Weng Wong** (?– ) — Founder of pobox.com, originator of
  SPF. Drafted the first SPF specs 2003–2004. Now active in
  AI/ML legal-tech.
- **Mark Delany** (?– ) — Yahoo engineer, original DomainKeys
  designer (2004). Wrote the first reference implementation.
- **Miles Libbey** — Yahoo, DomainKeys co-designer.
- **Jim Fenton** — Cisco, designer of Identified Internet Mail
  (IIM) which merged with DomainKeys into DKIM.
- **Eric Allman** (1955– ) — Author of Sendmail, deeply involved in
  DKIM standardisation at the IETF. Co-founded Sendmail Inc.
- **Dave Crocker** (1944– ) — IETF veteran, RFC 5322 author (email
  message format), DKIM editor (RFC 6376), one of the very few
  people whose protocol-design career spans 1972 → 2025+.
- **Tony Hansen** — AT&T, DKIM editor.
- **Murray Kucherawy** — Cloudflare (formerly Trusted Domain
  Project), DKIM editor RFC 6376, DMARC RFC 7489 author, current
  IETF DMARC WG chair as of 2025.
- **Vijaya Jain** — PayPal, principal architect of the framework
  that became DMARC.
- **Steve Jones** — Executive Director of dmarc.org and DMARC
  evangelist.
- **Tim Draegen** — co-founder of DMARCian, prolific DMARC
  educator.
- **Seth Blank** — Valimail CTO, IETF DMARC WG co-chair, DMARCbis
  editor.
- **John Levine** (1955– ) — author of *The Internet for Dummies*,
  long-time IETF anti-spam expert, ARC author.

## Learning resources (current as of 2026)

For each: URL, one-sentence description, level, year.

- **Specs** — RFC 7208 (SPF April 2014), RFC 6376 (DKIM September
  2011), RFC 7489 (DMARC March 2015), RFC 8617 (ARC May 2019),
  RFC 7960 (DMARC interop with forwarders September 2016), RFC
  8461 (MTA-STS September 2018), RFC 8460 (TLS-RPT September
  2018), draft-ietf-dmarc-dmarcbis (DMARC 2.0, latest draft as of
  2026), draft-ietf-dmarc-dkim2-keep-alive (DKIM2, latest), BIMI
  draft, VMC issuance policy at certificate.transparency.dev.
- **Books** — *DMARC: How to Stop Email Spoofing* (Marc Bradshaw,
  2024), *The Anti-Spam Toolkit* (Allman, McEnerney, et al.,
  older but classic).
- **Papers** — Hu, Holz "An End-to-End Large-Scale Measurement of
  DNS-over-Encryption" PAM 2020 (adjacent), Hu et al. "End-to-End
  Measurements of Email Spoofing Attacks" USENIX 2018, Foster et
  al. "Security by Any Other Name" IMC 2015.
- **Engineering blogs** — Gmail Postmaster blog, Microsoft Tech
  Community email-security posts, Postmark blog (DMARC Digest),
  Valimail blog, DMARCian blog, Cloudflare Email Routing posts.
- **YouTube** — M3AAWG conference talks, EmailKarma.net,
  *learndmarc.com* (DMARC Designer is an interactive
  visualisation), Mailosaur engineering channel.
- **Podcasts** — *Phishy Business* (Mimecast), *Email Geeks Show*,
  *Security Now* episodes on DMARC.
- **Tools** — MxToolbox, learndmarc.com (interactive simulator),
  dmarcian.com, mail-tester.com, dmarcadvisor.com,
  parsedmarc (open source).

## Where things are heading (2025–2026 frontier)

- **DMARCbis** — draft-ietf-dmarc-dmarcbis replacing RFC 7489.
  Drops PSL dependency for organisational-domain discovery in
  favour of an in-DNS mechanism (`psd=` PSD policy records).
  Tightens reporting, rationalises subdomain policy. Expected RFC
  status late 2026.
- **DKIM2** — early draft work on replay-attack resistance, the
  notorious weak point where a single valid DKIM-signed message
  can be replayed by attackers.
- **ARC adoption** — Google's been deploying ARC widely; other
  providers slower. ARC's the only practical answer to mailing-list
  + forwarder DKIM breakage.
- **BIMI + VMC maturation** — Gmail, Yahoo, Apple Mail all
  display BIMI logos for senders with `p=quarantine` or stronger
  + a Verified Mark Certificate. The VMC ecosystem
  (DigiCert, Entrust as issuers) is its own mini-industry.
- **AI-generated phishing** — 2024–2026 LLM-generated phishing has
  raised the bar on content-based spam filtering, making
  *authentication* (knowing who actually sent it) more important
  than ever.
- **MTA-STS + TLS-RPT** wider deployment — Gmail and Microsoft
  both publish MTA-STS policies now; smaller providers catching up.

## Hooks for the article, infographic, and podcast

- A 60-second narrated hook (FBI ic3.gov 2021 story works
  beautifully — "the FBI sent fake emails warning of a hacker
  attack, and the emails were technically real")
- A striking statistic — "On 1 February 2024, Gmail and Yahoo
  required every bulk sender on Earth to publish SPF, DKIM, and
  DMARC, or be silently quarantined into oblivion"
- A "pause and think" moment — the `From:` header in every email
  you've ever received was not authenticated until 2014, and
  millions of organisations still don't enforce DMARC ten years
  later
- A failure-story arc (FBI ic3.gov 2021 or DNC 2016 work best)

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

Note: this is a **bundled** record. Either propose a single combined
`email-auth` record OR three sibling records (`spf`, `dkim`, `dmarc`)
that link tightly. Recommend the single combined record with
sub-entries — the encyclopedia's `bundling` pattern (used for
STUN/TURN/ICE) fits.

```
id: email-auth
name: Email Authentication (SPF, DKIM, DMARC)
abbreviation: EMAIL-AUTH
categoryId: utilities-security
port: none (DNS TXT + SMTP)
year: 2006 (SPF), 2007 (DKIM), 2015 (DMARC)
rfc: RFC 7208 + RFC 6376 + RFC 7489
standardsBody: ietf
oneLiner: <single sentence — elevator pitch>
overview: <2–3 paragraphs covering all three>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency: "few DNS lookups per inbound message", throughput: "n/a — message-level", overhead: "SPF/DKIM/DMARC TXT records + DKIM signature ~512 bytes" }
connections: [smtp, imap, dns, tls, acme]
links: { wikipedia: "https://en.wikipedia.org/wiki/Email_authentication", spec: "https://datatracker.ietf.org/wg/dmarc/about/", official: "https://dmarc.org" }
image: <Wikimedia URL — SPF/DKIM/DMARC diagram>
```

### A.2 Header / wire-format layout

Provide **four** layouts:

- **SPF TXT record** — `v=spf1 <mechanisms> <qualifier>all` with
  full mechanism table (a, mx, ip4, ip6, include, redirect,
  exists, ptr-deprecated) and qualifier table (+ - ~ ?).
- **DKIM-Signature header field** — every tag with description
  (v, a, c, d, s, t, x, h, bh, b, l, q, i).
- **DKIM public-key TXT record** — `v=DKIM1; k=rsa; p=<base64>`
  with optional `t=` `s=` `n=`.
- **DMARC TXT record** — `v=DMARC1; p=...; sp=...; pct=...;
  rua=...; ruf=...; adkim=...; aspf=...; fo=...; rf=...; ri=...`.

### A.3 State machine

MTA receiver evaluation state machine in mermaid `stateDiagram-v2`:
ReceivedMsg → SPF check → DKIM check (per signature) → DMARC
lookup → Alignment evaluation → Policy decision (Accept / Quarantine
/ Reject).

### A.4 Code example

- `python` — using `aiosmtpd` + `authheaders` or `dkimpy` +
  `pyspf` to evaluate inbound mail
- `javascript` — Node.js using `mailauth` (Andris Reinman /
  Nodemailer) to do combined SPF/DKIM/DMARC eval
- `cli` — `dig +short txt _dmarc.example.com`, `opendkim-testkey`,
  `swaks`, `pyspf-check`
- `wire` — sectioned dump: SMTP MAIL FROM, RCPT TO, DATA with
  DKIM-Signature header, DNS TXT queries for SPF/DKIM/DMARC,
  resulting Authentication-Results header

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries: Gmail+Yahoo bulk-sender mandate (1 February
2024), Microsoft 365 matching mandate (May 2025), DMARCbis draft
progression milestones, DKIM2 first draft (2024), Apple Mail BIMI
display rollout (iOS 16+ progressively expanded 2024–2025), Marriott
Bonvoy DMARC cleanup case study, 2024 Salesforce-tenant phishing
wave, AI-phishing measurement papers.

### A.6 Real-world deployments

≥5 named: Gmail (3B users), Microsoft 365 + Outlook.com, Apple
iCloud Mail, SendGrid + Mailgun + Postmark + SES (every
transactional mailer), Mimecast + Proofpoint (filtering),
Valimail + DMARCian + Red Sift + EasyDMARC (DMARC SaaS), Fortune
500 DMARC adoption stats.

### A.7 Fun facts ≥3

### A.8 Practical wisdom (sysctls/pitfalls/tools)

For email-auth, "sysctls" map to record-level config: SPF
10-lookup limit, DKIM key length (1024 deprecated, 2048 standard,
Ed25519 supported by major receivers), DMARC `pct=` rollout,
selector rotation cadence.

### A.9 Wireshark hints ≥3

Mostly DNS-side: `dns.qry.name contains "_dmarc"`,
`dns.qry.name contains "_domainkey"`, `dns.txt`, plus SMTP
`smtp.req.command == "MAIL"` and Authentication-Results header
inspection in MUAs.

### A.10 Learn-more lists

### A.11 Pioneer candidates ≥3

Including Meng Wong (SPF), Mark Delany or Dave Crocker (DKIM),
Vijaya Jain or Murray Kucherawy or Seth Blank (DMARC) with full
bios.

### A.12 Spec records ≥3

RFC 7208 (SPF), RFC 6376 (DKIM), RFC 7489 (DMARC), RFC 8617
(ARC), RFC 7960 (DMARC interop), RFC 8461 (MTA-STS), RFC 8460
(TLS-RPT). Plus draft-ietf-dmarc-dmarcbis (DMARC 2.0).

### A.13 New glossary concepts

≥12 — envelope sender / MAIL FROM, header From / 5322.From,
organisational domain, alignment (strict / relaxed), SPF
mechanism, DKIM selector, canonicalization, body hash, ARC,
AAR / AMS / AS, BIMI, VMC, MTA-STS, DANE-SMTP, TLS-RPT, rua,
ruf, PSL.

### A.14 Frontier entry

Two strong candidates: **DMARCbis** (replacing PSL), and the
**2024 Gmail+Yahoo enforcement** as a paradigm shift entry.
Provide metrics — DMARC adoption pre/post Feb 2024.

### A.15 Journey suggestion

"How an email gets the green checkmark" — a 5–6 step journey
covering sender DKIM-signing → DNS publication of SPF/DKIM/DMARC
→ SMTP delivery → receiver SPF check → receiver DKIM check →
DMARC alignment + policy → MUA rendering.

### A.16 Comparison pair

"SPF vs DKIM vs DMARC (what each one actually checks)" — strongly
recommended as a single visual comparison card. Also "DMARC vs
ARC" for the forwarding story.

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "The original sin of SMTP" — why the From: header
  was never authenticated
- Timeline: 2003 (Meng Wong) → 2004 (DomainKeys + Sender ID war)
  → 2007 (DKIM RFC 4871) → 2012 (DMARC public launch) → 2015 (RFC
  7489) → 2024 (Gmail+Yahoo enforcement)
- Callout: "The 30 January 2012 joint press release" — the
  competing-companies-co-launching moment
- Pioneers section: Meng Wong + Dave Crocker + Murray Kucherawy
  mini-bios
- Diagram: combined SPF + DKIM + DMARC evaluation at receiver
- Image: Wikimedia of SMTP server diagram or DMARC report
  visualisation

### A.18 Famous-incident references + new outage proposals

Strong candidates for new outage records:
- FBI ic3.gov spoofed-email incident (13 November 2021) —
  configuration / human-error
- DNC John Podesta phishing (March 2016) — human-error /
  protocol-design (DMARC absence)
- Marriott / Bonvoy DMARC cleanup (2024) — configuration
- 2024 Salesforce-tenant phishing wave — software-bug

### A.19 Embedded media

Highest-signal: learndmarc.com interactive simulator, M3AAWG
"Email Authentication in Depth" talks, Postmark's DMARC video
explainer, dmarcian's "DMARC Designer" interactive tool.

### A.20 Prerequisites

```
concepts: [dns, dns-txt, smtp, public-key-crypto, base64, hash]
protocols: [smtp, imap, dns, tls]
```

### A.21 Name highlight

```
"[S]PF, [D]KIM, [D]MARC"  (the bundle)
```
With sub-name highlights as needed:
- `"[S]ender [P]olicy [F]ramework"` (SPF)
- `"[D]omain[K]eys [I]dentified [M]ail"` (DKIM)
- `"[D]omain-based [M]essage [A]uthentication, [R]eporting & [C]onformance"` (DMARC)

### A.22 Diagram-definitions entry

Annotated sequence diagram for combined SPF + DKIM + DMARC receiver
evaluation, end-to-end. 10–14 step annotations; show DNS lookups,
signature verification, alignment evaluation, policy decision,
final Authentication-Results header.

### A.23 Category placement

Fits in **`utilities-security`** alongside SMTP, IMAP, TLS, DNS,
ACME — no new category needed.

---

# Appendix B — Simulator step list

Author **one** simulation — combined SPF + DKIM + DMARC evaluation at
the receiving MTA, end-to-end.

```
title: "Email Authentication: SPF + DKIM + DMARC Receiver Evaluation"
description: "Watch a receiving MTA validate an inbound message via SPF, DKIM, and DMARC alignment."
actors:
  - { id: "sender", label: "Sending MTA (mail.example.com)", icon: "send", position: "left" }
  - { id: "receiver", label: "Receiving MTA (gmail-smtp-in)", icon: "inbox", position: "center" }
  - { id: "dns", label: "DNS (resolvers)", icon: "globe", position: "right" }
userInputs:
  - { id: "fromHeader", label: "From: header domain", type: "text", defaultValue: "alice@example.com" }
  - { id: "envelopeFrom", label: "MAIL FROM", type: "text", defaultValue: "bounce@mail.example.com" }
  - { id: "dmarcPolicy", label: "DMARC policy", type: "select", options: ["none", "quarantine", "reject"], defaultValue: "reject" }
steps:
  - id: smtp-mailfrom
    label: "SMTP MAIL FROM"
    description: "Sender opens SMTP session, gives envelope return-path."
    fromActor: sender
    toActor: receiver
    duration: 800
    highlight: [MAIL FROM, sender-ip]
    layers:
      - SMTP: { command: "MAIL FROM:<bounce@mail.example.com>" }
      - TCP: { dport: 25 }
  - id: spf-lookup
    label: "SPF TXT lookup"
    description: "Receiver queries DNS for example.com's SPF record."
    fromActor: receiver
    toActor: dns
    duration: 700
    highlight: [TXT, v=spf1]
    layers:
      - DNS: { qtype: "TXT", qname: "mail.example.com" }
  - id: spf-eval
    label: "SPF evaluation"
    description: "Receiver walks mechanisms vs sender IP — pass / fail / softfail."
    fromActor: receiver
    toActor: receiver
    duration: 600
    highlight: [ip4, include, all, result: pass]
  - id: data-and-dkim
    label: "DATA + DKIM-Signature header"
    description: "Sender sends the message with DKIM-Signature header containing s=, d=, h=, bh=, b=."
    fromActor: sender
    toActor: receiver
    duration: 1100
    highlight: [DKIM-Signature, d=example.com, s=mail2024, bh=, b=]
    layers:
      - SMTP: { command: "DATA" }
      - RFC5322: { headers: "From, Subject, DKIM-Signature, ..." }
  - id: dkim-key-lookup
    label: "DKIM public-key lookup"
    description: "Receiver queries mail2024._domainkey.example.com for public key."
    fromActor: receiver
    toActor: dns
    duration: 700
    highlight: [TXT, v=DKIM1, k=, p=]
    layers:
      - DNS: { qtype: "TXT", qname: "mail2024._domainkey.example.com" }
  - id: dkim-verify
    label: "DKIM signature verification"
    description: "Receiver recomputes body hash + header hash, verifies signature → pass."
    fromActor: receiver
    toActor: receiver
    duration: 900
    highlight: [body-hash, signature, result: pass]
  - id: dmarc-lookup
    label: "DMARC policy lookup"
    description: "Receiver queries _dmarc.example.com for policy."
    fromActor: receiver
    toActor: dns
    duration: 700
    highlight: [TXT, v=DMARC1, p=reject, rua=]
    layers:
      - DNS: { qtype: "TXT", qname: "_dmarc.example.com" }
  - id: alignment
    label: "Alignment evaluation"
    description: "Receiver checks SPF/DKIM identifiers align with From: header organisational domain."
    fromActor: receiver
    toActor: receiver
    duration: 900
    highlight: [aspf, adkim, From: domain, aligned: true]
  - id: policy-apply
    label: "Apply DMARC policy"
    description: "All checks pass + aligned → accept and deliver."
    fromActor: receiver
    toActor: receiver
    duration: 700
    highlight: [policy: pass, action: deliver]
  - id: ar-header
    label: "Authentication-Results header set"
    description: "Receiver stamps message with Authentication-Results: spf=pass; dkim=pass; dmarc=pass for downstream MUA rendering."
    fromActor: receiver
    toActor: receiver
    duration: 600
    highlight: [Authentication-Results, spf=pass, dkim=pass, dmarc=pass]
```

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
