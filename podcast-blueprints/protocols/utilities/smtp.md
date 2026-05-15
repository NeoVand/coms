---
id: smtp
type: protocol
name: Simple Mail Transfer Protocol
abbreviation: SMTP
etymology: "[S]imple [M]ail [T]ransfer [P]rotocol"
category: utilities-security
year: 1982
rfc: RFC 5321
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - foundations/ports-sockets
  - foundations/client-server-p2p
  - foundations/ai-protocols
  - story-of-the-internet/osi-vs-tcp-ip
  - story-of-the-internet/the-ai-agent-layer
  - utilities-security/email-stack
related_protocols: [tcp, tls, dns, imap]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Email.svg/500px-Email.svg.png
    caption: How email flows across the internet — the sender's mail client submits to an SMTP server, which looks up the recipient's domain via DNS MX records and relays the message hop by hop until it reaches the destination mailbox.
    credit: Image — Wikimedia Commons / CC BY-SA 3.0
visual_cues:
  - "An annotated EHLO transcript on a black terminal — green client lines, white server lines — with the 250-STARTTLS, 250-AUTH, 250-PIPELINING, 250-SMTPUTF8, 250-CHUNKING capability list called out and labelled 'this is what an extension framework looks like.'"
  - "A three-port diagram showing port 25 (MTA-to-MTA relay), port 587 (submission with STARTTLS), and port 465 (submissions with implicit TLS), with arrows from a phone to its provider for 587/465 and from the provider to the recipient's MX for 25. A red 'STRIPPABLE' tag hangs off the STARTTLS arrow."
  - "A schematic of SMTP smuggling: outbound server sees one message ending at the dot-CRLF, inbound server sees two messages because it accepted bare-LF-dot-CRLF, the second one forged from admin@microsoft.com — with both sides annotated 'passes SPF, DKIM, DMARC.'"
  - "A worldmap-scale stat card: 376 billion emails per day in 2025, ~424 billion projected for 2026, roughly 2 million SMTP transactions per second worldwide, only 2.5% of 73.3M scanned domains at DMARC p=reject."
  - "The four authentication overlays as nested boxes around a plain SMTP envelope: SPF on the outside (which IPs may send), DKIM (cryptographic signature in DNS), DMARC (alignment policy + reports), ARC (chain-of-custody for forwarders) — each with its RFC number and year."
---

# SMTP — Simple Mail Transfer Protocol

## In one breath

SMTP is the protocol that has moved every email you have ever sent. It is a text-based, line-oriented, store-and-forward protocol over TCP, born in August 1982 with Jon Postel's RFC 821 and last refreshed by John Klensin's RFC 5321 in October 2008. Today it carries roughly 376 billion messages a day — about two million transactions every second — between mail user agents, submission servers, relay MTAs, and final-delivery agents. The protocol itself has not been meaningfully redesigned since the year the IBM PC came out; everything modern about email — TLS, authentication, anti-spam, anti-phishing — is bolted on around it.

## The pitch (cold-open)

Every minute, four million emails leave for somewhere. Most of them ride a protocol Jon Postel froze in August 1982, in a document so short you can read it in an afternoon. SMTP is older than the World Wide Web. It is older than DNS as we know it. It was designed for fifty universities that knew each other by name, and it now carries 376 billion messages a day across a planet that does not. And in late 2023 a researcher in Vienna noticed that a single character — a line ending nobody had thought about — could make millions of mail servers disagree about where a message ends, letting an attacker forge mail from microsoft.com that passed every modern check.

## How it actually works

SMTP is a stateful, line-oriented, request/response protocol over a single TCP connection. Lines end in CRLF. Commands are four-letter verbs. Replies are three-digit status codes plus optional text, with a hyphen between code and text on multiline replies. The vocabulary is small enough to drive by hand — which is why SMTP is one of the most debuggable protocols on the internet.

A session starts with a TCP three-way handshake, then a 220 banner from the server. The client sends EHLO with its hostname, and the server replies with a 250 multiline list of supported extensions: STARTTLS, AUTH, SIZE, 8BITMIME, PIPELINING, CHUNKING, SMTPUTF8, DSN, ENHANCEDSTATUSCODES. The client then issues STARTTLS, runs a TLS handshake, EHLOs again over the encrypted channel, and authenticates with AUTH PLAIN, AUTH LOGIN, or AUTH XOAUTH2. From there, the actual mail transaction is three commands: MAIL FROM sets the envelope sender (the bounce address), RCPT TO adds one or more recipients, and DATA opens the message body. The body is terminated by a line containing only a single dot. The server replies 250 with a queue ID, and the client sends QUIT to close.

Once the receiving server has the message, it does not deliver yet. It enqueues. A queue runner — Postfix calls this `qmgr`; sendmail just retries from the spool — looks up MX records in DNS for the recipient's domain, sorts by preference, opens TCP to the highest-priority host on port 25, and replays the same EHLO / MAIL FROM / RCPT TO / DATA dialog. Each hop accepts responsibility for the message, then forwards it. That is what "store and forward" means: every server along the path takes the message into its own queue before letting the previous server release it. Failures get a Delivery Status Notification — a bounce — sent back to the envelope sender per RFC 3461. The final hop is usually LMTP from the edge MTA to a Dovecot or Cyrus MDA over a Unix socket, which writes the message into the user's mailbox.

