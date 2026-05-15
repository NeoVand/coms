---
id: imap
type: protocol
name: Internet Message Access Protocol
abbreviation: IMAP
etymology: "[I]nternet [M]essage [A]ccess [P]rotocol"
category: utilities-security
year: 1986
rfc: RFC 9051
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
  - utilities-security/email-stack
related_protocols: [tcp, tls, smtp, dns]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9051, 3501, 9755, 2683, 2177, 7162, 6186, 8314, 7628, 8620, 8621, 9586, 1064]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Alpine_email_client.png/500px-Alpine_email_client.png
    caption: Alpine email client (2009) — the successor to Pine, developed at the University of Washington by Mark Crispin's team. Pine was the reference implementation for IMAP, proving that server-side mail access could work across any device.
    credit: Image — University of Washington / Apache License 2.0, via Wikimedia Commons
visual_cues:
  - "An illustrated IMAP session as a vertical timeline — A001 LOGIN, A002 SELECT INBOX, A003 FETCH, A004 IDLE — each tag colour-coded to match its server response, with untagged * responses arriving asynchronously between them."
  - "The IMAP state machine as four boxes: Not Authenticated, Authenticated, Selected, Logout. Arrows labelled LOGIN, SELECT, CLOSE, LOGOUT. A dashed loop on Selected pointing back to itself for FETCH/STORE/SEARCH."
  - "A side-by-side mailbox view: the same inbox on a phone, a laptop, and a webmail tab — all showing the same five unread messages. Underneath, a single Dovecot server icon with three TCP arrows reaching up. Caption: 'state lives on the server, not the device.'"
  - "Port 993 versus port 143: two doors into the same house. Port 993 has a TLS lock on the outside (implicit TLS). Port 143 has the lock inside the entryway (STARTTLS), with a shadowy figure jamming the door before it closes."
  - "A bar chart of observable IMAP server market share circa 2020: Dovecot at 76.9 percent towering over a long tail of Cyrus, Courier, Exchange, hMailServer, MailEnable, others. Source label: Open Email Survey 2020."
  - "An animated diagram of IDLE: client sends IDLE, server replies '+ idling', a clock ticks, an asterisk-prefixed '* 1533 EXISTS' arrives unprompted, client sends DONE. The TCP socket pulse-line stays alive across the whole sequence."
---

# IMAP — Internet Message Access Protocol

## In one breath

IMAP is how your mail client reads messages from a server while leaving them stored remotely, so your phone, your laptop, and the webmail tab all see the same inbox, the same folders, and the same read-unread state. Every command carries a unique tag, every response echoes that tag back, and that tagging trick lets you pipeline commands and receive unsolicited server pushes on the same long-lived TCP connection. Forty years after Mark Crispin sketched it at Stanford, one open-source server — Dovecot — runs about 76.9 percent of all observable IMAP servers on the internet, which means three out of four times you check email today, you are talking to Dovecot.

## The pitch (cold-open)

In 1985, in a basement at Stanford, a 28-year-old systems programmer named Mark Crispin had a problem. The campus had a thousand workstations and a thousand inboxes, but every time someone walked from their dorm to the lab, their mail was on the wrong machine. POP would just download messages and delete them from the server, which made multi-device a nightmare. So Crispin wrote IMAP — Interim Mail Access Protocol — to keep mail on the server and let any device manipulate it remotely. Forty years later, that same protocol, evolved into IMAP4rev2 in 2021, is still how most of the world reads email — and it is also, quietly, dying, replaced piece by piece by a JSON-over-HTTPS protocol called JMAP that fixes IMAP's mobile-network unfriendliness.

## How it actually works

IMAP is text-based, line-oriented, and tagged. Every interaction is a CRLF-terminated line, except inside literals, which are counted byte strings. Each client command starts with a unique alphanumeric tag like A0001, and the server's matching tagged response — OK, NO, or BAD — signals completion. Untagged responses, prefixed with an asterisk, carry data and unsolicited status updates. Continuation requests, prefixed with a plus sign, ask the client to send more data, like the body of a SASL challenge or a literal payload.

