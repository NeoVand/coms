---
id: email-stack
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: The Email Stack
synopsis: SMTP and IMAP, the protocol family that refused to die — and the new bulk-sender enforcement.
podcast_target_minutes: 15
position_in_book: 60 of 75
listening_order:
  prev: utilities-security/oauth-and-jwt
  next: patterns-failures/patterns
related_protocols: [imap, smtp, tcp, ip, tls, dns]
related_pioneers: [jon-postel]
related_outages: []
related_frontier: []
related_rfcs: [5321, 822, 6409, 8314, 1064]
images: []
visual_cues:
  - "A timeline of email's standardisation: Tomlinson's @-sign at BBN in 1971, RFC 821 and RFC 822 in August 1982, sendmail shipping with 4.1cBSD in 1983, RFC 1064 IMAP2 in July 1988, RFC 6409 Submission, RFC 8314 restoring port 465."
  - "A three-port diagram of modern SMTP: port 25 between MTAs, port 587 for Submission with STARTTLS, port 465 for Submissions with implicit TLS — with a red line through STARTTLS labelled 'strippable by an active attacker'."
  - "An enforcement-cliff calendar: 1 February 2024 Yahoo and Google bulk-sender requirements, 5 May 2025 Microsoft hard rejection with error 550 5.7.515, November 2025 Gmail moves from 4xx to 5xx, 1 March 2026 SMTP AUTH basic auth retirement begins, 30 April 2026 full rejection."
  - "A pie chart of IMAP server market share in 2025: a single dominant slice labelled Dovecot ~76.9%, with the remainder split among other implementations — based on the Open Email Survey 2020 of about 2.9 million instances."
  - "A SPF, DKIM, DMARC stack diagram: SPF as a DNS record listing allowed sending IPs, DKIM as a public key in DNS verifying a per-message signature, DMARC as the policy on top instructing receivers what to do when the other two fail."
---

# Part IX, Chapter — The Email Stack

## The hook

The era of give me a sixteen-character password and IMAP works forever is over. Microsoft 365 SMTP AUTH basic auth retires in two phases starting 1 March 2026, with full rejection by 30 April 2026. Google removed Less Secure Apps for personal accounts in May 2022 and for Workspace by September 2024. Email is the longest-running application of the internet, and right now it is being forced through the most disruptive authentication change of its lifetime.

## The story

### Ray Tomlinson Picked the @

Email predates almost everything else still running on the internet. The at-sign itself was chosen by Ray Tomlinson at BBN — Bolt, Beranek and Newman, the Cambridge consultancy that built the original ARPANET hardware — in 1971, when he modified a program called SNDMSG to send messages between machines. The symbol that now lives in every email address, every social-media handle, and every AWS resource name started with one engineer picking a separator that wasn't already taken by anything else in a username.

SMTP itself was born from RFC 788 in November 1981 and RFC 821 in August 1982, both edited by Jon Postel. RFC 821 assigned the protocol the contact socket numbered twenty-five — port 25, in the language we use today. The same month Dave Crocker shipped RFC 822, the standard for the message header format, the From and To and Subject lines we still send. Mechanism for SMTP itself — the HELO and MAIL FROM and RCPT TO command vocabulary, the store-and-forward hop-by-hop delivery — is the SMTP episode.

Sendmail came next. Eric Allman at UC Berkeley wrote a program called delivermail and then rewrote it as sendmail, which shipped with 4.1cBSD in 1983 — the first BSD release with TCP/IP. At its peak in 1996, sendmail ran roughly eighty percent of public mail servers. Today its share is under four percent. Postfix, written by Wietse Venema and released in 1998, and Exim, written by Philip Hazel in 1995, ate sendmail's market share over the next two decades.

Before SMTP won, there was a real fight. ITU-T's X.400, in its Red Book of 1984 and Blue Book of 1988, was the official future of email — strongly typed, ASN.1-encoded, with built-in encryption. SMTP won by being deployable on the Unix machines that were already in the building, and by routing around X.400's PTT-billed gateway model. X.400 today survives only in aviation's AMHS and military MMHS networks.