A clarification on ports, because everyone gets this wrong. Port 25 is the canonical MTA-to-MTA relay port from RFC 821. Port 587 is the Submission port from RFC 6409 — authenticated client traffic that starts in cleartext and upgrades via STARTTLS. Port 465 is the Submissions port for implicit TLS, formally restored to that role by RFC 8314 in January 2018. RFC 8314 also declared cleartext submission obsolete. So MTA-to-MTA uses 25; MUA-to-MSA uses 587 with STARTTLS or 465 with implicit TLS; 465 is preferred for new client integrations because STARTTLS is strippable by an active attacker who can downgrade the connection. Most consumer ISPs have blocked outbound port 25 since the 2000s to limit botnet spam.

### Header at a glance

SMTP does not really have a binary header. It has commands and replies. The commands you need to know:

- `EHLO domain` — identify the client and ask for the extension list. (HELO is the pre-ESMTP form; EHLO replaced it in RFC 1425.)
- `MAIL FROM:<addr> [params]` — start a transaction; sets the envelope sender, which is also the bounce return-path. Note: the envelope sender is not the From: header in the message body, and they often differ.
- `RCPT TO:<addr> [params]` — add one envelope recipient; repeat for more.
- `DATA` — server replies 354 "End data with CR LF dot CR LF"; client sends headers, blank line, body, then a single dot on its own line. The server replies 250 with a queue ID.
- `RSET` — reset the transaction without dropping the connection.
- `STARTTLS` — upgrade to TLS (RFC 3207). Server resets state after the handshake; client must EHLO again.
- `AUTH mechanism` — SASL authentication (RFC 4954). Mechanisms include PLAIN, LOGIN (deprecated), CRAM-MD5, SCRAM, and XOAUTH2 — Google and Microsoft's OAuth-bearer mechanism.
- `VRFY user` / `EXPN list` — verify a user / expand a list. Almost universally disabled because they leak account information.
- `BDAT n [LAST]` — binary chunk transfer with explicit byte counts; part of the CHUNKING extension that closes the dot-stuffing class of bugs.
- `QUIT` — close gracefully.

Reply codes follow a three-digit pattern. 2yz is success. 3yz is intermediate ("send more data"). 4yz is transient — try again later. 5yz is permanent — do not retry. The most useful codes to recognise: 220 service ready, 221 closing, 235 auth ok, 250 OK, 354 start mail input, 421 service shutting down, 451 local error, 535 auth credentials invalid, 550 mailbox unavailable, 552 storage exceeded. Two recent additions you will see in the wild: 550 5.7.26 is Gmail's "DMARC required for bulk senders," and 550 5.7.515 is Outlook's bulk-sender authentication failure.

### State machine in three sentences

A session has the states Connection, Greeting, Identified (after EHLO), optionally Authenticated (after AUTH), Mail (after MAIL FROM), Rcpt (after at least one RCPT TO), Data, End-of-data, and Quit. RSET drops back to Identified without losing TLS or auth context, and STARTTLS resets back to Greeting after the handshake completes. The dot-on-its-own-line terminator drives the Data → End-of-data transition; dot-stuffing — a leading dot in the body is doubled to two dots on the wire and unstuffed on receipt — keeps body content from prematurely terminating the message, and mishandling of CR, LF, and the dot terminator is the entire SMTP smuggling bug class.

### Reliability, security, and the bolt-on stack

SMTP itself does almost nothing for security. It assumes a small, trusted set of universities. So the real security model lives in four layered overlays that all sit on top of the same EHLO conversation.

**TLS** runs in three modes. STARTTLS over port 25 is opportunistic MTA-to-MTA encryption — better than nothing, but downgradeable. STARTTLS over 587 is client submission. Implicit TLS over 465 is client submission with no downgrade window, mandated as the preferred form by RFC 8314. TLS 1.0 and 1.1 are obsolete per RFC 8996. STARTTLS itself has a long, ugly history of stripping attacks and command-injection bugs — the Poddebniak et al. paper at USENIX Security 2021, "Why TLS is Better Without STARTTLS," is what pushed the IETF toward implicit TLS for new deployments.

**SPF** (Sender Policy Framework, RFC 7208) is a TXT record at your domain that lists the IPs allowed to send mail with your domain in the envelope MAIL FROM. Receivers verify the connecting IP and produce pass, fail, softfail, or neutral. SPF breaks on plain forwarding because the envelope sender is preserved while the IP changes.

**DKIM** (DomainKeys Identified Mail, RFC 6376) signs selected headers and a body hash with a private key; receivers fetch the public key from `selector._domainkey.domain` TXT and verify. DKIM survives forwarding, but it is vulnerable to replay attacks — the same legitimately signed message blasted to millions of unrelated recipients. That is the entire reason DKIM2 is being designed.

**DMARC** (RFC 7489) ties SPF and DKIM together by requiring that one of them produce an aligned pass relative to the visible From: header, and lets the domain owner publish a policy — `p=none`, `p=quarantine`, or `p=reject` — plus aggregate (`rua`) and forensic (`ruf`) reporting addresses. DMARCbis (draft -41, April 2025) replaces the brittle Public Suffix List with a DNS Tree Walk and adds `np` for non-existent-subdomain policy.

Above those sit ARC (RFC 8617) for forwarding chains, MTA-STS (RFC 8461) for HTTPS-published TLS policy, DANE (RFC 7672) for DNSSEC-pinned TLS certs, TLS-RPT (RFC 8460) for TLS-failure reports, and BIMI for displayable brand logos. None of them are SMTP. All of them are SMTP's only defence against a 1982 trust model.