The simulator walks through the canonical session in seven steps. First, the server sends an untagged greeting the moment the TLS handshake completes — `* OK IMAP4rev2 server ready`. The asterisk means the response is not associated with any client command; the server volunteers that it is ready. Second, the client sends `A001 LOGIN user@example.com password`. In production, SASL mechanisms like OAUTHBEARER or XOAUTH2 are preferred over plain LOGIN — Microsoft 365 disabled basic-auth IMAP back in October 2022 and Google Workspace finished its less-secure-apps retirement on 30 September 2024, so password-only IMAP is no longer an option on the dominant cloud providers. Third, the server replies `A001 OK LOGIN completed`, with the matching tag confirming exactly which command succeeded.

Fourth, the client sends `A002 SELECT INBOX`. SELECT opens a mailbox in read-write mode; EXAMINE would open it read-only. Fifth, the server returns the complete mailbox state: `* 47 EXISTS`, `* 2 RECENT`, the available flags, and a `UIDVALIDITY` value the client must keep. If UIDVALIDITY ever changes between sessions, every UID the client cached is dead and a full resync is required.

Sixth, the client sends `A003 FETCH 47 (ENVELOPE BODY[TEXT])`. This is IMAP's superpower over POP3: the client asks for just the parsed envelope and the text body of message 47, no attachments, no full MIME tree. You can ask for `BODYSTRUCTURE` to get the parsed MIME tree and then fetch only `BODY[1.2]` — say, one image — without downloading the whole 30-megabyte message. Seventh, the server returns the data, the `\Seen` flag flips, and every other device on the account sees the new state.

The eighth move, not in the simulator but central to how IMAP feels in practice, is `A004 IDLE`. The server replies `+ idling`, the connection stays open, and when new mail lands the server pushes `* 1533 EXISTS` unprompted. The client sends `DONE` to leave IDLE. This is how push email works on IMAP, with no separate notification channel.

### Header at a glance

IMAP has no binary header. Each command and response is a line of ASCII, parsed by structure rather than offsets. The interesting fields are conceptual.

- **Tag.** A short alphanumeric prefix on every client command — A0001, A0002, and so on. The server's matching tagged response signals completion. Tags let you pipeline: send A002 before A001's response arrives, because tags match responses to commands unambiguously.
- **Status code.** Tagged responses end in `OK` (success), `NO` (operational failure such as a missing mailbox), or `BAD` (the server cannot parse the command). `BYE` is fatal — the server is closing the connection — but `NO` is recoverable and the client can keep going.
- **Untagged data.** Anything starting with `*` carries data or status. `* 5 EXISTS`, `* 3 EXPUNGE`, `* SEARCH 1 4 7 12`, `* FETCH …`, `* CAPABILITY …`. Servers can send these at any time, so clients must accept them on every read.
- **Continuation request.** A line starting with `+` asks the client to send more data — a SASL challenge response, or the bytes of a literal.
- **Data types.** Atoms (unquoted tokens), numbers (32-bit, or 64-bit since IMAP4rev2 for sizes), strings (either `"quoted"` or `{N}\r\n…N bytes…` literals), parenthesized lists, and `NIL`. The literal-versus-NIL distinction matters: `BODY[1] NIL` means the body part is absent; `BODY[1] "NIL"` means it contains the three-character string "NIL".

### State machine in three sentences

After the TCP connect and optional TLS handshake, IMAP enters Not Authenticated. After LOGIN or AUTHENTICATE the client moves to Authenticated, where it can manage mailboxes — CREATE, DELETE, LIST, STATUS, APPEND, IDLE — but cannot yet read messages. SELECT or EXAMINE pushes the client into Selected, where the message-level commands FETCH, STORE, COPY, MOVE, SEARCH, EXPUNGE, and UID variants apply, until CLOSE or UNSELECT returns to Authenticated, or LOGOUT closes the connection.

### Reliability, sync, and security mechanics

IMAP relies entirely on TCP for reliability and ordering. It has no checksum of its own. For correctness across reconnections, IMAP layers three numbering systems on top of TCP. Sequence numbers are 1-based positions in the currently selected mailbox, but they get re-packed every EXPUNGE, so they are unstable. UIDs are per-mailbox unique identifiers that, together with the 32-bit UIDVALIDITY value, are stable across sessions. CONDSTORE and QRESYNC, defined in RFC 7162 from May 2014, attach a 64-bit MODSEQ to every change so a client can resync after disconnect with a single `SELECT INBOX (QRESYNC (uidvalidity highestmodseq))`.

