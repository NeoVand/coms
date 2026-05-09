import type { Protocol } from '../types';

export const imap: Protocol = {
	id: 'imap',
	name: 'Internet Message Access Protocol',
	abbreviation: 'IMAP',
	categoryId: 'utilities',
	port: 993,
	year: 1986,
	rfc: 'RFC 9051',
	oneLiner:
		'Access and manage email on the server — read, search, and organize without downloading.',
	overview: `IMAP is how your email client reads messages from the server while keeping them stored remotely. Unlike POP3 (which downloads and deletes), IMAP keeps all mail on the server — so your phone, laptop, and webmail all see the same inbox, the same folders, and the same read/unread state. IMAP uses port 143 for plaintext connections (with optional STARTTLS upgrade) or port 993 for IMAPS (implicit TLS).

The key insight is IMAP's tagged command-response {{protocol|protocol}}. Every command gets a unique tag (A001, A002...) and the server's response includes the same tag. This means you can pipeline commands — send A002 before A001's response arrives — because tags match responses to commands unambiguously.

IMAP's FETCH command is remarkably flexible: you can request just message {{header|headers}}, just the text body, or individual MIME attachments — without downloading the entire message. Server-side SEARCH lets you find messages by sender, date, subject, or full-text content without transferring anything. The IDLE command keeps a persistent connection open for push notifications when new mail arrives.

[[smtp|SMTP]] sends email, IMAP receives it — together they form the complete email system. IMAP connections are {{encryption|encrypted}} with [[tls|TLS]] (IMAPS on {{port|port}} 993) and ride over [[tcp|TCP]] for reliable delivery of the tagged command-response dialogue.`,
	howItWorks: [
		{
			title: 'Connect & authenticate',
			description:
				"Client connects to port 993 (IMAPS with [[tls|TLS]]) and authenticates with LOGIN or a SASL mechanism like OAUTH2. The server grants access to the user's mailboxes."
		},
		{
			title: 'SELECT mailbox',
			description:
				'Client selects a mailbox (INBOX, Drafts, Sent, etc.). Server reports message count, recent messages, available flags, and UIDVALIDITY for cache validation.'
		},
		{
			title: 'FETCH messages',
			description:
				'Client requests message envelopes, headers, or full bodies. IMAP can fetch parts of messages — just headers, just text, or individual attachments — without downloading everything.'
		},
		{
			title: 'SEARCH & STORE',
			description:
				'Client searches server-side (SEARCH FROM "alice" SINCE 1-Mar-2024) and modifies flags (\\Seen, \\Flagged, \\Deleted) without transferring message content.'
		},
		{
			title: 'IDLE for push',
			description:
				'Client enters IDLE mode — server pushes notifications when new mail arrives or flags change. This is how "push email" works on IMAP, keeping the connection open for real-time updates.'
		}
	],
	useCases: [
		'Email clients syncing across multiple devices (phone, laptop, tablet)',
		'Webmail interfaces (Gmail, Outlook.com, Yahoo Mail)',
		'Server-side email search and filtering',
		'Corporate email with shared mailboxes and folders',
		'Automated email processing and monitoring scripts'
	],
	codeExample: {
		language: 'python',
		code: `import imaplib

# Connect to IMAP server over TLS
with imaplib.IMAP4_SSL('imap.example.com') as mail:
    mail.login('user@example.com', 'password')
    mail.select('INBOX')

    # Search for unread messages
    _, nums = mail.search(None, 'UNSEEN')
    for num in nums[0].split():
        _, data = mail.fetch(num, '(ENVELOPE)')
        print(data[0][1])

    mail.logout()`,
		caption: 'IMAP lets you search and fetch email on the server — no need to download everything',
		alternatives: [
			{
				language: 'javascript',
				code: `import Imap from 'imap';

const imap = new Imap({
  user: 'user@example.com',
  password: 'password',
  host: 'imap.example.com',
  port: 993, tls: true
});

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err, box) => {
    console.log(box.messages.total + ' messages');
    const f = imap.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)'
    });
    f.on('message', msg => {
      msg.on('body', stream =>
        stream.pipe(process.stdout));
    });
  });
});
imap.connect();`
			},
			{
				language: 'cli',
				code: `# Connect to IMAP server with openssl
openssl s_client -connect imap.example.com:993

# Manual IMAP session (type these commands):
A001 LOGIN user@example.com password
A002 SELECT INBOX
A003 FETCH 1:5 (FLAGS ENVELOPE)
A004 SEARCH UNSEEN FROM "alice"
A005 FETCH 3 (BODY[TEXT])
A006 STORE 3 +FLAGS (\\Seen)
A007 LOGOUT`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Tagged Commands',
						code: `Client: A001 LOGIN user@example.com ****
Server: A001 OK LOGIN completed

Client: A002 SELECT INBOX
Server: * 47 EXISTS
Server: * 2 RECENT
Server: * FLAGS (\\Seen \\Answered \\Flagged \\Deleted \\Draft)
Server: * OK [UIDVALIDITY 1234567890]
Server: A002 OK [READ-WRITE] SELECT completed`
					},
					{
						title: 'Fetch & IDLE',
						code: `Client: A003 FETCH 47 (ENVELOPE BODY[TEXT])
Server: * 47 FETCH (ENVELOPE ("14-Mar-2026"
  "Meeting Tomorrow"
  (("Alice" NIL "alice" "example.com"))
  (("Bob" NIL "bob" "example.com")))
  BODY[TEXT] {42}
  Hi Bob, see you at 10am tomorrow.
  )
Server: A003 OK FETCH completed

Client: A004 IDLE
Server: + idling
  ... server pushes: * 48 EXISTS`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'LOGIN + SELECT: ~200ms. FETCH single message: ~50-100ms. IDLE: persistent connection with instant push.',
		throughput:
			'Designed for interactive use, not bulk transfer. Partial FETCH avoids downloading large attachments.',
		overhead:
			'Text-based tagged protocol. Each command/response pair includes tag and status. Minimal framing overhead.'
	},
	connections: ['tcp', 'tls', 'smtp', 'dns'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc9051'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Alpine_email_client.png/500px-Alpine_email_client.png',
		alt: 'Screenshot of the Alpine email client showing threaded message view in a terminal interface',
		caption:
			"Alpine email client (2009) — the successor to Pine, developed at the University of Washington by Mark Crispin's team. Pine was the reference implementation for the IMAP protocol, proving that server-side mail access could work across any device.",
		credit: 'Image: University of Washington / Apache License 2.0, via Wikimedia Commons'
	}
};
