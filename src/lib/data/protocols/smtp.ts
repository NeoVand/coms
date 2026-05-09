import type { Protocol } from '../types';

export const smtp: Protocol = {
	id: 'smtp',
	name: 'Simple Mail Transfer Protocol',
	abbreviation: 'SMTP',
	categoryId: 'utilities',
	port: 587,
	year: 1982,
	rfc: 'RFC 5321',
	oneLiner: 'The protocol that delivers email across the internet — store and forward, hop by hop.',
	overview: `SMTP is the backbone of email. Every email you've ever sent was delivered via SMTP — from your mail client to your provider's server, then relayed across the internet to the recipient's mail server. It's a "store and forward" protocol: each server along the path accepts responsibility for the message and forwards it to the next {{hop|hop}}.

SMTP is a text-based {{protocol|protocol}} with a simple command vocabulary: HELO/EHLO to greet, MAIL FROM to specify the sender, RCPT TO for recipients, DATA to send the message body, and QUIT to disconnect. Modern SMTP uses STARTTLS to upgrade plain connections to [[tls|TLS]]-encrypted ones, and authentication (SMTP AUTH) to prevent unauthorized sending.

Despite being over 40 years old, SMTP remains the universal standard for email delivery. It's been extended with SPF, DKIM, and DMARC to fight spam and phishing. While newer protocols handle retrieval (IMAP, POP3), SMTP still handles every email's journey from sender to destination.`,
	howItWorks: [
		{
			title: 'Connection & greeting',
			description:
				'Client connects to the mail server on port 587 (submission) or 25 (relay) and sends EHLO with its hostname. Server responds with supported extensions like STARTTLS and AUTH.'
		},
		{
			title: 'TLS & authentication',
			description:
				'Client issues STARTTLS to upgrade to an encrypted connection, then authenticates with username/password via AUTH LOGIN or AUTH PLAIN.'
		},
		{
			title: 'Envelope & message',
			description:
				'Client specifies sender (MAIL FROM), recipients (RCPT TO), then sends the message body after DATA command. The message includes headers (From, To, Subject) and the body text.'
		},
		{
			title: 'Relay & delivery',
			description:
				"The server accepts the message (250 OK) and relays it to the recipient's mail server by looking up MX records in [[dns|DNS]]. Each hop stores and forwards until the message reaches the destination mailbox."
		}
	],
	useCases: [
		'Email delivery between mail servers',
		'Transactional emails (receipts, password resets, notifications)',
		'Newsletter and marketing email campaigns',
		'Automated alerts and monitoring notifications',
		'Application-generated email via SMTP relay services'
	],
	codeExample: {
		language: 'python',
		code: `import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Hello from SMTP!")
msg["Subject"] = "Test Email"
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"

with smtplib.SMTP("smtp.example.com", 587) as server:
    server.starttls()
    server.login("sender@example.com", "password")
    server.send_message(msg)`,
		caption: 'SMTP delivers email hop by hop — STARTTLS encrypts the connection.',
		alternatives: [
			{
				language: 'javascript',
				code: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: { user: 'sender@example.com', pass: 'password' }
});

await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello from SMTP!'
});`
			},
			{
				language: 'cli',
				code: `# Send a test email with swaks
swaks --to recipient@example.com \\
  --from sender@example.com \\
  --server smtp.example.com:587 \\
  --tls --auth-user sender@example.com

# Send email with curl
curl --url 'smtp://smtp.example.com:587' \\
  --ssl-reqd \\
  --mail-from 'sender@example.com' \\
  --mail-rcpt 'recipient@example.com' \\
  --upload-file email.txt \\
  --user 'sender@example.com:password'

# Test SMTP server connectivity
openssl s_client -starttls smtp \\
  -connect smtp.example.com:587`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Session Transcript',
						code: `Server: 220 mail.example.com ESMTP Postfix
Client: EHLO client.example.com
Server: 250-mail.example.com
        250-PIPELINING
        250-SIZE 52428800
        250-STARTTLS
        250-AUTH PLAIN LOGIN
        250 8BITMIME
Client: STARTTLS
Server: 220 2.0.0 Ready to start TLS

  [TLS handshake occurs]

Client: EHLO client.example.com
Client: AUTH PLAIN AGFsaWNlAHNlY3JldA==
Server: 235 2.7.0 Authentication successful
Client: MAIL FROM:<alice@example.com>
Server: 250 2.1.0 Ok
Client: RCPT TO:<bob@example.com>
Server: 250 2.1.5 Ok
Client: DATA
Server: 354 End data with <CR><LF>.<CR><LF>
Client: From: alice@example.com
        To: bob@example.com
        Subject: Meeting Tomorrow
        Date: Wed, 13 Mar 2024 10:30:00 -0700
        MIME-Version: 1.0
        Content-Type: text/plain; charset=UTF-8

        Hi Bob, are we still on for 3pm?
        .
Server: 250 2.0.0 Ok: queued as ABC123
Client: QUIT
Server: 221 2.0.0 Bye`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Seconds to minutes (store and forward)',
		throughput: 'Millions of messages/day at scale',
		overhead: 'Moderate — DNS lookups, TLS, multi-hop relay'
	},
	connections: ['tcp', 'tls', 'dns', 'imap'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc5321'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Email.svg/500px-Email.svg.png',
		alt: 'Diagram showing the flow of email from sender through SMTP servers and DNS MX lookups to the recipient mailbox',
		caption:
			"How email flows across the internet — the sender's mail client submits to an SMTP server, which looks up the recipient's domain via [[dns|DNS]] MX records and relays the message hop by hop until it reaches the destination mailbox.",
		credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
	}
};