Security has two distinct deployments. Implicit TLS on port 993 — IMAPS — does the TLS handshake before any IMAP byte crosses the wire. RFC 8314 from January 2018 makes this the recommended deployment and declares cleartext mail access obsolete. STARTTLS on port 143 starts in cleartext, the client sends `STARTTLS`, the TLS handshake runs, and state is meant to be reset. STARTTLS is vulnerable to plaintext-command-injection and response-injection attacks — more on that under failure modes. Authentication is pluggable through SASL: PLAIN and the legacy LOGIN, SCRAM-SHA-256, GSSAPI for Kerberos, EXTERNAL for TLS client certificates, OAUTHBEARER from RFC 7628 (August 2015), and Google's pre-RFC XOAUTH2.

## Where it shows up in production

**Dovecot.** First released in 2002 by Timo Sirainen, now an Open-Xchange product. The 2020 Open Email Survey from Open-Xchange measured Dovecot at 76.9 percent of observable IMAP servers globally, an extrapolated 2.9 million instances. The 2017 Mozilla MOSS-funded Cure53 audit reported the "excellent security-standing of Dovecot." It supports mbox, Maildir, sdbox, and mdbox storage formats, plus Director (consistent-hash proxy), object-storage backends, and replication via dsync.

**Cyrus IMAP.** Active since 1993 at Carnegie Mellon. Fastmail engineers do most current development and sit on the Cyrus board. JMAP arrived in Cyrus 3.8.3 in May 2024. Fastmail's slot-and-store architecture co-locates roughly 40 separate Cyrus instances on each 4U box, each slot carrying about 1 TB of data, replicated across New York, Iceland, and Amsterdam.

**Stalwart Mail Server.** Rust, AGPL-licensed, started in 2023. All-in-one: SMTP, IMAP4rev1 and rev2, POP3, JMAP, ManageSieve, CalDAV, CardDAV, WebDAV. Native JMAP rather than IMAP-with-JMAP-bolted-on. Reached "feature complete" in 2025 with FoundationDB, PostgreSQL, MySQL, RocksDB, and SQLite back-ends and clustering support. Funded in part by NLnet via the EU's NGI0 Entrust Fund.

**Apache James.** Java implementation; ships JMAP conforming to RFC 8620 and 8621 since version 3.6.0 in 2021.

**Microsoft Exchange and Exchange Online.** IMAP4 supported but second-class. The primary access methods are MAPI/HTTP, EWS, the Graph API, and Exchange ActiveSync. Basic-auth IMAP was disabled in Exchange Online from October 2022 onward — OAUTHBEARER or XOAUTH2 is required.

**Major IMAP-exposing services.** Gmail, Outlook.com and Microsoft 365, Yahoo and AOL, iCloud Mail, Fastmail, Migadu, Mailbox.org, Posteo, GMX, Yandex. Tutanota does not offer IMAP at all — incompatible with their end-to-end encryption model. ProtonMail requires Proton Mail Bridge, a local desktop application that exposes a 127.0.0.1 IMAP and SMTP listener after decrypting messages locally.

**UW-IMAP and Courier-IMAP.** UW-IMAP, Crispin's reference implementation written at the University of Washington from 1988 to 2008 (and forked into Panda IMAP in 2008), is end-of-life but still ships in some legacy distributions. Courier-IMAP, by Sam Varshavchik, is a Maildir-only design that competed with UW-IMAP for years.

## Things that go wrong

**EFAIL (USENIX Security 2018).** A team at Münster University of Applied Sciences — Poddebniak, Dresen, Müller, Ising, Schinzel — together with Friedberger at NXP/KU Leuven and Somorovsky and Schwenk at Ruhr-Universität Bochum, published a way to read encrypted email without breaking the encryption. They abused how mail clients render HTML. Send the victim a PGP-encrypted message wrapped in a malicious HTML envelope; when the client decrypts the inner ciphertext, it embeds the plaintext into an `<img src="…">` URL and silently fetches it from the attacker's web server. Combined with CBC and CFB malleability gadgets in S/MIME and OpenPGP, the team got 23 of 35 S/MIME clients and 10 of 28 OpenPGP clients to leak plaintext, with ten CVEs filed (CVE-2018-4111, -4221, -4227, -5162, -5184, -5185, -8160, -8305, -12372, -12373).

