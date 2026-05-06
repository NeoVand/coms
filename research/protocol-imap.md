---
prompt_source: deep-research-prompts.txt:8624-8802 (PROTOCOL · IMAP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/b198c73a-b6e9-4428-b697-dff0cd1a0d80
research_mode: claude.ai Research
---

# The Internet Message Access Protocol (IMAP): A Deep Research Report

## Prerequisites and glossary

This section defines every term you need before IMAP itself makes sense. IMAP is an application-layer text protocol that runs on top of a TCP connection (usually wrapped in TLS), using MIME-encoded messages and SASL-based authentication. If any of those words are unfamiliar, start here.

**Networking primitives**

- **OSI / TCP-IP stack layers** — IMAP lives at the *application layer* (layer 7 in OSI; layer 4 in the simpler TCP/IP model). It rides on TCP (transport layer), which rides on IP (network/internet layer), which rides on Ethernet/Wi-Fi (link layer). RFC 9051 §2.1 says "IMAP4rev2 protocol assumes a reliable data stream such as that provided by TCP." ([https://datatracker.ietf.org/doc/html/rfc9051](https://datatracker.ietf.org/doc/html/rfc9051)) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9051.pdf)
- **TCP (Transmission Control Protocol)** — Provides a *reliable, ordered, byte-stream* abstraction between two endpoints. IMAP relies on TCP for in-order delivery of every byte; it does not have its own retransmission. ([https://datatracker.ietf.org/doc/html/rfc9293](https://datatracker.ietf.org/doc/html/rfc9293))
- **Datagram vs. stream vs. frame** — A *datagram* is a self-contained packet (UDP). A *stream* is a continuous sequence of bytes with no inherent message boundaries (TCP — what IMAP uses). A *frame* is a layer-2 unit on the wire (Ethernet). IMAP commands and responses are not frames; they are CRLF-delimited lines inside a TCP stream.
- **Socket** — The OS handle on each end of a TCP connection (an IP address + port pair on the local side, plus the remote pair). When an IMAP client "connects," it opens a TCP socket to `imap.example.com:993`.
- **Port** — A 16-bit number identifying which service the TCP connection is for. IMAP cleartext = 143, IMAPS (implicit TLS) = 993. (RFC 8314, [https://datatracker.ietf.org/doc/html/rfc8314](https://datatracker.ietf.org/doc/html/rfc8314)) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9051.pdf)[Open Port Checkers](https://openportcheckers.com/blog/port-143-imap-open-closed)
- **Header** — In email: name-value lines at the top of an RFC 5322 message (`From:`, `Subject:`, etc.). In TCP/IP: per-layer metadata prepended to each PDU. IMAP itself has no headers; it is line-oriented commands and responses.
- **Checksum** — A short value computed from data to detect corruption. TCP carries a 16-bit checksum. IMAP relies on TLS for cryptographic integrity; it has no checksum of its own.
- **Handshake** — A multi-step exchange to set up a session. Examples: TCP three-way handshake (SYN → SYN-ACK → ACK); TLS handshake (ClientHello, ServerHello, certificate, key exchange).

**Cryptography**

- **TLS (Transport Layer Security)** — Successor to SSL; provides authentication, confidentiality, and integrity for a TCP connection. RFC 8314 (Jan 2018) declares cleartext mail submission/access *obsolete* and recommends Implicit TLS (port 993 for IMAP). ([https://www.rfc-editor.org/rfc/rfc8314.html](https://www.rfc-editor.org/rfc/rfc8314.html)) [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc8314.html)
- **STARTTLS** — Opportunistic TLS: client connects in cleartext to port 143 and issues `STARTTLS` to upgrade. Vulnerable to "STRIPTLS" / response injection if used carelessly (see Failure modes). ([https://nostarttls.secvuln.info/](https://nostarttls.secvuln.info/)) [Wikipedia](https://en.wikipedia.org/wiki/Opportunistic_TLS)
- **SASL (Simple Authentication and Security Layer)** — A pluggable authentication framework used inside IMAP's `AUTHENTICATE` command. (RFC 4422)
- **SASL mechanisms relevant to IMAP** — `PLAIN`, `LOGIN` (legacy), `CRAM-MD5`, `DIGEST-MD5` (deprecated), `SCRAM-SHA-1`, `SCRAM-SHA-256`, `GSSAPI` (Kerberos), `EXTERNAL` (TLS client cert), `OAUTHBEARER` (RFC 7628), and Google/Microsoft's pre-RFC `XOAUTH2`. ([https://www.rfc-editor.org/rfc/rfc7628.html](https://www.rfc-editor.org/rfc/rfc7628.html))

**Encodings**

- **ASCII** — 7-bit character set; the historical baseline of email.
- **UTF-8** — Variable-width encoding of all Unicode; mandatory in modern email (RFC 6532, RFC 9755). IMAP4rev2 uses Net-Unicode (UTF-8 NFC) for mailbox names. ([https://datatracker.ietf.org/doc/rfc9755/](https://datatracker.ietf.org/doc/rfc9755/)) [IETF](https://datatracker.ietf.org/doc/html/rfc9051)
- **UTF-7 (RFC 2152)** — A 7-bit-safe Unicode encoding. Largely obsolete except…
- **Modified UTF-7** — IMAP's mailbox-name encoding in IMAP4rev1. Uses `&` instead of `+` as the shift character (because `+` is common in Usenet group names, which were once exposed via IMAP) and `,` instead of `/` in the BASE64 alphabet (because `/` is the typical hierarchy separator). Defined in RFC 3501 §5.1.3. ([https://www.fetchmail.info/Mailbox-Names-UTF7.html](https://www.fetchmail.info/Mailbox-Names-UTF7.html)) [Ubuntu Manpages](https://manpages.ubuntu.com/manpages/bionic/man3/Encode::IMAPUTF7.3pm.html)[GitHub](https://github.com/Enough-Software/enough_mail/issues/69)
- **Base64** — Maps 3 binary bytes to 4 ASCII chars; used for SASL credentials and binary message parts. (RFC 4648) [Perl Documentation](https://perldoc.perl.org/MIME::Base64)
- **Quoted-printable** — Encodes mostly-ASCII text with a few non-ASCII bytes as `=XX` hex escapes. (RFC 2045)
- **MIME (RFC 2045–2049)** — Multipurpose Internet Mail Extensions; defines `Content-Type`, `Content-Transfer-Encoding`, multipart bodies, and how IMAP's `BODYSTRUCTURE` is built. ([https://www.rfc-editor.org/rfc/rfc2045.html](https://www.rfc-editor.org/rfc/rfc2045.html))

**IMAP-specific vocabulary** (all from RFC 9051)

- **Mailbox / folder** — A named container of messages on the server (e.g. `INBOX`, `Sent`, `Lists/IETF`).
- **Message** — A single RFC 5322 + MIME message stored in a mailbox.
- **Envelope** — Parsed `From`, `To`, `Cc`, `Subject`, `Date`, `Message-ID`, etc.; returned by `FETCH ENVELOPE`.
- **BODYSTRUCTURE** — Parsed MIME tree of the message; lets clients fetch only the parts they need.
- **Flags** — Per-message booleans. System flags begin with `\` (`\Seen`, `\Answered`, `\Flagged`, `\Deleted`, `\Draft`; `\Recent` is *deprecated in IMAP4rev2*). Server- and user-defined keywords (no `\`) are also supported. [Tech Invite](https://www.tech-invite.com/y90/tinv-ietf-rfc-9051.html)
- **Sequence number (MSN)** — 1-based position of a message in the currently selected mailbox. **Unstable** — re-numbered when other messages are expunged.
- **UID** — Per-mailbox unique identifier that, together with `UIDVALIDITY`, is stable across sessions.
- **UIDVALIDITY** — A 32-bit integer. If it changes between sessions, all UIDs the client cached are invalid and a full resync is required.
- **CAPABILITY** — Server-advertised list of supported features and extensions.
- **Tag** — Short alphanumeric prefix on each client command; the matching tagged response signals completion.

## History and story

**Origins (1985–1988).** IMAP was invented by **Mark Reed Crispin** (b. 19 July 1956, Camden NJ; d. 28 Dec 2012, Poulsbo WA) while he was a Systems Programmer at the Stanford Knowledge Systems Laboratory. The original "Interim Mail Access Protocol" (1986) had a Xerox Lisp Machine client and a TOPS-20 server; *no copies of that interim spec or its software are known to survive*. The Stanford-era motivation: POP made personal workstations download mail and then deal with file storage, hardware reliability, and per-machine addressing — Crispin argued mailboxes belonged on a *reliable repository* accessed by a (potentially flaky) workstation. ([https://en.wikipedia.org/wiki/Mark_Crispin](https://en.wikipedia.org/wiki/Mark_Crispin); [https://www.rfc-editor.org/rfc/rfc1064](https://www.rfc-editor.org/rfc/rfc1064)) [Wikipedia + 3](https://en.wikipedia.org/wiki/Mark_Crispin)

**IMAP2 → IMAP4rev2 timeline:**

- **RFC 1064 — IMAP2 (July 1988)**, M. Crispin. First publicly distributed version; introduced *command/response tagging*, the defining syntactic feature still used today. ([https://www.rfc-editor.org/rfc/rfc1064](https://www.rfc-editor.org/rfc/rfc1064)) [Lbl](https://ee.lbl.gov/rfc/rfc.html)[Horizon Electronics](https://horizonelectronics.com/internet-message-access-protocol/)
- **RFC 1176 — IMAP2, August 1990** (Experimental). Crispin's revised version; obsoletes RFC 1064. ([https://datatracker.ietf.org/doc/html/rfc1176](https://datatracker.ietf.org/doc/html/rfc1176)) [Icir + 2](https://www.icir.org/netdb/protocols/IMAP.html)
- **RFC 1203 — IMAP3, February 1991**, J. Rice. Counter-proposal to RFC 1176. *Never accepted by the marketplace.* The IESG reclassified RFC 1203 as **Historic in 1993**, and the IMAP Working Group used RFC 1176 (IMAP2) — not IMAP3 — as the basis for IMAP4. ([https://datatracker.ietf.org/doc/html/rfc1203](https://datatracker.ietf.org/doc/html/rfc1203); [https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol)) [Icir + 2](https://www.icir.org/netdb/protocols/IMAP.html)
- **IMAP2bis (1993, draft only)** — Added MIME body structures and `CREATE`/`DELETE`/`RENAME`/`APPEND`. Widely deployed (especially with Pine) but never an RFC. Documented retroactively in RFC 2061. ([https://datatracker.ietf.org/doc/html/rfc2061](https://datatracker.ietf.org/doc/html/rfc2061)) [BNC](https://www.networxsecurity.org/members-area/glossary/i/imap.html)[IETF](https://datatracker.ietf.org/doc/html/rfc2061.html)
- **RFC 1730 — IMAP4 (Dec 1994)**.
- **RFC 2060 — IMAP4rev1 (Dec 1996)**.
- **RFC 3501 — IMAP4rev1 (March 2003)** — the version that powered the entire 2003-2025 mail ecosystem.
- **RFC 9051 — IMAP4rev2 (August 2021)**, Melnikov & Leiba (eds.). Obsoletes RFC 3501. Folds mandatory extensions into the base spec, switches mailbox-name encoding from Modified UTF-7 to Net-Unicode (UTF-8 NFC), deprecates `\Recent`, deprecates `CHECK` and `LSUB`, and incorporates `ENABLE`, `LIST-EXTENDED`, `SPECIAL-USE`, `MOVE`, `LITERAL+`, `IDLE`, `NAMESPACE`, `ESEARCH`, `SASL-IR`, `STATUS=SIZE`, `UNSELECT`, `UIDPLUS`, `SEARCHRES`, and 64-bit message sizes. ([https://datatracker.ietf.org/doc/html/rfc9051](https://datatracker.ietf.org/doc/html/rfc9051))
- **RFC 9755 — IMAP Support for UTF-8 (March 2025)**. Replaces RFC 6855; brings IMAP4rev1 into syntactic alignment with IMAP4rev2. ([https://datatracker.ietf.org/doc/rfc9755/](https://datatracker.ietf.org/doc/rfc9755/)) [IETF](https://datatracker.ietf.org/doc/rfc9755/)[IETF](https://datatracker.ietf.org/doc/draft-ietf-extra-6855bis/)

**The people.** Crispin was the towering figure: he wrote UW-IMAP (one of the reference implementations of IMAP4rev1) at the University of Washington (1988–2008), co-created Pine (March 1992), wrote two April Fools' RFCs (RFC 1437, RFC 4042), forked UW-IMAP into Panda IMAP in May 2008, then joined Messaging Architects in August 2008 where he wrote a new IMAP server on a distributed mail store with the MIX format. His "Ten Commandments of How to Write an IMAP client" remains essential reading. **Alexey Melnikov** (Isode) and **Barry Leiba** (Futurewei, ex-IBM) are the editors of RFC 9051 and the principal stewards of modern IMAP. **Bron Gondwana** (Fastmail CEO, Cyrus board, JMAP/EXTRA WG co-chair) is the central figure of the JMAP/Cyrus-at-scale era. ([https://en.wikipedia.org/wiki/UW_IMAP](https://en.wikipedia.org/wiki/UW_IMAP); [https://gist.github.com/andrijac/e3f92c258cb8de0e10f6c8d8e9d6b9a7](https://gist.github.com/andrijac/e3f92c258cb8de0e10f6c8d8e9d6b9a7); [https://www.ietf.org/blog/jmap/](https://www.ietf.org/blog/jmap/)) [Wikipedia + 4](https://en.wikipedia.org/wiki/Mark_Crispin)

**Politics and controversies.**

- **IMAP vs POP wars (1990s).** POP3 was simpler and matched the dial-up "fetch then disconnect" model; IMAP allowed multi-device, server-side folder management. The argument was largely settled by mobile in the 2010s. [ITPro Today](https://www.itprotoday.com/microsoft-365/mark-crispin-father-of-imap-rip)
- **IMAP vs proprietary protocols.** Microsoft Exchange (MAPI/RPC, then MAPI/HTTP and Exchange ActiveSync), IBM Lotus Notes, and Gmail's native API kept IMAP a *second-class* citizen on the largest mailbox systems for two decades.
- **"IMAP is too complex" critiques** ultimately motivated JMAP. Fastmail's Bron Gondwana and Neil Jenkins explicitly stated that "the current open protocols connecting email clients and servers, such as IMAP, were not designed for the modern age," citing complexity, high resource use, mobile-network unfriendliness, and tangled CalDAV/CardDAV/SMTP interactions. ([https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)
- **Design alternatives that didn't win**: DMSP (Distributed Mail System Protocol, in PCMAIL), explicitly compared in RFC 1064; **IMAP3** (RFC 1203, declared Historic 1993); **ACAP** (RFC 2244, Application Configuration Access Protocol — Crispin co-author — practically extinct).

**Where the work happened.** Stanford (1985–88, Crispin); University of Washington (1988–2008, UW-IMAP/Pine); CMU (Cyrus, since 1993); IETF working groups IMAPEXT, then **EXTRA** (Email mailstore and eXtensions To Revise or Amend) which produced RFC 9051, and **JMAP**. ([https://datatracker.ietf.org/group/extra/about/](https://datatracker.ietf.org/group/extra/about/); [https://www.cyrusimap.org/](https://www.cyrusimap.org/)) [Wikipedia + 2](https://en.wikipedia.org/wiki/Mark_Crispin)

**Last 24 months (2024–2026).**

- RFC 9051 adoption is rolling: Dovecot, Cyrus, Stalwart, and Crymap all advertise IMAP4rev2; major commercial servers continue to advertise IMAP4rev1. Nextcloud Mail and Horde have open feature requests as of 2024–2025. ([https://github.com/nextcloud/mail/issues/12061](https://github.com/nextcloud/mail/issues/12061)) [GitHub](https://github.com/nextcloud/mail/issues/12061)
- **RFC 9586 (May 2024)** — UIDONLY extension. **RFC 9755 (March 2025)** — UTF-8 for IMAP4rev1. Internet-Drafts including `draft-ietf-extra-imap-messagelimit` (MESSAGELIMIT) and `draft-ietf-mailmaint-imap-extensions-suggestions-01` (2025) are active. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-mailmaint-imap-extensions-suggestions-01)[IETF](https://datatracker.ietf.org/doc/html/draft-ietf-extra-imap-messagelimit-10)
- **JMAP** added a flurry of RFCs: 9007 (MDN, 2021), 9219 (S/MIME verification, 2022), 9404 (Blob Management, 2023), 9425 (Quotas, 2023), 9610 (Contacts, Dec 2024), 9661 (Sieve Scripts, 2024), 9670 (Sharing, Nov 2024), 9749 (VAPID for JMAP Push). JMAP for Calendars is in the RFC Editor queue (2025). ([https://jmap.io/spec.html](https://jmap.io/spec.html)) [JMAP + 2](https://jmap.io/spec.html)
- **Stalwart Mail Server** (Rust, AGPL/SELv1) reached "feature complete" status in 2025 with full IMAP4rev2, IMAP4rev1, JMAP Core/Mail/WebSockets/Sieve/Quotas/Blob, ManageSieve, and clustering — funded in part by NLnet via the EU's NGI0 Entrust Fund. ([https://stalw.art/mail-server/](https://stalw.art/mail-server/)) [Libs + 2](https://libs.tech/project/610292163/stalwart)

## How it actually works

**Wire format.** IMAP is **text-based, line-oriented, and tagged**. Every interaction is a CRLF-terminated line, except inside *literals* (counted byte strings). Each client command is prefixed with a unique alphanumeric **tag** (e.g. `A0001`); the server's matching tagged response (`OK`, `NO`, or `BAD`) signals completion. Untagged responses (`*`) carry data and unsolicited status updates. Continuation requests (`+`) ask the client to send more (e.g. literal payload or SASL challenge). (RFC 9051 §2.2; [https://datatracker.ietf.org/doc/html/rfc9051](https://datatracker.ietf.org/doc/html/rfc9051))

**State machine** (RFC 9051 §3):

```
   (TCP connect, then optional TLS)
                |
                v
         Not Authenticated  --STARTTLS--> Not Authenticated (TLS)
                |
       LOGIN / AUTHENTICATE
                |
                v
           Authenticated  <----- CLOSE/UNSELECT -----+
                |                                    |
        SELECT / EXAMINE                             |
                |                                    |
                v                                    |
            Selected ---------------------------------+
                |
              LOGOUT
                v
              Logout (server sends BYE, closes TCP)
```

**Real on-the-wire example** (using OpenSSL to port 993 — comments after `;`):

```
S: * OK [CAPABILITY IMAP4rev2 IMAP4rev1 SASL-IR LOGIN-REFERRALS ID
        ENABLE IDLE LITERAL+ AUTH=PLAIN AUTH=OAUTHBEARER] Dovecot ready
C: a001 CAPABILITY
S: * CAPABILITY IMAP4rev2 IMAP4rev1 SASL-IR ID ENABLE IDLE
        AUTH=PLAIN AUTH=OAUTHBEARER LITERAL+ MOVE CONDSTORE QRESYNC
        UTF8=ACCEPT NAMESPACE LIST-EXTENDED SPECIAL-USE
S: a001 OK CAPABILITY completed
C: a002 AUTHENTICATE PLAIN AGFsaWNlAHM1cDNyczNjcjN0     ; SASL-IR
S: a002 OK [CAPABILITY ...] Logged in
C: a003 ENABLE IMAP4rev2 QRESYNC
S: * ENABLED IMAP4rev2 QRESYNC
S: a003 OK ENABLE completed
C: a004 SELECT INBOX (CONDSTORE)
S: * 1532 EXISTS
S: * OK [UIDVALIDITY 1700000123] UIDs valid
S: * OK [UIDNEXT 99876] Predicted next UID
S: * FLAGS (\Answered \Flagged \Deleted \Seen \Draft $Forwarded)
S: * OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Limited
S: * LIST () "/" INBOX
S: * OK [HIGHESTMODSEQ 4823195]
S: a004 OK [READ-WRITE] SELECT completed
C: a005 UID FETCH 99800:* (UID FLAGS ENVELOPE BODYSTRUCTURE)
S: * 1532 FETCH (UID 99875 FLAGS (\Seen)
        ENVELOPE ("Mon, 5 May 2025 12:34:56 +0000" "Hello"
                  (("Bob" NIL "bob" "example.com"))
                  (("Bob" NIL "bob" "example.com"))
                  (("Bob" NIL "bob" "example.com"))
                  (("Alice" NIL "alice" "example.org")) NIL NIL NIL
                  "<abc@example.com>")
        BODYSTRUCTURE ("text" "plain" ("charset" "utf-8") NIL NIL
                       "quoted-printable" 312 8))
S: a005 OK FETCH completed
C: a006 IDLE
S: + idling
   ... server sends "* 1533 EXISTS" later when new mail arrives ...
C: DONE
S: a006 OK IDLE terminated
C: a007 LOGOUT
S: * BYE Logging out
S: a007 OK LOGOUT completed
```

**Commands by state** (RFC 9051 §6):

- *Any state*: `CAPABILITY`, `NOOP`, `LOGOUT`.
- *Not Authenticated*: `STARTTLS`, `AUTHENTICATE`, `LOGIN`.
- *Authenticated*: `ENABLE`, `SELECT`, `EXAMINE`, `CREATE`, `DELETE`, `RENAME`, `SUBSCRIBE`, `UNSUBSCRIBE`, `LIST`, `NAMESPACE`, `STATUS`, `APPEND`, `IDLE`. (`LSUB` is deprecated; use `LIST (SUBSCRIBED)`.)
- *Selected*: `CLOSE`, `UNSELECT`, `EXPUNGE`, `SEARCH`, `FETCH`, `STORE`, `COPY`, `MOVE`, `UID …`. (`CHECK` is deprecated.)

**Response classifications.**

- *Tagged completion*: `OK` (success), `NO` (operational failure — e.g. mailbox doesn't exist), `BAD` (protocol error — server cannot parse the command).
- *Untagged data*: `* 5 EXISTS`, `* 3 EXPUNGE`, `* SEARCH 1 4 7 12`, `* FETCH …`, `* LIST …`, `* CAPABILITY …`.
- *Untagged status*: `* OK …`, `* NO …`, `* BAD …`, `* BYE …`, `* PREAUTH …`.
- *Continuation request*: `+ idling`, `+ Ready for SASL response`.

**Distinguish carefully**: `BYE` is fatal — the server is closing the connection. `NO` does not close anything; the client can keep going.

**Data types** (RFC 9051 §4): atom (unquoted token), number (32-bit; 64-bit since rev2 for sizes), string (`"quoted"` or `{N}\r\n…N bytes…` literal), parenthesized list, `NIL`. The literal-vs-NIL distinction matters: `BODY[1] NIL` means the body part is absent; `BODY[1] "NIL"` means it contains the three-character string "NIL". [Ietf](https://sandbox-cf.ietf.org/doc/html/rfc9051)

**Sequence numbers vs UIDs vs UIDVALIDITY.** Sequence numbers re-pack on `EXPUNGE`. UIDs are stable *within* a session-lived UIDVALIDITY value; if `UIDVALIDITY` differs from what the client cached, the entire local cache must be discarded. CONDSTORE/QRESYNC (RFC 7162, May 2014) attach a 64-bit `MODSEQ` to every change so a client can resync after disconnect using `SELECT INBOX (QRESYNC (uidvalidity highestmodseq))`. ([https://datatracker.ietf.org/doc/html/rfc7162](https://datatracker.ietf.org/doc/html/rfc7162)) [Tech Invite](https://www.tech-invite.com/y70/tinv-ietf-rfc-7162-2.html)

**BODYSTRUCTURE / MIME tree.** A parenthesized recursive description of the MIME tree: each leaf reports type, subtype, parameters, content-id, description, transfer-encoding, octet count, and (for text) line count; each `multipart/*` is a list of children followed by the subtype. The client uses it to fetch only `BODY[1.2]` instead of the whole 30-MB attachment.

**Modified UTF-7 vs UTF-8 mailbox names.** In IMAP4rev1 (RFC 3501) a mailbox like `~peter/mail/台北/東京` is sent on the wire as `~peter/mail/&U,BTFw-/&ZeVnLIqe-`. IMAP4rev2 mandates UTF-8 in NFC; clients MUST `ENABLE IMAP4rev2` (or `ENABLE UTF8=ACCEPT` for backward compatibility on rev1 servers).

**IDLE** (RFC 2177, June 1997). Client issues `IDLE`, server responds `+ idling`, server sends untagged updates as they happen, client sends `DONE` to leave IDLE. Servers must allow at least 30 minutes of inactivity (per RFC 2683); clients are advised to drop and re-issue IDLE *every 29 minutes* to avoid the autologout. ([https://datatracker.ietf.org/doc/html/rfc2177](https://datatracker.ietf.org/doc/html/rfc2177); [https://www.rfc-editor.org/rfc/rfc2683.html](https://www.rfc-editor.org/rfc/rfc2683.html)) [IETF](https://datatracker.ietf.org/doc/html/draft-leiba-imap-implement-guide)[Liu](http://pike.lysator.liu.se/docs/ietf/rfc/21/rfc2177.xml)

**Security model.**

- **Implicit TLS on port 993** (IMAPS): TLS handshake before any IMAP byte. RFC 8314 (Jan 2018) makes this the *recommended* deployment. [IETF](https://datatracker.ietf.org/doc/html/rfc8314)
- **STARTTLS on port 143**: cleartext greeting → `STARTTLS` → TLS handshake → reset state. Susceptible to STRIPTLS, command injection, and response injection if buffering is sloppy (NO STARTTLS, USENIX Security 2021; CVE-2021-38542 in Apache James, CVE-2020-15685 in Thunderbird, CVE-2011-0411). RFC 8314 strongly recommends Implicit TLS over STARTTLS. ([https://nostarttls.secvuln.info/](https://nostarttls.secvuln.info/); [https://www.rfc-editor.org/rfc/rfc8314.html](https://www.rfc-editor.org/rfc/rfc8314.html)) [The Mail Archive](https://www.mail-archive.com/announce@apache.org/msg07010.html)[GitHub](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server/issues/24)
- **SASL mechanisms.** Modern recommendation: prefer SCRAM-SHA-256 or `OAUTHBEARER` over `PLAIN` when feasible. `XOAUTH2` is Google's pre-RFC SASL profile (`base64("user=…\x01auth=Bearer …\x01\x01")`); `OAUTHBEARER` (RFC 7628, Aug 2015) is the IETF-standard equivalent with a different framing. ([https://www.rfc-editor.org/rfc/rfc7628.html](https://www.rfc-editor.org/rfc/rfc7628.html); [https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)) [Microsoft Learn](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)

**Important extensions** (most are mandatory in IMAP4rev2; otherwise capability-advertised):

| Extension | RFC | What it adds |
|---|---|---|
| ENABLE | 5161 | Two-way capability negotiation |
| IDLE | 2177 | Push notifications |
| NAMESPACE | 2342 | Personal/Other/Shared namespace discovery |
| QUOTA | 9208 (rev) | Per-mailbox quotas |
| ACL | 4314 | Per-user mailbox permissions |
| UIDPLUS | 4315 | `APPENDUID`, `COPYUID`, `UID EXPUNGE` |
| LIST-EXTENDED | 5258 | `(SUBSCRIBED)`, `(SPECIAL-USE)`, `RETURN (CHILDREN STATUS …)` |
| SPECIAL-USE | 6154 | `\Drafts \Sent \Trash \Junk \Archive \All \Flagged` |
| ESEARCH / SEARCHRES | 4731, 5182 | Compact SEARCH results, server-side result reuse |
| SORT / THREAD | 5256 | Server-side ordering and threading |
| MOVE | 6851 | Atomic message move |
| BINARY | 3516 | Fetch raw 8-bit body parts |
| CATENATE | 4469 | Build APPEND from existing parts |
| MULTIAPPEND | 3502 | Multiple messages in one APPEND |
| LITERAL+ / LITERAL- | 7888 | Non-synchronizing literals |
| COMPRESS=DEFLATE | 4978 | zlib stream compression |
| ID | 2971 | Client/server implementation strings |
| METADATA | 5464 | Per-mailbox annotations |
| NOTIFY | 5465 | Watch multiple mailboxes |
| CONDSTORE / QRESYNC | 7162 | Modseq, fast resync, VANISHED |
| OBJECTID | 8474 | Stable mailbox/email IDs |
| UTF8=ACCEPT | 6855 / 9755 | UTF-8 in headers and mailbox names |
| OAUTHBEARER | 7628 | OAuth 2.0 in SASL |
| MESSAGELIMIT | draft-ietf-extra-imap-messagelimit | Server-announced batch limit [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-extra-imap-messagelimit-10) |
| UIDONLY | 9586 | Drop sequence numbers entirely [IETF](https://datatracker.ietf.org/doc/draft-ietf-extra-imap-uidonly/08/) |

**Edge cases.** Servers can send untagged responses *at any time* — clients must accept them on every read. The protocol forbids the server from sending FETCH responses for a message that has been EXPUNGEd, but a race between client FETCH and another client EXPUNGE on a shared mailbox is real (RFC 2180 documents the recommended behaviour). UIDVALIDITY changes (because the admin restored a backup or replaced the mailstore) force a full client resync. PREAUTH on connect (with TLS client cert) skips the auth state entirely; many clients handle this poorly. [Liu](http://pike.lysator.liu.se/docs/ietf/rfc/21/rfc2177.xml)

## Deep connections to other protocols

**TCP.** IMAP runs on TCP because it needs in-order, lossless delivery of arbitrary-length text. Unlike HTTP/1.1, IMAP connections are *long-lived* — a healthy IDLE connection can stay open for hours. NAT timeouts on home routers (often 5–10 min for "idle" TCP) and mobile NATs are the practical reason RFC 2177 recommends re-IDLE every 29 min and the practical reason JMAP exists.

**TLS.** Two distinct deployments:

- Port 993 implicit TLS (preferred per RFC 8314, [https://www.rfc-editor.org/rfc/rfc8314.html](https://www.rfc-editor.org/rfc/rfc8314.html)).
- Port 143 + `STARTTLS`. Vulnerable to plaintext-command-injection and response-injection attacks (NO STARTTLS, 2021, [https://nostarttls.secvuln.info/](https://nostarttls.secvuln.info/)). RFC 8314 obsoletes cleartext IMAP and TLS < 1.1. [Wikipedia](https://en.wikipedia.org/wiki/Opportunistic_TLS)

**SMTP.** Complementary, not a replacement: SMTP delivers (`MAIL FROM`, `RCPT TO`, `DATA`); IMAP retrieves and stores. Both use MIME (RFC 2045–2049) and RFC 5322 message format, but the state machines are unrelated. Mail Submission (port 587 or 465 via RFC 6409 + RFC 8314) is what an IMAP-using MUA actually talks to for *sending*.

**DNS.** IMAP does not use MX records — those are for inbound SMTP. **RFC 6186 (March 2011)** defines `_imap._tcp.<domain>` and `_imaps._tcp.<domain>` SRV records (and `_submission._tcp`, `_pop3._tcp`) so a MUA needs only the user's email address. A target of `.` means "service not offered." ([https://www.rfc-editor.org/rfc/rfc6186.html](https://www.rfc-editor.org/rfc/rfc6186.html)). Mozilla's **autoconfig** (XML at `https://autoconfig.thunderbird.net/` or `https://autoconfig.<domain>/mail/config-v1.1.xml`) and Microsoft's **Autodiscover** (HTTPS POST to `https://autodiscover.<domain>/autodiscover/autodiscover.xml`) are the two competing client-configuration mechanisms; modern servers (Stalwart 0.8.0+) ship both alongside RFC 6186 SRV records. [Liu + 2](http://pike.lysator.liu.se/docs/ietf/rfc/61/rfc6186.xml)

**Other protocols you should know about:**

- **POP3 (RFC 1939).** Simpler, "fetch then delete" semantics; shares port-987-style TLS history. RFC 6186 covers POP3 SRV records.
- **MIME (RFC 2045–2049).** Provides `Content-Type`, `Content-Transfer-Encoding`, `multipart/*`. IMAP's BODYSTRUCTURE is a parsed MIME tree.
- **SASL (RFC 4422), GSSAPI/Kerberos, SCRAM (RFC 5802/7677).**
- **OAuth 2.0 (RFC 6749) + OAUTHBEARER (RFC 7628) + XOAUTH2 (Google de-facto).** Now mandatory for Gmail and Microsoft 365.
- **JMAP (RFC 8620, July 2019; RFC 8621, August 2019).** JSON-over-HTTPS replacement for IMAP, designed at Fastmail and standardized in IETF JMAP WG. Covers email, contacts (RFC 9610), sharing (RFC 9670), quotas (RFC 9425), blobs (RFC 9404), Sieve scripts (RFC 9661), MDN (RFC 9007), S/MIME (RFC 9219), WebSocket push (RFC 8887), VAPID push (RFC 9749). Calendars in RFC Editor queue (2025). [Cyrus IMAP](https://www.cyrusimap.org/3.4/imap/developer/jmap.html)[JMAP](https://jmap.io/spec.html)
- **Sieve (RFC 5228) + ManageSieve (RFC 5804, port 4190).** Server-side filtering language and the protocol to upload/edit Sieve scripts. ManageSieve's syntax is "much like IMAP or ACAP." [ACM Digital Library](https://dl.acm.org/doi/10.17487/RFC5804)[RFC Editor](https://www.rfc-editor.org/rfc/rfc5804.html)
- **ACAP (RFC 2244, Application Configuration Access Protocol).** An IMAP-syntax-flavoured config protocol intended to store client preferences server-side. Effectively dead; replaced piecewise by IMAP METADATA (RFC 5464) and JMAP.
- **Exchange ActiveSync (EAS) and MAPI/HTTP.** Microsoft's competitors to IMAP for mobile and Outlook clients. Closed-spec licensed protocols.
- **MTA-STS (RFC 8461), DANE (RFC 7672), DKIM (6376), SPF (7208), DMARC (7489), ARC (8617).** Server-to-server hardening of the *delivery* path; orthogonal to IMAP but determine whether messages reach the IMAP store at all.

## Real-world deployment

**Major server implementations.**

- **Dovecot (open source, OX/Open-Xchange).** First released 2002 by Timo Sirainen. According to Open-Xchange's Open Email Survey (2020), Dovecot held a **76.9% global share** of observable IMAP servers, an extrapolated 2.9 million instances; OX continues to cite a 76% installed-base figure for Dovecot Pro. The 2017 Mozilla MOSS-funded Cure53 audit reported "the excellent security-standing of Dovecot." Storage formats: mbox, Maildir, sdbox, mdbox; supports Director (proxy/affinity), object-storage backends, replication. ([https://en.wikipedia.org/wiki/Dovecot_(software)](https://en.wikipedia.org/wiki/Dovecot_(software)); [https://blog.open-xchange.com/dovecot-imap-servers-market-share-has-grown-again/](https://blog.open-xchange.com/dovecot-imap-servers-market-share-has-grown-again/)) [Wikipedia + 4](https://en.wikipedia.org/wiki/Dovecot_(software))
- **Cyrus IMAP (CMU + Fastmail).** Active since 1993 at CMU; Fastmail engineers do most current development and are on the Cyrus board. JMAP in Cyrus 3.8.3+ (May 2024). Fastmail's "slot/store" architecture runs ~40 separate Cyrus instances per machine, each with ~1 TB storage, replicated across New York, Iceland, and Amsterdam. ([https://www.cyrusimap.org/imap/download/installation/http/jmap.html](https://www.cyrusimap.org/imap/download/installation/http/jmap.html); [https://www.fastmail.com/help/technical/architecture.html](https://www.fastmail.com/help/technical/architecture.html); [https://www.fastmail.com/blog/standalone-mail-servers/](https://www.fastmail.com/blog/standalone-mail-servers/)) [Wikipedia + 7](https://en.wikipedia.org/wiki/Cyrus_IMAP_server)
- **Stalwart Mail Server (Rust, 2023+).** All-in-one: SMTP, IMAP4rev1+rev2, POP3, JMAP, ManageSieve, CalDAV, CardDAV, WebDAV. Native JMAP rather than IMAP-with-JMAP-on-top. Reached "feature complete" in 2025 with FoundationDB/PostgreSQL/MySQL/RocksDB/SQLite back-ends and clustering. NLnet/EU-NGI funded. ([https://stalw.art/](https://stalw.art/); [https://github.com/stalwartlabs/stalwart](https://github.com/stalwartlabs/stalwart)) [GitHub + 6](https://github.com/joelparkerhenderson/demo-fastmail-api-jmap)
- **UW-IMAP (Crispin/UW, 1988–2008; Panda IMAP fork 2008–2012).** End-of-life. Still ships in some legacy distributions.
- **Courier-IMAP (Sam Varshavchik).** Maildir-only design; long-term competitor of UW-IMAP.
- **Microsoft Exchange Server / Exchange Online.** IMAP4 supported but second-class; primary access is MAPI/HTTP, EWS, Graph API, EAS. Basic-auth IMAP disabled in Exchange Online from October 2022; OAUTHBEARER/XOAUTH2 required. [O365 Reports](https://o365reports.com/basic-authentication-exchange-online/)
- **Zimbra, MailEnable, IceWarp, Kerio Connect, hMailServer, Apache James** — niche but real.
- **Apache James** has a Java JMAP implementation conforming to RFC 8620/8621 since version 3.6.0 (2021). ([https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)) [Wikipedia](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)

**Major IMAP-exposing services.** Gmail, Outlook.com / Microsoft 365, Yahoo / AOL (Verizon Media), iCloud Mail, Fastmail, Migadu, Mailbox.org, Posteo, GMX, Yandex. Tutanota does **not** offer IMAP (incompatible with their end-to-end encryption model). ProtonMail requires **Proton Mail Bridge**, a local desktop application that exposes a 127.0.0.1 IMAP/SMTP listener after decrypting messages locally. ([https://proton.me/support/port-already-occupied-error](https://proton.me/support/port-already-occupied-error)) [FreeBSD](https://forums.freebsd.org/threads/how-to-deal-with-mailing-lists.76821/page-2)[Cloudmailerpro](https://cloudmailerpro.com/program/protonmail-bridge/)

**Client libraries / clients.** libetpan, JavaMail/Jakarta Mail, Python `imaplib`, `imapclient`, `emails`/`mailparser`, Go `go-imap`, mailcore2 (Apple/Android), MailKit (.NET), MailCore Swift, JMAP-mail-aware clients like aerc 0.16+ and Ltt.rs. Major MUAs: Apple Mail, Mozilla Thunderbird, K-9 Mail/Thunderbird for Android, Outlook (limited IMAP), Mutt, Claws Mail, Evolution, KMail, Roundcube/RainLoop (webmail).

**Performance and scale.**

- Dovecot is widely deployed at ISPs handling tens of millions of mailboxes; the 2020 Open Email Survey reports millions of public-facing instances.
- Fastmail's per-server architecture co-locates 40 IMAP instances on one 4U box; each "slot" carries ~1 TB of data, replicated to 2-3 other slots across geographies. ([https://www.fastmail.com/blog/standalone-mail-servers/](https://www.fastmail.com/blog/standalone-mail-servers/)) [Narkive](https://info-cyrus.andrew.cmu.narkive.com/OMkB6htv/high-availability)
- IDLE connections are cheap on Dovecot/Cyrus (~10s of kB RSS each on Linux), but every long-lived TCP socket is a file descriptor — `ulimit -n` is the first knob to raise.
- Stalwart explicitly markets sharded blob storage, FoundationDB scale-out, and "millions of mailboxes" capability. [Stalwart](https://stalw.art/)[Stalwart](https://stalw.art/)

**Deployment topologies.**

- *Single-box*: Postfix → LMTP → Dovecot → MySQL/PostgreSQL auth.
- *Director / proxy*: Dovecot Director (consistent-hash users to backends) or Cyrus Murder (frontends + per-user backends). [Cyrus IMAP](https://www.cyrusimap.org/imap/reference/architecture.html)
- *Replicated*: Cyrus replication (Fastmail) or dsync (Dovecot).
- *Object-storage*: Dovecot OBOX plugin against S3/Swift/Scality (used by Rackspace/Open-Xchange).

## Failure modes and famous incidents

**Vulnerabilities with CVEs.**

- **CVE-2024-23184** (Aug 2024, Dovecot ≤2.3.21): excessive CPU when parsing 100k+ address headers (≈12s of CPU at 100k headers, 18 minutes at 500k). DoS. Fixed in 2.3.21.1. ([https://www.sentinelone.com/vulnerability-database/cve-2024-23185/](https://www.sentinelone.com/vulnerability-database/cve-2024-23185/); [https://dovecot.org/security](https://dovecot.org/security)) [Dovecot](https://dovecot.org/mailman3/hyperkitty/list/dovecot@dovecot.org/thread/TBZIOBSMJ5G2C5HBJJCE62HW4ETDZF3S/)[Dovecot](https://dovecot.org/mailman3/hyperkitty/list/dovecot@dovecot.org/thread/TBZIOBSMJ5G2C5HBJJCE62HW4ETDZF3S/)
- **CVE-2024-23185** (Aug 2024, Dovecot ≤2.3.21): unbounded `full_value` buffer in message-header-parser allows memory-exhaustion DoS via oversized headers. Authenticated user can trigger via `APPEND`. Fixed in 2.3.21.1.
- **CVE-2019-11500**: Dovecot IMAP / ManageSieve parsers mishandle NUL bytes in quoted strings (out-of-bounds write).
- **CVE-2021-38542** (Apache James ≤3.6.0): STARTTLS command-injection (man-in-the-middle can buffer extra bytes after `STARTTLS` that are processed *inside* the encrypted session). Reported alongside the 2021 NO STARTTLS research from Münster. Mitigation: disable STARTTLS, use implicit TLS. ([https://seclists.org/oss-sec/2022/q1/1](https://seclists.org/oss-sec/2022/q1/1)) [Openwall + 2](https://www.openwall.com/lists/oss-security/2022/01/04/1)
- **CVE-2020-15685** (Thunderbird): IMAP response-injection via STARTTLS — the attacker injects untagged responses ahead of the TLS handshake that the client treats as legitimate post-TLS server traffic. ([https://bugzilla.mozilla.org/show_bug.cgi?id=1622640](https://bugzilla.mozilla.org/show_bug.cgi?id=1622640))
- **CVE-2011-0411 / CVE-2011-1926**: original Postfix/Wietse Venema STARTTLS plaintext-injection class. [Secvuln](https://nostarttls.secvuln.info/)
- **EFAIL (2018, USENIX Security 18)** — Poddebniak, Dresen, Müller, Ising, Schinzel (Münster Univ. of Applied Sciences) + Friedberger (NXP/KU Leuven) + Somorovsky, Schwenk (Ruhr-Universität Bochum). CBC/CFB malleability gadgets in S/MIME and OpenPGP plus HTML/CSS/X.509 backchannels in IMAP-fetched HTML email exfiltrate decrypted plaintext. 23/35 S/MIME and 10/28 OpenPGP clients vulnerable; ten CVEs (CVE-2018-4111, -4221, -4227, -5162, -5184, -5185, -8160, -8305, -12372, -12373). ([https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak](https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak); [https://efail.de/](https://efail.de/)) [USENIX + 4](https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak)
- **NO STARTTLS (2021, USENIX Security 30)**, same Münster team + Hanno Böck. Internet-wide scan of ~320,000 servers; 40+ CVEs across Apple Mail, Gmail, Thunderbird, Mutt, Claws, Evolution, Exim, Mail.ru, Samsung Email, Yandex, KMail. Two attack classes: command injection (server side) and response injection (client side); plus the IMAP `PREAUTH` downgrade where a MITM injects a `* PREAUTH` greeting before STARTTLS, forcing the client to skip TLS. ([https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html); [https://nostarttls.secvuln.info/](https://nostarttls.secvuln.info/)) [The Hacker News + 2](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html)

**Authentication transitions (last 24 months and the run-up).**

- **Microsoft Exchange Online basic-auth deprecation.** Phased disablement *began 1 October 2022* across worldwide multi-tenant Microsoft 365; reached Office 365 Operated by 21Vianet on 31 March 2023. Affected EAS, EWS, IMAP, POP, RPS, MAPI/RPC, OAB, Autodiscover. SMTP AUTH was the lone exception; Microsoft has since announced retirement of basic auth for SMTP AUTH in two phases, **starting 1 March 2026 with full rejection by 30 April 2026**. ([https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online); [https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)) [Microsoft Community Hub + 4](https://techcommunity.microsoft.com/blog/exchange/basic-authentication-deprecation-in-exchange-online-%E2%80%93-may-2022-update/3301866)
- **Google "Less Secure Apps" / basic-auth deprecation.** Google removed the LSA toggle for personal accounts on 30 May 2022. Workspace deadline: **30 September 2024** (full retirement) for password-only IMAP/POP/SMTP/CalDAV/CardDAV; mobile-management profile pushes phased out across 2024; Google Sync existing-user cutoff was **14 March 2025**. ([https://workspaceupdates.googleblog.com/2023/09/winding-down-google-sync-and-less-secure-apps-support.html](https://workspaceupdates.googleblog.com/2023/09/winding-down-google-sync-and-less-secure-apps-support.html); [https://knowledge.workspace.google.com/admin/sync/transition-from-less-secure-apps-to-oauth](https://knowledge.workspace.google.com/admin/sync/transition-from-less-secure-apps-to-oauth)) [WP Mail SMTP + 2](https://wpmailsmtp.com/gmail-less-secure-apps/)

**Protocol-level pitfalls.**

- *UIDVALIDITY changes* (e.g., after a backup restore, store migration, or some filesystem operations) silently break clients into either silent re-download or visible "INBOX is empty" panics.
- *IDLE timeout misconfiguration* — server `imap_idle_notify_interval` shorter than NAT keepalive equals client disconnects every few minutes.
- *Connection leaks* — clients forgetting to LOGOUT, multiplied by autologout failures, exhaust file descriptors.
- *EXPUNGE/FETCH races* in shared mailboxes (RFC 2180).
- *Mailbox-name encoding* — Modified UTF-7 vs UTF-8 mismatches cause folders to appear with garbled names like `INBOX.Gel&APY-schte`.

**Real outages.** Major outages at Gmail (multiple incidents 2009–2023), Apple iCloud Mail, Outlook.com, and Yahoo Mail are common but rarely IMAP-specific; the IMAP layer usually rides on whichever storage outage is upstream. Fastmail's own 27 February 2014 incident on `imap21` is a classic case study in Cyrus replication failure (a stuck sync log entry caused new-user assignments to silently halt). ([https://www.fastmail.com/blog/cleaning-up-from-an-imap-server-failure/](https://www.fastmail.com/blog/cleaning-up-from-an-imap-server-failure/))

## Fun facts and anecdotes

- Mark Crispin's two April Fools RFCs: **RFC 1437 (1993)** ("Extension of MIME for Transmission of Body Parts") and **RFC 4042 (2005)** describing UTF-9 and UTF-18 — Unicode encodings optimized for the **PDP-10's** 36-bit words. Crispin reportedly still ran TOPS-20 systems in his home in 2009. ([https://en.wikipedia.org/wiki/Mark_Crispin](https://en.wikipedia.org/wiki/Mark_Crispin)) [Wikipedia](https://en.wikipedia.org/wiki/Mark_Crispin)
- Modified UTF-7 chose `&` instead of `+` because the `+` was already common in *Usenet newsgroup names* (e.g. `comp.std.c++`) which IMAP servers historically presented as folders, and `,` instead of `/` because `/` was the typical hierarchy separator. ([https://www.fetchmail.info/Mailbox-Names-UTF7.html](https://www.fetchmail.info/Mailbox-Names-UTF7.html))
- Crispin himself called RFC 2060 (IMAP4rev1) — the spec he wrote — an "abortion" in some mailing-list correspondence (per the lesspress.net history note); his tone on imap-protocol/imapext lists was famously direct. [Lesspress](https://lesspress.net/reference/imap/)
- Crispin's *Ten Commandments of How to Write an IMAP client* still circulates. ("Thou shalt not fetch the entire mailbox at once" might as well be Commandment 1.)
- **JMAP origin story.** Designed inside Fastmail starting around 2014 by Neil Jenkins (UX architect/director) and Bron Gondwana (now CEO). Fastmail's webmail has run on JMAP since *before* RFC 8620 was published. ([https://www.fastmail.com/blog/jmap-new-email-open-standard/](https://www.fastmail.com/blog/jmap-new-email-open-standard/)) [Wikipedia + 2](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)
- Why port 143? It was simply the next available well-known TCP port assigned by IANA after IMAP2 was specified (1988). The IANA registry literally lists `imap 143/tcp imap2 # Interim Mail Access Proto v2`. Port 220 ("imap3") is registered for IMAP3 — the version that never shipped. Port 993 is the implicit-TLS port (registered originally for SSL and re-anchored to TLS by RFC 8314). [Scribd](https://www.scribd.com/doc/56821050/Services)[Scribd](https://www.scribd.com/doc/56821050/Services)
- Crispin obituary on LWN (Jan 2013) and Hacker News thread of the era are the closest things to a community memorial: "It reminds me of Jon Postel … the greater public is oblivious to people who have built even more important infrastructure." ([https://lwn.net/Articles/539655/](https://lwn.net/Articles/539655/); [https://news.ycombinator.com/item?id=4825893](https://news.ycombinator.com/item?id=4825893)) [Hacker News](https://news.ycombinator.com/item?id=4825893)
- Stevens Institute of Technology (Crispin's alma mater) gave him an Alumni Award in Science and Technology in April 2013, posthumously.
- The IMAP tag system (`A0001 LOGIN …`) has no direct ancestor in SMTP (which is reply-code-based) or POP3 (which is single-command-at-a-time); tagging was Crispin's own design choice to allow command pipelining and unsolicited untagged data in the same stream.

## Practical wisdom

**Tuning.**

- Tune `imap_idle_notify_interval` (Dovecot) to ~2 minutes if you serve mobile clients — many home-router NATs drop "idle" TCP after 5–10 min.
- Set per-IP and per-user *concurrent connection limits* (`mail_max_userip_connections` in Dovecot) — modern clients open 5–10 connections per account (separate IDLEs per folder).
- Enable TLS session resumption (Dovecot `ssl_session_cache=shared:imap:8M` or per-process tickets) — TLS handshakes dominate connect cost.
- Enable `COMPRESS=DEFLATE` for high-latency / mobile clients; saves 60–80% on FETCH bandwidth.
- TCP keepalive (Linux `net.ipv4.tcp_keepalive_time=300`) is your floor against silent NAT drops on long IDLEs.

**Defaults to be skeptical of.**

- Plaintext port 143 with `STARTTLS` *optional* (often the historical Postfix/Dovecot default). Set `disable_plaintext_auth = yes` and ideally remove port 143 entirely (RFC 8314).
- AUTH=PLAIN advertised pre-TLS: a misconfigured `LOGINDISABLED` capability lets clients auto-downgrade.
- Old SASL mechanisms — `DIGEST-MD5` is deprecated; CRAM-MD5 is weak; prefer SCRAM-SHA-256 or OAUTHBEARER.
- TLS 1.0/1.1 still enabled "for compatibility" — RFC 8314 §4.1 already deprecated them; in 2026 only TLS 1.2 and 1.3 should be enabled.

**What to monitor.**

- Authentication failure rate per source IP (brute force / password spray detection).
- Concurrent IDLE connections per user.
- 95p / 99p latency of `SELECT INBOX` and `UID FETCH` on > 100 k-message INBOXes.
- FETCH bytes/sec and search times.
- `imapd` RSS per process, file-descriptor usage.
- UIDVALIDITY changes — every change should be intentional and logged.

**Production debugging.**

- `openssl s_client -connect imap.example.com:993 -crlf` for hand-driven IMAP.
- `nc` / `ncat` for cleartext port 143.
- Dovecot: `doveadm log find`, `doveadm who`, `doveadm fetch`, `doveadm sync`, `doveadm mailbox status`.
- Cyrus: `mbexamine`, `cyradm`, `quota`, `ctl_mboxlist`.
- Wireshark with the `imap` dissector (works on cleartext or post-`SSLKEYLOGFILE` decrypted streams).
- `imaptest` (Dovecot's load and conformance tester).

**Common misconfigurations.** Clients ignoring UIDVALIDITY change; mailbox-name encoding mismatches between Modified UTF-7 and UTF-8 (especially when migrating between rev1 and rev2 servers); inconsistent hierarchy separators (`/` vs `.`); NAMESPACE confusion between Personal/Other/Shared (RFC 2342); SRV records advertising STARTTLS-only when implicit-TLS port 993 is preferred (RFC 8314 §4.5.2). [Incenp](https://incenp.org/notes/2018/rfc8314-roadmap.html)

## Learning resources (current as of May 2026)

**RFCs (all freely downloadable from rfc-editor.org).**

- **RFC 9051** — IMAP4rev2 (2021). The current canonical spec. (advanced)
- **RFC 3501** — IMAP4rev1 (2003). Still implemented by every major server alongside rev2. (advanced)
- **RFC 9755** — IMAP UTF-8 (2025). Replaces 6855. (intermediate)
- **RFC 2683** — IMAP4 Implementation Recommendations (1999, B. Leiba). The single best document for *getting it right*. (intermediate–advanced) [easyDNS](https://imap.org/library/)
- **RFC 2177** — IDLE (1997). Section 3 explains the 29-min rule.
- **RFC 7162** — CONDSTORE / QRESYNC (2014). Mandatory reading for offline sync.
- **RFC 6186** — SRV records for IMAP/POP/Submission (2011).
- **RFC 8314** — Cleartext Considered Obsolete (2018). Implicit TLS ports.
- **RFC 7628** — SASL OAuth (2015). For OAUTHBEARER.
- **RFC 8620 / 8621** — JMAP Core / JMAP Mail (2019).
- **RFC 5228** — Sieve.
- **RFC 5804** — ManageSieve.
- **RFC 4314** — IMAP ACL.
- **RFC 5256** — SORT/THREAD.
- **RFC 6851** — MOVE.
- **RFC 8474** — OBJECTID.
- **draft-ietf-mailmaint-imap-extensions-suggestions-01** (2025) — short list of recommended extensions for new general-purpose implementations. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-mailmaint-imap-extensions-suggestions-01)

**Books.**

- *Internet Email Protocols: A Developer's Guide*, K. Johnson (Addison-Wesley, 1999) — historical; pre-IMAP4rev1 final.
- *Programming Internet Email*, David Wood (O'Reilly, 1999) — still the most coherent narrative treatment of IMAP/POP/SMTP/MIME together; dated but uniquely accessible. (intro–intermediate)
- *Postfix: The Definitive Guide*, Kyle Dent (O'Reilly, 2003) — for the SMTP context.
- *Pro Open Source Mail*, Curtis Smith (Apress, 2006) — covers Dovecot and Postfix integration.
- The *Cyrus IMAP* and *Dovecot* online manuals (cyrusimap.org, doc.dovecot.org) are kept current and far better than any printed book at this point. (intermediate–advanced, regularly updated)

**Engineering blogs.**

- **Fastmail blog** ([https://www.fastmail.com/blog/](https://www.fastmail.com/blog/)) — JMAP origin, Cyrus internals, "Standalone Mail Servers", "The Fastmail storage architecture", "Cleaning up from an IMAP server failure". (intermediate–advanced)
- **Open-Xchange / Dovecot blog** ([https://blog.open-xchange.com/](https://blog.open-xchange.com/)) — Dovecot Pro, Open Email Survey statistics.
- **Stalwart Labs blog** ([https://stalw.art/blog/](https://stalw.art/blog/)) — JMAP-native architecture, performance posts. (2024–2026)
- **APNIC NO STARTTLS write-up** ([https://blog.apnic.net/2021/11/18/vulnerabilities-show-why-starttls-should-be-avoided-if-possible/](https://blog.apnic.net/2021/11/18/vulnerabilities-show-why-starttls-should-be-avoided-if-possible/)).
- **Julia Evans, *Implementing 'focus and reply' for Fastmail with JMAP*** ([https://jvns.ca/blog/2020/08/18/implementing--focus-and-reply--for-fastmail/](https://jvns.ca/blog/2020/08/18/implementing--focus-and-reply--for-fastmail/)) — a delightful and very accessible JMAP-from-zero walkthrough. (intro) [Jvns.ca](https://jvns.ca/blog/2020/08/18/implementing--focus-and-reply--for-fastmail/)

**Academic papers.**

- Poddebniak et al., *Efail: Breaking S/MIME and OpenPGP Email Encryption Using Exfiltration Channels*, USENIX Security 2018. ([https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak](https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak)) [USENIX](https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak)
- Poddebniak, Ising, Böck, Schinzel, *Why TLS is better without STARTTLS: A Security Analysis of STARTTLS in the Email Context*, USENIX Security 2021. ([https://nostarttls.secvuln.info/](https://nostarttls.secvuln.info/))

**Talks and conferences.**

- IETF EXTRA WG meeting recordings ([https://datatracker.ietf.org/group/extra/about/](https://datatracker.ietf.org/group/extra/about/)).
- FOSDEM Mail track talks; Stalwart presented at FOSDEM '25 (1 February 2025). [Stalwart](https://stalw.art/blog/next-gen-spam-filter/)
- RuhrSec 2018, Black Hat USA 2018, 35C3 — all carry EFAIL talks.

**Hands-on tools.**

- `openssl s_client` — interactive IMAPS shell.
- Dovecot `imaptest` — conformance + load.
- `doveadm` (server admin), `mbexamine` (Cyrus), `dsync` (Dovecot replication).
- Wireshark IMAP dissector.
- `mblib`/`offlineimap`/`mbsync (isync)` — for migrations and dev sandboxes.

## Where things are heading (2025–2026 frontier)

**IMAP4rev2 adoption (RFC 9051, August 2021).** Five years in, adoption is partial:

- *Implemented and advertised*: Dovecot (rolling in 2.4 series), Cyrus IMAP, Stalwart, Crymap. Apple iCloud, Gmail, and Microsoft 365 still primarily advertise IMAP4rev1.
- *Open requests*: Nextcloud Mail (issue #12061, 2024), Horde IMP (issue #30, 2024). Many large hosters wait for client demand.
- The pragmatic story: IMAP4rev1 + the right extensions ≈ IMAP4rev2 already, so the migration pressure is low.

**JMAP (RFC 8620 / 8621, 2019; family extended through 2024–2025).**

- *In production*: Fastmail (entire stack), Stalwart (native), Apache James (since 3.6.0), Cyrus IMAP (since 3.8.3, May 2024), atmail. [Apache JIRA + 2](https://issues.apache.org/jira/browse/JAMES-2884)
- *Clients*: Fastmail web/iOS/Android, Thunderbird and Thunderbird iOS (per SysTools 2025), aerc 0.16+, Ltt.rs (Android, JMAP-only), Twake Mail, Mailtemi, plus 1Password's Masked Email integration. [Wikipedia + 3](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)
- *Status*: Mail (8621) + Contacts (9610) + Sharing (9670) + Sieve (9661) + Quotas (9425) + Blob (9404) + WebSocket (8887) + VAPID Push (9749) + MDN (9007) + S/MIME (9219) all RFCs. Calendars in RFC Editor queue (2025). ([https://jmap.io/spec.html](https://jmap.io/spec.html)) [JMAP](https://jmap.io/spec.html)
- *Verdict (2026)*: JMAP is real and growing among small, modern, open-source providers and clients, but it has not displaced IMAP at the big incumbents (Gmail, Microsoft 365, Yahoo, Apple). For the foreseeable future, *both* IMAP4rev1 and JMAP will coexist; new servers should implement both.

**Active IETF working groups.**

- **EXTRA** (Email mailstore and eXtensions To Revise or Amend) — produced RFC 9051; ongoing extensions (MESSAGELIMIT, UIDONLY/RFC 9586, UTF-8/9755).
- **JMAP** — Calendars draft, Tasks draft, Implementation Profile (`draft-ietf-jmap-essential`), File Storage.
- **MAILMAINT** — produced *IMAP Extensions Suggestions* (draft-ietf-mailmaint-imap-extensions-suggestions, 2025), a curated list for new implementers.

**OAuth-only mailbox access.** Microsoft 365 (basic auth disabled October 2022; SMTP AUTH basic auth retiring 1 March → 30 April 2026) and Google Workspace (LSA fully retired September 2024; Google Sync existing-user cutoff 14 March 2025) have effectively forced OAuth-2/OIDC for all third-party IMAP clients. Yahoo / AOL support both XOAUTH2 and OAUTHBEARER. The era of "give me a 16-character password and IMAP works forever" is *over* on the dominant cloud providers. [Microsoft Community Hub + 3](https://techcommunity.microsoft.com/blog/exchange/basic-authentication-deprecation-in-exchange-online-%E2%80%93-may-2022-update/3301866)

**Post-quantum TLS implications.** TLS 1.3 hybrid key-exchange (X25519+ML-KEM) is shipping in OpenSSL 3.5/3.6, BoringSSL, and Rustls in 2025–2026. IMAPS (port 993) inherits this transparently — no changes to the IMAP protocol itself. The longer-term concern is *harvest now, decrypt later*: any plaintext IMAP4 on port 143 today should be assumed harvestable.

**AI-driven email clients.** A live and largely speculative discussion: AI clients want bulk envelope+snippet access (today's `FETCH 1:* (UID ENVELOPE BODY.PEEK[HEADER.FIELDS (...)] PREVIEW)` works but is chatty), persistent push (IDLE / JMAP push), structured search, and stable cross-device IDs (OBJECTID/JMAP `id`). JMAP fits this workload markedly better than IMAP; expect every serious AI-mail product to ship JMAP support first and IMAP as a fallback. *(Forward-looking; based on the protocol fit, not a confirmed product roadmap.)*

**Is IMAP dying or dominant?** Both. IMAP4rev1 remains dominant in installed mailboxes — Dovecot alone reportedly serves ~76% of observable IMAP servers per the 2020 Open Email Survey. But on a *new project, today* basis, JMAP plus modern SMTP is the better choice; the pendulum on the *new client / new server* axis is clearly swinging away from IMAP, even as the installed base will run IMAP for another couple of decades. [Wikipedia](https://en.wikipedia.org/wiki/Dovecot_(software))

## Hooks for the article, infographic, and podcast

**60-second narrated hook (for ear/podcast intro).**

> "In 1985, in a basement at Stanford, a 28-year-old systems programmer named Mark Crispin had a problem. The campus had a thousand workstations and a thousand inboxes — but every time someone walked from their dorm to the lab, their email was on the wrong machine. POP, the only standard protocol at the time, would just download the messages and delete them from the server, which made multi-device a nightmare and made the workstation responsible for keeping mail safe. So Crispin wrote IMAP — Interim Mail Access Protocol — to keep email *on* the server and let any device manipulate it remotely. Forty years later, that same protocol, slightly evolved into IMAP4rev2 in 2021, is still how most of the world reads email. Dovecot, one open-source server, runs more than three quarters of all observable IMAP servers on the internet. And yet IMAP is also, quietly, dying — replaced by a JSON-based protocol called JMAP, designed at Fastmail and standardized in 2019, that fixes IMAP's mobile-unfriendly chattiness. This is the story of one of the longest-lived application protocols on the internet, the man who made it, and what comes after."

**Striking statistics with sources.**

- **Dovecot ≈ 76.9% of all observable IMAP servers globally** (Open Email Survey 2020, ~2.9 million instances). ([https://en.wikipedia.org/wiki/Dovecot_(software)](https://en.wikipedia.org/wiki/Dovecot_(software))) [Wikipedia](https://en.wikipedia.org/wiki/Dovecot_(software))
- The 2021 NO STARTTLS scan found **~320,000 email servers vulnerable** to STARTTLS command injection. ([https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html)) [The Hacker News](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html)
- EFAIL affected **23 of 35 S/MIME clients and 10 of 28 OpenPGP clients** tested in 2018. ([https://wiki.elvis.science/index.php?title=E-Fail](https://wiki.elvis.science/index.php?title=E-Fail))
- A single Cyrus server at Fastmail can host **40 isolated IMAP "slot" instances of 1 TB each** on one 4U box. ([https://www.fastmail.com/blog/standalone-mail-servers/](https://www.fastmail.com/blog/standalone-mail-servers/))
- IMAP is **40 years old in 2026** (Crispin's interim version, 1985–86; RFC 1064, 1988; RFC 9051, 2021).

**"Pause and think" moment.**

> Open your mail client. Right now. The little spinner that says "checking for new mail" — what is it actually doing? It's holding open a TCP connection that has been continuously alive, *probably for hours*, sending the word `IDLE` and waiting for the server to whisper back `* 1234 EXISTS`. There is no polling. There is no push notification system. It is a 1997 RFC, eight characters long, that has quietly survived the entire mobile-internet era. Now ask yourself: when your phone switches from Wi-Fi to LTE and the IDLE socket dies — what happens? *That* is why JMAP exists.

**Failure-story arc retold dramatically.**

> May 2018: a research team in Münster, Germany, publishes EFAIL. They have found a way to read your encrypted email. Not by breaking the encryption — by abusing how mail clients render HTML. The trick: send a victim a PGP-encrypted email wrapped in a malicious HTML envelope. When their client decrypts the inner ciphertext, it embeds the plaintext into an `<img src="…">` URL — and silently fetches it from the attacker's web server. Two-thirds of S/MIME clients and a third of OpenPGP clients are vulnerable. The disclosure is so explosive that the EFF tells everyone to disable PGP plug-ins entirely. Three years later, the same Münster team comes back with NO STARTTLS — a different attack class entirely, this time targeting the *transport*. They scan the internet and find 320,000 mail servers that will silently accept attacker-injected commands buffered in the same TCP segment as `STARTTLS`. The fix isn't a patch. The fix is a five-year-old IETF document called RFC 8314 that nobody bothered to read: *stop using STARTTLS on port 143, use implicit TLS on port 993*. The lesson: the boring infrastructure decisions you put off — implicit-TLS migrations, OAuth rollouts, UIDVALIDITY handling — are exactly the ones that will mug you, because IMAP has been around so long that the half-life of a bad default is measured in decades. [The Hacker News](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html)

## Caveats

- Open Email Survey market-share figures (Dovecot 76.9%, ~2.9 million observable servers) are from 2020 and were published by Open-Xchange, who own Dovecot — directionally consistent with later Dovecot Pro marketing claiming "76% of installed email backends," but a fresh independent 2025/2026 survey appears not to exist publicly. Treat as approximate.
- The "IMAP was first standardized in 1986" claim is widely repeated but the *first published* RFC was RFC 1064 in **July 1988**; 1985–1986 is the Stanford internal-development date Crispin himself cited. The original "Interim Mail Access Protocol" specification has not survived.
- "RFC 1437 was Crispin's first April Fools RFC" is repeated in some sources but the IETF/Stevens biographical material clearly identifies RFC 4042 (2005) as his "second" April Fools RFC; the first specific identification is less crisp — Wikipedia and Stevens cite RFC 1437 (1993) but the connection is not always documented.
- Microsoft's SMTP-AUTH basic-auth retirement date (March–April 2026) was, at the time of this report (May 2026), the published timeline; check the Microsoft Tech Community for any extensions or actual rejection percentages reached.
- Some forward-looking material in "Where things are heading" — particularly AI-client implications, post-quantum hybrid TLS rollout, and JMAP Calendars finalisation — is speculative or based on draft work and is flagged as such.
- This report cites JMAP and Stalwart heavily. Both are real and shipping, but JMAP's *non-Fastmail* commercial deployment is still small relative to IMAP. Do not interpret "growing JMAP adoption" as "imminent IMAP retirement."
- Where multiple sources gave conflicting Crispin biographical details (Stanford role, exact 1985 vs 1986 invention), the report follows the Wikipedia + Stevens Institute alumni record, which appear most consistent.
- All `[needs source]` items have either been resolved with a citation or removed; nothing has been fabricated. Where this report says "reportedly" or "per X," the claim is from that source and should be re-verified for high-stakes use.