## Where it shows up in production

**The MTA implementations.** **Sendmail**, written by Eric Allman at UC Berkeley in 1981–1983, shipped with 4.1cBSD and was once 80% of public mail servers in 1996; recent surveys put it under 4%. It is now a Proofpoint product since the 2013 acquisition. **Postfix**, written by Wietse Venema at IBM T.J. Watson and released in December 1998, is the default MTA on most Linux distributions; its multi-process, privilege-separated design and clean `main.cf`/`master.cf` configuration are why it took over. **Exim**, written by Philip Hazel at the University of Cambridge in 1995, is the world's most-deployed MTA largely because it is the default on Debian and inside cPanel/Plesk hosting stacks — survey data places it above 50% of public MX banners. **qmail** (Daniel J. Bernstein, 1995–1998) is famous for the $500 — later $1000 — security bounty that has essentially never paid out. **OpenSMTPD** is the OpenBSD privilege-separated mailer; its current release is 7.8.0p1 from March 2026, shipping with OpenBSD errata 005 fixing CVE-2025-62875. **Microsoft Exchange / Exchange Online** is the largest single email cluster on the planet by paying-customer count.

**Cloud and API senders.** Amazon SES has been around since 2011. Mailgun, Twilio SendGrid, and Postmark each handle massive volumes; SendGrid and Mailgun lead on absolute volume, Postmark publicly publishes time-to-inbox statistics and focuses on transactional. Resend (since 2022) is the developer-experience-focused entrant. Each exposes both an HTTPS API and SMTP submission. The receiver-side providers everyone has to please: Google Workspace and Gmail, Microsoft 365, Fastmail, Yahoo, Proton, Tutanota, iCloud, Migadu, Zoho.

**Deployment topologies.** Outbound mail typically leaves an application server via SMTP to a hardened "smarthost" — a Postfix or Exim instance with TLS, DKIM signing, queueing, and monitoring — which then resolves MX and delivers. Inbound mail terminates at one or more edge MTAs that run SPF, DMARC, anti-spam, and anti-virus, then LMTP-hand the survivors to the mailbox cluster. Bulk senders fan out across pools of outbound MTAs on many IPs, each "warmed up" with a particular receiver to maintain reputation.

**Performance.** A single ~2003-era Dell 1850 with a battery-backed RAID controller and two SCSI disks delivered ~300 messages per second of real-user mail under Postfix — Wietse Venema's published number from the postfix-users list. On 2012-era commodity hardware, an operator reported 65 messages per second untuned on a single SATA disk, while watching 1080p video. Wietse himself has described Postfix saturating "rates approaching ten million messages an hour" with enough disk and network bandwidth — about 2,800 per second — when peer agreements are pre-arranged. Vendor PowerMTA-style claims of one million messages per hour, around 278 per second, are easily met or beaten by Postfix when the receiving side is cooperative. The bottleneck is almost never your MTA. It is the receiver's per-IP rate limits and reputation systems. Postfix's default `smtpd_recipient_limit` is 1000 and `default_destination_concurrency_limit` is 20.

**Volume.** The Radicati Group, via Statista, estimates 376 billion emails per day in 2025, projected to 424 billion in 2026. Roughly 45% is spam.

## Things that go wrong

**The Morris Worm, November 2, 1988.** Robert Tappan Morris's worm infected about 6,000 of the roughly 60,000 hosts then on the internet, in part by abusing sendmail's DEBUG mode — a leftover developer feature that let a remote SMTP client pipe data through a shell during DATA. The other vectors were a fingerd buffer overflow, weak passwords, and trust in `.rhosts`. The incident triggered the formation of CERT/CC and the first conviction under the US Computer Fraud and Abuse Act. The chapter on the early-internet outages in our book covers the night the academic internet found out it had no immune system.

**Exim — *The Return of the WIZard*, June 2019.** Qualys disclosed CVE-2019-10149, an RCE in Exim 4.87 through 4.91 reachable via a malformed RCPT TO. Locally instant; remotely it required keeping a connection open for about seven days in the default config, but it was trivially weaponised against custom configurations and exploited at scale in the wild. The name nods to sendmail's ancient WIZ and DEBUG bugs — the same class of mistake, repeated thirty years later.

**Exim ZDI cluster, September–October 2023.** ZDI publicly disclosed six bugs (CVE-2023-42114 through 42119) after a fifteen-month communication breakdown with the Exim team. CVE-2023-42115, with a CVSS of 9.8, was an unauthenticated out-of-bounds write in the SMTP service when EXTERNAL auth was enabled. About 3.5 million Exim servers were exposed at disclosure time. Exim 4.96.1 and 4.97 patched the three most critical issues on October 2, 2023.

**Microsoft Exchange — ProxyLogon, March 2021.** CVE-2021-26855 (an SSRF) chained with CVE-2021-27065 (post-auth arbitrary file write) gave unauthenticated RCE on internet-facing Exchange Server. The HAFNIUM cluster, plus dozens of follow-on actors, compromised tens of thousands of organisations. Discovered by Orange Tsai of DEVCORE. The successor ProxyShell (CVE-2021-34473/34523/31207) extended the carnage in August 2021.

**OpenSMTPD CVE-2020-7247 and CVE-2020-8794.** Two Qualys-reported RCEs in OpenSMTPD's `smtp_mailaddr()` and client-side code that ran arbitrary shell commands as root in the default OpenBSD configuration. Both received same-week patches. Same shape as Morris — a string-parsing oversight and a shell at the other end of it.

