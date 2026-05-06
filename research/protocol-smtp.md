---
prompt_source: deep-research-prompts.txt:8267-8445 (PROTOCOL · SMTP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/ed01fe1b-2417-4b32-8987-a52bd842d653
research_mode: claude.ai Research
---

# SMTP — A Foundation Reference for Engineers (May 2026)

## 1. Prerequisites and glossary

To read this document end-to-end you need a working model of the network stack and a vocabulary of mail-specific roles. Brief, link-anchored definitions follow.

**Networking and transport**

- **OSI / TCP-IP stack** — Two layered models for network protocols; SMTP lives at the application layer over TCP/IP. See the IETF host requirements RFC 1122 ([https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122)) and Cloudflare's OSI primer ([https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)).
- **TCP** — Transmission Control Protocol, RFC 9293 ([https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293)) — provides the reliable, ordered byte stream SMTP requires.
- **Socket** — The (IP, port) endpoint identifying a TCP conversation; SMTP servers listen on sockets like 0.0.0.0:25.
- **Port** — 16-bit TCP service number; SMTP uses 25 (relay), 587 (submission), 465 (implicit-TLS submission). IANA Service Name Registry ([https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)).
- **Datagram / frame / packet / stream** — Datagram = self-contained message (UDP); frame = link-layer unit (Ethernet); packet = IP-layer unit; stream = ordered byte sequence (TCP). SMTP uses streams.
- **Handshake** — Initial exchange establishing state; TCP three-way handshake, plus a TLS handshake for encrypted SMTP, plus the SMTP banner/EHLO handshake.
- **Header / envelope** — In SMTP, the *envelope* (MAIL FROM, RCPT TO) controls routing; the *header* (From:, To:, Subject:) is part of the RFC 5322 message body and may differ from the envelope. See RFC 5321 §2.3.1 ([https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321)) and RFC 5322 ([https://www.rfc-editor.org/rfc/rfc5322](https://www.rfc-editor.org/rfc/rfc5322)).
- **Checksum** — Integrity check; in SMTP the relevant ones are TCP checksums and DKIM body hashes (RFC 6376).
- **DNS / MX record** — Domain Name System; an MX record names the mail exchanger(s) for a domain. RFC 1035 ([https://www.rfc-editor.org/rfc/rfc1035](https://www.rfc-editor.org/rfc/rfc1035)), RFC 5321 §5.1.

**Encoding**

- **ASCII** — 7-bit US character set; classic SMTP body lines are 7-bit ASCII.
- **MIME** — Multipurpose Internet Mail Extensions, RFC 2045–2049 ([https://www.rfc-editor.org/rfc/rfc2045](https://www.rfc-editor.org/rfc/rfc2045)) — adds multipart bodies, attachments, character sets.
- **Base64 / quoted-printable** — MIME content transfer encodings; Base64 packs 3 bytes into 4 ASCII characters; quoted-printable escapes only non-ASCII bytes as `=XX`.
- **UTF-8 / SMTPUTF8** — UTF-8 is the dominant Unicode encoding (RFC 3629). SMTPUTF8 (RFC 6531, [https://datatracker.ietf.org/doc/html/rfc6531](https://datatracker.ietf.org/doc/html/rfc6531)) lets envelope and headers carry non-ASCII addresses. [IETF](https://datatracker.ietf.org/doc/html/rfc6531)

**Cryptography**

- **TLS** — Transport Layer Security; RFC 8446 (TLS 1.3, [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)). SMTP uses STARTTLS (RFC 3207) or implicit TLS (RFC 8314).
- **Public-key signature / hash** — DKIM uses RSA or Ed25519 signatures over canonicalized headers and a body hash; DANE/MTA-STS pin or assert TLS certs.

**Mail roles**

- **MUA — Mail User Agent** — The client (Thunderbird, Outlook, mutt, an app's SMTP library).
- **MSA — Message Submission Agent** — The first server, typically on port 587/465, that authenticates the user (RFC 6409, [https://www.rfc-editor.org/rfc/rfc6409](https://www.rfc-editor.org/rfc/rfc6409)).
- **MTA — Mail Transfer Agent** — Server that relays mail to the next hop over port 25 (Postfix, Sendmail, Exim, OpenSMTPD, Exchange).
- **MDA — Mail Delivery Agent** — Final-hop process that writes to the user's mailbox (procmail, Dovecot LDA, Cyrus); often invoked over LMTP (RFC 2033).
- **Relay** — An MTA that forwards mail it did not originate to another MTA; an *open relay* accepts and forwards mail from anyone to anyone (the historical spam vector).
- **Bounce / DSN** — A Delivery Status Notification (RFC 3461/3464, [https://datatracker.ietf.org/doc/html/rfc3461](https://datatracker.ietf.org/doc/html/rfc3461)) returned to the envelope sender when delivery fails.
- **Backscatter** — Bounces sent to forged sender addresses (innocent victims).
- **Greylisting** — Temporarily 4xx-rejecting unknown senders to deter spam bots.
- **MX / fallback / smarthost** — DNS MX advertises receivers; a *smarthost* is a fixed outbound relay (e.g., your provider's MSA).
- **Queue / spool** — Disk-backed store of in-flight messages; a *queue runner* periodically retries deferred mail.
- **SPF, DKIM, DMARC, ARC, BIMI, MTA-STS, DANE, TLS-RPT** — Authentication and transport-security overlays defined in §4.

## 2. History and story

**Origin (1971–1981).** Networked email predates SMTP. In 1971 Ray Tomlinson at BBN modified SNDMSG for ARPANET and chose `@` to separate user from host ([https://en.wikipedia.org/wiki/Morris_worm](https://en.wikipedia.org/wiki/Morris_worm) has context; first-email lore at [https://faraday.email/blog/history-of-email](https://faraday.email/blog/history-of-email)). Through the 1970s mail rode on top of FTP and the Mail Transfer Protocol (RFC 772 in 1980, RFC 780, RFC 788). Jon Postel — then at USC's Information Sciences Institute and the RFC Editor — split mail off into a dedicated protocol. RFC 788 (November 1981) was the first SMTP, and **RFC 821 (August 1982) by Postel became the canonical version** ([https://www.rfc-editor.org/rfc/rfc821](https://www.rfc-editor.org/rfc/rfc821)), assigning port 25 ("contact socket 25 (31 octal), that is L=25"). Dave Crocker's RFC 822, published the same month, defined the message header format ([https://www.rfc-editor.org/rfc/rfc822](https://www.rfc-editor.org/rfc/rfc822)). Funding came primarily from DARPA and the universities (USC ISI, UC Berkeley, MIT, BBN) operating on ARPANET; the rooms were ISI in Marina del Rey, the Berkeley CSRG, BBN in Cambridge, and the Internet Engineering Task Force as it formalized in 1986. [Prolateral + 5](https://www.prolateral.com/help/kb/smtp/420-when-was-the-first-smtp-email.html)

**First implementations (1981–1983).** Eric Allman at UC Berkeley wrote *delivermail* on the INGRES project, then rewrote it as **sendmail**, which shipped with 4.1cBSD in 1983 — the first BSD with TCP/IP ([https://en.wikipedia.org/wiki/Sendmail](https://en.wikipedia.org/wiki/Sendmail); Allman interview, [https://www.acm.org/articles/people-of-acm/2014/eric-allman](https://www.acm.org/articles/people-of-acm/2014/eric-allman)). Allman's design embraced Postel's robustness principle: rewrite addresses to fit whatever foreign network you needed to reach, accept malformed input. This pragmatism is why sendmail dominated — and also why it had decades of CVEs. [Association for Computing Machinery + 2](https://www.acm.org/articles/people-of-acm/2014/eric-allman)

**The protocol war: SMTP vs X.400.** Through the 1980s ITU-T's X.400 (Red Book 1984, Blue Book 1988) was the official "future" of email — strongly typed, ASN.1-encoded, with built-in delivery receipts, encryption, and PTT-operated relays. SMTP was the rough upstart. The IETF moved fast, X.400 did not (6 years to first standard, another 4 to update); SMTP won by being deployable on already-installed Unix machines and by routing around X.400's PTT-billed gateway model. By 1993 even the UN was running both ([https://buttondown.com/blog/x400-vs-smtp-email](https://buttondown.com/blog/x400-vs-smtp-email); [https://en.wikipedia.org/wiki/X.400](https://en.wikipedia.org/wiki/X.400)). X.400 survives in aviation AMHS and military MMHS only. [Buttondown + 2](https://buttondown.com/blog/x400-vs-smtp-email)

**Extended SMTP and security (1993–2008).** RFC 1425 (1993) and RFC 1869 (1995) introduced the EHLO extension framework (ESMTP), enabling 8BITMIME (RFC 6152), PIPELINING (RFC 2920), CHUNKING/BINARYMIME (RFC 3030), SIZE, AUTH (RFC 4954), STARTTLS (RFC 3207), and DSN (RFC 3461/3464). **RFC 2821 (April 2001) by John Klensin** consolidated SMTP and ESMTP. **RFC 5321 (October 2008) by Klensin** is the current Internet Standard ([https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321)). Wietse Venema released **Postfix** from IBM T. J. Watson Research Center in December 1998 as a security-focused alternative to sendmail ([https://en.wikipedia.org/wiki/Postfix_(software)](https://en.wikipedia.org/wiki/Postfix_(software))); Dan Bernstein released **qmail** in 1995–1998 with a famous $500 (later $1000) security bounty ([https://cr.yp.to/qmail/guarantee.html](https://cr.yp.to/qmail/guarantee.html)); Philip Hazel's **Exim** became the Debian default; OpenBSD's **OpenSMTPD** appeared in 2013. [Historyofdomains + 3](https://www.historyofdomains.com/smtp/)

**Authentication overlay (2003–2015).** Years of spam and forgery produced an authentication stack bolted on top of SMTP: SPF (RFC 4408 → 7208), DKIM (RFC 4871 → 6376), DMARC (RFC 7489, 2015), ARC (RFC 8617, 2019), MTA-STS (RFC 8461, 2018), DANE for SMTP (RFC 7672, 2015), TLS-RPT (RFC 8460), BIMI (draft).

**What has changed in the last 24 months (2024–2026).**

- **EMAILCORE working group / RFC 5321bis.** John Klensin and Pete Resnick are editing **draft-ietf-emailcore-rfc5321bis** (and 5322bis) to revise the core specs to Internet Standard with corrections only — not a redesign ([https://datatracker.ietf.org/wg/emailcore/about/](https://datatracker.ietf.org/wg/emailcore/about/)). As of July 2025 the draft is at version -44, obsoleting RFC 5321, 1846, 7504, and 7505 if approved ([https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/)). Fastmail's December 2024 post said all three documents were expected to ship to the RFC Editor in early 2025 ([https://www.fastmail.com/blog/revision-of-core-email-specifications/](https://www.fastmail.com/blog/revision-of-core-email-specifications/)); they are still working through Last Call ticketing as of 2026. [IETF](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/)
- **Yahoo / Google bulk-sender requirements (Feb 2024).** Senders of >5,000 messages/day to Gmail or Yahoo addresses must implement SPF, DKIM, *and* DMARC with at least p=none, an RFC 8058 one-click List-Unsubscribe (deadline pushed to June 1, 2024), valid PTR/forward-confirmed reverse DNS, RFC 5322 compliance, and a spam-complaint rate kept under 0.30% ([https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/); [https://emailwarmup.com/blog/email-deliverability/gmail-and-yahoo-bulk-sender-requirements/](https://emailwarmup.com/blog/email-deliverability/gmail-and-yahoo-bulk-sender-requirements/)). Gmail moved from 4xx soft errors (Feb 2024) to 5xx permanent rejections in **November 2025** ([https://securityboulevard.com/2025/11/google-and-yahoo-updated-email-authentication-requirements-for-2025/](https://securityboulevard.com/2025/11/google-and-yahoo-updated-email-authentication-requirements-for-2025/)). **Microsoft Outlook/Hotmail** added equivalent requirements with hard SMTP rejection (error 550 5.7.515) starting **May 5, 2025** ([https://unboxd.ai/blog/bulk-sender-requirements.html](https://unboxd.ai/blog/bulk-sender-requirements.html)). [DMARC Report](https://dmarcreport.com/blog/understanding-dmarc-rfc-a-comprehensive-guide-by-dmarcreport/)
- **Basic-auth deprecation for SMTP submission.** **Google** retired "less secure apps" entirely on **March 14, 2025**; XOAUTH2 is now required. **Microsoft 365** is removing Basic auth for SMTP AUTH client submission; the timeline slipped from September 2025 to a default-disable for new tenants in **December 2026**, with the final removal date to be announced in H2 2027 ([https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)). [Mailbird + 2](https://www.getmailbird.com/microsoft-modern-authentication-enforcement-email-guide/)
- **DMARCbis.** **draft-ietf-dmarc-dmarcbis-41** (April 2025) obsoletes RFC 7489 and 9091, replaces the Public Suffix List with a DNS Tree Walk, removes the `pct`/`ri`/`rf` tags, adds `np` (non-existent-subdomain policy), `psd` (public-suffix-domain marker), and `t=y` (test mode). It is approved by the IESG and queued for publication, expected as a Proposed Standard in 2026 ([https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/](https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/)). [IETF + 2](https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/)
- **DKIM2.** A new working-group effort (**draft-ietf-dkim-dkim2-motivation**, current rev -02, November 2025) responds to the DKIM replay-attack epidemic, adding per-hop signatures with timestamps and explicit next-hop identifiers so that mass replays of legitimately signed mail become detectable ([https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)). [IETF](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)
- **SMTP smuggling (December 2023 / January 2024).** Timo Longin (SEC Consult) presented at 37C3 the discovery that outbound and inbound SMTP servers disagree on end-of-data sequences, allowing forged messages that pass SPF/DKIM/DMARC; CVE-2023-51764 (Postfix), CVE-2023-51765 (Sendmail), CVE-2023-51766 (Exim) were assigned ([https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/](https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/); [https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html](https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html)). [Dark Reading + 3](https://www.darkreading.com/cloud-security/novel-smtp-smuggling-technique-slips-past-dmarc-email-protections)
- **MTA implementations.** **OpenSMTPD** shipped 7.6.0p0 (October 2024), 7.8.0 (October 2025), and 7.8.0p1 (March 2026); the latter ships with OpenBSD errata 005 fixing CVE-2025-62875 ([https://www.opensmtpd.org/](https://www.opensmtpd.org/), [https://github.com/OpenSMTPD/OpenSMTPD/blob/master/CHANGES.md](https://github.com/OpenSMTPD/OpenSMTPD/blob/master/CHANGES.md)). **Postfix** continues active development under Wietse Venema. **Sendmail** persists but Sendmail Inc. was acquired by Proofpoint in 2013 and the open-source codebase moves slowly. **Exim** remains the world's most-deployed MTA largely because it ships as the default on Debian and many hosting panels; the 2023 ZDI cluster (CVE-2023-42114–42119) shook confidence and 4.96.1 / 4.97 finally fixed the most serious issues. [Wikidata + 3](https://www.wikidata.org/wiki/Q7095873)
- **MTA-STS adoption.** Across the top 1 million domains, MTA-STS publication has roughly doubled in two years but is still under 1% (URIports, January 2026, [https://www.uriports.com/blog/mta-sts-survey-update-2026/](https://www.uriports.com/blog/mta-sts-survey-update-2026/)). Weighted by mail volume to providers like Gmail/Hotmail it covers ~19% of traffic (Zivver, September 2025, [https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts](https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts)). [URIports Blog](https://www.uriports.com/blog/mta-sts-survey-update-2026/)[Zivver](https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts)

## 3. How it actually works

**SMTP is a stateful, line-oriented, request/response protocol over TCP.** Lines end in CRLF (`\r\n`); commands are 4-letter verbs followed by arguments; replies are 3-digit status codes plus optional text. Multiline replies use a hyphen between code and text on all but the last line. [RFC Editor](https://www.rfc-editor.org/rfc/rfc821)

**Ports — clarifying the user's brief.** The user's working assumption that SMTP "typically runs on default port 587" is partly correct and worth correcting precisely:

- **Port 25** is the canonical MTA-to-MTA relay port (RFC 5321, RFC 821 originally). It accepts mail addressed to a domain whose MX points at this server. Most consumer ISPs block outbound 25 to limit botnet spam.
- **Port 587** is the **Submission** port for authenticated client-to-MSA traffic, defined by RFC 6409 ([https://www.rfc-editor.org/rfc/rfc6409](https://www.rfc-editor.org/rfc/rfc6409)). It uses STARTTLS to upgrade an initially cleartext connection to TLS.
- **Port 465** is the **Submissions** port for *implicit* TLS submission, formally restored to that role by RFC 8314 in January 2018 ([https://www.rfc-editor.org/rfc/rfc8314](https://www.rfc-editor.org/rfc/rfc8314)). RFC 8314 also declares cleartext submission/access obsolete and instructs clients/servers to support both 587/STARTTLS and 465/implicit-TLS during a multi-year transition.

So the accurate framing is: **MTA-to-MTA uses 25; MUA-to-MSA uses 587 (STARTTLS) or 465 (implicit TLS); 465 is preferred for new client integrations because STARTTLS is strippable.**

**Core commands.**

- `HELO domain` / `EHLO domain` — Identify client. EHLO requests the extension list.
- `MAIL FROM:<addr> [params]` — Begin a transaction; sets the envelope sender (the bounce return-path).
- `RCPT TO:<addr> [params]` — Add an envelope recipient (repeatable).
- `DATA` — Server replies 354; client sends headers, blank line, body, terminates with a single `.` on a line. The server replies 250 once queued.
- `RSET` — Reset transaction without dropping the connection.
- `NOOP` — No-op; useful as a keepalive.
- `QUIT` — Close gracefully (server replies 221).
- `VRFY user` / `EXPN list` — Verify a user / expand a list. Almost universally disabled because they leak account information.
- `STARTTLS` — Upgrade to TLS (RFC 3207). Server resets state after the handshake; client must EHLO again.
- `AUTH mechanism [initial-response]` — SASL authentication (RFC 4954). Mechanisms include PLAIN, LOGIN (deprecated), CRAM-MD5, SCRAM, and XOAUTH2.
- `BDAT chunk-size [LAST]` — Binary chunk transfer, used with CHUNKING.

**Reply-code structure.**

- `2yz` — Success.
- `3yz` — Intermediate ("send more data").
- `4yz` — Transient failure (try again later).
- `5yz` — Permanent failure (don't retry).
The second/third digits carry rough semantics (0=syntax, 1=info, 2=connections, 3=mail-system, 4=routing, 5=mail). Enhanced status codes (RFC 3463, e.g., `5.7.1`) are appended in DSNs.

**Common useful codes.** 220 service ready; 221 closing; 235 auth ok; 250 OK; 354 start mail input; 421 service unavailable / shutting down; 451 local error in processing; 452 insufficient storage; 454 TLS not available now; 500 syntax error; 501 syntax in arguments; 502 not implemented; 503 bad sequence; 535 auth credentials invalid; 550 mailbox unavailable; 551 user not local; 552 storage exceeded; 553 mailbox name not allowed; 554 transaction failed. Recent: **550 5.7.26** (Gmail "DMARC required for bulk senders") and **550 5.7.515** (Outlook bulk-sender authentication failure) are now common ([https://www.validity.com/blog/dmarc-adoption-a-deep-dive-into-the-current-state-of-email-authentication/](https://www.validity.com/blog/dmarc-adoption-a-deep-dive-into-the-current-state-of-email-authentication/), [https://unboxd.ai/blog/bulk-sender-requirements.html](https://unboxd.ai/blog/bulk-sender-requirements.html)).

**Common ESMTP extensions.**

- `8BITMIME` (RFC 6152) — accept 8-bit message bodies; signaled with `BODY=8BITMIME` on MAIL FROM. [IETF](https://datatracker.ietf.org/doc/html/rfc6152.html)
- `PIPELINING` (RFC 2920) — let the client send multiple commands without waiting for each reply. [Linux Man Pages](https://linux.die.net/man/1/swaks)
- `CHUNKING` and `BINARYMIME` (RFC 3030) — replace DATA with a series of `BDAT n [LAST]` commands carrying exact-byte-count chunks; closes the dot-stuffing class of bugs. [IETF](https://datatracker.ietf.org/doc/html/rfc3030)
- `SIZE n` (RFC 1870) — advertise/declare maximum message size.
- `DSN` (RFC 3461) — request `NOTIFY=SUCCESS,FAILURE,DELAY,NEVER` and an `ENVID` per RCPT.
- `SMTPUTF8` (RFC 6531) — internationalized addresses and headers.
- `STARTTLS` (RFC 3207) and `AUTH` (RFC 4954).
- `BURL` (RFC 4468) — submit by reference to an IMAP URL.

**A real on-the-wire transcript.** Spaces and CRLFs preserved; `S:` is server, `C:` is client.

```
S: 220 mx.example.com ESMTP Postfix (Debian)
C: EHLO client.acme.test
S: 250-mx.example.com Hello client.acme.test [203.0.113.7]
S: 250-SIZE 52428800
S: 250-8BITMIME
S: 250-PIPELINING
S: 250-CHUNKING
S: 250-STARTTLS
S: 250-SMTPUTF8
S: 250-DSN
S: 250 ENHANCEDSTATUSCODES
C: STARTTLS
S: 220 2.0.0 Ready to start TLS
   <TLS handshake>
C: EHLO client.acme.test
S: 250-mx.example.com Hello client.acme.test [203.0.113.7]
S: 250-AUTH PLAIN LOGIN XOAUTH2
S: 250 SMTPUTF8
C: AUTH PLAIN AGFsaWNlAHMzY3JldA==
S: 235 2.7.0 Authentication successful
C: MAIL FROM:<alice@acme.test> SIZE=2331 BODY=8BITMIME SMTPUTF8
S: 250 2.1.0 Ok
C: RCPT TO:<bob@example.com> NOTIFY=FAILURE,DELAY ORCPT=rfc822;bob@example.com
S: 250 2.1.5 Ok
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: Alice <alice@acme.test>
C: To: Bob <bob@example.com>
C: Subject: Test
C: Date: Mon, 05 May 2026 12:00:00 +0000
C: Message-ID: <20260505120000.abc@acme.test>
C: MIME-Version: 1.0
C: Content-Type: text/plain; charset=utf-8
C:
C: Hello, Bob.
C: .
S: 250 2.0.0 Ok: queued as 7B2C19F12
C: QUIT
S: 221 2.0.0 Bye
```

**State machine.** A session has the states *Connection*, *Greeting*, *Identified* (after EHLO), *Authenticated* (optional, after AUTH), *Mail* (after MAIL FROM), *Rcpt* (after at least one RCPT TO), *Data*, *End-of-data*, and *Quit*. RSET drops back to Identified without losing TLS or auth context. The dot-on-its-own-line terminator drives the *Data* → *End-of-data* transition; dot-stuffing (a leading `.` is doubled to `..` on the wire and unstuffed on receipt) keeps body content from prematurely terminating the message. Mishandling of CR/LF and the dot terminator is the entire SMTP smuggling bug class. [CSO Online](https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html)

**Mermaid sequence diagram.**

UserMDA / mailbox (LMTP)Recipient MX (25)Submission MSA (587/465)MUA / Client appUserMDA / mailbox (LMTP)Recipient MX (25)Submission MSA (587/465)MUA / Client app#mermaid-rkp{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rkp .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rkp .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rkp .error-icon{fill:#CC785C;}#mermaid-rkp .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rkp .edge-thickness-normal{stroke-width:1px;}#mermaid-rkp .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rkp .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rkp .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rkp .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rkp .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rkp .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rkp .marker.cross{stroke:#A1A1A1;}#mermaid-rkp svg{font-family:inherit;font-size:16px;}#mermaid-rkp p{margin:0;}#mermaid-rkp .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rkp text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rkp .actor-line{stroke:#A1A1A1;}#mermaid-rkp .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rkp .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rkp #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rkp .sequenceNumber{fill:#5e5e5e;}#mermaid-rkp #sequencenumber{fill:#E5E5E5;}#mermaid-rkp #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rkp .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rkp .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rkp .labelText,#mermaid-rkp .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rkp .loopText,#mermaid-rkp .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rkp .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rkp .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rkp .noteText,#mermaid-rkp .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rkp .activation0{fill:transparent;stroke:#00000000;}#mermaid-rkp .activation1{fill:transparent;stroke:#00000000;}#mermaid-rkp .activation2{fill:transparent;stroke:#00000000;}#mermaid-rkp .actorPopupMenu{position:absolute;}#mermaid-rkp .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rkp .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rkp .actor-man circle,#mermaid-rkp line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rkp :root{--mermaid-font-family:inherit;}TLS 1.3 handshakeTCP connect (SYN/SYN-ACK/ACK)1220 banner2EHLO client3250 capabilities (STARTTLS, AUTH, SIZE, ...)4STARTTLS  (or implicit TLS if 465)5EHLO client (again, post-TLS)6250 capabilities (now includes AUTH XOAUTH2 ...)7AUTH XOAUTH2 <bearer>8235 OK9MAIL FROM / RCPT TO / DATA + body + .10250 queued11DKIM sign, enqueue12DNS MX lookup, TCP 25, EHLO, STARTTLS (opportunistic),MAIL FROM, RCPT TO, DATA13250 accepted14SPF / DKIM / DMARC / ARC checks, content filters15LMTP (RFC 2033) hand-off16250 delivered17visible in IMAP/JMAP mailbox18

If you can implement EHLO, MAIL/RCPT/DATA, dot-stuffing, three-digit replies, STARTTLS, AUTH PLAIN, SIZE, and 8BITMIME, you have a minimum viable SMTP server. Add CHUNKING, PIPELINING, DSN, and SMTPUTF8 to be a polite citizen.

## 4. Deep connections to other protocols

**TCP.** SMTP requires a reliable, ordered, full-duplex byte stream; it relies on TCP for retransmission and ordering. The transmission channel is a single TCP connection per session, so transport-level resets (e.g., a connection drop after DATA but before the 250 reply) cause the well-known "duplicate message" race documented in RFC 3464. [Buttondown](https://buttondown.com/blog/x400-vs-smtp-email)

**TLS.** SMTP uses TLS in three modes. **STARTTLS over 25** for opportunistic MTA-to-MTA encryption (RFC 3207); this is the mode MTA-STS and DANE harden. **STARTTLS over 587** for client submission. **Implicit TLS over 465** for client submission, mandated as the preferred form by RFC 8314 ([https://www.rfc-editor.org/rfc/rfc8314](https://www.rfc-editor.org/rfc/rfc8314)). TLS 1.0/1.1 are obsolete (RFC 8996). STARTTLS has a long, ugly history of stripping attacks, command-injection bugs (CVE-2011-0411 et al.), and the more recent "STARTTLS is better off without" Poddebniak et al. analysis at USENIX Security 2021 — which is part of why RFC 8314 pushed implicit TLS.

**DNS / MX records.** Mail routing is DNS-driven. A sender resolves the recipient's domain to an MX RRset (RFC 1035, RFC 5321 §5), sorts by preference, and tries hosts in order. If no MX exists, the implicit MX is the A/AAAA of the domain itself; **RFC 7505** introduced the "Null MX" (`. 0` priority) to advertise "this domain does not receive mail." DNS also carries SPF TXT, DKIM `selector._domainkey` TXT, DMARC `_dmarc` TXT, MTA-STS TXT and policy URL, TLS-RPT TXT, BIMI TXT, and DANE TLSA records under `_25._tcp.host`. DNSSEC is the trust anchor for DANE; MTA-STS deliberately avoids DNSSEC by hosting policies over HTTPS. [ACM Digital Library](https://dl.acm.org/doi/10.1145/3730567.3732916)

**IMAP.** The Internet Message Access Protocol (RFC 9051 for IMAP4rev2; RFC 3501 for the older 4rev1) is the *retrieval* counterpart to SMTP. SMTP gets the message from sender to receiving server; IMAP lets the user read, search, and manage that mailbox. IMAP and SMTP are operationally separate even when run by the same provider.

**POP3.** RFC 1939 ([https://datatracker.ietf.org/doc/html/rfc1939](https://datatracker.ietf.org/doc/html/rfc1939)) — an older, simpler retrieval protocol that traditionally downloads and removes messages. Still supported widely for legacy clients but rarely chosen for new deployments.

**JMAP.** RFC 8620 (Core, July 2019) and RFC 8621 (Mail, August 2019) by Neil Jenkins and Chris Newman, with later extensions for WebSocket push (RFC 8887), MDN (RFC 9007), Sharing (RFC 9670), Quotas (RFC 9425), Blob Management (RFC 9404), Sieve management (RFC 9661), Contacts (RFC 9610). JMAP is a JSON-over-HTTP modern alternative to IMAP and is being adopted by Fastmail, Cyrus, Apache James, Stalwart, and Thunderbird ([https://jmap.io/](https://jmap.io/)). It does *not* replace SMTP — JMAP includes an `EmailSubmission` object that hands a message to the server's submission queue, but inter-server transport is still SMTP. [IETF + 3](https://datatracker.ietf.org/doc/html/rfc8621)

**MIME.** RFC 2045–2049 by Ned Freed and Nathaniel Borenstein ([https://www.rfc-editor.org/rfc/rfc2045](https://www.rfc-editor.org/rfc/rfc2045)). MIME is what made attachments, HTML mail, internationalization, and multipart/alternative bodies possible inside SMTP's 7-bit-ASCII envelope. Every modern email is structurally a MIME tree.

**SPF.** Sender Policy Framework, RFC 7208. A TXT record at the apex domain enumerates IPs authorized to send mail with that domain in the envelope MAIL FROM. Receivers verify the connecting IP against the policy and produce pass/fail/softfail/neutral. SPF breaks on plain forwarding because the envelope sender is preserved while the IP changes.

**DKIM.** DomainKeys Identified Mail, RFC 6376 ([https://datatracker.ietf.org/doc/html/rfc6376](https://datatracker.ietf.org/doc/html/rfc6376)). The sending domain signs selected headers and a body hash with a private key; receivers fetch the public key from `selector._domainkey.domain` TXT and verify. DKIM survives forwarding but is vulnerable to **replay attacks** — the entire reason DKIM2 is being designed.

**DMARC.** RFC 7489 (Informational, 2015), being replaced by DMARCbis as a Standards Track RFC. Ties SPF and DKIM together by requiring that one of them produce an *aligned* pass relative to the visible From: header, and lets the domain owner publish a policy (`p=none|quarantine|reject`) plus aggregate (`rua`) and forensic (`ruf`) reporting addresses. Adoption is rising (~52% of the EasyDMARC top-1.8M sample by early 2026) but enforcement remains a minority — only ~9% of analyzed domains combine `p=reject/quarantine` with reporting ([https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/](https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/)). Red Sift's December 2025 sweep of 73.3M domains found just **2.5% at p=reject** ([https://redsift.com/guides/red-sifts-guide-to-global-dmarc-adoption](https://redsift.com/guides/red-sifts-guide-to-global-dmarc-adoption)). [DMARC Report + 2](https://dmarcreport.com/blog/understanding-dmarc-rfc-a-comprehensive-guide-by-dmarcreport/)

**ARC.** Authenticated Received Chain, RFC 8617. Lets intermediate mailing-list and forwarding servers seal an authentication-results chain so the final receiver can see that the message was authenticated when it entered the chain, even if SPF or DKIM later broke.

**MTA-STS.** RFC 8461. Domain owners publish a policy at `https://mta-sts.<domain>/.well-known/mta-sts.txt` saying "use TLS, with these MX hostnames, in `enforce` or `testing` mode," advertised via a `_mta-sts` TXT record. Senders cache and apply. URIports' early-2026 data shows adoption above 1% of the top million domains and steady year-over-year growth.

**DANE / TLSA for SMTP.** RFC 7672. Pins the receiving server's TLS certificate (or its issuer) in DNSSEC-signed TLSA records under `_25._tcp.<mx>`, eliminating the trust-on-first-use weakness of MTA-STS at the cost of requiring DNSSEC. [CaptainDNS](https://www.captaindns.com/en/blog/mta-sts-vs-dane)

**TLS-RPT.** RFC 8460. Receiving domains advertise an address (TXT at `_smtp._tls.<domain>`) where senders should report TLS negotiation failures; complementary to MTA-STS and DANE.

**BIMI.** Brand Indicators for Message Identification — a draft (not yet a numbered RFC) that lets domains publish a logo to display next to authenticated messages. Requires DMARC at quarantine/reject and (for Gmail and Apple Mail) a Verified Mark Certificate (VMC) or, since early 2025 in Gmail, a Common Mark Certificate (CMC). Apple stopped trusting Entrust-issued VMCs created after 15 November 2024 ([https://www.uriports.com/blog/bimi-2025-update/](https://www.uriports.com/blog/bimi-2025-update/)). [Validity](https://www.validity.com/blog/the-bimi-battle-an-analysis-on-bimi-adoption-and-implementation/)[URIports Blog](https://www.uriports.com/blog/bimi-2025-update/)

**SASL.** Simple Authentication and Security Layer, RFC 4422. The mechanism layer SMTP AUTH plugs into; PLAIN, LOGIN, CRAM-MD5, SCRAM-*, GSSAPI, EXTERNAL, and **XOAUTH2** (Google/Microsoft's OAuth-bearer mechanism) all live here.

**ESMTP extension framework.** RFC 5321 §2.2. The mechanism by which EHLO advertises capabilities and new verbs/parameters get added without breaking older servers — the reason SMTP could absorb 25+ extensions over four decades. [RFC Editor](https://www.rfc-editor.org/rfc/rfc5321.html)

**LMTP.** Local Mail Transfer Protocol, RFC 2033 (1996). A non-queueing variant of SMTP used between an MTA and the final-delivery MDA over a Unix socket or local TCP, returning per-recipient delivery status synchronously. Postfix↔Dovecot↔Cyrus deployments are typically LMTP-glued.

**Sieve.** RFC 5228 plus extensions (Vacation, Reject, Notifications, etc.). A small, side-effect-restricted server-side filtering language run by the MDA at delivery time. JMAP includes Sieve script management (RFC 9661). [RFC Editor](https://www.rfc-editor.org/rfc/rfc5228.html)

**PGP and S/MIME.** OpenPGP (RFC 9580, 2024) and S/MIME (RFC 8551) provide end-to-end content encryption and signing *inside* the MIME body. Orthogonal to SMTP transport security: SMTP carries them transparently. ProtonMail and Tutanota build on OpenPGP-style mechanisms and bridge to SMTP at their gateways.

**NTP.** Tangentially relevant: DKIM signature timestamp validation, MTA-STS policy expiry, TLS certificate validity, and DMARCbis's `t=y` testing all care about clocks. A skewed clock by hours can produce mysterious authentication failures.

## 5. Real-world deployment

**Implementations.**

- **Sendmail** — Eric Allman, 1981, BSD. Once 80% of the public mail servers (1996); recent surveys put it under 4%. Now a Proofpoint product since 2013 acquisition. Configuration via m4-generated `sendmail.cf` is famously difficult. Still ships on many Solaris and AIX environments. [Wikipedia](https://en.wikipedia.org/wiki/Sendmail)[Wikipedia](https://en.wikipedia.org/wiki/Sendmail)
- **Postfix** — Wietse Venema, IBM Watson, December 1998. Multi-process, privilege-separated, "secure mailer" design. Default MTA on most Linux distributions. Active maintenance through 2025. Famous for clean configuration syntax (`main.cf`, `master.cf`). [Wikipedia](https://en.wikipedia.org/wiki/Postfix_(software))
- **Exim** — Philip Hazel, University of Cambridge, 1995. The world's most-deployed MTA largely because it's the default on Debian/Ubuntu and inside cPanel/Plesk hosting stacks. Survey data places it above 50% of public MX banners. The 2019 *Return of the WIZard* and 2023 ZDI vulnerabilities battered its reputation.
- **qmail** — Daniel J. Bernstein (DJB), 1995–1998. Famous for the $500/$1000 security bounty ([https://cr.yp.to/qmail/guarantee.html](https://cr.yp.to/qmail/guarantee.html)). The official 1.03 codebase has not been updated in over 25 years; modern users run forks (netqmail, sagredo's qmail). [DJB + 2](https://cr.yp.to/qmail/guarantee.html)
- **OpenSMTPD** — Gilles Chehade, Eric Faurot, Charles Longeau (OpenBSD), 5.3 in 2013. Privilege-separated, simple `smtpd.conf` syntax. 7.8.0p1 March 2026 ([https://www.opensmtpd.org/](https://www.opensmtpd.org/)).
- **Microsoft Exchange / Exchange Online** — Originally an X.400/MAPI system; now SMTP-native internally. Exchange Online is the largest single email cluster on the planet by paying-customer count.
- **Halon** — Commercial high-throughput SMTP platform with Lua scripting; popular with ESPs.
- **Haraka** — Node.js SMTP server with a plugin model, used by Craigslist among others.
- **Cloud / API senders** — **Amazon SES** (since 2011), **Mailgun**, **Twilio SendGrid**, **Postmark** (deliverability-focused, transactional-only), **Resend** (developer-experience focused, since 2022). Each exposes both an HTTPS API and SMTP submission. Postmark publicly publishes time-to-inbox statistics; SendGrid and Mailgun handle the highest absolute volumes. [Vibe Coder Blog](https://blog.vibecoder.me/resend-vs-sendgrid-vs-postmark-email-services)[Postmark](https://postmarkapp.com/compare/sendgrid-alternative)
- **Receiver-side providers** — **Google Workspace / Gmail**, **Microsoft 365**, **Fastmail**, **Yahoo Mail**, **Proton Mail**, **Tutanota**, **iCloud Mail**, **Migadu**, **Zoho**.

**Deployment topologies.**

- **Edge MTA + smarthost** — Outbound mail leaves the application server via SMTP to a centralized "smarthost" (a hardened Postfix/Exim with TLS, DKIM signing, queueing) which then resolves MX and delivers. Inbound mail terminates at one or more edge MTAs that handle SPF/DMARC/anti-spam/anti-virus, then LMTP-hand the survivors to the mailbox cluster.
- **Fan-out architecture** — Bulk senders run pools of outbound MTAs across many IPs, each "warmed up" with a particular receiver to maintain reputation. Postfix can saturate "rates approaching 10 million messages an hour" given enough disk and network bandwidth and pre-arranged peer agreements (Wietse Venema, postfix-users, [https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)). The bottleneck is almost never your MTA; it is the receiver's per-IP rate limits and reputation systems. [Google Groups](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)
- **Queue runner** — Most MTAs split *receive*, *queue*, *delivery* into separate processes. Postfix has `qmgr`, `smtpd`, `smtp`/`lmtp`, `bounce`, `cleanup`. Operators monitor `mailq` depth, the active vs deferred queues, and per-destination concurrency.

**Performance characteristics with real numbers.** A single ~2003-era Dell 1850 with a battery-backed RAID controller and two SCSI disks delivered ~300 msgs/s of real-user mail under Postfix — Wietse Venema's published measurement ([https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)). On 2012-vintage commodity hardware Stefan Foerster reported 65 msgs/s without any tuning on a single SATA disk while watching 1080p video. Vendor PowerMTA-style claims of one million msgs/hour (≈278/s) are easily met or beaten by Postfix when the receiving side is cooperative. Postfix's default `smtpd_recipient_limit` is 1000 and `default_destination_concurrency_limit` is 20 ([https://www.postfix.org/TUNING_README.html](https://www.postfix.org/TUNING_README.html)); operators raise concurrency for relay-trust destinations and lower it for the public Internet. [Google Groups + 3](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)

**Volume context.** The Radicati Group (December 2024 update, via Statista) estimates **376 billion emails/day in 2025**, projected to **424 billion in 2026** ([https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/](https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/)). Roughly 45% is spam. [Statista](https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/)[Unboxd](https://unboxd.ai/blog/email-statistics.html)

## 6. Failure modes and famous incidents

**Morris Worm, November 2, 1988.** Robert Tappan Morris's worm infected ~6,000 of the ~60,000 hosts then on the Internet, in part by abusing **sendmail's DEBUG mode**, which let a remote SMTP client pipe data through a shell during DATA. The other vectors were a fingerd buffer overflow, weak passwords, and trust in `.rhosts`. The incident triggered the formation of CERT/CC and the first US Computer Fraud and Abuse Act conviction ([https://en.wikipedia.org/wiki/Morris_worm](https://en.wikipedia.org/wiki/Morris_worm); Rapid7 module documentation at [https://www.rapid7.com/db/modules/exploit/unix/smtp/morris_sendmail_debug/](https://www.rapid7.com/db/modules/exploit/unix/smtp/morris_sendmail_debug/)). [GitHub](https://github.com/rapid7/metasploit-framework/blob/master/documentation/modules/exploit/unix/smtp/morris_sendmail_debug.md)[InnoVirtuoso](https://innovirtuoso.com/cybersecurity/the-morris-worm-the-1988-bug-that-crashed-the-early-internet-and-changed-cybersecurity-forever/)

**The sendmail decade (late 1990s–2000s).** A long chain of CERT advisories (CA-1996-20, -24, -25; CA-1997-05; CA-2003-07/12/25; TA06-081A) hit sendmail. The UNIX-HATERS Handbook devoted an entire chapter to it. This pain is what produced Postfix and qmail.

**Exim — *The Return of the WIZard*, CVE-2019-10149.** Qualys disclosed (June 2019) an RCE in Exim 4.87–4.91 reachable via a malformed RCPT TO. Locally instant; remotely required keeping a connection open for ~7 days in the default config. Trivially weaponized against custom configurations and exploited en masse in the wild — the name nods to Sendmail's ancient WIZ and DEBUG bugs ([https://www.qualys.com/2019/06/05/cve-2019-10149/return-wizard-rce-exim.txt](https://www.qualys.com/2019/06/05/cve-2019-10149/return-wizard-rce-exim.txt)). [Vulners + 3](https://vulners.com/qualysblog/QUALYSBLOG:EE3A76FB5EA09543FF235E8362A83373)

**Exim ZDI cluster, September–October 2023.** ZDI publicly disclosed six bugs (CVE-2023-42114 through 42119) after a 15-month communication breakdown. **CVE-2023-42115** (CVSS 9.8) is an unauthenticated out-of-bounds write in the SMTP service when EXTERNAL auth is enabled. Exim 4.96.1/4.97 patched the three most critical issues on October 2, 2023 ([https://www.zerodayinitiative.com/advisories/ZDI-23-1469](https://www.zerodayinitiative.com/advisories/ZDI-23-1469); [https://arcticwolf.com/resources/blog/cve-2023-42115/](https://arcticwolf.com/resources/blog/cve-2023-42115/); ~3.5M Exim servers were exposed at disclosure time per BleepingComputer/SecurityAffairs).

**Microsoft Exchange — ProxyLogon, March 2021.** **CVE-2021-26855** (SSRF) chained with **CVE-2021-27065** (post-auth arbitrary file write) gave unauthenticated RCE on internet-facing Exchange Server. The HAFNIUM cluster, plus dozens of follow-on actors, compromised tens of thousands of organizations. Discovered by Orange Tsai of DEVCORE ([https://proxylogon.com/](https://proxylogon.com/), [https://www.praetorian.com/blog/reproducing-proxylogon-exploit/](https://www.praetorian.com/blog/reproducing-proxylogon-exploit/)). The successor **ProxyShell** (CVE-2021-34473/34523/31207, August 2021) extended the carnage. [GitHub](https://github.com/RickGeex/ProxyLogon)[ProxyLogon](https://proxylogon.com/)

**OpenSMTPD CVE-2020-7247 (January 2020) and CVE-2020-8794 (February 2020).** Two Qualys-reported RCEs in OpenSMTPD's `smtp_mailaddr()` and client-side code that ran arbitrary shell commands as root in default OpenBSD configurations. Both received same-week patches.

**Postfix — CVE-2023-51764 (SMTP smuggling, December 2023).** Postfix accepted `<LF>.<CR><LF>` as end-of-data while many counterparties did not, allowing an attacker to inject a second forged message inside a legitimate one and bypass SPF/DKIM/DMARC alignment. Mitigation requires `smtpd_forbid_bare_newline=normalize` and `smtpd_data_restrictions=reject_unauth_pipelining` ([https://ubuntu.com/security/CVE-2023-51764](https://ubuntu.com/security/CVE-2023-51764), [https://www.postfix.org/smtp-smuggling.html](https://www.postfix.org/smtp-smuggling.html)). Companion CVEs hit Sendmail (CVE-2023-51765) and Exim (CVE-2023-51766). Discovered by Timo Longin (SEC Consult), presented at 37C3, December 2023 ([https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide)); 3rd place in PortSwigger's Top 10 web hacking techniques of 2023. [SonicWall + 2](https://www.sonicwall.com/blog/smtp-smuggling)

**qmail security guarantee, 1997 → 2005, 2020.** DJB offered $500 (later $1000) for a verifiable security hole. He paid no bounty for Georgi Guninski's 2005 64-bit integer issue or for Qualys's 2020 follow-up, arguing both required configurations or memory limits unrealistic for normal use ([https://cr.yp.to/qmail/guarantee.html](https://cr.yp.to/qmail/guarantee.html), [https://seclists.org/oss-sec/2020/q2/139](https://seclists.org/oss-sec/2020/q2/139)). In 2026 Calif.io reported finding a remote command-execution hole in a popular *modern* qmail fork (sagredo) using an LLM-assisted audit, in a community patch that wasn't part of DJB's 1.03 codebase ([https://blog.calif.io/p/we-asked-claude-to-audit-sagredos](https://blog.calif.io/p/we-asked-claude-to-audit-sagredos)). [DJB + 2](https://cr.yp.to/qmail/guarantee.html)

**Spam history.** **April 12, 1994 — Canter & Siegel "Green Card spam".** Two Phoenix immigration lawyers used a Perl script to post commercial mail to ~5,500 Usenet groups. Their ISP's mail servers crashed for two days. They claimed $100k–$200k in revenue and wrote *How to Make a Fortune on the Information Superhighway* ([https://en.wikipedia.org/wiki/Laurence_Canter_and_Martha_Siegel](https://en.wikipedia.org/wiki/Laurence_Canter_and_Martha_Siegel); [https://www.cjr.org/critical_eye/original_sin.php](https://www.cjr.org/critical_eye/original_sin.php)). The first cancelbot followed weeks later. The 2003 Sobig and 2003–2005 Sober worms turned millions of consumer PCs into spam relays and motivated the eventual port-25 outbound block by ISPs. [Today I Found Out + 4](https://www.todayifoundout.com/index.php/2012/04/this-day-in-history-the-first-mass-commercial-internet-spam-campaign-is-launched/)

**Open-relay history.** Until the late 1990s most MTAs accepted and forwarded mail from anyone. The MAPS and ORBL blocklists, plus tightened defaults in sendmail 8.9 (1998) and Postfix from inception, ended that. Receivers now reject open relays at the SMTP banner.

**Mailing-list breakage from DMARC.** Yahoo's April 2014 move to `p=reject` broke every mailing list that didn't rewrite the From: header — listservs from IETF to LKML had to switch to From-munging or to ARC.

**Recent outages.** Gmail and Outlook have each had multi-hour SMTP-acceptance outages since 2024, generally rooted in authentication backends rather than SMTP itself. The November 2025 Gmail enforcement step from soft-fail to hard-reject produced a spike of permanent bounces for senders who had been ignoring 4xx DMARC warnings for nearly two years.

## 7. Fun facts and anecdotes

- **Why "Simple."** The "S" was a deliberate jab at X.400's complexity; SMTP was deliberately the smallest protocol that could move mail between heterogeneous hosts. Marshall Rose, on MIME's design, contrasted X.400's "blanket assumption that someday everything will be X.400" with the IETF's "assume an existing infrastructure" pragmatism ([https://buttondown.com/blog/x400-vs-smtp-email](https://buttondown.com/blog/x400-vs-smtp-email)). [Buttondown](https://buttondown.com/blog/x400-vs-smtp-email)
- **Postel's robustness principle.** "Be conservative in what you send, be liberal in what you accept" first appears in RFC 760 (1980) and is canonized in RFC 1122 §1.2.2. Eric Allman revisited it in *The Robustness Principle Reconsidered*, ACM Queue, 2011 ([https://queue.acm.org/detail.cfm?id=1999945](https://queue.acm.org/detail.cfm?id=1999945)). Martin Thomson's 2018–2023 IETF draft *The Harmful Consequences of the Robustness Principle* ([https://datatracker.ietf.org/doc/draft-thomson-postel-was-wrong/](https://datatracker.ietf.org/doc/draft-thomson-postel-was-wrong/)) argues the maxim entrenches deviations as de-facto standards, and recommends "maximally strict" implementations with continuous specification maintenance instead. The DMARCbis editors and the SMTP smuggling discoverer both cite it. [Devopedia + 2](https://devopedia.org/postel-s-law)
- **Eric Allman's quote.** Asked about sendmail by Berkeley historians, Allman recalled that Bill Joy told him, "We're going to need a mail program and you're the only one who knows how to write it." Allman: "If I had known how hard it would be I would have said, 'You're insane.'" ([https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/](https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/)). Allman later quipped: "There is some sort of perverse pleasure in knowing that it's basically impossible to send a piece of hate mail through the Internet without its being touched by a gay program" — Allman is openly gay and married to Marshall Kirk McKusick of BSD fame ([https://en.wikipedia.org/wiki/Eric_Allman](https://en.wikipedia.org/wiki/Eric_Allman)). [Internet Hall of Fame + 2](https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/)
- **The qmail bounty.** DJB's offer is a unicorn in software — a multi-decade public bug bounty paid out essentially never, with DJB defending qmail's security model line-by-line on his website to this day ([https://cr.yp.to/qmail/guarantee.html](https://cr.yp.to/qmail/guarantee.html)). A community group put up a separate $1000 prize, also unclaimed, and donated it to the FSF. [Liran Tal](https://lirantal.com/blog/making-500-from-open-source-software-108c134e2651)[DJB](https://cr.yp.to/qmail/guarantee.html)
- **RFC 2324 — HTCPCP.** The Hyper Text Coffee Pot Control Protocol (April 1, 1998) parodies HTTP and includes status code 418 "I'm a teapot." The mail-adjacent April-Fool-spirit RFC 1149 (IP over Avian Carriers) was actually implemented over Bergen, Norway in 2001 with a 64-byte ping and 55% packet loss.
- **Why MAIL FROM and RCPT TO use angle brackets.** Carried over from RFC 821; the brackets disambiguate the address from human-friendly text on the same line. Postel deliberately kept the syntax FTP-like.
- **The dot.** A line with a single `.` ending a DATA section is the oldest single-byte security hazard in active use — directly responsible for SMTP smuggling forty-one years after RFC 821.
- **"Be liberal" in the post-spam era.** Yahoo's Marcel Becker on the 2024 bulk-sender thresholds: spam-rate enforcement at 0.30% "is nothing new. We have always looked at these spam rates… If you're a good sender, your spam rates will be well below 0[.1]%" ([https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)).
- **"Yahoogle" → "Yahooglesoft."** Industry shorthand for the Yahoo+Google (Feb 2024) and then +Microsoft (May 2025) sender-requirements bloc.
- **Internet Hall of Fame.** Postel (posthumously, 2012), Allman (2014), Crocker (2012). Postel never fully accepted being called the "god of the Internet"; he edited every RFC personally and ran the IANA registries effectively single-handedly until his death in October 1998 at age 55.

## 8. Practical wisdom

**Defaults to be skeptical of.**

- Open submission on port 25 of an internal MTA — assume it will be probed.
- VRFY/EXPN — disable.
- TLS configurations that still allow TLS 1.0/1.1.
- Postfix's `smtpd_recipient_limit=1000` if you do not actually want a single transaction with 1,000 RCPT TOs.
- Default SPF that accepts `+all` (catastrophic); anything broader than `~all` should require justification.
- A DMARC `p=none` you set "for now" three years ago — that is not protection, it is reporting.
- STARTTLS without `smtp_tls_security_level=encrypt` for known-good destinations or MTA-STS/DANE enforcement.

**What to monitor.**

- **Queue depth** — `mailq | postfix-queue-size`, alert on >10k or sustained growth.
- **Deferral rate per destination** — track 4xx vs 5xx breakdown by recipient domain.
- **DMARC aggregate (RUA) reports** — you should be parsing these into a database and looking at unauthorized sending sources, alignment failures, and policy override counts.
- **TLS-RPT failure reports** — a domain with MTA-STS published is opting in to receiving them.
- **Blocklist status** — Spamhaus ZEN, Barracuda, SORBS, the major MBPs' postmaster portals (Google Postmaster Tools, Microsoft SNDS, Yahoo Sender Hub).
- **Spam-complaint rate** — Gmail and Yahoo enforce <0.30%, target <0.10% ([https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)). [Mailgun](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)
- **Per-IP reputation** in Google Postmaster Tools, especially after IP rotation.
- **DKIM key age** — rotate every 6–12 months; retire 1024-bit keys.
- **Bounce categorization** — soft (4xx) vs hard (5xx) should drive automatic suppression.

**Common debugging moves.**

- `dig +short MX example.com` — verify routing.
- `openssl s_client -starttls smtp -connect mx.example.com:25 -crlf` — manually drive a STARTTLS session, inspect cert chain.
- `openssl s_client -connect smtp.example.com:465 -crlf` — implicit TLS.
- `swaks --to test@example.com --server mx.example.com:25 --tls --auth PLAIN --auth-user u --auth-password p --h-Subject "test"` — Swiss Army Knife for SMTP, by John Jetmore ([https://jetmore.org/john/code/swaks/](https://jetmore.org/john/code/swaks/)). [Hostround + 2](https://www.hostround.com/one/knowledgebase/103/How-to-test-SMTP-using-Swaks.html)
- `msmtp -d --debug` — for the client side.
- `postqueue -p`, `postcat -q <id>`, `postsuper -d` — Postfix queue inspection.
- Sender Score / Mail-Tester / MXToolbox / hardenize.com / internet.nl / learndmarc.com — third-party diagnostics.
- For DMARC failures: enable `ruf` reports against a domain you control; correlate against your sending platforms.

**Common misconfigurations to actively look for.**

- Open relay: anyone-to-anywhere on port 25.
- SPF too permissive (`+all`) or with too many DNS lookups (>10 causes `permerror`; the 60% SPF-error rate among US `.gov` domains, despite BOD 18-01, is the canonical example, [https://autospf.com/blog/dmarc-adoption-benchmarks-by-industry-protection-gaps-and-sector-comparison/](https://autospf.com/blog/dmarc-adoption-benchmarks-by-industry-protection-gaps-and-sector-comparison/)).
- DKIM signing only on the apex but mail sent from `mailer.example.com` — `d=` mismatch breaks alignment.
- DMARC `p=reject` with `pct=100` enabled the day a marketing platform launches — break-glass without aggregate report review first.
- MX pointing at a host that doesn't have a matching forward+reverse PTR (Google rejects).
- TLS certificate hostname mismatch on an MX (`mx.example.com` cert presented for `example.com`).
- Running an internal mail server with public DNS pointers but no inbound DMARC policy on the parent domain.

## 9. Learning resources (current as of 2026)

**RFCs (current, with section pointers).**

- RFC 5321 (2008), §2–§4 — SMTP wire protocol; [https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321) (intermediate).
- draft-ietf-emailcore-rfc5321bis-44 (July 2025) — successor; [https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/) (advanced; in progress).
- RFC 5322 (2008) — Internet Message Format; [https://www.rfc-editor.org/rfc/rfc5322](https://www.rfc-editor.org/rfc/rfc5322) (intermediate).
- RFC 6409 (2011) — Message Submission, port 587; [https://www.rfc-editor.org/rfc/rfc6409](https://www.rfc-editor.org/rfc/rfc6409) (intermediate).
- RFC 8314 (2018) — implicit TLS / port 465 / cleartext deprecation; [https://www.rfc-editor.org/rfc/rfc8314](https://www.rfc-editor.org/rfc/rfc8314) (intermediate).
- RFC 6376 (2011) — DKIM; [https://datatracker.ietf.org/doc/html/rfc6376](https://datatracker.ietf.org/doc/html/rfc6376).
- RFC 7208 (2014) — SPF.
- RFC 7489 (2015) — DMARC; **DMARCbis** draft -41 is the active successor.
- RFC 8617 (2019) — ARC.
- RFC 8461 (2018) — MTA-STS; RFC 8460 — TLS-RPT; RFC 7672 — DANE for SMTP.
- RFC 6531/6532 (2012) — SMTPUTF8.
- RFC 3207 (2002) — STARTTLS; RFC 4954 — AUTH; RFC 6152 — 8BITMIME; RFC 3030 — CHUNKING/BINARYMIME; RFC 3461/3462/3463/3464 — DSN.
- RFC 9051 (2021) — IMAP4rev2; RFC 1939 — POP3; RFC 8620/8621 (2019) — JMAP Core/Mail; RFC 5228 — Sieve.

**Books.**

- *The Book of Postfix*, Hildebrandt & Koetter (No Starch Press) — still the canonical operator's manual (intermediate). [Linux.com](https://www.linux.com/news/postfix-performance-tuning/)
- *Postfix: The Definitive Guide*, Kyle Dent (O'Reilly).
- *Sendmail*, 3rd ed., Costales & Allman (O'Reilly) — historical but unmatched on m4. [eBay](https://www.ebay.com/itm/406561180131)
- *DNS and BIND*, 5th ed., Cricket Liu & Paul Albitz — DNS fundamentals, MX chapters.
- *Internet Mail*, Robert Jenkins (deprecated but useful for X.400 context).

**Engineering blog posts (2024–2026).**

- Fastmail, "Revision of the core email specifications," December 2024 ([https://www.fastmail.com/blog/revision-of-core-email-specifications/](https://www.fastmail.com/blog/revision-of-core-email-specifications/)) — readable summary of 5321bis.
- SEC Consult, Timo Longin, "SMTP Smuggling — Spoofing E-Mails Worldwide," December 2023 with 2024 updates ([https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/](https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/)).
- URIports, MTA-STS adoption surveys 2024/2025/2026 ([https://www.uriports.com/blog/mta-sts-survey-update-2026/](https://www.uriports.com/blog/mta-sts-survey-update-2026/)) and BIMI 2025 update ([https://www.uriports.com/blog/bimi-2025-update/](https://www.uriports.com/blog/bimi-2025-update/)).
- Mailgun, *State of Email Deliverability* ([https://www.mailgun.com/state-of-email-deliverability/](https://www.mailgun.com/state-of-email-deliverability/)).
- Postmark "Compare" pages, deliverability dashboards, and DMARC monitor.
- Microsoft Exchange Team Blog — basic-auth deprecation timeline ([https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)).
- Red Sift / EasyDMARC / dmarcian / Valimail / PowerDMARC adoption reports (referenced throughout §4 and §6).
- Cloudflare Learning Center, OWASP, and internet.nl writeups.

**Academic.**

- Durumeric et al., "Neither Snow Nor Rain Nor MITM: An Empirical Analysis of Email Delivery Security," IMC 2015 — still the foundational measurement paper.
- Lee et al., "Under the Hood of DANE Mismanagement in SMTP," USENIX Security 2022.
- Poddebniak et al., "Why TLS is Better Without STARTTLS," USENIX Security 2021.
- "Unraveling the Complexities of MTA-STS Deployment and Management in Securing Email," IMC 2025 ([https://dl.acm.org/doi/10.1145/3730567.3732916](https://dl.acm.org/doi/10.1145/3730567.3732916)).

**Talks and video.**

- Timo Longin, "SMTP Smuggling — Spoofing E-Mails Worldwide," 37C3 / Chaos Communication Congress, December 2023 ([https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide)). The DEF CON 31 (August 2023) version preceded full disclosure. [Media.CCC](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide)
- Longin, "SMTP Smuggling Revisited," BSidesVienna 2024 ([https://cfp.bsidesvienna.at/bsv2024/speaker/GUADRQ/](https://cfp.bsidesvienna.at/bsv2024/speaker/GUADRQ/)).
- M3AAWG quarterly meeting recordings ([https://www.m3aawg.org/](https://www.m3aawg.org/)) — operator-level deliverability practice.

**Hands-on tools.**

- MXToolbox ([https://mxtoolbox.com/](https://mxtoolbox.com/)) — MX, blocklist, SPF lookups.
- Mail-Tester ([https://www.mail-tester.com/](https://www.mail-tester.com/)) — deliverability scoring.
- Hardenize ([https://www.hardenize.com/](https://www.hardenize.com/)) and Internet.nl ([https://internet.nl/](https://internet.nl/)) — TLS / DMARC / DNSSEC / MTA-STS audits.
- learndmarc.com — visualizer.
- Postmark DMARC monitor (free).
- Hurricane Electric BGP toolkit ([https://bgp.he.net/](https://bgp.he.net/)) — for IP reputation context.
- swaks ([https://jetmore.org/john/code/swaks/](https://jetmore.org/john/code/swaks/)), msmtp, openssl s_client.

## 10. Where things are heading (2025–2026 frontier)

**EMAILCORE WG.** RFC 5321bis and 5322bis are nearing publication as Internet Standards. They are maintenance-only — corrections, errata, an Applicability Statement — not a redesign. The most quotable thing about them is that the same editors (Klensin, Resnick) have shepherded the spec across three decades.

**DMARCbis.** Approved by the IESG, awaiting failure-reporting companion publication, expected in 2026 as Standards Track, replacing RFC 7489 and 9091. Removes the brittle Public Suffix List in favor of a DNS Tree Walk; tightens external-destination verification; adds `np` (non-existent subdomain policy) to close a real attack vector. [IRONSCALES + 2](https://ironscales.com/glossary/what-is-dmarc-2.0-dmarcbis)

**DKIM2.** The motivation draft ([https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)) is the first serious revisit of DKIM since 2011. Goals: defeat replay by signing the next-hop recipient and adding mandatory timestamps; standardize a forwarding chain with explicit "I touched this" signatures; introduce a change-algebra so headers can be rewritten by mailing lists without invalidating signatures; provision for post-quantum signatures. Production timelines are speculative — the *motivation* is on the IETF stream as of November 2025, not the protocol itself. [IETF + 2](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)

**ARC adoption.** Required de facto by Gmail when handling forwarded mail; Google explicitly recommends it for forwarders.

**Bulk-sender enforcement is the actual deployment story.** Google moved from soft to permanent rejection in November 2025; Microsoft enforced from May 2025; Apple has signaled but not enforced; Yahoo continues to tighten. The result is the largest forced authentication wave in email history: EasyDMARC reports DMARC records on **937,931 of 1.8M analyzed domains in early 2026** (52.1%) versus 27.2% in 2023 ([https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/](https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/)), but **only ~9% combine enforcement with reporting**; Red Sift's December 2025 sweep across 73.3M domains found just **2.5% at p=reject**. The gap between "publishes a record" and "is actually protected" is the central unfinished business. [EasyDMARC + 2](https://easydmarc.com/blog/ebook/dmarc-adoption-report-2026)

**Cleartext SMTP submission.** Effectively dead at the major providers — Microsoft and Google both require XOAUTH2 (Microsoft's hard cutoff slipped to December 2026 for new tenants and H2 2027 for the final removal; Google's "less secure apps" cutoff was March 14, 2025). Port 25 from end-user clients to ISP outbound has been blocked at most consumer ISPs since the 2000s; new application code should target 587/STARTTLS or 465/implicit TLS, with OAuth2 bearer tokens. [Microsoft Community Hub](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)[Mailbird](https://www.getmailbird.com/microsoft-modern-authentication-enforcement-email-guide/)

**JMAP.** Used in production at Fastmail, Apache James, Cyrus, and Stalwart; Thunderbird is rolling out support (iOS first). Calendars draft is in the RFC Editor queue. JMAP does not displace SMTP for inter-server transport; it competes with IMAP/POP for client↔server access. [SysTools Group](https://www.systoolsgroup.com/updates/what-is-jmap/)[JMAP](https://jmap.io/spec.html)

**Encrypted-by-default providers.** Proton and Tutanota use OpenPGP (or Tuta-specific) E2E inside the MIME body; SMTP carries them transparently. They terminate at gateways that interoperate with the rest of the world over plain SMTP+TLS.

**AI/ML for spam filtering.** Gmail's spam filter blocks over 100 million phishing emails per day per Google's reporting; the FBI IC3 2025 report logged **22,364 AI-enabled cybercrime complaints with $893M in losses** as a new distinct category. The arms race now centers on LLM-generated phishing copy and voice/deepfake phishing that bypass content classifiers; defenders lean on sender-reputation, behavioral, and graph-based signals more than content. Expect this to push DMARC enforcement and BIMI adoption further as visible "this is from a known sender" signals. [Unboxd](https://unboxd.ai/blog/email-statistics.html)[DMARC Report](https://dmarcreport.com/blog/the-dmarc-adoption-2026-domains-records-only-9-percent-protected)

**Deliverability as the new operational discipline.** Sending mail that *technically* leaves your server is trivial; sending mail that arrives in the inbox at scale now requires DMARC alignment, IP warming, complaint-rate management, list-unsubscribe headers, RFC 5322 strictness, and continuous postmaster-tools monitoring. The discipline is real and increasingly hireable.

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook.**

> Every minute, four million emails leave for somewhere. Most of them ride a protocol that Jon Postel froze in August 1982, in a document so short you can read it in an afternoon. SMTP is older than the World Wide Web. It is older than DNS as we know it. It was designed for fifty universities that knew each other by name, and it now carries 376 billion messages a day across a planet that does not. It has no idea who you are; that is bolted on. It has no idea if you are lying about who sent the message; that is bolted on. It has no idea if anyone read it; that, too, is bolted on. And in 2023, a researcher in Vienna noticed that a single character — a line ending nobody had thought about — could make millions of mail servers disagree about where a message ends, letting an attacker forge mail from microsoft.com that passes every modern check. SMTP is the protocol nobody designed for the world it built.

**Striking statistic.**

- **376 billion emails per day in 2025; ~424 billion projected for 2026** (Radicati Group via Statista, [https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/](https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/)). Roughly 45% is spam. That means roughly **2 million SMTP transactions every second** worldwide.
- Pair: **only ~2.5% of 73.3 million scanned domains have DMARC at `p=reject`** (Red Sift, December 2025). The protocol that secures the global inbox is widely *published* and rarely *enforced*.

**Pause-and-think moment.**

> Port 25 has not had its protocol meaningfully redesigned since 1982. The current Internet Standard, RFC 5321, is a 2008 cleanup of a 2001 cleanup of the original. The IETF working group rewriting it right now, EMAILCORE, has an explicit charter that says: do not redesign anything. Just fix typos. The protocol routing 376 billion messages a day is in maintenance mode by policy. Everything modern about email — TLS, authentication, anti-spam, anti-phishing — is a lean-to built against the side of an 80s farmhouse.

Source: EMAILCORE charter ([https://datatracker.ietf.org/wg/emailcore/about/](https://datatracker.ietf.org/wg/emailcore/about/)); RFC 5321 ([https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321)); draft-ietf-emailcore-rfc5321bis-44 ([https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/)).

**Failure-story arc — SMTP smuggling.**

- *Setup.* It is mid-2023. Timo Longin, a security consultant at SEC Consult in Vienna, has been poking at internet protocols nobody else looks at. He has already published DNS attacks; now he is staring at SMTP. He notices that RFC 5321 says a message ends with `<CR><LF>.<CR><LF>` — and that no two mail servers seem to agree on what to do with the slightly-wrong variants like `<LF>.<CR><LF>`.
- *Mistake.* Decades of "be liberal in what you accept" produced an ecosystem where Postfix, Sendmail, Exim, Microsoft Exchange Online, Cisco Secure Email Gateway, and GMX each made small, individually defensible choices. Together those choices interlocked into a contradiction: an outbound server would see one message, the inbound server would see *two*.
- *Consequence.* Longin demonstrated that he could send an email "from [admin@microsoft.com](mailto:admin@microsoft.com)" to a Fortune 500 company that passed SPF, DKIM, and DMARC, because the smuggled second message inherited the trust of the legitimate first one. Affected populations were estimated in the millions of domains — every domain with SPF pointing at Exchange Online, every domain hosted at GMX or Ionos.
- *Resolution.* Responsible disclosure to Microsoft (May 2023), GMX (fixed in ~10 days, with a bounty), Cisco (declared "feature, not bug"). Public disclosure December 18, 2023 (SEC Consult blog) and at 37C3 December 27, 2023. CVE-2023-51764/65/66 assigned to Postfix, Sendmail, Exim. Postfix shipped `smtpd_forbid_bare_newline` and `smtpd_data_restrictions=reject_unauth_pipelining` mitigations across 3.5.23, 3.6.13, 3.7.9, 3.8.4, 3.9. PortSwigger named it the #3 web hacking technique of 2023 (a non-web bug, on a podium otherwise full of HTTP stack tricks). The lesson: forty-one years after Postel chose `<CR><LF>.<CR><LF>`, the most consequential email vulnerability of the year was a disagreement about a single byte.

Sources: [https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/](https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/); [https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide); [https://ubuntu.com/security/CVE-2023-51764](https://ubuntu.com/security/CVE-2023-51764); [https://www.postfix.org/smtp-smuggling.html](https://www.postfix.org/smtp-smuggling.html); [https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html](https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html).

## 12. Citations

1. RFC 821, *Simple Mail Transfer Protocol*, J. Postel, August 1982 — [https://www.rfc-editor.org/rfc/rfc821](https://www.rfc-editor.org/rfc/rfc821)
2. RFC 5321, *Simple Mail Transfer Protocol*, J. Klensin, October 2008 — [https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321)
3. RFC 5322, *Internet Message Format*, P. Resnick, October 2008 — [https://www.rfc-editor.org/rfc/rfc5322](https://www.rfc-editor.org/rfc/rfc5322)
4. RFC 822, *Standard for the Format of ARPA Internet Text Messages*, D. Crocker, August 1982 — [https://www.rfc-editor.org/rfc/rfc822](https://www.rfc-editor.org/rfc/rfc822)
5. EMAILCORE WG charter — [https://datatracker.ietf.org/wg/emailcore/about/](https://datatracker.ietf.org/wg/emailcore/about/)
6. draft-ietf-emailcore-rfc5321bis-44 — [https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/](https://datatracker.ietf.org/doc/draft-ietf-emailcore-rfc5321bis/)
7. Fastmail blog, "Revision of the core email specifications," December 2024 — [https://www.fastmail.com/blog/revision-of-core-email-specifications/](https://www.fastmail.com/blog/revision-of-core-email-specifications/)
8. RFC 6409, *Message Submission for Mail* — [https://www.rfc-editor.org/rfc/rfc6409](https://www.rfc-editor.org/rfc/rfc6409)
9. RFC 8314, *Cleartext Considered Obsolete: Use of TLS for Email Submission and Access* — [https://www.rfc-editor.org/rfc/rfc8314](https://www.rfc-editor.org/rfc/rfc8314)
10. RFC 3207, *SMTP Service Extension for Secure SMTP over TLS* — [https://datatracker.ietf.org/doc/html/rfc3207](https://datatracker.ietf.org/doc/html/rfc3207)
11. RFC 4954, *SMTP Service Extension for Authentication* — [https://datatracker.ietf.org/doc/html/rfc4954](https://datatracker.ietf.org/doc/html/rfc4954)
12. RFC 6152, *SMTP Service Extension for 8-bit MIME Transport* — [https://datatracker.ietf.org/doc/html/rfc6152](https://datatracker.ietf.org/doc/html/rfc6152)
13. RFC 3030, *SMTP Service Extensions for Transmission of Large and Binary MIME Messages* — [https://datatracker.ietf.org/doc/html/rfc3030](https://datatracker.ietf.org/doc/html/rfc3030)
14. RFC 2920, *SMTP Service Extension for Command Pipelining* — [https://datatracker.ietf.org/doc/html/rfc2920](https://datatracker.ietf.org/doc/html/rfc2920)
15. RFC 1870, *SMTP Service Extension for Message Size Declaration*
16. RFC 3461, *SMTP Service Extension for Delivery Status Notifications* — [https://datatracker.ietf.org/doc/html/rfc3461](https://datatracker.ietf.org/doc/html/rfc3461)
17. RFC 3464, *An Extensible Message Format for Delivery Status Notifications* — [https://datatracker.ietf.org/doc/html/rfc3464](https://datatracker.ietf.org/doc/html/rfc3464)
18. RFC 6531, *SMTP Extension for Internationalized Email* — [https://datatracker.ietf.org/doc/html/rfc6531](https://datatracker.ietf.org/doc/html/rfc6531)
19. RFC 7505, *A "Null MX" No Service Resource Record for Domains That Accept No Mail*
20. RFC 1939, *Post Office Protocol — Version 3* — [https://datatracker.ietf.org/doc/html/rfc1939](https://datatracker.ietf.org/doc/html/rfc1939)
21. RFC 9051, *IMAP4rev2*
22. RFC 8620, *JMAP Core* — [https://datatracker.ietf.org/doc/html/rfc8620](https://datatracker.ietf.org/doc/html/rfc8620)
23. RFC 8621, *JMAP for Mail* — [https://datatracker.ietf.org/doc/html/rfc8621](https://datatracker.ietf.org/doc/html/rfc8621)
24. JMAP specifications site — [https://jmap.io/spec.html](https://jmap.io/spec.html)
25. Fastmail JMAP announcement — [https://www.fastmail.com/blog/jmap-new-email-open-standard/](https://www.fastmail.com/blog/jmap-new-email-open-standard/)
26. RFC 2045–2049, *MIME* — [https://www.rfc-editor.org/rfc/rfc2045](https://www.rfc-editor.org/rfc/rfc2045)
27. RFC 6376, *DKIM Signatures* — [https://datatracker.ietf.org/doc/html/rfc6376](https://datatracker.ietf.org/doc/html/rfc6376)
28. RFC 7208, *Sender Policy Framework*
29. RFC 7489, *DMARC*
30. draft-ietf-dmarc-dmarcbis-41, April 2025 — [https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/](https://datatracker.ietf.org/doc/draft-ietf-dmarc-dmarcbis/)
31. RFC 8617, *Authenticated Received Chain*
32. RFC 8461, *MTA-STS*
33. RFC 8460, *TLS-RPT*
34. RFC 7672, *DANE for SMTP*
35. RFC 4422, *SASL*
36. RFC 2033, *LMTP*
37. RFC 5228, *Sieve* — [https://www.rfc-editor.org/rfc/rfc5228.html](https://www.rfc-editor.org/rfc/rfc5228.html)
38. draft-ietf-dkim-dkim2-motivation — [https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-motivation/)
39. RFC 1122, *Requirements for Internet Hosts* — [https://datatracker.ietf.org/doc/html/rfc1122](https://datatracker.ietf.org/doc/html/rfc1122)
40. RFC 9293, *TCP*
41. RFC 8446, *TLS 1.3*
42. RFC 8996, deprecation of TLS 1.0/1.1
43. RFC 1035, *DNS*
44. IANA service-name registry — [https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)
45. Postel biography — [https://www.historytools.org/people/jon-postel-complete-biography](https://www.historytools.org/people/jon-postel-complete-biography)
46. Connected.app, "Port 25: SMTP" — [https://www.connected.app/ports/25](https://www.connected.app/ports/25)
47. History of the SMTP protocol — [https://historyofdomainnames.com/smtp-the-history-of-domain-names/](https://historyofdomainnames.com/smtp-the-history-of-domain-names/)
48. Faraday Email, "The history of email" — [https://faraday.email/blog/history-of-email](https://faraday.email/blog/history-of-email)
49. Buttondown, "Email could have been X.400 times better" — [https://buttondown.com/blog/x400-vs-smtp-email](https://buttondown.com/blog/x400-vs-smtp-email)
50. Wikipedia, *X.400* — [https://en.wikipedia.org/wiki/X.400](https://en.wikipedia.org/wiki/X.400)
51. Eric Allman Wikipedia — [https://en.wikipedia.org/wiki/Eric_Allman](https://en.wikipedia.org/wiki/Eric_Allman)
52. Internet Hall of Fame, Allman — [https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/](https://www.internethalloffame.org/2017/10/17/sendmail-creator-eric-allman-brings-email-masses/)
53. ACM, "People of ACM: Eric Allman" — [https://www.acm.org/articles/people-of-acm/2014/eric-allman](https://www.acm.org/articles/people-of-acm/2014/eric-allman)
54. Wikipedia, *Sendmail* — [https://en.wikipedia.org/wiki/Sendmail](https://en.wikipedia.org/wiki/Sendmail)
55. Wikipedia, *Postfix (software)* — [https://en.wikipedia.org/wiki/Postfix_(software)](https://en.wikipedia.org/wiki/Postfix_(software))
56. Wietse Venema biography — [https://en.wikipedia.org/wiki/Wietse_Venema](https://en.wikipedia.org/wiki/Wietse_Venema)
57. cr.yp.to qmail security guarantee — [https://cr.yp.to/qmail/guarantee.html](https://cr.yp.to/qmail/guarantee.html)
58. Calif.io, "We asked Claude to audit Sagredo's qmail" — [https://blog.calif.io/p/we-asked-claude-to-audit-sagredos](https://blog.calif.io/p/we-asked-claude-to-audit-sagredos)
59. OpenSMTPD project — [https://www.opensmtpd.org/](https://www.opensmtpd.org/)
60. OpenSMTPD release history — [https://github.com/OpenSMTPD/OpenSMTPD/blob/master/CHANGES.md](https://github.com/OpenSMTPD/OpenSMTPD/blob/master/CHANGES.md)
61. Wikipedia, *OpenSMTPD* — [https://en.wikipedia.org/wiki/OpenSMTPD](https://en.wikipedia.org/wiki/OpenSMTPD)
62. Wikipedia, *Morris worm* — [https://en.wikipedia.org/wiki/Morris_worm](https://en.wikipedia.org/wiki/Morris_worm)
63. Rapid7 Morris-sendmail-debug module — [https://www.rapid7.com/db/modules/exploit/unix/smtp/morris_sendmail_debug/](https://www.rapid7.com/db/modules/exploit/unix/smtp/morris_sendmail_debug/)
64. Qualys advisory CVE-2019-10149 — [https://www.qualys.com/2019/06/05/cve-2019-10149/return-wizard-rce-exim.txt](https://www.qualys.com/2019/06/05/cve-2019-10149/return-wizard-rce-exim.txt)
65. Arctic Wolf, CVE-2023-42115 — [https://arcticwolf.com/resources/blog/cve-2023-42115/](https://arcticwolf.com/resources/blog/cve-2023-42115/)
66. Wiz, Exim 0day write-up — [https://www.wiz.io/blog/exim-zero-day-vulnerabilities](https://www.wiz.io/blog/exim-zero-day-vulnerabilities)
67. ZDI advisory ZDI-23-1469 — [https://www.zerodayinitiative.com/advisories/ZDI-23-1469](https://www.zerodayinitiative.com/advisories/ZDI-23-1469)
68. ProxyLogon site — [https://proxylogon.com/](https://proxylogon.com/)
69. Praetorian ProxyLogon write-up — [https://www.praetorian.com/blog/reproducing-proxylogon-exploit/](https://www.praetorian.com/blog/reproducing-proxylogon-exploit/)
70. SEC Consult, SMTP Smuggling — [https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/](https://sec-consult.com/blog/detail/smtp-smuggling-spoofing-e-mails-worldwide/)
71. Timo Longin 37C3 talk — [https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide](https://media.ccc.de/v/37c3-11782-smtp_smuggling_spoofing_e-mails_worldwide)
72. CSO Online, SMTP smuggling — [https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html](https://www.csoonline.com/article/1269779/smtp-smuggling-enables-email-spoofing-while-passing-security-checks.html)
73. Ubuntu CVE-2023-51764 — [https://ubuntu.com/security/CVE-2023-51764](https://ubuntu.com/security/CVE-2023-51764)
74. Postfix smtp-smuggling page — [https://www.postfix.org/smtp-smuggling.html](https://www.postfix.org/smtp-smuggling.html)
75. Wikipedia, *Canter and Siegel* — [https://en.wikipedia.org/wiki/Laurence_Canter_and_Martha_Siegel](https://en.wikipedia.org/wiki/Laurence_Canter_and_Martha_Siegel)
76. Columbia Journalism Review, "Original Sin" — [https://www.cjr.org/critical_eye/original_sin.php](https://www.cjr.org/critical_eye/original_sin.php)
77. Mailgun, "Yahoogle: New Bulk Sender Requirements" — [https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/](https://www.mailgun.com/state-of-email-deliverability/chapter/yahoogle-bulk-senders/)
78. Email Warmup, Gmail/Yahoo bulk-sender requirements 2026 — [https://emailwarmup.com/blog/email-deliverability/gmail-and-yahoo-bulk-sender-requirements/](https://emailwarmup.com/blog/email-deliverability/gmail-and-yahoo-bulk-sender-requirements/)
79. Higher Logic, bulk-sender requirements — [https://support.higherlogic.com/hc/en-us/articles/21639835567124-New-Bulk-Sender-Requirements](https://support.higherlogic.com/hc/en-us/articles/21639835567124-New-Bulk-Sender-Requirements)
80. Unboxd, bulk-sender requirements complete guide 2026 — [https://unboxd.ai/blog/bulk-sender-requirements.html](https://unboxd.ai/blog/bulk-sender-requirements.html)
81. Microsoft Tech Community, "Updated Exchange Online SMTP AUTH Basic Authentication Deprecation Timeline" — [https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)
82. Microsoft Tech Community, original SMTP AUTH retirement post — [https://techcommunity.microsoft.com/blog/exchange/exchange-online-to-retire-basic-auth-for-client-submission-smtp-auth/4114750](https://techcommunity.microsoft.com/blog/exchange/exchange-online-to-retire-basic-auth-for-client-submission-smtp-auth/4114750)
83. URIports, MTA-STS three-year survey 2026 — [https://www.uriports.com/blog/mta-sts-survey-update-2026/](https://www.uriports.com/blog/mta-sts-survey-update-2026/)
84. URIports, MTA-STS 2024 survey — [https://www.uriports.com/blog/mta-sts-survey-2024/](https://www.uriports.com/blog/mta-sts-survey-2024/)
85. Zivver, "Use of Email Security Standards in the Netherlands, September 2025" — [https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts](https://www.zivver.com/blog/use-of-email-security-standards-in-the-netherlands-september-2025-only-14-dane-6-mta-sts)
86. ACM IMC 2025, "Unraveling MTA-STS Deployment" — [https://dl.acm.org/doi/10.1145/3730567.3732916](https://dl.acm.org/doi/10.1145/3730567.3732916)
87. URIports, BIMI 2025 update — [https://www.uriports.com/blog/bimi-2025-update/](https://www.uriports.com/blog/bimi-2025-update/)
88. Validity, "BIMI Battle" — [https://www.validity.com/blog/the-bimi-battle-an-analysis-on-bimi-adoption-and-implementation/](https://www.validity.com/blog/the-bimi-battle-an-analysis-on-bimi-adoption-and-implementation/)
89. EasyDMARC 2026 Adoption Report — [https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/](https://easydmarc.com/blog/easydmarc-releases-2026-dmarc-adoption-report/)
90. Red Sift global DMARC adoption guide — [https://redsift.com/guides/red-sifts-guide-to-global-dmarc-adoption](https://redsift.com/guides/red-sifts-guide-to-global-dmarc-adoption)
91. AutoSPF, DMARC adoption benchmarks — [https://autospf.com/blog/dmarc-adoption-benchmarks-by-industry-protection-gaps-and-sector-comparison/](https://autospf.com/blog/dmarc-adoption-benchmarks-by-industry-protection-gaps-and-sector-comparison/)
92. Postfix Tuning README — [https://www.postfix.org/TUNING_README.html](https://www.postfix.org/TUNING_README.html)
93. Postfix Bottleneck Analysis (QSHAPE) — [https://www.postfix.org/QSHAPE_README.html](https://www.postfix.org/QSHAPE_README.html)
94. Postfix bulk-mailing performance discussion — [https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA](https://groups.google.com/g/mailing.postfix.users/c/pPcRJFJmdeA)
95. Statista, daily emails 2018–2028 — [https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/](https://www.statista.com/statistics/456500/daily-number-of-e-mails-worldwide/)
96. EmailToolTester, "How many emails are sent per day" — [https://www.emailtooltester.com/en/blog/how-many-emails-are-sent-per-day/](https://www.emailtooltester.com/en/blog/how-many-emails-are-sent-per-day/)
97. Unboxd, "50+ Email Statistics for 2026" — [https://unboxd.ai/blog/email-statistics.html](https://unboxd.ai/blog/email-statistics.html)
98. Eric Allman, "The Robustness Principle Reconsidered," ACM Queue 2011 — [https://queue.acm.org/detail.cfm?id=1999945](https://queue.acm.org/detail.cfm?id=1999945)
99. Martin Thomson, *The Harmful Consequences of the Robustness Principle* — [https://datatracker.ietf.org/doc/draft-thomson-postel-was-wrong/](https://datatracker.ietf.org/doc/draft-thomson-postel-was-wrong/)
100. Wikipedia, *Robustness principle* — [https://en.wikipedia.org/wiki/Robustness_principle](https://en.wikipedia.org/wiki/Robustness_principle)
101. Swaks site — [https://jetmore.org/john/code/swaks/](https://jetmore.org/john/code/swaks/)
102. Wikipedia, *Swaks* — [https://en.wikipedia.org/wiki/Swaks](https://en.wikipedia.org/wiki/Swaks)
103. RFC 6376 (DKIM) — [https://datatracker.ietf.org/doc/html/rfc6376](https://datatracker.ietf.org/doc/html/rfc6376)
104. RFC 8058 (One-Click Unsubscribe)
105. PowerDMARC, Norway 2025 report — [https://powerdmarc.com/norway-dmarc-adoption-report/](https://powerdmarc.com/norway-dmarc-adoption-report/)
106. DMARC Report, "State of DMARC Adoption in 2026" — [https://dmarcreport.com/blog/the-dmarc-adoption-2026-domains-records-only-9-percent-protected](https://dmarcreport.com/blog/the-dmarc-adoption-2026-domains-records-only-9-percent-protected)
107. PowerDMARC, "Bulk Email Sender Rules" — [https://powerdmarc.com/bulk-email-sender-requirements/](https://powerdmarc.com/bulk-email-sender-requirements/)
108. SonicWall, SMTP Smuggling — [https://www.sonicwall.com/blog/smtp-smuggling](https://www.sonicwall.com/blog/smtp-smuggling)
109. Wikipedia, *Email address* — [https://en.wikipedia.org/wiki/Email_address](https://en.wikipedia.org/wiki/Email_address)
110. Wikipedia, *International email* — [https://en.wikipedia.org/wiki/International_email](https://en.wikipedia.org/wiki/International_email)
111. RFC 7672 (DANE for SMTP) — [https://www.rfc-editor.org/rfc/rfc7672](https://www.rfc-editor.org/rfc/rfc7672)

**Caveats.** Some statistics in §5–§6 (Postfix throughput, Exim deployment share, BIMI adoption) come from blog posts and operator surveys rather than peer-reviewed measurement; figures vary across sources and over time, and I have noted source and date with each claim. The DMARC enforcement numbers diverge between the EasyDMARC 1.8M sample (52% adoption, 9% with reporting+enforcement) and the Red Sift 73.3M sample (14.9% adoption, 2.5% at reject), reflecting sampling differences — the smaller dataset is biased toward more popular and better-managed domains. The DMARCbis, 5321bis, and DKIM2 publication dates are projections based on the May 2026 state of the IETF queue and are subject to change; I have flagged drafts as drafts throughout. The user-supplied claim that SMTP "typically runs on default port 587" is corrected in §3 — port 25 remains the canonical MTA-to-MTA port; 587 is submission with STARTTLS; 465 is submission with implicit TLS; "default" depends entirely on role.