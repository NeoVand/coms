import type { SubcategoryStory } from './types';

export const mailFileTransferStory: SubcategoryStory = {
	subcategoryId: 'mail-file-transfer',
	tagline:
		'The oldest application protocols — text on the wire, store-and-forward, and the surprising afterlife of 50-year-old designs',
	sections: [
		{
			type: 'narrative',
			title: 'The Survivors of the 1970s',
			text: `Long before the World Wide Web, before [[tcp|TCP/IP]], before personal computers, the ARPANET had two killer apps: **file transfer** and **electronic mail**. The protocols that carried them were defined in the early 1970s and — astonishingly — are still running the world's mail and a meaningful chunk of its file transfer in 2025.\n\n- **[[ftp|FTP]]** ([[rfc:114|RFC 114]], 1971; modernized as [[rfc:959|RFC 959]], 1985) is the oldest protocol in this app. It defines two separate connections — a *control* connection for commands and a *data* connection for the file itself — and a rich set of commands (LIST, RETR, STOR, RNFR, RNTO). FTP's design is older than TCP itself; the original ran on NCP, the pre-TCP ARPANET protocol.\n- **[[smtp|SMTP]]** ([[rfc:821|RFC 821]], 1982; modernized as [[rfc:5321|RFC 5321]], 2008) defines how mail servers hand mail to each other. Send a message; the SMTP server takes responsibility for delivering it; if the receiving server is unreachable, queue and retry until success or bounce. The store-and-forward model is the same one Ray Tomlinson invented in 1971 when he chose \`@\` as the separator between user and host.\n- **[[imap|IMAP]]** ([[rfc:1064|RFC 1064]], 1988; current spec [[rfc:3501|RFC 3501]], 2003) is how your mail *client* talks to your mail *server*. Unlike POP3 (which downloads and deletes), IMAP lets the server be the source of truth — multiple devices see the same folders, the same read/unread state, the same starred messages.\n\nAll three are *text-based protocols*. You can speak them by hand with a telnet session. They were designed when "the network" meant a few dozen academic machines and "security" meant trusting everyone who had an account. Every modern deployment wraps them in TLS, layers anti-spam on top, and gates them behind authentication — but the wire formats are unchanged.\n\nThe 50-year survival of these protocols is the most striking fact about them. Other 1970s designs got swept away. These didn't.`
		},
		{
			type: 'pioneers',
			title: 'The Mail and File Architects',
			people: [
				{
					id: 'ray-tomlinson',
					name: 'Ray Tomlinson',
					years: '1941–2016',
					title: 'Inventor of Network Email',
					org: 'BBN Technologies',
					contribution:
						"Implemented the first network email between two ARPANET hosts in late 1971 using a program called SNDMSG. To distinguish a user\\'s mailbox from a host name, Tomlinson picked the `@` symbol from his Model 33 Teletype keyboard — a choice that put @ on every business card in the world fifty years later. Email predated the [[smtp|SMTP]] specification by a decade; SMTP came later to standardize what was already happening."
				},
				{
					id: 'jon-postel',
					name: 'Jon Postel',
					years: '1943–1998',
					title: 'Author of SMTP',
					org: 'USC ISI',
					contribution:
						"Wrote [[rfc:821|RFC 821]] (Simple Mail Transfer Protocol, 1982) and [[rfc:822|RFC 822]] (the message format, also 1982). Together they\\'re the foundation of every email sent for the next forty years. Postel also wrote RFC 768 (UDP), RFC 793 (TCP), and approximately 200 other RFCs — including most of the early ones that simply *named* what was already running on the ARPANET. The IETF\\'s motto \"rough consensus and running code\" is Postel\\'s legacy as much as anyone\\'s."
				},
				{
					name: 'Mark Crispin',
					years: '1956–2012',
					title: 'Inventor of IMAP',
					org: 'Stanford / University of Washington',
					contribution:
						"Designed [[imap|IMAP]] in 1985–1986 at Stanford as an alternative to POP — POP downloaded messages and deleted them from the server, which didn\\'t work for users with multiple devices. IMAP\\'s key insight: the server holds canonical state; clients are views. This is the model behind every modern webmail and mobile mail client. Crispin maintained the IMAP specification ([[rfc:3501|RFC 3501]]) and ran the UW IMAP server until his death."
				},
				{
					name: 'Abhay Bhushan',
					years: '1944–2023',
					title: 'Author of FTP',
					org: 'MIT',
					contribution:
						'Wrote [[rfc:114|RFC 114]] (1971) — the original [[ftp|FTP]] specification, predating TCP/IP. Bhushan was a graduate student at MIT working on the early ARPANET; FTP was needed because researchers wanted to share files between sites and there was no standard way to do it. The protocol has been revised many times (959, 2228, 2428) but the core command-response shape from 1971 remains.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1971,
					title: 'FTP First Specified (RFC 114)',
					description:
						'Bhushan publishes the first FTP. Originally ran on NCP, the pre-TCP ARPANET protocol. The oldest application protocol still in production use today.'
				},
				{
					year: 1971,
					title: 'Ray Tomlinson Sends First Network Email',
					description:
						'Tomlinson uses SNDMSG to send a message between two ARPANET-connected PDP-10s at BBN. Picks `@` to separate user from host.'
				},
				{
					year: 1982,
					title: 'SMTP (RFC 821) + Message Format (RFC 822)',
					description:
						'[[pioneer:jon-postel|Postel]] writes the [[smtp|SMTP]] spec, codifying what ARPANET sites had already been doing for a decade. Both RFCs published the same month; both still operational as updated [[rfc:5321|RFC 5321]] and RFC 5322.'
				},
				{
					year: 1984,
					title: 'POP1 (RFC 918)',
					description:
						'Post Office Protocol v1 ships — "download mail to my workstation, delete it from the server." The right design when your workstation is your only mail device; the wrong design once mobile arrives.'
				},
				{
					year: 1985,
					title: 'FTP RFC 959',
					description:
						'The current [[ftp|FTP]] specification. Cleans up the 1971 design without breaking it. Active vs passive mode is documented; this still trips up firewalls 40 years later.'
				},
				{
					year: 1988,
					title: 'IMAP Begins',
					description:
						'[[imap|IMAP]] proposed by Mark Crispin at Stanford. "What if the server holds canonical state and the client is a view?" Becomes a long-running counterpoint to POP3.'
				},
				{
					year: 1995,
					title: 'SFTP and SCP Over SSH',
					description:
						'SCP and SFTP — file transfer over [[ssh|SSH]] — ship with OpenSSH. Eventually displaces FTP for most secure-file-transfer use cases inside organizations. FTP retreats to anonymous file mirrors.'
				},
				{
					year: 1998,
					title: 'FTPS — FTP Over TLS',
					description:
						"FTPS adds [[tls|TLS]] to FTP's control and data connections. Maintains FTP's wire protocol; adds encryption. Used heavily in regulated industries (banking, healthcare) where FTP was already deployed."
				},
				{
					year: 2003,
					title: 'IMAP4rev1 (RFC 3501)',
					description: 'The IMAP4rev1 spec used by every modern mail client.'
				},
				{
					year: 2004,
					title: 'SMTP Submission (RFC 4409)',
					description:
						'Splits "client → first server" from "server → server" SMTP. Port 587 with authentication for submission, port 25 for relay. Eliminates the original "open relay" problem.'
				},
				{
					year: 2007,
					title: 'DKIM, SPF Standardized',
					description:
						'DomainKeys Identified Mail and Sender Policy Framework finally give SMTP a way to verify mail origins. {{dmarc|DMARC}} (2015) glues them together with reporting and policy. Spam is reduced from existential threat to manageable nuisance.'
				},
				{
					year: 2018,
					title: 'JMAP First Stable (RFC 8620)',
					description:
						"Fastmail leads JMAP — JSON Meta Application Protocol — as a modern HTTP-based replacement for IMAP. Slow adoption; IMAP's install base is enormous."
				},
				{
					year: 2024,
					title: 'MTA-STS, TLS-RPT, BIMI',
					description:
						'Modern email security/standards: MTA-STS forces TLS between mail servers; TLS-RPT reports failures; BIMI shows brand logos in supporting clients. All wrap around the 1982 SMTP without replacing it.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'SMTP, IMAP, and FTP',
			axes: ['Direction', 'Connections', 'Authentication', 'Modern usage'],
			rows: [
				{
					label: '[[smtp|SMTP]]',
					values: [
						'Push — sender to receiver',
						'1 (control + data multiplexed)',
						'Originally none; modern: SMTP-AUTH + STARTTLS',
						'Mail submission (587) + server-to-server delivery (25)'
					]
				},
				{
					label: '[[imap|IMAP]]',
					values: [
						'Pull — client reads from server',
						'1 (with IDLE for push-like behavior)',
						'Password (over TLS) or OAuth 2.0',
						'Every mail client (Outlook, Apple Mail, Thunderbird, Gmail/iOS); ~all webmail'
					]
				},
				{
					label: '[[ftp|FTP]]',
					values: [
						'Bidirectional — STOR uploads, RETR downloads',
						'2 (control 21 + data port negotiated)',
						'Anonymous or password; FTPS for TLS',
						'Public file mirrors, legacy enterprise integration, some scientific data'
					]
				}
			],
			note: 'The mail protocols (SMTP, IMAP) remain dominant. FTP is in long decline — SFTP (over [[ssh|SSH]]) replaced it for secure file transfer inside organizations, and the web replaced it for casual file distribution. FTPS keeps it alive in regulated industries.'
		},
		{
			type: 'animated-sequence',
			title: 'SMTP Mail Delivery',
			definition: `sequenceDiagram
    participant U as User Agent
    participant S1 as Sending MTA
    participant DNS as DNS
    participant S2 as Receiving MTA
    participant M as Mailbox
    participant U2 as Recipient
    Note over U,U2: Phase 1 — Submission, user to first MTA
    U->>S1: SMTP submission on port 587 with STARTTLS
    S1-->>U: 250 OK, queued for bob at foo.org
    Note over U,U2: Phase 2 — Lookup
    S1->>DNS: MX query for foo.org
    DNS-->>S1: mx.foo.org, priority 10
    Note over U,U2: Phase 3 — Server-to-server relay
    S1->>S2: open SMTP on port 25 with STARTTLS
    S1->>S2: MAIL FROM alice at example.com
    S2-->>S1: 250 ok
    S1->>S2: RCPT TO bob at foo.org
    S2-->>S1: 250 ok
    S1->>S2: DATA, headers, body, CRLF dot CRLF
    S2-->>S1: 250 queued
    Note over U,U2: Phase 4 — Local delivery
    S2->>M: deliver to bob mailbox via LMTP
    Note over U,U2: Phase 5 — Recipient reads
    U2->>M: IMAP FETCH unread messages
    M-->>U2: Mail delivered`,
			caption:
				'Email\'s store-and-forward architecture means there\'s no end-to-end "connection" between sender and recipient. A message hops through one or more MTAs, each taking responsibility before the next, with retries on failure. This is why email tolerates network outages and recipient downtime — the queueing was designed in from 1971.',
			steps: {
				0: "**Phase 1 — Submission.** Alice composes mail in Apple Mail. The MUA submits to *her own provider's* SMTP server — never directly to the recipient. This separation is what enables spam filtering and authenticated submission.",
				1: 'Mail client connects to its submission server on **port 587** with STARTTLS and SMTP-AUTH. Port 25 is server-to-server only on modern networks; submission has its own port.',
				2: 'Server accepts and replies **250 OK**, queueing the message. From here, Alice\'s sending is "done" — but the message has not yet reached Bob.',
				3: '**Phase 2 — Lookup.** The sending MTA needs to find where to deliver. It asks DNS.',
				4: 'SMTP server asks DNS for the **MX records** of `foo.org`. MX records point at mail servers, with priorities for failover.',
				5: 'DNS returns `mx.foo.org` at priority 10 (the lower the priority, the higher the preference — yes, backwards from intuition).',
				6: "**Phase 3 — Server-to-server relay.** Now the actual SMTP conversation between two organizations' mail servers.",
				7: 'S1 connects to S2 on **port 25** and negotiates STARTTLS (opportunistic — if S2 supports TLS, the conversation gets encrypted; if not, falls back to cleartext).',
				8: 'S1 sends **MAIL FROM** — declaring the envelope sender. This is the "return-path" used for bounces, not necessarily what the user sees in the From header.',
				9: 'S2 accepts the sender with **250 ok**.',
				10: 'S1 sends **RCPT TO** — one recipient per RCPT command. (Multiple recipients = multiple RCPT TO lines.)',
				11: 'S2 accepts the recipient with **250 ok**. (Could reject here for "user does not exist," "mailbox full," etc.)',
				12: 'S1 sends **DATA**, then headers, body, and a terminating `CRLF.CRLF`. Everything between is the message proper.',
				13: "S2 confirms with **250 queued**. The message is now S2's responsibility. S1 can delete its copy.",
				14: "**Phase 4 — Local delivery.** S2 has accepted the message; now it has to deposit it in Bob's mailbox.",
				15: "S2 hands off via **LMTP** (Local Mail Transfer Protocol) or direct write to the mailbox store. This step happens entirely inside S2's infrastructure.",
				16: '**Phase 5 — Recipient reads.** Bob is on Gmail. His client never sees SMTP; it uses IMAP to fetch.',
				17: "Bob's mail client sends **IMAP FETCH** to ask for new messages.",
				18: "Server returns the mail. **From Alice's perspective the message was sent hours ago; from Bob's perspective it just arrived.** The store-and-forward architecture made each hop independent."
			}
		},
		{
			type: 'callout',
			title: "Why Email Survived (and FTP Didn't Quite)",
			text: `[[smtp|SMTP]] is still the world's mail transport in 2025. [[ftp|FTP]] is barely alive. Both date from the same era. What's the difference?\n\n**Email has no replacement at scale.** Chat protocols (Slack, WhatsApp, iMessage, Teams) are silos — Gmail can't message a WhatsApp user. Federated chat (XMPP, Matrix) lost the consumer market. The "universal address" property of \`alice@example.com\` — anyone can email anyone, no platform required — has no successor. As long as that property matters, SMTP runs.\n\n**FTP has obvious replacements.** SFTP (over [[ssh|SSH]]) gives the same file-transfer semantics with encryption and authentication built in. HTTPS lets you serve files with finer-grained access control, resumable downloads, and CDN caching. \`rsync\` does incremental sync better than FTP ever did. \`aws s3 cp\` is what people actually run when they want to "transfer a file" in 2025. FTP had everywhere to go but down.\n\n**Mail accreted modern features without breaking the wire.** Anti-spam (DKIM, SPF, DMARC), TLS encryption (STARTTLS, MTA-STS), authentication (SMTP-AUTH, OAuth 2.0), structured content (MIME), webmail — all layered on top of 1982 SMTP without changing the basic envelope-headers-body shape. A 1995 Eudora client can technically still send mail to a Gmail user (Gmail might reject it for spam reasons, but the protocol path works).\n\nFTP's active-mode-vs-passive-mode connection complexity and unencrypted-by-default design made it a worse fit for the modern Internet. Mail's loose store-and-forward and text-extensibility made it a better one. Sometimes a protocol survives because it's exactly the right shape for the next forty years of demand.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[smtp|SMTP]]'s failure mode is **deliverability**. Sending mail technically still works; getting it into the recipient's inbox (not spam folder, not rejected) is a different question. The industry that ranks "sender reputation" — IP reputation, domain reputation, content reputation, DKIM alignment, SPF pass, DMARC policy — is a billion-dollar market because the SMTP protocol gives the receiving server total discretion to reject. A new domain sending mail to Gmail starts in the spam folder no matter what the headers say. The protocol works; the policy environment is treacherous.\n\n[[imap|IMAP]]'s failure mode is **performance**. IMAP was designed when "fetching a message" meant a few dozen kilobytes; modern messages have HTML, embedded images, attachments. A folder with 50,000 messages takes IMAP a long time to sync. \`CONDSTORE\`, \`QRESYNC\`, and other extensions try to fix this, but the protocol's text-based, line-oriented design fundamentally can't hit JMAP-level efficiency. The mobile-app workaround: cache aggressively, sync incrementally, and lie about completeness in the UI.\n\n[[ftp|FTP]]'s failure mode is **NAT and firewalls**. FTP's two-connection design (control + data) was elegant in 1971; in 2025 it's a NAT-traversal nightmare. The data connection IP is announced in the control stream (as ASCII text); routers running FTP-ALG try to rewrite this and often fail. Passive mode reverses the connection direction but requires the server to accept connections on dynamic high ports — many firewalls block this. The "FTP just doesn't work over our network" story is the protocol's slow death.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **JMAP** (RFC 8620) continues slow adoption as the spiritual IMAP successor. JSON over HTTPS, designed for mobile-first sync. Fastmail uses it natively; Apple Mail, Thunderbird, and Roundcube have client support. The catch: nearly every existing mail server speaks IMAP, and rewriting that side is enormous work.\n- **MTA-STS + DANE + BIMI** continue closing the SMTP security gaps. MTA-STS forces TLS between mail servers using a published policy; DANE binds TLS certs to DNSSEC; BIMI shows brand logos in supporting mail clients. Email's security keeps getting better without changing the protocol.\n- **OAuth 2.0 for SMTP/IMAP** — Microsoft 365 and Google Workspace require OAuth 2.0 for client mail access. Password-based mail is dying inside enterprises (already gone at Microsoft as of 2022).\n- **Encrypted mail (S/MIME, PGP)** remains niche. Apple Mail and Outlook ship S/MIME for enterprise; consumer adoption is rare. The "no end-to-end encrypted alternative to email at scale" problem is still open.\n- **FTP slow extinction**. Public FTP mirrors (kernel.org, Debian, GNU) have mostly moved to HTTPS. SFTP handles secure file transfer. Cloud object storage (S3, GCS) handles bulk transfer. FTP in 2030 will mostly exist as a legacy compatibility shim in enterprise integration platforms.\n- **The truth about these protocols**: they're too embedded to die and too old-fashioned to attract new development. They'll outlive most of the protocols designed in the last 20 years.`
		}
	]
};