There is a port fact that almost everyone gets wrong, and it is worth getting right. Port 25 is for MTA-to-MTA relay between mail servers. Port 587 is Submission, with STARTTLS to upgrade the connection to TLS, defined in RFC 6409. Port 465 is Submissions — with the trailing s — using implicit TLS from the first byte, formally restored to that role by RFC 8314 in January 2018. Port 465 is preferred for new client integrations because STARTTLS is strippable by an active attacker who can intercept and downgrade the connection. The submission-versus-relay distinction is what enterprise mail administrators burn most of their time on. How TLS itself negotiates that encrypted channel is the TLS episode.

### IMAP and the Crispin Mythology

IMAP has a person attached to it the way few protocols do. Mark Reed Crispin — born 19 July 1956, died 28 December 2012 — wrote the original Interim Mail Access Protocol at Stanford's Knowledge Systems Laboratory in 1985 and 1986. The first server ran on a TOPS-20 system, the first client on a Xerox Lisp Machine. RFC 1064, in July 1988, was the first publicly distributed IMAP2.

There is no successful IMAP3, and the reason is one of the more entertaining standards stories. RFC 1203 in February 1991, by J. Rice, was a counter-proposal that never won the marketplace. The IESG reclassified it as Historic in 1993. The IMAP working group instead used RFC 1176 — the IMAP2 spec — as the basis for IMAP4. Which is why we have IMAP4rev1 and IMAP4rev2 today, and an empty hole where IMAP3 should be.

Crispin had a sense of humour. He wrote two April Fools' RFCs that are still cited. RFC 1437 in 1993 was a deadpan extension to MIME body parts. RFC 4042 in 2005 described UTF-9 and UTF-18, Unicode encodings optimised for the PDP-10's thirty-six-bit words. Crispin reportedly still ran TOPS-20 systems in his home as late as 2009. His Ten Commandments of How to Write an IMAP Client still circulates among engineers — *Thou shalt not fetch the entire mailbox at once* might as well be Commandment One.

If you connect to an IMAP server today, the chances are very high you are talking to Dovecot. The Open Email Survey of 2020, with about 2.9 million observed instances, put Dovecot at roughly 76.9 percent of all observable IMAP servers globally. Three out of four IMAP connections in the wild land on the same implementation. How IMAP's tagged command-response protocol actually works — the FETCH and SEARCH and IDLE commands, the persistent connection — is the IMAP episode.

### The Trust Layer and the 2024–2026 Enforcement Cliff

SMTP was designed in 1982 with no notion that senders might lie about who they were. Spammers could spoof any From address with no friction. The fix took two decades and three layered protocols, all of them sitting in DNS records.

SPF — Sender Policy Framework, RFC 7208 in 2014 — is a DNS record declaring which IP addresses may send mail for a domain. DKIM — DomainKeys Identified Mail, RFC 6376 in 2011 — adds cryptographic signatures over the message itself, with the public key published in DNS. DMARC, RFC 7489 in 2015, is the policy on top, telling receivers what to do when SPF or DKIM fails for your domain. How DNS itself stores and serves those records is the DNS episode.

The enforcement cliff started on 1 February 2024. Yahoo and Google's bulk-sender requirements went live: senders of more than five thousand messages per day to Gmail or Yahoo addresses had to implement SPF, DKIM, and DMARC with at least p=none, RFC 8058 one-click List-Unsubscribe — the deadline pushed to 1 June 2024 — valid PTR and forward-confirmed reverse DNS, and a spam-complaint rate under 0.30 percent. Gmail moved from 4xx soft errors in February 2024 to 5xx permanent rejections in November 2025. Microsoft Outlook and Hotmail added equivalent requirements with hard SMTP rejection — error 550 5.7.515 — starting 5 May 2025.

There is a fresh attack worth knowing by name. SMTP smuggling, disclosed by Timo Longin of SEC Consult at the 37C3 conference in December 2023 and January 2024, exploited the fact that outbound and inbound SMTP servers disagree on end-of-data sequences. The disagreement allows forged messages that pass SPF, DKIM, and DMARC anyway. Three CVEs landed at once: CVE-2023-51764 against Postfix, CVE-2023-51765 against Sendmail, CVE-2023-51766 against Exim.

