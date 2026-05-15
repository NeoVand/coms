---
id: eric-rescorla
type: pioneer
name: Eric Rescorla
years: "c. 1968–"
title: Editor of TLS 1.3
org: Mozilla, Windy Hill Systems
podcast_target_minutes: 6
protocols: [tls]
categories: []
related_book_chapters:
  - utilities-security/tls
  - how-to-learn-more/rfcs-to-read
awards: []
image:
  src: null
  alt: Portrait of Eric Rescorla
  credit: null
visual_cues:
  - "Portrait composition: a working IETF chair at a laptop in a hotel ballroom, the TLS 1.3 draft number ticking up on screen — draft-01, draft-02, all the way to draft-28"
  - "Side-by-side handshake diagrams: TLS 1.2 with two round-trips on the left, TLS 1.3 with one round-trip on the right, an arrow labelled RFC 8446 — August 2018"
  - "A bookshelf shot of the 2000 hardback SSL and TLS: Designing and Building Secure Systems sitting next to a printed copy of RFC 8446"
  - "A schematic of a hostile middlebox in the path between browser and server, with the TLS 1.3 legacy_version field and a fake ChangeCipherSpec record sliding through it untouched"
---

# Eric Rescorla

## In one sentence
Eric Rescorla is the engineer who edited TLS 1.3 — the five-year, twenty-eight-draft redesign that cut the HTTPS handshake from two round-trips to one and is now running every time your browser shows a lock icon.

## The hook (cold-open)
For most of the web's history, opening an HTTPS connection cost two full round-trips before the first byte of your request could move. In August 2018, after five years and twenty-eight published drafts, the IETF shipped TLS 1.3 — RFC 8446 — and that handshake collapsed to one. The person whose name is at the top of that RFC, as editor, is Eric Rescorla. He is also the reason it deployed at all on a real internet full of middleboxes that would otherwise have broken it.

## The work

### TLS 1.3 — RFC 8446, August 2018
Rescorla's central contribution is editing TLS 1.3. The redesign threw out the old cipher suites that had carried half a decade of vulnerabilities, made authenticated encryption — AEAD — mandatory rather than optional, and fused the handshake into a single round-trip. The mechanism itself belongs to the TLS episode; what matters for the biography is the scale of the editorial job. Twenty-eight drafts. Five years of working-group argument. A standard that now sits underneath essentially every encrypted connection on the public web.

### The middlebox-compatibility hacks
The part of TLS 1.3 that gets less credit, and that Rescorla designed personally, is the set of compatibility hacks that let it deploy at all. Roughly three percent of middleboxes on the open internet were parsing the TLS version field and dropping connections they did not recognise — enough to make a clean TLS 1.3 unshippable. The fix was to lie convincingly: a legacy_version field that still says TLS 1.2 on the wire, and a fake ChangeCipherSpec record sent for no cryptographic reason except that middleboxes expected to see one. Without those hacks, TLS 1.3 would have been a beautifully designed protocol that nobody could turn on. With them, it rolled out across the web in months.

### SSL and TLS, the textbook
In 2000, Rescorla wrote *SSL and TLS: Designing and Building Secure Systems*, which became the standard practitioner's text on transport-layer encryption. It is one of the books the chapter on RFCs and reading material in the "How to Learn More" part of the book points readers to.

### Continuing IETF work
Rescorla still chairs IETF working groups — on TLS itself, on OAuth, and on encrypted DNS. The OAuth and DNS protocol episodes both touch work that has gone through committees he runs. His day job has been at Mozilla and at his own consultancy, Windy Hill Systems.

## Where they appear in the book
- Part "Utilities & Security," chapter "TLS" — Rescorla is the editor of the standard the chapter is built around.
- Part "How to Learn More," chapter "RFCs Worth Reading" — RFC 8446 is on the recommended reading list, and Rescorla's textbook is the long-form companion.

## See also (other pioneer episodes)
The TLS episode is the obvious next listen — the protocol whose 1.3 revision is Rescorla's defining work. For the layer underneath, the TCP and QUIC episodes cover the transports that TLS rides on top of, and the QUIC handshake borrows TLS 1.3's cryptography wholesale. For the standards process that produced RFC 8446, the IETF shows up in almost every other pioneer episode in this series.

## Sources

**Wikipedia**
- [Eric Rescorla — Wikipedia](https://en.wikipedia.org/wiki/Eric_Rescorla)
