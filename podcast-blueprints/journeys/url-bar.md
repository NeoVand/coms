---
id: url-bar
type: journey
title: What Happens When You Type a URL
scope: global
podcast_target_minutes: 12
step_count: 4
protocols_in_order: [dns, tcp, tls, http1]
related_protocols: [dns, tcp, tls, http1]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: DNS, then TCP, then TLS, then HTTP — with a thin timeline underneath showing each step's round trip cost"
  - "DNS resolver walking the hierarchy: root, then .com TLD, then google.com's authoritative nameserver, returning 142.250.80.46"
  - "Stacked layer diagram of one HTTPS request: the IP packet at the bottom, then TCP, then TLS, then HTTP at the top — each layer adding its own header"
  - "Sequence diagram: browser on the left, server on the right, with SYN / SYN-ACK / ACK, then TLS ClientHello / ServerHello / certificate / key exchange, then GET / 200 OK"
  - "Single half-second wall-clock timeline from keypress to first byte of HTML, with the four protocol slices coloured in"
---

# What Happens When You Type a URL

## In one breath
This is the journey every browser takes a few hundred million times a
second: from a name in the address bar to bytes of HTML on the screen.
Four protocols cooperate — DNS to find the server, TCP to reach it
reliably, TLS to encrypt the line, and HTTP to actually ask for the
page. Watching them in order is the cleanest demo of the layered stack
doing its job.

## The hook (cold-open)
You type google.com and hit enter. Somewhere between the keypress and
the first pixel of the homepage, four different protocols have already
done their work, in a strict order, and handed off to each other. None
of them knows what the others do. None of them needs to. In the next
few minutes we're going to walk that handoff, one protocol at a time,
and watch the stack actually do its job.

## The journey

### Step 1 — DNS Resolution (DNS)
Before your browser can reach google.com, it needs an actual address —
the same way you need a street address before you can mail a letter.
So your device fires off a DNS query to a recursive resolver. The
resolver walks the DNS hierarchy on your behalf: it asks a root server,
then the .com top-level domain servers, then google.com's authoritative
nameserver. Out the other end comes an IP address — something like
142.250.80.46 — and the resolver caches it locally so the next request
for the same name skips the entire chain. Without this step you would
be memorising raw IP addresses for every site you visit. The full
mechanism — root servers, TLDs, authoritative nameservers, caching, the
record types — is in the DNS episode. Here we just need the answer:
your browser now knows where the server lives.

But knowing where to send packets is not the same as being able to talk.
Packets on the open internet get lost, reordered, sometimes duplicated.
Before sending any real data, the browser needs to negotiate a reliable
channel.

### Step 2 — TCP Handshake (TCP)
The internet is unreliable by design. Packets vanish, arrive out of
order, occasionally show up twice. TCP is what hides all of that from
the application above it. To open the channel, your browser and
google.com's server perform the famous three-way handshake — SYN,
SYN-ACK, ACK — synchronising sequence numbers so each side knows where
the other's byte stream begins. While they're at it, they also negotiate
window sizes for flow control, so neither side will ever fire bytes
faster than the other can swallow them. The cost is one full round trip
of latency before a single byte of useful data has moved. It's a real
cost, and it's worth it: without TCP, every application on the internet
would have to reinvent reliable, ordered delivery on its own. The full
mechanism — sequence numbers, retransmits, congestion control, all of
it — is in the TCP episode. Here we just need to know that the
handshake is what produces the round trip we're about to spend.

A reliable pipe now connects your browser to the server. But anyone
sitting on the network path between them — your ISP, the coffee shop's
router, a government firewall, anyone — can read every byte of that
pipe in plaintext. The data needs to be encrypted before it leaves the
machine.