EFAIL, presented at USENIX Security 2018, is the canonical attack on encrypted email. CBC and CFB malleability gadgets in S/MIME and OpenPGP, combined with HTML, CSS, and X.509 backchannels in IMAP-fetched HTML email, exfiltrated decrypted plaintext. The numbers were brutal: twenty-three of thirty-five S/MIME clients vulnerable, ten of twenty-eight OpenPGP clients vulnerable, ten CVEs in total.

The Microsoft 365 basic-auth retirement is the biggest user-visible change in years. Phased disablement began on 1 October 2022 across worldwide multi-tenant Microsoft 365 for EAS, EWS, IMAP, POP, RPS, MAPI/RPC, OAB, and Autodiscover. SMTP AUTH basic auth itself retires in two phases starting 1 March 2026, with full rejection by 30 April 2026, and default-disable for new tenants in December 2026. Every script, every printer, every legacy MFP that authenticates with a sixteen-character app password to send mail will need OAuth instead. How OAuth's authorization-code flow and JWT bearer tokens work is the previous chapter.

What's coming next is interesting. JMAP — RFC 8620 and RFC 8621, July and August 2019 — by Neil Jenkins and Bron Gondwana at Fastmail is a JSON-over-HTTPS replacement for IMAP, designed inside Fastmail starting around 2014. Stalwart Mail Server, a Rust project under AGPL that started in 2023, reached feature complete in 2025 with native JMAP plus IMAP4rev1, IMAP4rev2, POP3, ManageSieve, CalDAV, CardDAV, and WebDAV — funded in part by NLnet through the EU's NGI0 Entrust Fund. And DKIM2, in the draft *draft-ietf-dkim-dkim2-motivation* of November 2025, responds to the DKIM replay-attack epidemic by adding per-hop signatures with timestamps.

## The figures

### Jon Postel

Jon Postel, who lived from 1943 to 1998, edited RFC 821 in August 1982 — the original SMTP — alongside the foundational TCP/IP RFCs from a year earlier: RFC 791 for IPv4, RFC 792 for ICMP, RFC 793 for TCP, and RFC 768 for UDP. RFC 768 is three pages long and the most spartan and durable specification in networking. With David Reed in 1978 he made the architectural argument that split the original monolithic TCP into IP plus a separate transport layer, the decision that made UDP and decades later QUIC possible. He served as the RFC Editor for nearly three decades and was the first steward of what became IANA. His Robustness Principle — be conservative in what you send, be liberal in what you accept — entered the cultural canon. He has his own episode in the pioneers part of the book.

### RFC 5321 — Simple Mail Transfer Protocol

Edited by John Klensin and published in 2008, RFC 5321 is the current SMTP standard, obsoleting RFC 821 and RFC 2821. Standards-track. Same hop-by-hop store-and-forward model Postel specified in 1982, with twenty-six years of clarifications folded in.

### RFC 822 — Standard for the Format of ARPA Internet Text Messages

Dave Crocker's August 1982 specification of the message header format — the From, To, Subject, Date, and Message-ID lines that have framed every email since. Now classified historic, replaced by RFC 5322, but the format Crocker chose is what you still see in any raw message source.

### RFC 6409 — Message Submission for Mail

R. Gellens and J. Klensin, 2011. The internet standard that defined Submission as a distinct service from MTA-to-MTA relay, on port 587, with STARTTLS and authentication required. The reason your mail client and your mail server's relay path have different ports.

### RFC 8314 — Cleartext Considered Obsolete

K. Moore and C. Newman, January 2018. A proposed-standard RFC that formally restored port 465 to its role as Submissions with implicit TLS, after years of ambiguity. The document that ended the long argument over whether STARTTLS on port 587 was good enough — its answer was no, because STARTTLS is strippable.

### RFC 1064 — Interactive Mail Access Protocol Version 2

Mark Crispin, July 1988. The first publicly distributed IMAP2 specification, the basis the working group later used to skip IMAP3 and produce IMAP4. Now historic.

## What it taught the industry

