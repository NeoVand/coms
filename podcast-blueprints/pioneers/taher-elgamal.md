---
id: taher-elgamal
type: pioneer
name: Taher Elgamal
years: "1955–"
title: Designer of SSL
org: Netscape, Salesforce, Axway
podcast_target_minutes: 6
protocols: [tls]
categories: []
related_book_chapters:
  - utilities-security/tls
awards:
  - { name: "RSA Lifetime Achievement Award", year: 2009 }
  - { name: "Internet Hall of Fame", year: 2024 }
image:
  src: null
  alt: Portrait of Taher Elgamal
  credit: null
visual_cues:
  - "Portrait composition: a cryptographer at a Netscape workstation in 1995, the Mosaic-era browser open to a page with the small padlock icon at the bottom of the frame"
  - "A whiteboard split in two: on the left, the 1985 Elgamal encryption equations in handwritten chalk; on the right, the SSL 3.0 handshake diagram from 1996"
  - "Close-up of an early HTTPS URL bar from the mid-1990s — https:// in green, the padlock just appearing as a UI element for the first time"
  - "A bookshelf shot: a printed copy of RFC 2246 dated January 1999 sitting next to a Netscape Navigator install CD"
---

# Taher Elgamal

## In one sentence
Taher Elgamal is the cryptographer who designed SSL at Netscape in the mid-1990s — the protocol that made it safe to type a credit-card number into a web browser, and the direct ancestor of every TLS connection running today.

## The hook (cold-open)
Before 1994, the open web had no story for encryption. You could browse, but you could not pay. At Netscape, between 1994 and 1996, Taher Elgamal designed SSL — Secure Sockets Layer — the protocol that put the padlock in the browser and made commerce on the open internet possible. A decade earlier, as a graduate student, he had already invented one of the foundational public-key algorithms that still bears his name. Two contributions, both load-bearing, a decade apart.

## The work

### The Elgamal encryption algorithm — 1985
Elgamal's first headline contribution came before SSL, before Netscape, before the web existed. In 1985 he published the Elgamal encryption algorithm, one of the earliest practical public-key schemes. It is built on the same hardness assumption — the discrete logarithm problem — that underpins Diffie-Hellman key exchange, and it is the direct mathematical ancestor of the Digital Signature Algorithm, DSA, that the US government later standardised. The algorithm is taught in every undergraduate cryptography course; the signature variant shows up wherever DSA does.

### SSL at Netscape — 1994 to 1996
Elgamal's second act was the one that put him on the internet's critical path. As chief scientist at Netscape, he designed SSL — the encryption layer that sits between TCP and HTTP and turns http:// into https://. SSL 2.0 shipped in 1995; SSL 3.0, the version that actually mattered, shipped in 1996. The mechanism — the handshake, the cipher suites, the record layer — belongs to the TLS episode. What matters for the biography is what changed because of it: by the late 1990s, every browser spoke SSL, and the entire e-commerce industry was built on top of it.

SSL 3.0 had a long life and a famous death. In 2014 the POODLE attack made it unsafe to keep around, and browsers finally turned it off. By then, though, the IETF had already taken the protocol over: RFC 2246, published in January 1999, renamed SSL 3.1 to TLS 1.0 as part of a Microsoft–Netscape standards compromise. Every TLS version since — 1.1, 1.2, 1.3 — descends in an unbroken line from the SSL Elgamal designed at Netscape. He is, by common acclaim, the "Father of SSL."

### After Netscape
Elgamal's later career has been spent inside the security industry he helped create — chief technology officer roles at Axway and Salesforce, board seats, advisory work. The dump does not detail a third headline protocol; the SSL design is the work the awards committees keep coming back to.

## Awards and recognition
Elgamal received the RSA Lifetime Achievement Award in 2009, the cryptography community's highest honour for sustained contribution. In 2024 he was inducted into the Internet Hall of Fame, the recognition specifically for the SSL design and its role in making the commercial web possible.

## Where they appear in the book
- Part "Utilities & Security," chapter "TLS" — Elgamal's SSL is the protocol the chapter traces forward from, through every TLS version up to 1.3.

## See also (other pioneer episodes)
The TLS episode is the natural next listen — the protocol that grew directly out of Elgamal's SSL design and now carries essentially every encrypted connection on the public web. For the editorial work that turned SSL into modern TLS, the Eric Rescorla episode covers the editor of TLS 1.3, the most recent revision of the standard Elgamal started.

## Sources

**Wikipedia**
- [Taher Elgamal — Wikipedia](https://en.wikipedia.org/wiki/Taher_Elgamal)