### Step 3 — TLS Negotiation (TLS)
TLS is where trust gets established. The server sends a certificate
proving it really is google.com, signed by a certificate authority your
browser already trusts. Then the two sides agree on a cipher suite —
which encryption and integrity algorithms they'll use for the rest of
the conversation — and run a key exchange, typically ECDHE, to derive
a pair of session keys that only they know. The clever part is that
the keys are derived in a way that even an attacker who recorded every
byte of the handshake can't reproduce them. TLS 1.3 collapses this whole
negotiation into a single round trip, and on a repeat visit, 0-RTT
resumption lets the browser send encrypted application data
immediately, with no extra waiting. The full mechanism — certificates,
chains of trust, cipher suites, the handshake itself — is in the TLS
episode. Here we just need the outcome: an encrypted, tamper-proof
channel running on top of the reliable TCP one.

The connection is now both reliable and encrypted. No eavesdropper can
read it, no one in the middle can quietly change it. Everything is in
place for the browser to actually ask for the page.

### Step 4 — HTTP Request and Response (HTTP/1.1)
Now, finally, the browser speaks HTTP. It sends a GET request with a
short stack of headers describing what it accepts — content types,
encodings, languages — and any cookies it already has for the domain.
The server processes the request and sends back a response: a status
code, 200 OK if all is well, response headers describing caching rules
and content type, and then the body — the HTML document itself. That
single request-response cycle is the fundamental unit of the web.
What's striking is how small it looks compared to everything that had
to happen first. The full mechanism — methods, status codes, headers,
keep-alive, the original spec and where it came from — is in the HTTP
episode. The one fact worth holding on to here: a modern page will
trigger hundreds more of these cycles, for CSS, for JavaScript, for
images, for fonts, all running over the same secure channel we just
built.

## What the listener now understands
This is the layered stack actually doing its job. DNS doesn't know
anything about encryption. TCP doesn't know anything about names or
HTTP. TLS doesn't care which application is running on top of it. HTTP
assumes a clean, ordered, private byte stream and asks no questions
about how that came to exist. Each protocol minds its own concern, and
trusts the others to mind theirs. That's the whole trick. When you type
a URL and the page loads, what you're really seeing is four
independently designed systems composing perfectly, in the right order,
in under a second.

## Where this connects in the book
- The chapter on DNS goes deep on the resolver hierarchy — root
  servers, TLDs, authoritative nameservers, and why caching matters so
  much for the rest of this journey to feel fast.
- The chapter on TCP unpacks the three-way handshake, sequence
  numbers, and the congestion control that decides how fast your bytes
  can actually flow once the channel is open.
- The chapter on TLS walks through certificates, chains of trust, and
  the move from TLS 1.2 to 1.3 — including the 0-RTT resumption that
  makes a repeat visit feel instant.
- The chapter on HTTP/1.1 covers the original request-response model
  and where its limits start to bite once a page needs hundreds of
  resources.

## See also (other journeys and protocol episodes)

- If you want to hear the same four protocols stripped down to their
  essentials, the DNS episode and the TCP episode are the two to start
  with — they're the foundation everything in this journey depends on.

- The TLS episode is the right next listen if the certificate and key
  exchange parts felt like the most magical step. It's the one that
  most often surprises engineers when they look closely.

- For where the web goes after HTTP/1.1, the HTTP/2 and HTTP/3 episodes
  pick up exactly where this journey leaves off — same problem, same
  page, but with multiplexing and a different transport underneath.

## Visual cues for image generation

- Four-node graph lighting up in sequence: DNS, then TCP, then TLS,
  then HTTP — with a thin timeline underneath showing each step's round
  trip cost.
- DNS resolver walking the hierarchy: root, then .com TLD, then
  google.com's authoritative nameserver, returning 142.250.80.46.
- Stacked layer diagram of one HTTPS request: IP at the bottom, then
  TCP, then TLS, then HTTP at the top — each layer adding its own
  header.
- Sequence diagram: browser on the left, server on the right, showing
  SYN / SYN-ACK / ACK, then the TLS ClientHello, ServerHello,
  certificate and key exchange, then GET and 200 OK.
- A single half-second wall-clock timeline from keypress to first byte
  of HTML, with the four protocol slices coloured in.
