---
id: trevor-perrin
type: pioneer
name: Trevor Perrin
years: "c. 1977–"
title: Designer of the Noise Protocol Framework and the Signal Protocol
org: Independent cryptographer
podcast_target_minutes: 6
protocols: [wg]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Trevor Perrin
  credit: null
visual_cues:
  - "Portrait composition: a quiet workbench-style desk, a laptop open to the noiseprotocol.org spec, no conference badge in sight — the deliberate low profile of an applied cryptographer whose patterns ship in a billion phones"
  - "A whiteboard diagram of the Noise handshake patterns — IK, XX, IKpsk2 — with an arrow from IKpsk2 to a small WireGuard logo labelled Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s"
  - "A split-screen of three messaging app icons — Signal, WhatsApp, Google Messages — all converging on a single ratchet diagram labelled X3DH plus Double Ratchet"
  - "A timeline panel: 2013 Axolotl ratchet, 2016 X3DH paper, 2016 Noise Protocol Framework — three small artefacts a single person shipped in three years"
---

# Trevor Perrin

## In one sentence
Trevor Perrin is the applied cryptographer who co-designed the key-agreement and ratcheting machinery that secures Signal, WhatsApp, Facebook Messenger, and Google Messages, and then wrote the framework that WireGuard's handshake is built from.

## The hook (cold-open)
If you sent an end-to-end encrypted message today — on Signal, on WhatsApp, on Facebook Messenger, on Google Messages over RCS — the cryptography that set up that conversation traces back to two protocols Trevor Perrin co-designed with Moxie Marlinspike: X3DH and the Double Ratchet. If you connected to a WireGuard VPN today, the handshake that authenticated the tunnel is an instantiation of a pattern from a separate framework Perrin published in 2016. He almost never speaks at conferences. His patterns are in roughly every secure conversation on the planet.

## The work

### X3DH and the Double Ratchet — the Signal core
Before the Noise framework, Perrin's headline work was inside Signal. With Moxie Marlinspike he co-designed X3DH — Extended Triple Diffie-Hellman — the asynchronous key-agreement protocol that lets two parties establish a shared secret even when one of them is offline, by publishing a bundle of pre-keys to a server in advance. He also co-designed the ratchet that runs once the conversation is open, originally called Axolotl and later renamed the Double Ratchet. The Double Ratchet is what gives Signal its forward secrecy and post-compromise security — every message advances the key state, so a key compromise yesterday does not let an attacker read today's messages. Both protocols were adopted wholesale by WhatsApp, by Facebook Messenger's end-to-end mode, and by Google Messages' RCS encryption. The deployed footprint runs into the billions of users.

### The Noise Protocol Framework — 2016
In 2016 Perrin published the Noise Protocol Framework at noiseprotocol.org. Noise is not a protocol — it is a construction kit for building secure handshakes from a small set of named patterns (IK, XX, NK, IKpsk2, and a handful more) composed with a chosen Diffie-Hellman group, an AEAD cipher, and a hash. The point is that a designer picks a pattern that matches the threat model — who authenticates whom, who knows whose static key in advance, whether there is a pre-shared key — and the framework gives back a handshake whose security properties are already analysed.

The most visible adopter is WireGuard, which we cover in its own episode. WireGuard's handshake is exactly the Noise IKpsk2 pattern instantiated with Curve25519, ChaCha20-Poly1305, and BLAKE2s — written out in full as `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`. The mechanism story belongs to the WireGuard episode; what matters here is that one of the cleanest VPN handshakes ever shipped is a parameter choice on top of Perrin's framework.

### A quiet career, an outsized footprint
Perrin works as an independent cryptographer and is rarely on a conference stage. The pattern across his work is the same: small, sharply specified primitives — a ratchet, a key-agreement protocol, a handshake construction kit — that other people then build a billion-user product on top of. He is, on any honest count, one of the most consequential applied cryptographers of the last fifteen years.

## See also (other pioneer episodes)
The most natural companion listen is the WireGuard episode itself — the protocol whose handshake is a direct instantiation of Perrin's Noise IKpsk2 pattern, and whose minimalist crypto-suite philosophy is the deliberate counter-design to IPsec.

## Sources

**Homepage**
- [Noise Protocol Framework — noiseprotocol.org](https://noiseprotocol.org/)
