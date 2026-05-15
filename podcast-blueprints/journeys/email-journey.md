---
id: email-journey
type: journey
title: Life of an Email
scope: utilities
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [dns, smtp, imap]
related_protocols: [dns, smtp, imap]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: DNS, then SMTP, then IMAP — with the email itself moving along the path from sender to recipient's mailbox to recipient's screen"
  - "DNS lookup returning a list of MX records for example.com, with priorities — mx1 at priority 10, mx2 at priority 20 — plus the SPF, DKIM, and DMARC records sitting alongside"
  - "Sequence diagram of one SMTP dialogue: EHLO, STARTTLS, MAIL FROM, RCPT TO, DATA, then the message body terminated by a lone period on a line"
  - "Same mailbox shown across phone, laptop, and web client — flags and folders staying in sync because IMAP keeps the canonical state on the server"
  - "Wall-clock timeline of a single email's life: lookup, hop, store on disk, push notification to the recipient's phone"
---

# Life of an Email

## In one breath
This is the journey almost every message you have ever sent to another
human takes — from the moment you hit send to the moment it lights up
the recipient's phone. Three protocols cooperate: DNS to find the
right mail server, SMTP to deliver the message there, and IMAP to let
the recipient read it from any device. Watching them in order is the
cleanest demo of how email's age-old architecture still holds up.

## The hook (cold-open)
You write a message to user@example.com and hit send. Before it
reaches a human, your mail server has to find the right machine
halfway around the world, knock on its door, hand the letter over by
name, and walk away — and then the recipient's app has to discover
the new message, pull it down, and keep it consistent across every
device they own. None of those jobs is done by the same protocol.
SMTP, the protocol doing the actual delivery, has been quietly running
this same dialogue since 1982. In the next few minutes we are going
to walk that handoff, one step at a time.

## The journey

### Step 1 — DNS: Find the Mail Server (DNS)
When you send an email to user@example.com, your mail server does not
just look up example.com's IP address. It queries DNS for MX records
— Mail Exchange records — a special record type that names which
servers accept email for that domain, with a priority on each. A
domain might publish several: mx1.example.com at priority 10,
mx2.example.com at priority 20, for redundancy. If the primary mail
server is down, the sender automatically falls back to the next one.
While it is at it, your server also pulls the SPF record (which IPs
are allowed to send for that domain), the DKIM records (the public
keys used to verify message signatures), and the DMARC policy (what
the domain wants done with messages that fail those checks). This
single DNS step is where email security begins. The full mechanism
of DNS — the resolver hierarchy, root servers, caching — is in the
DNS episode. Here we just need the answer: a list of mail servers,
ranked, plus the keys and policies that prove who is allowed to speak
for the domain.

The DNS lookup revealed exactly which servers accept mail for the
recipient's domain, along with their priority ordering. Now your mail
server opens a TCP connection to the highest-priority MX server and
begins the SMTP dialogue.

### Step 2 — SMTP: Send the Email (SMTP)
SMTP is one of the oldest internet protocols still in active use, and
its text-based command dialogue has remained remarkably stable since
1982. Your mail server connects to the recipient's MX server and the
two sides exchange greetings — EHLO, which also advertises supported
extensions like STARTTLS and SIZE. After upgrading to an encrypted
connection via STARTTLS, the envelope is defined: MAIL FROM specifies
the bounce address, RCPT TO identifies the recipient or recipients.
Then the DATA command signals that the message body follows — the
headers (From, To, Subject, Date, Message-ID), the MIME parts
(text/plain, text/html), and any base64-encoded attachments — all
terminated by a lone period on a line. The receiving server may relay
the message through additional hops — forwarding rules, mailing
lists — before it lands in the recipient's mailbox. The full
mechanism of SMTP is in the SMTP episode. Here, the thing to hold on
to is how plain it all looks: a server-to-server text conversation
older than most of the engineers reading their email today.

The email has traversed the internet and landed safely in the
recipient's mailbox on their mail server. But it is just sitting
there as a file on a remote disk. The recipient now needs a way to
discover it, download it, organise it into folders, and keep
everything synchronised across their phone, laptop, and web client.

### Step 3 — IMAP: Read the Email (IMAP)
IMAP — the Internet Message Access Protocol — is what makes modern
multi-device email possible. Unlike its predecessor POP3, which
downloaded messages and optionally deleted them from the server, IMAP
keeps every message on the server and synchronises state across every
connected client. When you open your email app, IMAP fetches just the
headers first — sender, subject, date — for a fast initial display,
then pulls full message bodies on demand. Folders, flags (read,
starred, deleted), and search all happen server-side, so a change you
make on your phone instantly shows up on your laptop. IMAP IDLE adds
push: the server immediately alerts your client when a new message
arrives, so the client does not have to poll. The full mechanism of
IMAP is in the IMAP episode. The point worth holding on to here is
the architectural one: this server-centric model is why Gmail,
Outlook, and every modern email service can give you a consistent
view across web, desktop, and mobile.

## What the listener now understands
Email is one of the oldest distributed systems on the internet, and
its architecture is the reason it has survived. DNS knows nothing
about email — it just answers a question about which servers are
authorised for a domain. SMTP knows nothing about how messages are
read — it just delivers, hop by hop, in the same text dialogue it has
used for over forty years. IMAP knows nothing about how messages were
delivered — it just keeps a clean, synchronised view of a mailbox on
a server. Three independently designed protocols, each minding its
own concern, compose into the experience of sending a message to a
person and seeing it pop up on their phone seconds later.

## Where this connects in the book
- The chapter on DNS goes deep on the record types that show up in
  this journey — MX, SPF, DKIM, DMARC — and the resolver hierarchy
  that finds them.
- The chapter on SMTP unpacks the full command dialogue, the
  store-and-forward delivery model, and why a 1982 protocol is still
  the wire format for almost every email on Earth.
- The chapter on IMAP walks through the folder model, IDLE, and the
  way server-side state replaced the old POP3 download-and-delete
  habit.

## See also (other journeys and protocol episodes)

- If you want the protocol-by-protocol view, the SMTP episode is the
  natural next listen — it is where the text dialogue you just heard
  narrated gets dissected line by line.

- The IMAP episode picks up the recipient side in detail, including
  how IDLE pushes new messages to your phone the instant they arrive
  and why server-side flags are the foundation of multi-device sync.

- The DNS episode is the right next listen if the MX, SPF, DKIM, and
  DMARC parts felt dense. They are all just records sitting in DNS,
  and seeing the resolver mechanism in full makes that whole opening
  step click into place.

## Visual cues for image generation

- Three-node graph lighting up in sequence: DNS, then SMTP, then IMAP
  — with the email itself moving along the path from sender to the
  recipient's mailbox to the recipient's screen.
- DNS lookup returning a list of MX records for example.com, with
  priorities — mx1 at priority 10, mx2 at priority 20 — plus the SPF,
  DKIM, and DMARC records sitting alongside.
- Sequence diagram of one SMTP dialogue: EHLO, STARTTLS, MAIL FROM,
  RCPT TO, DATA, then the message body terminated by a lone period on
  a line.
- The same mailbox shown across phone, laptop, and web client — flags
  and folders staying in sync because IMAP keeps the canonical state
  on the server.
- Wall-clock timeline of a single email's life: lookup, hop, store on
  disk, push notification to the recipient's phone.