The disclosure was so explosive that the EFF told everyone to disable PGP plug-ins entirely. The lesson, retold in the Email Stack chapter episode, is that crypto in transit and crypto in MIME bodies are different problems, and that "render this HTML and fetch its images" is a covert channel right next to your decrypted plaintext.

**NO STARTTLS (USENIX Security 2021).** The same Münster team came back three years later with Hanno Böck and a different attack class entirely, this time targeting the transport. They scanned the internet and found roughly 320,000 mail servers vulnerable to STARTTLS command injection — a man-in-the-middle can buffer extra bytes after the `STARTTLS` line that get processed inside the encrypted session. They also documented the IMAP `PREAUTH` downgrade: a MITM injects a `* PREAUTH` greeting before STARTTLS, forcing the client to skip TLS entirely. More than 40 CVEs landed across Apple Mail, Gmail, Thunderbird, Mutt, Claws, Evolution, Exim, Mail.ru, Samsung Email, Yandex, and KMail.

The fix wasn't a patch. The fix was a five-year-old IETF document — RFC 8314, January 2018 — that nobody bothered to read: stop using STARTTLS on port 143, use implicit TLS on port 993. The chapter on the Email Stack covers this arc as part of the broader 2024 to 2026 enforcement cliff.

**CVE-2024-23184 and CVE-2024-23185 (Dovecot, August 2024).** Two related denial-of-service flaws in Dovecot ≤2.3.21. CVE-2024-23184 exhausts CPU when parsing 100,000-plus address headers — about 12 seconds of CPU at 100,000 headers, 18 minutes at 500,000. CVE-2024-23185 is an unbounded `full_value` buffer in the message-header parser; an authenticated user can trigger it via APPEND. Both fixed in 2.3.21.1.

**CVE-2021-38542 (Apache James) and CVE-2020-15685 (Thunderbird).** Both STARTTLS attacks. Apache James ≤3.6.0 had STARTTLS command-injection where a man-in-the-middle could buffer extra bytes processed inside the encrypted session. Thunderbird's CVE-2020-15685 was IMAP response-injection via STARTTLS — the attacker injects untagged responses ahead of the TLS handshake that the client treats as legitimate post-TLS server traffic. Both trace back to the original Postfix and Wietse Venema STARTTLS plaintext-injection class from 2011 (CVE-2011-0411, CVE-2011-1926).

**Fastmail imap21 (27 February 2014).** A classic case study in Cyrus replication failure. A stuck sync log entry caused new-user assignments to silently halt. Fastmail's own write-up — "Cleaning up from an IMAP server failure" — is a small masterpiece of post-incident transparency.

## Common pitfalls (for the practitioner)

- **UIDVALIDITY changes silently break clients.** A backup restore, a store migration, or some filesystem operations can change UIDVALIDITY. Clients that ignore the change either silently re-download everything or panic with "INBOX is empty." Always check UIDVALIDITY on every SELECT and discard the local cache when it changes.
- **IDLE timeout misconfiguration.** RFC 2683 says servers must allow at least 30 minutes of inactivity, and RFC 2177 advises clients to drop and re-issue IDLE every 29 minutes. If your server's `imap_idle_notify_interval` is shorter than the home-router NAT keepalive — typically 5 to 10 minutes for "idle" TCP — clients disconnect every few minutes.
- **Connection leaks.** Clients that forget to LOGOUT, multiplied by autologout failures, exhaust file descriptors. `ulimit -n` is the first knob to raise.
- **EXPUNGE and FETCH races on shared mailboxes.** A FETCH for a message another client has just EXPUNGEd is real. RFC 2180 documents the recommended server behaviour. Clients need to handle "FETCH for a message that no longer exists" gracefully.
- **Mailbox-name encoding mismatches.** Modified UTF-7 in IMAP4rev1 versus UTF-8 in IMAP4rev2 produces folders that appear with garbled names like `INBOX.Gel&APY-schte`. Especially common when migrating between rev1 and rev2 servers.
- **Inconsistent hierarchy separators.** `/` versus `.` confuses clients that hard-code one or the other.
- **NAMESPACE confusion.** Personal, Other, and Shared namespaces (RFC 2342) are routinely misconfigured.
- **SRV records advertising STARTTLS-only.** RFC 8314 §4.5.2 prefers implicit-TLS port 993; if your `_imap._tcp` SRV record only points to port 143, modern clients will downgrade.

