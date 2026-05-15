---
id: tim-berners-lee
type: pioneer
name: Tim Berners-Lee
years: "1955–"
title: Inventor of the World Wide Web
org: CERN, W3C, MIT
podcast_target_minutes: 8
protocols: [http1, http2, http3]
categories: []
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/ports-sockets
  - story-of-the-internet/the-web-arrives
awards:
  - { name: "ACM Turing Award", year: 2016, url: null }
  - { name: "Order of Merit", year: 2007, url: null }
  - { name: "Knight Commander", year: 2004, url: null }
image:
  src: null
  alt: Portrait of Tim Berners-Lee
  credit: null
visual_cues:
  - "A NeXTcube on a desk at CERN, late 1990, with a sticker reading 'This machine is a server. DO NOT POWER DOWN.'"
  - "Hand-drawn diagram of a single web page linking to three others, with the labels HTTP, HTML, and URL pointing to different parts of the request"
  - "Portrait composition: engineer in a small CERN office, terminal showing the line 'http://info.cern.ch'"
  - "Split frame: the 30 April 1993 CERN document releasing the web royalty-free on the left, a wall of modern browser tabs on the right"
---

# Tim Berners-Lee

## In one sentence
Tim Berners-Lee is the engineer who, in three years at CERN, designed HTTP, HTML, and URLs — the application layer that turned the internet from a network for researchers into something every human uses.

## The hook (cold-open)
By Christmas 1990, the first website in the world was live on a NeXTcube in a small office at CERN, in Geneva. The machine was both the server and the only browser that could talk to it. Three things ran on it: a protocol called HTTP, a markup language called HTML, and a naming scheme called URLs. One person had designed all three. Two and a half years later, on the 30th of April 1993, CERN released the technology royalty-free — and the web stopped being a CERN project and started being the web.

## The work

### CERN, 1989–1991: HTTP, HTML, URLs
Between 1989 and 1991, working at CERN, Berners-Lee designed the three pieces the web still runs on. HTTP — the request-response protocol — is the wire format. HTML is the document format the protocol carries. URLs are the addressing scheme that lets one document point at another. We won't unpack the wire format here; the HTTP/1.1 episode walks through what a request actually looks like on the wire. What matters for the biography is that one engineer designed all three layers, and they fit together cleanly enough that none of the three has been replaced in thirty-five years — extended, yes, but not replaced.

### The first browser and the first server
Berners-Lee didn't only write specs. On a NeXTcube he built WorldWideWeb, the first browser — and crucially, also an editor, because his original conception of the web was read-write, not read-only. He built CERN httpd, the first web server. The first website went live by Christmas 1990. The chapter on the web being built on top of the existing internet tells the wider story of how the application sat on the TCP and IP layers that were already in place; here it's enough to say that a single person shipped both ends of the protocol on the same machine, and that machine is the reason the web exists.

### The royalty-free release
On 30 April 1993, CERN signed off on releasing the web technology royalty-free. No licence fees, no patents to clear. That decision — and Berners-Lee's part in arguing for it — is the reason the web ran away from competing hypertext systems that wanted royalties. It is the single business decision that made the application universal.

### W3C and the second act
In 1994, Berners-Lee left CERN, moved to MIT, and founded the World Wide Web Consortium — the W3C — the standards body that has shepherded HTML, CSS, and the rest of the web platform ever since. He still directs it. The HTTP/2 and HTTP/3 episodes pick up the protocol story after his original spec — multiplexing on one connection, then HTTP over QUIC — but the standards process those revisions went through is the one he set up.

## Awards and recognition
Berners-Lee received the ACM Turing Award in 2016 — computing's highest honour — for inventing the web. The United Kingdom appointed him Knight Commander in 2004 and admitted him to the Order of Merit in 2007, an honour limited to twenty-four living members at any one time.

## Where they appear in the book
- Part "Foundations," chapter "What Is a Protocol?" — HTTP is one of the canonical examples used to introduce the idea of a protocol at all.
- Part "Foundations," chapter "Ports and Sockets" — port 80 and port 443 are the web's, and the chapter uses them to ground the abstraction.
- Part "The Story of the Internet," chapter "The Web Is Built On Top" — the centrepiece chapter for Berners-Lee, on how the application layer he built sat on top of the network Cerf and Kahn had already shipped.

## See also (other pioneer episodes)
The 60-second narrated hook of internet history is "Vint Cerf made the network of networks; Tim Berners-Lee made the application that turned it into something every human uses." If you want the network half of that sentence, the Vint Cerf and Bob Kahn episodes are the place to go — they set up the TCP/IP layer that HTTP sat down on top of.

For the protocols themselves, the HTTP/1.1, HTTP/2, and HTTP/3 episodes pick up where this biography leaves off — the original 1991 design, the 2015 multiplexed binary revision, and the QUIC-based version shipping today.

## Sources

**Wikipedia**
- [Tim Berners-Lee — Wikipedia](https://en.wikipedia.org/wiki/Tim_Berners-Lee)
