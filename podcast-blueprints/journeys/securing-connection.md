---
id: securing-connection
type: journey
title: Securing the Connection
scope: utilities
podcast_target_minutes: 12
step_count: 3
protocols_in_order: [dns, tls, ssh]
related_protocols: [dns, tls, ssh, udp, tcp]
related_book_chapters: []
visual_cues:
  - "Three-node graph lighting up in sequence: DNS, then TLS, then SSH — with little padlock icons appearing on the line between each pair as the security guarantees stack"
  - "Side-by-side comparison of a plaintext UDP DNS query and the same query wrapped in DNS-over-HTTPS — observer on the wire sees the domain name in the first frame, sees only encrypted bytes in the second"
  - "TLS 1.3 handshake sequence: ClientHello, ServerHello with certificate, key exchange via ECDHE, then a green line of encrypted application data — annotated with 'one round trip' across the top"
  - "SSH connection diagram: developer laptop on the left, jump host in the middle, target server on the right — with the public key, the encrypted shell channel, and a port-forward tunnel all drawn on the same wire"
  - "Stacked guarantee diagram: 'who am I talking to', 'is anyone listening', 'has anyone changed this' — three boxes, with DNS, TLS, and SSH each ticking off which boxes they own"
---

# Securing the Connection

## In one breath
This journey walks the invisible infrastructure that translates names,
encrypts data in flight, and lets a human safely log into a machine on
the other side of the world. Three protocols cooperate — DNS to find
the right server, TLS to wrap the wire in encryption, and SSH to give
operators a secure door into the box itself. Together they are the
quiet layer underneath almost every safe interaction on the modern
internet.

## The hook (cold-open)
Every safe thing you do online — checking your bank, deploying code,
opening a private chat — depends on three protocols you almost never
think about. One of them tells you where to go. One of them locks the
line between you and the place you're going. And one of them lets the
people who actually run that place log in without handing their
password to anyone watching the wire. In the next few minutes we're
going to walk those three, in the order they show up, and watch the
guarantees of confidentiality, integrity, and authenticity get stacked
on top of each other one layer at a time.

## The journey

### Step 1 — DNS: Name Resolution (DNS)
Almost every internet interaction starts with a DNS query — and that
query is also one of the most exposed things your device does.
Traditional DNS travels in plaintext over UDP, which means your ISP,
or anyone else sitting on the network path, can see every domain you
look up. Modern hardening fixes that on three fronts. DNSSEC adds
cryptographic signatures so a forged response can't impersonate a real
nameserver. DNS-over-HTTPS and DNS-over-TLS encrypt the queries
themselves, so observers see only opaque traffic, not the names you're
asking about. And DANE lets a domain owner publish their TLS
certificate fingerprints inside DNS itself, tying the two systems
together. Securing this step matters because a compromised DNS
response can quietly redirect you to a phishing site that perfectly
mimics your bank — and no amount of TLS will help if you connect to
the wrong server in the first place. The full mechanism — recursive
resolvers, the root and TLD hierarchy, record types, and the
specifics of DNSSEC, DoH, DoT and DANE — is in the DNS episode. Here
we just need the outcome: your device knows where it's actually
supposed to connect, and an attacker on the wire can't easily lie
about that.

DNS has told you where to connect, but the connection itself is still
naked. Anyone on the path between you and that server can read it,
modify it, or inject data into it. The next step is wrapping the line
in encryption that guarantees confidentiality, integrity, and
authenticity all at once.

### Step 2 — TLS: Encryption (TLS)
TLS is the layer that makes secure internet communication possible. It
opens with a handshake. The server presents a certificate signed by a
trusted Certificate Authority, which is what proves it really is the
service you think you're talking to — that's the authentication piece.
The two sides then negotiate a cipher suite and run a key exchange,
typically ECDHE — Elliptic Curve Diffie-Hellman Ephemeral — to derive
shared session keys that only they hold. The "ephemeral" part is what
buys forward secrecy: even if the server's long-term private key gets
stolen years from now, an attacker who recorded today's traffic still
cannot decrypt it, because the session keys never travelled the wire.
From there on, every byte of application data is encrypted for
confidentiality and authenticated with a MAC for integrity, so nothing
can be quietly altered in flight. TLS 1.3 simplified the whole story —
it dropped the insecure legacy algorithms, collapsed the handshake to
a single round trip, and made 0-RTT resumption possible so a repeat
visit can send encrypted application data immediately. The full
mechanism — certificates, chains of trust, cipher suites, the
handshake itself — is in the TLS episode. Here we just need the
outcome: a private, tamper-evident channel between two parties who
have actually proved who they are.