## Debugging it

- `openssl s_client -connect imap.example.com:993 -crlf` opens an interactive IMAPS session you can drive by hand. Type `A001 CAPABILITY`, then `A002 LOGIN user pass`, then `A003 SELECT INBOX`, and so on.
- `nc` or `ncat` for cleartext port 143 — only useful for diagnosing pre-TLS behaviour.
- Wireshark with the `imap` dissector. Works on cleartext or, for TLS, on streams decrypted via `SSLKEYLOGFILE`.
- Dovecot admin: `doveadm log find`, `doveadm who`, `doveadm fetch`, `doveadm sync`, `doveadm mailbox status`.
- Cyrus admin: `mbexamine`, `cyradm`, `quota`, `ctl_mboxlist`.
- `imaptest` — Dovecot's load and conformance tester.
- `offlineimap` and `mbsync` (`isync`) for migrations and dev sandboxes.

Tuning knobs worth watching in production: `mail_max_userip_connections` in Dovecot — modern clients open 5 to 10 connections per account because they keep a separate IDLE per folder. `ssl_session_cache=shared:imap:8M` for TLS resumption — handshakes dominate connect cost. `COMPRESS=DEFLATE` saves 60 to 80 percent on FETCH bandwidth on high-latency or mobile clients. Linux `net.ipv4.tcp_keepalive_time=300` is your floor against silent NAT drops on long IDLEs.

What to monitor: authentication-failure rate per source IP (brute force and password spray detection), concurrent IDLE connections per user, 95th and 99th percentile latency of `SELECT INBOX` and `UID FETCH` on inboxes with more than 100,000 messages, FETCH bytes per second, search times, `imapd` RSS per process and file-descriptor usage, and every UIDVALIDITY change — every change should be intentional and logged.

## What's changing in 2026

**RFC 9755 — IMAP Support for UTF-8 (March 2025).** Replaces RFC 6855. Brings IMAP4rev1 into syntactic alignment with IMAP4rev2 on UTF-8 in headers and mailbox names.

**RFC 9586 — UIDONLY extension (May 2024).** Lets clients drop sequence numbers entirely and work only with UIDs, eliminating a whole class of EXPUNGE-related races.

**Microsoft 365 SMTP AUTH basic-auth retirement.** Phased disablement starting 1 March 2026, full rejection by 30 April 2026. Default-disable for new tenants in December 2026. The era of "give me a 16-character password and IMAP works forever" is over on the dominant cloud providers.

**Stalwart Mail Server feature-complete in 2025.** Native JMAP plus IMAP4rev1, IMAP4rev2, POP3, ManageSieve, CalDAV, CardDAV, WebDAV. NLnet and EU NGI0 funded.

**JMAP family expansion through 2024 to 2025.** RFC 9610 (Contacts, December 2024), RFC 9670 (Sharing, November 2024), RFC 9661 (Sieve Scripts, 2024), RFC 9425 (Quotas, 2023), RFC 9404 (Blob Management, 2023), RFC 9749 (VAPID for JMAP Push). JMAP for Calendars is in the RFC Editor queue as of 2025.

**Active IETF working groups.** EXTRA continues to add IMAP extensions — `draft-ietf-extra-imap-messagelimit` (server-announced batch limits) is active, and `draft-ietf-mailmaint-imap-extensions-suggestions-01` (2025) curates a recommended extension set for new general-purpose implementations.

**Post-quantum TLS implications.** TLS 1.3 hybrid key exchange (X25519 plus ML-KEM) is shipping in OpenSSL 3.5 and 3.6, BoringSSL, and Rustls in 2025 to 2026. IMAPS on port 993 inherits this transparently — no IMAP protocol change required. The longer-term concern is harvest-now-decrypt-later: any plaintext IMAP4 on port 143 today should be assumed harvestable.

**IMAP4rev2 adoption.** Five years after RFC 9051, adoption is partial. Dovecot 2.4-series, Cyrus, Stalwart, and Crymap advertise IMAP4rev2. Apple iCloud, Gmail, and Microsoft 365 still primarily advertise IMAP4rev1. The pragmatic story is that IMAP4rev1 plus the right extensions already approximates IMAP4rev2, so migration pressure is low.

