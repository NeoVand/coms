---
id: ian-hickson
type: pioneer
name: Ian Hickson
years: "c. 1980–"
title: Editor of HTML5 and WebSocket
org: Opera, Google, WHATWG
podcast_target_minutes: 6
protocols: [websockets, sse]
categories: []
related_book_chapters:
  - web-api/websockets-and-sse
awards: []
image:
  src: null
  alt: Portrait of Ian Hickson
  credit: null
visual_cues:
  - "Portrait composition: a specification editor at a laptop, terminal open to a multi-thousand-page HTML draft, IRC client visible in a side window logged into #whatwg"
  - "Split frame: an XHTML 2 spec stamped 'abandoned' on the left, a sprawling 'HTML Living Standard' page on the right, dated 2004 onward"
  - "A browser window in late-2006 Opera streaming a server-sent events feed of stock ticks down the page, captioned 'Web Applications 1.0'"
  - "An IRC log line on a dark terminal: '<hixie> let's call it WebSocket', with a later overlay reading 'RFC 6455, December 2011'"
---

# Ian Hickson

## In one sentence
Ian Hickson is the engineer who, as editor of HTML5 at the WHATWG from 2004, almost single-handedly turned the web's specification from a stalled XHTML 2 effort into a living standard, and along the way shipped the first drafts of Server-Sent Events and coined the name "WebSocket."

## The hook (cold-open)
By 2004 the official future of the web was XHTML 2 — a clean-slate, backwards-incompatible rewrite that browsers were quietly refusing to implement. A small group of browser engineers walked out of the W3C and founded the WHATWG to write a different spec, one that described the web as it actually was. Ian Hickson became its editor. Over the next decade the document he maintained grew into HTML5, then into the HTML Living Standard, and the entire modern web platform was built on top of it. The same editor, in the same years, wrote the first draft of Server-Sent Events and typed the word "WebSocket" into an IRC channel for the first time.

## The work

### Editing HTML5 at the WHATWG, from 2004
Hickson took over as editor of the HTML specification at the WHATWG in 2004. The job was unusual in two ways. First, the scope was enormous — not just the markup language but the parsing algorithm, the DOM, the navigation model, and the dozens of APIs that browsers exposed to script. Second, the editorial style was singular: one person reading bug reports, mailing-list threads and browser source, and writing the prose that the four major engines would then implement. The amount of detailed specification work shipped under his name across two decades is exceptional even by IETF and W3C standards. The output is the document the modern web platform depends on.

### Server-Sent Events, Opera, September 2006
While editing HTML5, Hickson also drafted Server-Sent Events — a one-way streaming channel from server to browser over plain HTTP. The first shipping implementation went out in Opera in September 2006 as part of what was then called "Web Applications 1.0." The mechanism — how the EventSource API maps onto a long-lived HTTP response of `text/event-stream` lines — is the subject of the Server-Sent Events episode; what matters here is that the spec and the first browser implementation both trace back to the same editor.

### Coining "WebSocket"
The name "WebSocket" was first typed by Hickson in the #whatwg IRC channel during the design discussions that became the protocol. The protocol itself — a full-duplex, persistent connection between browser and server — was finalised as RFC 6455 in December 2011 under editor Ian Fette. The WebSocket episode walks through the handshake and the framing; the biographical fact for this episode is that the name, and the early specification work that made the protocol part of the web platform at all, came from the same editor who was simultaneously shepherding HTML5.

## Where they appear in the book
- Part "Web / API," chapter "WebSockets and SSE" — both protocols Hickson drafted live in this chapter, and his editorial role at the WHATWG is the through-line that connects them.

## See also (other pioneer episodes)
The protocols Hickson drafted have their own episodes — the Server-Sent Events episode and the WebSocket episode — and those are the place to hear the wire-format and handshake stories this biography deliberately defers.

For the wider story of the web platform Hickson was editing on top of, the Tim Berners-Lee episode covers the original HTTP, HTML and URL design from CERN; HTML5 is the spec that grew up around the language Berners-Lee first sketched.

## Sources

**Wikipedia**
- [Ian Hickson — Wikipedia](https://en.wikipedia.org/wiki/Ian_Hickson)

**Homepage**
- [hixie.ch](https://hixie.ch/)