**SMTP smuggling, December 2023.** Timo Longin at SEC Consult in Vienna noticed that RFC 5321 says a message ends with CR LF dot CR LF, and that no two mail servers agreed on what to do with the slightly-wrong variants like LF dot CR LF. Decades of "be liberal in what you accept" had produced an ecosystem where Postfix, Sendmail, Exim, Microsoft Exchange Online, Cisco Secure Email Gateway, and GMX each made small, individually defensible choices — and together those choices interlocked into a contradiction. An outbound server saw one message; an inbound server saw two. Longin demonstrated forging mail "from admin@microsoft.com" into Fortune 500 inboxes that passed SPF, DKIM, and DMARC, because the smuggled second message inherited the trust of the legitimate first one. CVE-2023-51764 (Postfix), CVE-2023-51765 (Sendmail), and CVE-2023-51766 (Exim) followed. Postfix shipped `smtpd_forbid_bare_newline=normalize` and `smtpd_data_restrictions=reject_unauth_pipelining` mitigations across 3.5.23, 3.6.13, 3.7.9, 3.8.4, and 3.9. PortSwigger named it the #3 web hacking technique of 2023 — a non-web bug, on a podium otherwise full of HTTP stack tricks. The lesson: forty-one years after Postel chose CR LF dot CR LF, the most consequential email vulnerability of the year was a disagreement about a single byte. The chapter on the email stack treats this story at length.

**The qmail bounty, ongoing.** DJB has paid no bounty for Georgi Guninski's 2005 64-bit integer issue or for Qualys's 2020 follow-up, arguing both required configurations or memory limits unrealistic for normal use. In 2026 Calif.io reported finding a remote command-execution hole in a popular modern qmail fork, sagredo, using an LLM-assisted audit — in a community patch that was not part of DJB's original 1.03 codebase. The bounty stands.

**Spam, 1994 onward.** April 12, 1994 — Canter & Siegel, two Phoenix immigration lawyers, used a Perl script to post commercial mail to about 5,500 Usenet groups. Their ISP's mail servers crashed for two days. They claimed $100k–$200k in revenue and wrote a book about it. The first cancelbot followed weeks later. The 2003 Sobig worm and the 2003–2005 Sober worms turned millions of consumer PCs into spam relays and produced the eventual port-25 outbound block at most consumer ISPs.

**Open relays, until the late 1990s.** Most MTAs accepted and forwarded mail from anyone to anyone. The MAPS and ORBL blocklists, plus tightened defaults in sendmail 8.9 (1998) and Postfix from inception, ended that. Receivers now reject open relays at the SMTP banner.

**Mailing-list breakage from DMARC, April 2014.** Yahoo's flip to `p=reject` broke every mailing list that did not rewrite the From: header. The IETF's own lists were among the casualties. The fix was From-munging or, eventually, ARC.

**Recent outages.** Gmail and Outlook have each had multi-hour SMTP-acceptance outages since 2024, generally rooted in authentication backends rather than SMTP itself. The November 2025 Gmail enforcement step from soft-fail to hard-reject produced a spike of permanent bounces for senders who had been ignoring 4xx DMARC warnings for nearly two years.

## Common pitfalls (for the practitioner)

- **Open submission on port 25 of an internal MTA.** Assume it will be probed within hours of going live.
- **VRFY and EXPN left enabled.** They leak account information. Disable.
- **TLS configurations that still allow TLS 1.0 / 1.1.** RFC 8996 deprecated them. Turn them off.
- **Postfix's `smtpd_recipient_limit=1000` defaults.** Fine for relay; not what you want if a single transaction with 1,000 RCPT TOs is itself the threat.
- **SPF that accepts `+all`.** Catastrophic. Anything broader than `~all` should require justification.
- **A DMARC `p=none` you set "for now" three years ago.** That is not protection. It is reporting. Move to quarantine, then reject, on a schedule.
- **STARTTLS without `smtp_tls_security_level=encrypt` for known-good destinations** or MTA-STS / DANE enforcement — you are accepting opportunistic encryption and pretending it is real encryption.
- **DKIM signing only on the apex** when mail actually leaves from `mailer.example.com` — the `d=` mismatch breaks alignment and DMARC fails silently.
- **DMARC `p=reject` with `pct=100` enabled the day a marketing platform launches.** Break-glass without aggregate-report review first. You will reject your own mail.
- **MX pointing at a host that does not have a matching forward-confirmed reverse DNS.** Google rejects it.
- **TLS certificate hostname mismatch on an MX** — `mx.example.com` cert presented for `example.com`.
- **Too many DNS lookups in SPF (>10)** causes `permerror`. The 60% SPF-error rate among US `.gov` domains, despite the BOD 18-01 mandate, is the canonical cautionary tale.
- **Running an internal mail server with public DNS pointers but no inbound DMARC policy on the parent domain.** Free spoofing-as-a-service.

## Debugging it

The single most useful tool is **swaks**, John Jetmore's "Swiss Army Knife for SMTP." A typical session:

```
swaks --to test@example.com --server mx.example.com:25 \
      --tls --auth PLAIN --auth-user u --auth-password p \
      --h-Subject "test"
```

For TLS inspection on the wire:

```
openssl s_client -starttls smtp -connect mx.example.com:25 -crlf
openssl s_client -connect smtp.example.com:465 -crlf
```