The email stack taught the industry that a protocol designed without authentication will eventually have authentication grafted onto it from three different angles, and that the graft will take twenty years to land. SPF, DKIM, and DMARC are the three angles, and the 2024–2026 enforcement cliff is when receivers finally stopped accepting unauthenticated mail at scale. It taught the industry that strippable security — STARTTLS opportunistically upgrading port 587 — gets replaced by implicit security — TLS from the first byte on port 465 — once the threat model includes active attackers. And it taught the industry that the long tail of legacy authentication, the sixteen-character app password feeding a printer or a script, is the hardest thing of all to retire — which is why Microsoft is retiring it in phases over more than three years rather than all at once.

## Listening order

- **Before this chapter:** *OAuth 2.1 and JWT* — the modern authentication framework that every email client will need to speak once SMTP AUTH basic auth is gone, and the substrate of every Microsoft 365 mail integration after April 2026.
- **After this chapter:** *Recurring Patterns* — Part IX closes the utilities-and-security tour and the next part steps back to the patterns and failures that recur across every protocol we've covered.

## Where to go deeper

- The SMTP episode picks up the mechanism — the HELO and EHLO greeting, MAIL FROM and RCPT TO, the DATA command, the store-and-forward hop-by-hop model, and what STARTTLS and SMTP AUTH actually negotiate.
- The IMAP episode covers Crispin's tagged command-response protocol — the unique tags, pipelined commands, the FETCH command's flexibility for headers and MIME parts, server-side SEARCH, and IDLE for push notifications.
- The TLS episode is the encryption layer that protects every modern email connection — the 1.3 handshake collapsed to one round trip, and why implicit TLS on port 465 beats opportunistic STARTTLS on port 587.
- The DNS episode is where SPF, DKIM, and DMARC actually live — TXT records carrying sender policies, public keys, and receiver policies, served by the same hierarchy that resolves your mail server's A and MX records.
- The TCP episode is the reliable byte-stream underneath every SMTP and IMAP session — the handshake, sequence numbers, and retransmission that let a tagged IMAP command-response dialogue work at all.
- The IP episode is the addressing layer that the SPF and reverse-DNS checks ultimately key off — every bulk-sender requirement comes back to which IP address the message came from.

## Visual cues for image generation

- A timeline strip with five pins: Tomlinson's @-sign at BBN in 1971, RFC 821 and RFC 822 both in August 1982, sendmail shipping with 4.1cBSD in 1983, RFC 1064 IMAP2 in July 1988, RFC 8314 restoring port 465 in January 2018.
- A three-port diagram of modern SMTP: port 25 between MTAs, port 587 Submission with STARTTLS, port 465 Submissions with implicit TLS, with a red strikethrough on STARTTLS captioned strippable by an active attacker.
- An enforcement-cliff calendar from 1 February 2024 to 30 April 2026, with five pins: Yahoo and Google bulk-sender requirements live, Microsoft hard rejection at error 550 5.7.515 on 5 May 2025, Gmail moving from 4xx to 5xx in November 2025, SMTP AUTH basic auth retirement starting 1 March 2026, full rejection on 30 April 2026.
- A pie chart of IMAP server market share in 2025 with one dominant slice labelled Dovecot at roughly 76.9 percent, sourced to the Open Email Survey 2020 of about 2.9 million instances.
- A SPF, DKIM, DMARC stack diagram showing all three living in DNS — SPF as a TXT record listing sending IPs, DKIM as a public key in DNS verifying a per-message signature, DMARC as the policy that tells receivers what to do when the other two fail.

## Sources

- [RFC 5321 — Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc5321)
- [RFC 822 — Standard for the Format of ARPA Internet Text Messages](https://www.rfc-editor.org/rfc/rfc822)
- [RFC 6409 — Message Submission for Mail](https://www.rfc-editor.org/rfc/rfc6409)
- [RFC 8314 — Cleartext Considered Obsolete: Use of Transport Layer Security (TLS) for Email Submission and Access](https://www.rfc-editor.org/rfc/rfc8314)
- [RFC 1064 — Interactive Mail Access Protocol — Version 2](https://www.rfc-editor.org/rfc/rfc1064)
- [Jon Postel — Wikipedia](https://en.wikipedia.org/wiki/Jon_Postel)