## Fun facts (host material)

Mark Crispin wrote two April Fools' RFCs. RFC 1437 from 1993 was nominally an extension of MIME for transmission of body parts. RFC 4042 from 2005 described UTF-9 and UTF-18 — Unicode encodings optimized for the PDP-10's 36-bit words. Crispin reportedly still ran TOPS-20 systems in his home in 2009.

Modified UTF-7 — IMAP4rev1's mailbox-name encoding — chose `&` as the shift character instead of `+` because `+` was already common in Usenet newsgroup names like `comp.std.c++`, and IMAP servers historically presented Usenet groups as folders. It chose `,` instead of `/` in the Base64 alphabet because `/` was the typical hierarchy separator. Both choices look bizarre until you remember 1996.

Why port 143? It was simply the next available well-known TCP port assigned by IANA after IMAP2 was specified in 1988. The IANA registry literally lists `imap 143/tcp imap2 # Interim Mail Access Proto v2`. Port 220, registered for IMAP3, points to a version that never shipped. Port 993 is the implicit-TLS port, originally registered for SSL and re-anchored to TLS by RFC 8314.

The IMAP tag system has no direct ancestor. SMTP is reply-code-based; POP3 is single-command-at-a-time. Tagging was Crispin's own design choice to allow command pipelining and unsolicited untagged data on the same TCP stream — which is also what made IDLE possible nine years later.

Crispin himself called RFC 2060 — IMAP4rev1, the spec he wrote — an "abortion" in some mailing-list correspondence. His tone on the imap-protocol and imapext lists was famously direct. His "Ten Commandments of How to Write an IMAP client" still circulates; "Thou shalt not fetch the entire mailbox at once" might as well be Commandment 1.

A single Cyrus server at Fastmail can host 40 isolated IMAP "slot" instances of about 1 TB each on one 4U box. Each slot is its own independent Cyrus process; replication runs across slots in New York, Iceland, and Amsterdam.

## Where this connects in the book

- **Part Utilities and Security, Chapter "The Email Stack"** — the long arc of SMTP plus IMAP, the Crispin mythology, the 2024-to-2026 bulk-sender enforcement cliff (Yahoo and Google's 1 February 2024 deadline; Gmail moving from 4xx to 5xx rejections in November 2025; Microsoft's 5 May 2025 hard rejection at error 550 5.7.515), and the JMAP frontier. EFAIL and NO STARTTLS are told in full there.
- **Part The Story of the Internet, Chapter "The AI Agent Layer (2024–)"** — IMAP appears in the long-tail list of older application-layer protocols that have held their niches for fifteen years while almost nothing new happened at L7, before MCP and A2A arrived in November 2024 and April 2025.
- **Part Foundations, Chapter "Protocols for AI Agents"** — same long-tail framing: the older application protocols (SMTP, IMAP, XMPP, MQTT) that the new MCP-and-A2A layer joins rather than replaces.

## See also (other protocol episodes)

If you have heard the SMTP episode, IMAP is the other half of the email story. SMTP is the post office: transactional, store-and-forward, sender-driven, MAIL FROM and RCPT TO and DATA. IMAP is the mailbox: persistent, stateful, recipient-driven, SELECT and FETCH and IDLE. SMTP delivers; IMAP retrieves; together they form the complete email system. Both use MIME and the RFC 5322 message format, but the state machines are unrelated. A modern mail user agent typically talks SMTP submission on port 587 or 465 outbound and IMAPS on port 993 inbound, against entirely different server software.

The TCP episode matters here because IMAP rides TCP for everything. Unlike HTTP/1.1, IMAP connections are long-lived — a healthy IDLE connection can stay open for hours. NAT timeouts on home routers (often 5 to 10 minutes for idle TCP) and mobile NATs are the practical reason RFC 2177 recommends re-IDLE every 29 minutes, and the practical reason JMAP exists at all.

If you have heard the TLS episode, IMAP is one of the cleanest case studies in why STARTTLS lost. Implicit TLS on port 993 does the handshake before any IMAP byte crosses the wire — there is no plaintext window for an attacker to inject into. STARTTLS on port 143 starts in cleartext, runs `STARTTLS`, and is meant to reset state — but as the NO STARTTLS paper showed in 2021, sloppy buffering across the boundary lets attackers smuggle commands and responses across the TLS line. RFC 8314 declared cleartext IMAP obsolete in January 2018; five years later, hundreds of thousands of servers still hadn't migrated.