Both let you drive the SMTP conversation by hand and inspect the certificate chain.

DNS first:

```
dig +short MX example.com
```

Then Postfix queue inspection: `postqueue -p` shows the active and deferred queues, `postcat -q <id>` prints a queued message with its envelope, and `postsuper -d <id>` deletes one. Watch `mailq` depth and alert on >10k or sustained growth. On the client side, `msmtp -d --debug` is the equivalent.

Third-party diagnostics worth knowing: MXToolbox for MX, blocklist, and SPF lookups; Mail-Tester for deliverability scoring; Hardenize and internet.nl for TLS / DMARC / DNSSEC / MTA-STS audits; learndmarc.com as a visualiser; Postmark's free DMARC monitor; Hurricane Electric's BGP toolkit for IP reputation context. For DMARC failures, enable `ruf` reporting against a domain you control and correlate against your sending platforms.

What to monitor in production: queue depth per destination, the 4xx vs 5xx breakdown by recipient domain, DMARC aggregate (RUA) reports parsed into a database, TLS-RPT failure reports if you publish MTA-STS, blocklist status across Spamhaus ZEN / Barracuda / SORBS, the major postmaster portals (Google Postmaster Tools, Microsoft SNDS, Yahoo Sender Hub), spam-complaint rate (Gmail and Yahoo enforce <0.30%, target <0.10%), per-IP reputation in Google Postmaster Tools after any IP rotation, and DKIM key age — rotate every 6–12 months and retire 1024-bit keys.

## What's changing in 2026

**November 2025 — Gmail flipped DMARC enforcement to hard reject.** What had been 4xx soft errors since February 2024 became 5xx permanent rejections. Senders who had been ignoring those soft errors for nearly two years saw a spike of permanent bounces overnight.

**May 5, 2025 — Microsoft Outlook / Hotmail enforced bulk-sender requirements** with a hard SMTP reject (550 5.7.515) for senders missing SPF, DKIM, or DMARC at scale.

**March 14, 2025 — Google retired "less secure apps" entirely.** XOAUTH2 is now required for SMTP submission to Gmail. The era of "give me a 16-character password and IMAP works forever" is over for Google.

**April 2025 — DMARCbis, draft-ietf-dmarc-dmarcbis-41.** Approved by the IESG and queued for publication, expected as a Proposed Standard in 2026. Replaces the brittle Public Suffix List with a DNS Tree Walk, removes the `pct`, `ri`, and `rf` tags, adds `np` for non-existent-subdomain policy, `psd` for public-suffix-domain marking, and `t=y` for test mode.

**November 2025 — DKIM2 motivation draft.** `draft-ietf-dkim-dkim2-motivation`, current rev -02, is the first serious revisit of DKIM since 2011. Goals: defeat replay by signing the next-hop recipient and adding mandatory timestamps; standardise a forwarding chain with explicit "I touched this" signatures; introduce a change-algebra so mailing lists can rewrite headers without invalidating signatures; make room for post-quantum signatures. The motivation is on the IETF stream. The protocol itself is not.

**July 2025 — emailcore RFC 5321bis at draft -44.** John Klensin and Pete Resnick are editing draft-ietf-emailcore-rfc5321bis (and 5322bis) to revise the core specs to Internet Standard with corrections only — not a redesign. Fastmail's December 2024 post said all three documents were expected to ship to the RFC Editor in early 2025; they are still working through Last Call as of 2026. The same editors have shepherded the spec across three decades.

**Microsoft 365 basic-auth deprecation slipped — again.** The original timeline targeted September 2025; the new timeline default-disables for new tenants in December 2026, with the final removal date to be announced in H2 2027. SMTP AUTH basic-auth retirement begins in two phases starting March 2026 with full rejection by April 2026.

**MTA-STS adoption.** Across the top one million domains, MTA-STS publication has roughly doubled in two years but is still under 1% (URIports, January 2026). Weighted by mail volume to providers like Gmail and Hotmail it covers about 19% of traffic (Zivver, September 2025).

**DMARC adoption — the gap between "publishes" and "enforces."** EasyDMARC reports DMARC records on 937,931 of 1.8M analysed domains in early 2026 — about 52.1% — versus 27.2% in 2023. But only ~9% combine enforcement with reporting. Red Sift's December 2025 sweep across 73.3M domains found just 2.5% at `p=reject`. The protocol that secures the global inbox is widely published and rarely enforced.

**OpenSMTPD 7.8.0p1, March 2026.** Ships with OpenBSD errata 005 fixing CVE-2025-62875.

**Cleartext SMTP submission is effectively dead at the major providers.** Microsoft and Google both require XOAUTH2. Port 25 from end-user clients to ISP outbound has been blocked at most consumer ISPs since the 2000s. New application code should target 587/STARTTLS or 465/implicit TLS, with OAuth2 bearer tokens.

**JMAP** (RFC 8620 / 8621, 2019), by Neil Jenkins and Bron Gondwana at Fastmail, is in production at Fastmail, Apache James, Cyrus, and Stalwart; Thunderbird is rolling out support. JMAP does not displace SMTP for inter-server transport — its `EmailSubmission` object hands a message to the server's submission queue, and inter-server transport is still SMTP. JMAP competes with IMAP and POP for client-to-server access.

## Fun facts (host material)

