---
id: auth-journey
type: journey
title: How Authentication Works
scope: global
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [oauth2, tls, ssh]
related_protocols: [oauth2, tls, ssh]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: OAuth, then TLS, then SSH — each labeled with what it actually proves and to whom"
  - "OAuth Authorization Code flow with PKCE: user, app, authorization server, resource server — arrows showing redirect, code, code verifier, access token, then API call with Bearer token"
  - "TLS 1.3 handshake collapsed to one round trip: ClientHello, ServerHello plus certificate and key share, Finished — and an ECDHE key exchange producing ephemeral session keys"
  - "Side-by-side trust models: a CA-signed certificate chain on the TLS side, a known_hosts file and an Ed25519 key pair on the SSH side"
  - "Stacked layer diagram of one authenticated API call: TCP at the bottom, then TLS, then HTTP, with an OAuth Bearer token sitting in the Authorization header at the top"
---

# How Authentication Works

## In one breath
Three different protocols answer three different identity questions —
who are you allowed to act as, who are you talking to, and which
machine are you logging into. OAuth hands out scoped tokens without
ever showing the app your password. TLS proves the server is who it
claims to be and hides the token in flight. SSH gives you a shell on a
remote box using keys you control. Together they cover almost every
modern login.

## The hook (cold-open)
You click "Sign in with Google" on a site you have never visited
before. A second later you are signed in, and that site can read your
calendar — but it never saw your Google password, and it never will.
That trick is one of three different authentication stories the
internet runs on every day. In the next few minutes we're going to
walk all three, in order: tokens for apps, certificates for servers,
keys for machines.

## The journey

### Step 1 — OAuth 2.0: Delegated Authorization (OAuth)
OAuth 2.0 solves a very specific problem: how can a third-party app
get at your data without ever knowing your password? The answer is to
put an authorization server in the middle. You authenticate directly
with the provider you already trust — Google, GitHub — you approve a
specific list of permissions called scopes, and the provider hands the
app a time-limited access token. The app uses that token to call APIs
on your behalf. For web and mobile apps, the standard flow is the
Authorization Code flow with PKCE — Proof Key for Code Exchange — which
adds a code verifier so an attacker who intercepts the redirect can't
trade it for a token. Refresh tokens let the app silently get a new
access token when the old one expires, so you don't have to log in
again every hour. One thing worth holding on to: OAuth is
authorization, not authentication. It says what the app is allowed to
do, not who you are. The identity layer on top of it is OpenID
Connect. The full mechanism — the flows, the token formats, PKCE,
refresh, OpenID Connect — is in the OAuth episode. Here we just need
the outcome: a scoped, time-limited Bearer token the app can present
on every API call.

But that token is now traveling the network as a Bearer token in an
HTTP header. Anyone who reads it can impersonate you for as long as it
lives. Something has to keep the wire itself private.

### Step 2 — TLS: Encrypted Channels (TLS)
TLS is what protects every OAuth token, every API key, and every
password while they're in transit. The handshake does two jobs at
once. First, the server proves who it is by presenting a certificate
signed by a Certificate Authority your client already trusts — that's
the part that stops an attacker from quietly answering for
google.com. Second, both sides run a key exchange — typically ECDHE —
that produces ephemeral session keys neither side stores after the
session ends. That property is forward secrecy: even if the server's
private key gets stolen tomorrow, last year's recorded sessions stay
unreadable, because the keys that protected them were thrown away. TLS
1.3 streamlined the whole negotiation down to a single round trip and
threw out every legacy algorithm that was no longer safe. The full
mechanism — certificates, chains of trust, the handshake itself,
session resumption — is in the TLS episode. Here we just need the
fact that without TLS, OAuth is naked. The Bearer token would be
visible to every router between you and the API.

TLS protects bytes flowing over the network, and it does it with a
trust model rooted in Certificate Authorities. But system administrators
need a different shape of secure access — interactive shell sessions,
file transfers, tunnels into machines you actually own. That calls for
a different protocol with a different idea of trust.

### Step 3 — SSH: Key-Based Machine Access (SSH)
SSH replaces the trust model entirely. Instead of leaning on
Certificate Authorities, it uses trust on first use: the first time
you connect to a server, you verify its host key fingerprint by hand,
your client remembers it, and on every future connection it checks
that the server still presents the same key. Authentication usually
runs on Ed25519 key pairs — your private key never leaves your
machine, your public key gets dropped onto every server you need to
reach. No password ever crosses the network. Once you have a session,
SSH gives you a lot more than a shell: encrypted port forwarding that
can wrap any TCP protocol in encryption, SFTP for secure file
transfer, and agent forwarding for chaining through a bastion host
into a private network. This is the backbone of modern DevOps. Git
pushes, Ansible deployments, remote debugging sessions — all of them
flow through SSH. The full mechanism — the key exchange, the channel
multiplexing, the forwarding tricks — is in the SSH episode. Here the
takeaway is the contrast: TLS authenticates servers to anonymous
clients at web scale; SSH authenticates a known engineer to a
specific fleet of machines.

## What the listener now understands
Authentication is not one problem. It's three. OAuth answers "what is
this app allowed to do on my behalf?" — and it does it without ever
exposing your password to the app. TLS answers "is the server I'm
talking to actually the one I think it is, and can anyone else read
this?" — and it does it with a public CA system and ephemeral session
keys. SSH answers "am I the right human to get a shell on this box?"
— and it does it with keys the engineer owns and a fingerprint the
machine remembers. Each protocol picks a trust model that fits its
problem and refuses to do the others' jobs. That separation is what
makes the whole system work.

## Where this connects in the book
- The chapter on OAuth 2.0 walks the Authorization Code flow with
  PKCE step by step, including the refresh token loop and where
  OpenID Connect bolts identity on top.
- The chapter on TLS unpacks certificates, chains of trust, the move
  from TLS 1.2 to 1.3, and what forward secrecy actually buys you
  when a private key eventually leaks.
- The chapter on SSH covers host keys, the Ed25519 key pair, agent
  forwarding, and the port-forwarding tricks that make SSH the Swiss
  Army knife of remote access.

## See also (other journeys and protocol episodes)

- If this journey made the OAuth step feel the most surprising, the
  OAuth episode is the right next listen. It's the one most engineers
  underestimate until they have to implement it themselves.

- The TLS episode pairs naturally with the journey on what happens
  when you type a URL — same handshake, same certificates, just framed
  inside a page load instead of an API call.

- The SSH episode is worth queueing if you've ever wondered why
  ssh-keygen produces two files, what known_hosts is actually for, or
  how a single ssh command can tunnel an entire database connection
  through a jump host.

## Visual cues for image generation

- Three-node graph lighting up in sequence: OAuth, then TLS, then SSH
  — each labeled with what it actually proves and to whom.
- OAuth Authorization Code flow with PKCE: user, app, authorization
  server, resource server, with arrows for the redirect, the code, the
  code verifier, the access token, and the final API call carrying a
  Bearer token.
- TLS 1.3 handshake collapsed to one round trip: ClientHello, then
  ServerHello with certificate and key share, then Finished, with an
  ECDHE key exchange producing ephemeral session keys on the side.
- Side-by-side trust models: a CA-signed certificate chain on the TLS
  side, a known_hosts file and an Ed25519 key pair on the SSH side.
- Stacked layer diagram of one authenticated API call: TCP at the
  bottom, then TLS, then HTTP, with an OAuth Bearer token sitting in
  the Authorization header at the top.