The DNS episode is the cross-reference for client autoconfiguration. IMAP does not use MX records — those are inbound-SMTP only. RFC 6186 from March 2011 defines `_imap._tcp.<domain>` and `_imaps._tcp.<domain>` SRV records (plus `_submission._tcp` and `_pop3._tcp`) so that a mail user agent needs only the user's email address to find the right server. Mozilla's autoconfig (XML at `https://autoconfig.thunderbird.net/` or `https://autoconfig.<domain>/mail/config-v1.1.xml`) and Microsoft's Autodiscover (HTTPS POST to `https://autodiscover.<domain>/autodiscover/autodiscover.xml`) are the two competing client-configuration mechanisms; modern servers like Stalwart 0.8.0-plus ship both alongside the SRV records.

## Visual cues for image generation

- An illustrated IMAP session as a vertical timeline — A001 LOGIN, A002 SELECT INBOX, A003 FETCH, A004 IDLE — each tag colour-coded to match its server response, with untagged `*` responses arriving asynchronously between them.
- The IMAP state machine as four boxes: Not Authenticated, Authenticated, Selected, Logout. Arrows labelled LOGIN, SELECT, CLOSE, LOGOUT. A dashed loop on Selected pointing back to itself for FETCH, STORE, and SEARCH.
- A side-by-side mailbox view: the same inbox on a phone, a laptop, and a webmail tab, all showing the same five unread messages. Underneath, a single Dovecot server icon with three TCP arrows reaching up. Caption: "state lives on the server, not the device."
- Port 993 versus port 143: two doors into the same house. Port 993 has a TLS lock on the outside (implicit TLS). Port 143 has the lock inside the entryway (STARTTLS), with a shadowy figure jamming the door before it closes.
- A bar chart of observable IMAP server market share circa 2020: Dovecot at 76.9 percent towering over a long tail of Cyrus, Courier, Exchange, hMailServer, MailEnable, others. Source label: Open Email Survey 2020.
- An animated diagram of IDLE: client sends `IDLE`, server replies `+ idling`, a clock ticks, an asterisk-prefixed `* 1533 EXISTS` arrives unprompted, client sends `DONE`. The TCP socket pulse-line stays alive across the whole sequence.

## Sources

**RFCs**