The "S" in SMTP was a deliberate jab at X.400's complexity. SMTP was designed to be the smallest protocol that could move mail between heterogeneous hosts. ITU-T's X.400 — strongly typed, ASN.1-encoded, with built-in delivery receipts and PTT-billed gateway routing — was the official "future" of email through the 1980s. SMTP won by being deployable on already-installed Unix machines and by routing around the gateway model entirely. X.400 survives today only in aviation AMHS and military MMHS. The standards-war story belongs to the chapter on the OSI vs TCP/IP war.

Eric Allman, asked years later why he wrote sendmail, recalled that Bill Joy told him, "We're going to need a mail program and you're the only one who knows how to write it." Allman: "If I had known how hard it would be I would have said, 'You're insane.'" Allman later quipped that there is "some sort of perverse pleasure in knowing that it's basically impossible to send a piece of hate mail through the internet without its being touched by a gay program." Allman is openly gay and married to Marshall Kirk McKusick of BSD fame.

DJB's qmail bounty is a unicorn in software — a multi-decade public bug bounty paid out essentially never. DJB defends qmail's security model line by line on his website to this day. A separate community group put up another $1000 prize, also unclaimed, and donated it to the FSF.

Postel's "be conservative in what you send, be liberal in what you accept" first appears in RFC 760 (1980) and is canonised in RFC 1122 §1.2.2. Eric Allman revisited it in *The Robustness Principle Reconsidered* in ACM Queue in 2011. Martin Thomson's IETF draft *The Harmful Consequences of the Robustness Principle* argues the maxim entrenches deviations as de-facto standards and recommends "maximally strict" implementations with continuous specification maintenance instead. The DMARCbis editors and the SMTP smuggling discoverer both cite Thomson approvingly. Forty-one years later, a single liberally-accepted line ending forged mail from microsoft.com.

Why MAIL FROM and RCPT TO use angle brackets — the brackets disambiguate the address from human-friendly text on the same line. Postel deliberately kept the syntax FTP-like, because every Unix admin in 1982 already knew FTP.

The dot — a line with a single `.` ending a DATA section — is the oldest single-byte security hazard in active use. Directly responsible for SMTP smuggling, forty-one years after RFC 821.

Industry shorthand from 2024–2025: "Yahoogle" for the Yahoo + Google bulk-sender requirements that landed February 2024, then "Yahooglesoft" once Microsoft joined in May 2025.

## Where this connects in the book

- **Part Foundations, "The Layer Model"** — where SMTP fits as an L7 application protocol on top of TCP, and where the seven-layer model blurs in practice.
- **Part Foundations, "Ports & Sockets"** — port 25 vs 587 vs 465, and why the "submission vs relay" distinction is what enterprise mail admins burn most of their time on.
- **Part Foundations, "Client-Server vs Peer-to-Peer"** — SMTP is a textbook client-server store-and-forward protocol, and the chapter uses it as the canonical example.
- **Part Foundations, "Protocols for AI Agents"** — frames where SMTP sits relative to MCP and A2A as agent-era protocols, and why a protocol designed in 1982 still has to coexist with an L7 layer designed in 2024.
- **Part The Story of the Internet, "The OSI vs TCP/IP War"** — David Clark's "rough consensus and running code," and why X.400 lost to SMTP. The full standards-war narrative lives there; this episode just nods to it.
- **Part The Story of the Internet, "The AI Agent Layer (2024–)"** — places SMTP, IMAP, XMPP, and MQTT as the long-tail protocols of the pre-2024 application layer, against which MCP and A2A define themselves.
- **Part Utilities & Security, "The Email Stack"** — the long-form companion to this episode. Ray Tomlinson picking the @, Sendmail eating its share, the X.400 protocol war, IMAP and Mark Crispin, the Trust Layer (SPF, DKIM, DMARC), the 2024–2026 enforcement cliff, EFAIL, SMTP smuggling, Microsoft 365 basic-auth retirement, and JMAP / Stalwart / DKIM2 as the frontier. If a listener wants the story, send them there.

## See also (other protocol episodes)

If you have heard the **TCP** episode, the relationship is foundational. SMTP requires a reliable, ordered, full-duplex byte stream — every command, every response code, every body byte must arrive in order — and SMTP has no application-layer mechanism to recover from lost data. TCP gives it that. The well-known consequence: a connection drop after DATA but before the 250 reply produces a duplicate-message race, documented in RFC 3464.

If you have heard the **TLS** episode, SMTP uses it in three modes that map cleanly onto a deployment story. STARTTLS over port 25 is opportunistic MTA-to-MTA encryption, and the mode that MTA-STS and DANE harden. STARTTLS over 587 is client submission with a downgrade window. Implicit TLS over 465 is client submission with no downgrade window — RFC 8314's preferred form. The TLS episode covers why STARTTLS-stripping was a USENIX paper and 465 won.

If you have heard the **DNS** episode, SMTP is the original DNS-driven application. Mail routing is MX records — an RRset of preference-sorted mail exchangers, with the implicit MX falling back to A/AAAA when no MX is published, and RFC 7505's "Null MX" advertising "this domain accepts no mail." DNS also carries SPF TXT, DKIM `selector._domainkey` TXT, DMARC `_dmarc` TXT, MTA-STS TXT and policy URL, TLS-RPT TXT, BIMI TXT, and DANE TLSA records under `_25._tcp.host`. DNSSEC is the trust anchor for DANE; MTA-STS deliberately avoids DNSSEC by hosting policies over HTTPS.