TLS protects the data flowing over the network. But the people who
run the servers on the other end need more than encrypted web traffic.
They need to log into remote machines, copy files around, and stand up
encrypted tunnels for whatever else they're building. That's a
different problem, and a different protocol grew up to solve it.

### Step 3 — SSH: Secure Access (SSH)
SSH replaced Telnet and rlogin — protocols that cheerfully sent
passwords across the network in plaintext — and became the universal
standard for secure remote server management. It supports several
authentication methods: passwords, public keys using Ed25519 or RSA,
certificate-based auth, and multi-factor on top. Public-key auth is
the gold standard, because there is no password to intercept and
nothing for an attacker to guess. SSH does more than just give you a
shell. SCP and SFTP ride on the same encrypted channel for file
transfer. Local and remote port forwarding let you tunnel any TCP
connection through that channel, which is how operators reach
databases and internal services that aren't supposed to face the
public internet. Agent forwarding lets you chain through jump hosts
without leaving private keys on machines you don't own. And the
~/.ssh/config file ties it all together — per-host settings, jump
proxies, and identity files in one place. SSH is also the transport
underneath most Git operations, which is why it sits, quietly, at the
foundation of modern software development. The full mechanism — the
handshake, the key exchange, the channel multiplexing, and the host
key trust model — is in the SSH episode. Here we just need to see
where it fits: TLS secures connections between programs, SSH secures
the door that the humans walk through.

## What the listener now understands
This is the security stack as a layered story. DNS answers "where am
I going" and, when hardened, makes it hard for anyone to lie about the
answer. TLS answers "is anyone listening" and "has anyone changed
this" for the data flowing between two endpoints. SSH answers "how do
the people who maintain that endpoint actually get in." Each protocol
minds its own concern, and trusts the others to mind theirs.
Confidentiality, integrity, and authenticity are not one feature
delivered by one system — they are properties that get assembled,
piece by piece, by protocols that were designed independently and now
quietly cooperate every time you do anything that matters online.

## Where this connects in the book
- The chapter on DNS goes deep on the resolver hierarchy and the
  hardening story — DNSSEC's signature chain, DoH and DoT's encrypted
  transports, and DANE's bridge into the TLS trust model.
- The chapter on TLS walks through certificates and chains of trust,
  the ECDHE key exchange, forward secrecy, and the move from TLS 1.2
  to TLS 1.3 with its single-round-trip handshake and 0-RTT
  resumption.
- The chapter on SSH covers the host key trust model, the
  public-key authentication flow, and the port-forwarding tricks that
  turn a remote shell into a general-purpose secure tunnel.

## See also (other journeys and protocol episodes)

- If this journey made you curious about what an unhardened DNS
  lookup actually exposes, the DNS episode is the place to go next —
  it walks the resolver hierarchy and shows exactly which parties get
  to see your query at each hop.

- The TLS episode is the right follow-on if the certificate and key
  exchange step felt like the most magical part. It's the one that
  most often surprises engineers when they look at it closely, and
  it's the layer the rest of the secure web is built on.

- The SSH episode goes further into port forwarding, agent
  forwarding, and the host key trust model — the parts that turn SSH
  from "remote shell" into the general-purpose secure transport that
  modern operations actually depend on.

## Visual cues for image generation

- Three-node graph lighting up in sequence: DNS, then TLS, then SSH —
  with small padlock icons appearing on the line between each pair as
  the security guarantees stack up.
- Side-by-side comparison of a plaintext UDP DNS query and the same
  query wrapped in DNS-over-HTTPS — an observer on the wire reads the
  domain name in the first frame and sees only encrypted bytes in the
  second.
- TLS 1.3 handshake sequence: ClientHello, ServerHello with
  certificate, key exchange via ECDHE, then a green line of encrypted
  application data — labelled "one round trip" across the top.
- SSH connection diagram: developer laptop on the left, jump host in
  the middle, target server on the right — with the public key, the
  encrypted shell channel, and a port-forward tunnel all drawn on the
  same wire.
- Stacked guarantee diagram: three boxes labelled "who am I talking
  to", "is anyone listening", and "has anyone changed this" — with
  DNS, TLS, and SSH each ticking off which boxes they own.