- [RFC 9051 — IMAP4rev2 (2021)](https://datatracker.ietf.org/doc/html/rfc9051)
- [RFC 3501 — IMAP4rev1 (2003)](https://www.rfc-editor.org/rfc/rfc9051.pdf)
- [RFC 9755 — IMAP Support for UTF-8 (2025)](https://datatracker.ietf.org/doc/rfc9755/)
- [RFC 2683 — IMAP4 Implementation Recommendations (1999)](https://www.rfc-editor.org/rfc/rfc2683.html)
- [RFC 2177 — IDLE (1997)](https://datatracker.ietf.org/doc/html/rfc2177)
- [RFC 7162 — CONDSTORE / QRESYNC (2014)](https://datatracker.ietf.org/doc/html/rfc7162)
- [RFC 6186 — SRV records for IMAP / POP / Submission (2011)](https://www.rfc-editor.org/rfc/rfc6186.html)
- [RFC 8314 — Cleartext Considered Obsolete (2018)](https://www.rfc-editor.org/rfc/rfc8314.html)
- [RFC 7628 — SASL OAuth (2015)](https://www.rfc-editor.org/rfc/rfc7628.html)
- [RFC 1064 — IMAP2 (1988)](https://www.rfc-editor.org/rfc/rfc1064)
- [RFC 1176 — IMAP2 revised (1990)](https://datatracker.ietf.org/doc/html/rfc1176)
- [RFC 1203 — IMAP3 (1991, Historic)](https://datatracker.ietf.org/doc/html/rfc1203)
- [RFC 2061 — IMAP2bis history](https://datatracker.ietf.org/doc/html/rfc2061)
- [draft-ietf-extra-imap-uidonly (RFC 9586)](https://datatracker.ietf.org/doc/draft-ietf-extra-imap-uidonly/08/)
- [draft-ietf-extra-imap-messagelimit](https://datatracker.ietf.org/doc/html/draft-ietf-extra-imap-messagelimit-10)
- [draft-ietf-mailmaint-imap-extensions-suggestions-01](https://datatracker.ietf.org/doc/html/draft-ietf-mailmaint-imap-extensions-suggestions-01)
- [draft-leiba-imap-implement-guide](https://datatracker.ietf.org/doc/html/draft-leiba-imap-implement-guide)

**Papers**

- [EFAIL — Poddebniak et al., USENIX Security 2018](https://www.usenix.org/conference/usenixsecurity18/presentation/poddebniak)
- [EFAIL project page](https://efail.de/)
- [NO STARTTLS — Poddebniak, Ising, Böck, Schinzel, USENIX Security 2021](https://nostarttls.secvuln.info/)

**Vendor and engineering blogs**

- [Fastmail — Cleaning up from an IMAP server failure (2014)](https://www.fastmail.com/blog/cleaning-up-from-an-imap-server-failure/)
- [Fastmail — Standalone Mail Servers](https://www.fastmail.com/blog/standalone-mail-servers/)
- [Fastmail — Architecture overview](https://www.fastmail.com/help/technical/architecture.html)
- [Fastmail — JMAP, the new email open standard](https://www.fastmail.com/blog/jmap-new-email-open-standard/)
- [Open-Xchange — Dovecot IMAP servers market share](https://blog.open-xchange.com/dovecot-imap-servers-market-share-has-grown-again/)
- [Stalwart Mail Server](https://stalw.art/)
- [Stalwart on GitHub](https://github.com/stalwartlabs/stalwart)
- [Cyrus IMAP — JMAP install notes](https://www.cyrusimap.org/imap/download/installation/http/jmap.html)
- [Cyrus IMAP — architecture reference](https://www.cyrusimap.org/imap/reference/architecture.html)
- [Dovecot security advisories](https://dovecot.org/security)
- [Microsoft Learn — OAuth for IMAP/POP/SMTP in Exchange Online](https://learn.microsoft.com/en-us/exchange/client-developer/legacy-protocols/how-to-authenticate-an-imap-pop-smtp-application-by-using-oauth)
- [Microsoft Learn — Basic auth deprecation in Exchange Online](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/deprecation-of-basic-authentication-exchange-online)
- [Microsoft Tech Community — SMTP AUTH basic auth deprecation timeline](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)
- [Google Workspace — Winding down LSA and Google Sync](https://workspaceupdates.googleblog.com/2023/09/winding-down-google-sync-and-less-secure-apps-support.html)
- [Google Workspace — Transition from LSA to OAuth](https://knowledge.workspace.google.com/admin/sync/transition-from-less-secure-apps-to-oauth)
- [JMAP specification index](https://jmap.io/spec.html)
- [APNIC — Why STARTTLS should be avoided](https://blog.apnic.net/2021/11/18/vulnerabilities-show-why-starttls-should-be-avoided-if-possible/)
- [Julia Evans — Implementing focus-and-reply for Fastmail with JMAP](https://jvns.ca/blog/2020/08/18/implementing--focus-and-reply--for-fastmail/)

**News**

- [The Hacker News — Dozens of STARTTLS-related flaws found (2021)](https://thehackernews.com/2021/08/dozens-of-starttls-related-flaws-found.html)
- [Mark Crispin obituary, LWN (2013)](https://lwn.net/Articles/539655/)
- [ITPro Today — Mark Crispin, father of IMAP, RIP](https://www.itprotoday.com/microsoft-365/mark-crispin-father-of-imap-rip)
- [Hacker News — Mark Crispin discussion thread](https://news.ycombinator.com/item?id=4825893)

**Wikipedia**

- [Internet Message Access Protocol](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol)
- [Mark Crispin](https://en.wikipedia.org/wiki/Mark_Crispin)
- [Dovecot (software)](https://en.wikipedia.org/wiki/Dovecot_(software))
- [Cyrus IMAP server](https://en.wikipedia.org/wiki/Cyrus_IMAP_server)
- [UW IMAP](https://en.wikipedia.org/wiki/UW_IMAP)
- [JSON Meta Application Protocol (JMAP)](https://en.wikipedia.org/wiki/JSON_Meta_Application_Protocol)
- [Opportunistic TLS](https://en.wikipedia.org/wiki/Opportunistic_TLS)