If you have heard the **IMAP** episode, the contrast is the whole story. SMTP sends; IMAP retrieves. SMTP is transactional — MAIL FROM, DATA, QUIT, done. IMAP is a long-lived stateful session — SELECT, FETCH, IDLE — with tagged commands that can pipeline. SMTP hands the message off and forgets it. IMAP keeps the message on the server and synchronises across all your devices. Default port 587 (with STARTTLS) for SMTP submission; default port 993 (IMAPS with TLS) for IMAP. Together they are the email system.

## Visual cues for image generation

- An annotated EHLO transcript on a black terminal — green client lines, white server lines — with the 250-STARTTLS, 250-AUTH, 250-PIPELINING, 250-SMTPUTF8, 250-CHUNKING capability list called out and labelled "this is what an extension framework looks like."
- A three-port diagram showing port 25 (MTA-to-MTA relay), port 587 (submission with STARTTLS), and port 465 (submissions with implicit TLS), with arrows from a phone to its provider for 587/465 and from the provider to the recipient's MX for 25. A red "STRIPPABLE" tag hangs off the STARTTLS arrow.
- A schematic of SMTP smuggling: outbound server sees one message ending at the dot-CRLF; inbound server sees two messages because it accepted bare-LF-dot-CRLF; the second one is forged from admin@microsoft.com — both sides annotated "passes SPF, DKIM, DMARC."
- A worldmap-scale stat card: 376 billion emails per day in 2025, ~424 billion projected for 2026, roughly 2 million SMTP transactions per second worldwide, only 2.5% of 73.3M scanned domains at DMARC `p=reject`.
- The four authentication overlays as nested boxes around a plain SMTP envelope — SPF on the outside (which IPs may send), DKIM (cryptographic signature in DNS), DMARC (alignment policy + reports), ARC (chain-of-custody for forwarders) — each with its RFC number and year.
- A lineage timeline: RFC 788 (Nov 1981) → RFC 821 / Postel (Aug 1982) → RFC 1425 ESMTP (1993) → RFC 2821 / Klensin (2001) → RFC 5321 / Klensin (2008) → draft-ietf-emailcore-rfc5321bis-44 (July 2025). Forty-four years of edits to the same protocol.

## Sources

**RFCs**

