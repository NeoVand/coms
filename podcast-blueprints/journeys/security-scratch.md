---
id: security-scratch
type: journey
title: Security from Scratch
scope: global
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [tls, ssh, http2]
related_protocols: [tls, ssh, http2]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: TLS, then SSH, then HTTP/2 — with a timeline underneath labelled early-90s plaintext, late-90s SSH, 2015 onward HTTPS-everywhere"
  - "Two-pane before-and-after diagram: a plaintext password traveling across a network on the left, the same password wrapped in a TLS tunnel on the right"
  - "Sequence diagram of a TLS 1.3 handshake collapsed to a single round trip: ClientHello, ServerHello with certificate, key exchange, application data"
  - "A bar chart of HTTPS adoption climbing from roughly 40% in 2015 to over 95% today, with browser warnings and Let's Encrypt marked as inflection points"
  - "Split frame of an administrator's terminal session: Telnet cleartext on the left exposing the password, SSH on the right showing public-key auth and an encrypted channel"
---

# Security from Scratch

## In one breath
This journey is the story of how the internet went from plaintext to
encrypted-by-default. Three protocols did most of the heavy lifting —
TLS wrapped the web in encryption, SSH replaced cleartext server access,
and HTTP/2 quietly made HTTPS the only practical choice. Together they
took the network from roughly 40% encrypted in 2015 to over 95% today.

## The hook (cold-open)
In the early internet, your password traveled across the wire in
cleartext. Anyone on the path could read it — your ISP, the network at
the airport, the person at the next table. Today, over 95% of web
traffic is encrypted, and on most sites you cannot turn that off even
if you tried. In the next few minutes we're going to walk the three
protocols that made that shift happen, in the order they arrived.

## The journey

### Step 1 — TLS: The Encryption Layer (TLS)
The first move was wrapping the connections themselves. In the early
internet, everything traveled in plaintext — passwords, credit cards,
personal emails, all visible to anyone on the network path. TLS changed
that by sitting on top of TCP and turning every byte into ciphertext.
During the handshake, the server proves its identity with a certificate
signed by a trusted authority. The two sides agree on a cipher suite,
then run an ephemeral key exchange — ECDHE — to derive shared session
keys that even a passive observer who recorded every byte cannot
reproduce. TLS 1.3 stripped out the legacy cruft, removed the insecure
algorithms, and collapsed the handshake into a single round trip.
Today, over 95% of web traffic runs through TLS. The full mechanism —
certificates, chains of trust, cipher suites, the handshake itself — is
in the TLS episode. Here we just need to know that this is the layer
that made encryption a property of the connection rather than a thing
each application had to invent.

TLS secures client-to-server connections beautifully, but system
administrators need more than encrypted web traffic. They need to log
into remote servers, transfer files, and tunnel network connections.
For that, a different protocol emerged.

### Step 2 — SSH: Secure Shell (SSH)
Before SSH, administrators managed remote servers with Telnet — sending
passwords and commands across the network in cleartext, exactly the
problem TLS solved for browsers. SSH replaced Telnet with a fully
encrypted channel built for the same job. It supports public-key
authentication, so there are no passwords on the wire to steal. It
carries secure file transfer through SCP and SFTP. And its port
forwarding feature can tunnel any TCP connection through the encrypted
link, which is how a developer on a laptop reaches a database that
isn't supposed to be exposed to the public internet at all. SSH uses
its own key exchange and encryption layer, independent of TLS — a
parallel security stack for the operator's plane rather than the user's.
Its agent forwarding feature lets you chain SSH connections through
jump hosts without ever exposing your private key to the intermediate
machines. The full mechanism is in the SSH episode. The thing to hold
on to here: SSH became the universal tool for server management, Git
operations, and secure automation, and it did it without ever borrowing
TLS's machinery.

With TLS protecting web connections and SSH securing server access, the
foundations of internet security were in place. But there was still a
gap. HTTP encryption was optional, and most sites did not bother. The
web needed a forcing function — something to flip encryption from a
nice-to-have to the only path that actually worked.

### Step 3 — HTTPS Everywhere (HTTP/2)
HTTP/2 was the tipping point. The specification technically allows
plaintext HTTP/2, but every major browser only implements it over TLS.
That single decision made encryption a de facto requirement for the
modern web — if you wanted the performance benefits of HTTP/2, you were
shipping over TLS, full stop. Combine that with Let's Encrypt giving
away certificates for free, and browsers starting to mark plain HTTP
pages as "Not Secure" right next to the address bar, and the incentives
finally lined up. The web went from roughly 40% encrypted in 2015 to
over 95% today. HTTP/2 also introduced binary framing, multiplexed
streams, and HPACK header compression — and those changes are worth
their own episode — but the most lasting impact may be the cultural
one: normalising the idea that all web traffic should be encrypted by
default. The full mechanism is in the HTTP/2 episode.

## What the listener now understands
This is how the internet rewrote its own threat model in roughly twenty
years. TLS gave the network a way to keep secrets. SSH gave operators a
way to do their work without leaking those secrets out the management
plane. And HTTP/2, almost as a side effect of chasing performance,
turned encryption into the default state of the web rather than an
opt-in. None of these protocols replaced the ones underneath them —
TCP still moves the bytes, the IP layer still routes the packets — they
just stopped trusting the wire. That is the whole shift, in three
moves.

## Where this connects in the book
- The chapter on TLS walks the certificates and the key exchange in
  detail — including the move from TLS 1.2 to 1.3 and the 0-RTT
  resumption that makes a repeat visit feel instant.
- The chapter on SSH unpacks public-key authentication, agent
  forwarding, and the tunneling tricks that turn SSH into an
  all-purpose secure transport for operators.
- The chapter on HTTP/2 covers binary framing, multiplexing, and HPACK
  — the performance story that ended up dragging encryption along with
  it.

## See also (other journeys and protocol episodes)

- If this journey hooked you on the encryption side, the TLS episode is
  the next listen. It is the one most engineers find more interesting
  the closer they look at it — certificate chains, cipher suite
  negotiation, and the slightly uncomfortable amount of trust the whole
  system places in a handful of root authorities.

- The SSH episode is the right pick if you have ever wondered why your
  SSH config file has grown to fifty lines. Public-key authentication,
  jump hosts, agent forwarding, and tunneling are each small ideas that
  compound into something much bigger.

- For where the encrypted web goes after HTTP/2, the HTTP/3 episode
  picks up the thread. QUIC bakes TLS 1.3 directly into the transport
  itself, so the encryption and the connection setup happen in the same
  handshake.

## Visual cues for image generation

- Three-node graph lighting up in sequence: TLS, then SSH, then HTTP/2,
  with a timeline underneath labelled early-90s plaintext, late-90s
  SSH, 2015 onward HTTPS-everywhere.
- Before-and-after diagram: a plaintext password traveling across a
  network on the left, the same password wrapped inside a TLS tunnel on
  the right.
- Sequence diagram of a TLS 1.3 handshake collapsed to a single round
  trip — ClientHello, ServerHello with certificate, key exchange,
  application data.
- Bar chart of HTTPS adoption climbing from roughly 40% in 2015 to over
  95% today, with Let's Encrypt and the "Not Secure" browser warning
  marked as inflection points.
- Split frame of an administrator's terminal: Telnet on the left with a
  password visible in cleartext, SSH on the right showing public-key
  authentication and an encrypted channel.