- [RFC 821 — Simple Mail Transfer Protocol (Postel, August 1982)](https://www.rfc-editor.org/rfc/rfc821)
- [RFC 5321 — Simple Mail Transfer Protocol (Klensin, October 2008)](https://www.rfc-editor.org/rfc/rfc5321)
- [RFC 5322 — Internet Message Format (Resnick, October 2008)](https://www.rfc-editor.org/rfc/rfc5322)
- [RFC 822 — Standard for ARPA Internet Text Messages (Crocker, August 1982)](https://www.rfc-editor.org/rfc/rfc822)
- [RFC 6409 — Message Submission for Mail (port 587)](https://www.rfc-editor.org/rfc/rfc6409)
- [RFC 8314 — Cleartext Considered Obsolete (TLS for submission/access)](https://www.rfc-editor.org/rfc/rfc8314)
- [RFC 3207 — SMTP Service Extension for Secure SMTP over TLS](https://datatracker.ietf.org/doc/html/rfc3207)
- [RFC 4954 — SMTP Service Extension for Authentication](https://datatracker.ietf.org/doc/html/rfc4954)
- [RFC 6152 — SMTP Service Extension for 8-bit MIME Transport](https://datatracker.ietf.org/doc/html/rfc6152)
- [RFC 3030 — SMTP Extensions for Large and Binary MIME Messages](https://datatracker.ietf.org/doc/html/rfc3030)
- [RFC 2920 — SMTP Service Extension for Command Pipelining](https://datatracker.ietf.org/doc/html/rfc2920)
- [RFC 3461 — SMTP Service Extension for Delivery Status Notifications](https://datatracker.ietf.org/doc/html/rfc3461)
- [RFC 3464 — Extensible Format for Delivery Status Notifications](https://datatracker.ietf.org/doc/html/rfc3464)
- [RFC 6531 — SMTP Extension for Internationalized Email](https://datatracker.ietf.org/doc/html/rfc6531)
- [RFC 6376 — DKIM Signatures](https://datatracker.ietf.org/doc/html/rfc6376)
- [RFC 7672 — DANE for SMTP](https://www.rfc-editor.org/rfc/rfc7672)
- [RFC 1939 — POP3](https://datatracker.ietf.org/doc/html/rfc1939)
- [RFC 8620 — JMAP Core](https://datatracker.ietf.org/doc/html/rfc8620)
- [RFC 8621 — JMAP for Mail](https://datatracker.ietf.org/doc/html/rfc8621)
- [RFC 1122 — Requirements for Internet Hosts](https://datatracker.ietf.org/doc/html/rfc1122)
- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 1035 — DNS](https://www.rfc-editor.org/rfc/rfc1035)
- [draft-ietf-emailcore-rfc5321bis](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/)
- [draft-ietf-dmarc-dmarcbis](https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/)
- [draft-ietf-dkim-dkim2-motivation](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)
- [EMAILCORE WG charter](https://datatracker.ietf.org/wg/emailcore/about/)
- [draft-thomson-postel-was-wrong](https://datatracker.ietf.org/doc/draft-thomson-postel-was-wrong/)
- [IANA service-name and port-number registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)

**Papers and academic**

- [Unraveling the Complexities of MTA-STS Deployment, IMC 2025](https://dl.acm.org/doi/10.1145/3730567.3732916)
- [Eric Allman — The Robustness Principle Reconsidered, ACM Queue 2011](https://queue.acm.org/detail.cfm?id=1999945)

**Vendor and engineering blogs**

- [Fastmail — Revision of the core email specifications (Dec 2024)](https://www.fastmail.com/blog/revision-of-core-email-specifications/)
- [SEC Consult — SMTP Smuggling](https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/)
- [URIports — MTA-STS three-year survey 2026](https://www.uriports.com/blog/mta-sts-survey-update-2026/)
- [URIports — BIMI 2025 update](https://www.uriports.com/blog/bimi-2025-update/)
- [Zivver — Email security standards in the Netherlands, Sept 2025](https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts)
- [Postfix — SMTP smuggling mitigation](https://www.postfix.org/smtp-smuggling.html)
- [Postfix — Tuning README](https://www.postfix.org/TUNING_README.html)
- [Postfix — bulk-mailing performance discussion (Wietse Venema)](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)
- [Microsoft Tech Community — Updated Exchange Online SMTP AUTH Basic Auth deprecation timeline](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)
- [Mailgun — Yahoogle bulk-sender requirements](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)
- [Email Warmup — Gmail/Yahoo bulk-sender requirements 2026](https://emailwarmup.com/blog/email-deliverability/gmail-and-yahoo-bulk-sender-requirements/)
- [Unboxd — bulk-sender requirements complete guide 2026](https://unboxd.ai/blog/bulk-sender-requirements.html)
- [EasyDMARC 2026 Adoption Report](https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/)
- [Red Sift — global DMARC adoption guide](https://redsift.com/guides/red-sifts-guide-to-global-dmarc-adoption)
- [DMARC Report — State of DMARC Adoption in 2026](https://dmarcreport.com/blog/the-dmarc-adoption-2026-domains-records-only-9-percent-protected)
- [Buttondown — Email could have been X.400 times better](https://buttondown.com/blog/x400-vs-smtp-email)
- [DJB — qmail security guarantee](https://cr.yp.to/qmail/guarantee.html)
- [Calif.io — auditing the sagredo qmail fork with Claude](https://blog.calif.io/p/we-asked-claude-to-audit-sagredos)
- [OpenSMTPD project](https://www.opensmtpd.org/)
- [OpenSMTPD release history](https://github.com/OpenSMTPD/OpenSMTPD/blob/master/CHANGES.md)
- [Qualys — CVE-2019-10149 Return of the WIZard](https://www.qualys.com/2019/06/05/cve-2019-10149/return-wizard-rce-exim.txt)
- [Arctic Wolf — CVE-2023-42115](https://arcticwolf.com/resources/blog/cve-2023-42115/)
- [ZDI advisory ZDI-23-1469](https://www.zerodayinitiative.com/advisories/ZDI-23-1469)
- [ProxyLogon site](https://proxylogon.com/)
- [Praetorian — Reproducing ProxyLogon](https://www.praetorian.com/blog/reproducing-proxylogon-exploit/)
- [Swaks — John Jetmore](https://jetmore.org/john/code/swaks/)
- [JMAP specifications](https://jmap.io/spec.html)
- [Internet Hall of Fame — Eric Allman](https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/)
- [ACM — People of ACM: Eric Allman](https://www.acm.org/articles/people-of-acm/2014/eric-allman)

**News**

- [CSO Online — SMTP smuggling enables email spoofing while passing security checks](https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html)
- [SonicWall — SMTP Smuggling](https://www.sonicwall.com/blog/smtp-smuggling)
- [Dark Reading — Novel SMTP smuggling slips past DMARC](https://www.darkreading.com/cloud-security/novel-smtp-smuggling-technique-slips-past-dmarc-email-protections)
- [Security Boulevard — Google and Yahoo updated email authentication requirements for 2025](https://securityboulevard.com/2025/11/google-and-yahoo-updated-email-authentication-requirements-for-2025/)
- [Timo Longin — SMTP Smuggling at 37C3](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide)
- [Ubuntu security — CVE-2023-51764](https://ubuntu.com/security/CVE-2023-51764)
- [Statista — daily emails worldwide 2018–2028](https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/)
- [Today I Found Out — first mass commercial spam](https://www.todayifoundout.com/index.php/2012/04/this-day-in-history-the-first-mass-commercial-internet-spam-campaign-is-launched/)
- [Columbia Journalism Review — Original Sin (Canter & Siegel)](https://www.cjr.org/critical_eye/original_sin.php)

**Wikipedia**

- [Simple Mail Transfer Protocol](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)
- [Sendmail](https://en.wikipedia.org/wiki/Sendmail)
- [Postfix (software)](https://en.wikipedia.org/wiki/Postfix_(software))
- [OpenSMTPD](https://en.wikipedia.org/wiki/OpenSMTPD)
- [Wietse Venema](https://en.wikipedia.org/wiki/Wietse_Venema)
- [Eric Allman](https://en.wikipedia.org/wiki/Eric_Allman)
- [X.400](https://en.wikipedia.org/wiki/X.400)
- [Morris worm](https://en.wikipedia.org/wiki/Morris_worm)
- [Laurence Canter and Martha Siegel](https://en.wikipedia.org/wiki/Laurence_Canter_and_Martha_Siegel)
- [Robustness principle](https://en.wikipedia.org/wiki/Robustness_principle)
- [Swaks](https://en.wikipedia.org/wiki/Swaks)
