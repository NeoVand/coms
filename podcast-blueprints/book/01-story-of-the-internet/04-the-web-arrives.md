---
id: the-web-arrives
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The Web Is Built On Top
synopsis: CERN, hypertext, and a NeXT cube in the corner.
podcast_target_minutes: 12
position_in_book: 14 of 84
listening_order:
  prev: story-of-the-internet/osi-vs-tcp-ip
  next: story-of-the-internet/mobile-and-bufferbloat
related_protocols: [tcp, http1, http2, http3, ip]
related_pioneers: [tim-berners-lee]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/First_Web_Server.jpg/500px-First_Web_Server.jpg
    caption: The NeXTcube on which Tim Berners-Lee ran the world's first web server, info.cern.ch, at CERN in 1990. The "Do not power down" sticker is original — for years this single machine was the entire web.
    credit: Photo — Coolcaesar, CC BY-SA 3.0, via Wikimedia Commons
visual_cues:
  - "A close-up of the cover page of Berners-Lee's March 1989 memo 'Information Management: A Proposal,' with Mike Sendall's handwritten 'Vague but exciting' scrawled in the top corner."
  - "The black NeXTcube on a desk at CERN with a yellowing 'This machine is a server. DO NOT POWER IT DOWN!!' label, a CRT monitor beside it showing the WorldWideWeb browser."
  - "A four-tier stack diagram: HTML on top, then HTTP, then TCP, then IP — with an arrow labelled '1990 — only this top layer was new' pointing at HTML and HTTP."
  - "A timeline of HTTP versions: HTTP/1.0 (1996), HTTP/1.1 (1997), HTTP/2 (2015), HTTP/3 (2022) — same semantics, four different transports."
  - "A side-by-side of two 1995 desktops: one running Mosaic / early Netscape on the open web, the other showing AOL's keyword screen and a Compuserve menu — captioned 'open won.'"
---

# Part II, Chapter — The Web Is Built On Top

## The hook

In March 1989, a software engineer at CERN named Tim Berners-Lee handed his manager a memo titled *Information Management: A Proposal*. His manager, Mike Sendall, scribbled three words on the cover: "Vague but exciting." That memo, and the NeXT cube Berners-Lee built it on a year later, are the reason you have a browser open right now. The story of how the web arrived is not a story about inventing the internet. It is a story about inventing one application that sat on top of an internet that already worked.

## The story

### A Manager's Side Project

Berners-Lee's 1989 memo described a system where documents on different machines could link to each other through hypertext, retrieved by a uniform addressing scheme. Sendall called it vague but exciting and let him keep going. By Christmas 1990, on a NeXT workstation in his office at CERN, Berners-Lee had built four things: the first web server, info.cern.ch; the first web browser, which was also a WYSIWYG editor; and the three protocols he needed to glue them together — HTTP for transport, HTML for markup, and URLs for addressing.

The deepest fact about that Christmas-1990 system is what Berners-Lee did *not* have to build. He did not have to invent reliable transport. He did not have to invent ordering, retransmission, or routing. The whole system rode on top of TCP — the protocol that, by 1990, had already been hardened by the 1986 Berkeley fix we cover in the chapter on the 1986 congestion collapse — and underneath TCP was IP, which knew how to get a packet from CERN to anywhere else on Earth. Mechanism details for both of those live in the TCP episode and the IP episode; the point here is that they were *done*.

That is the deepest lesson of the web's success. The web was an *application*. An application that benefited from a layered stack underneath that worked. HTTP/1.0 in 1996, HTTP/1.1 in 1997, HTTP/2 in 2015, HTTP/3 in 2022 — every one of them is still, at heart, just a way to ask one host to send another some bytes. The transports under HTTP have been swapped out three times in thirty years; the application semantics have barely moved.

### CERN Released It Royalty-Free

On the 30th of April 1993, CERN released the World Wide Web technology — server, browser, line-mode reader, and the protocol specifications — into the public domain. The document is one of the most consequential pieces of paper in computing history. It was a deliberate decision by CERN's management, against the institutional instinct to license the research, that the web should be free for anyone to implement.

That release is the reason there is no Microsoft web, no Apple web, no IBM web. Within twelve months, Mosaic — built at NCSA by Marc Andreessen and Eric Bina, released January 1993 — had become the first popular graphical browser. Andreessen co-founded Netscape later that year. Microsoft licensed the Spyglass / Mosaic codebase as the seed of Internet Explorer in 1995. By 1996, the browser wars were under way. But every combatant was building on the public-domain CERN spec.

The architectural lesson the web carried forward is the lesson the internet had already taught with TCP and IP: an application that succeeds at internet scale must be open enough that competitors can implement it. HTTP succeeded for the same reason TCP/IP succeeded — the spec was public, the reference implementation was free, and anyone could build a compatible peer. Every walled-garden alternative — Microsoft's MSN, AOL's keywords, Compuserve, even Apple's later eWorld — lost to the open web.

## The figures

### Tim Berners-Lee

Born 1955. A British software engineer at CERN, then at MIT and the W3C. Between 1989 and 1991 he created HTTP, HTML, and URLs — the three pillars of the web — and built the first browser-editor (called WorldWideWeb) and the first server (CERN httpd) on a NeXT cube. The first website went live by Christmas 1990. He founded the World Wide Web Consortium, the W3C, in 1994 and continues to direct it from MIT. Honours include the ACM Turing Award in 2016, the UK Order of Merit in 2007, and a knighthood as Knight Commander in 2004. The 60-second narrated hook of internet history is the one he gives himself: Vint Cerf made the network of networks; Tim Berners-Lee made the application that turned it into something every human uses.

## Listening order

- **Before this chapter:** *The OSI vs TCP/IP War* — by 1992, official opinion still held that TCP/IP would be replaced by OSI's seven-layer suite. The web shipping on TCP/IP in 1990 and going public-domain in 1993 is part of how that war ended.
- **After this chapter:** *The Mobile and Bufferbloat Decade* — the web crossed onto phones, the network behaved differently than fixed broadband, and HTTP started straining against transports that had been designed for desks.

## Where to go deeper

- The TCP episode picks up the transport that the web rode on. Connection setup, ordered delivery, the congestion control that made 1990s HTTP-over-TCP actually work — that is the mechanism layer this chapter deliberately does not re-explain.
- The IP episode covers the layer underneath TCP — the addressing, the 20-byte header, the hop-by-hop forwarding. Without IPv4 in place by 1981, there is no info.cern.ch to point a URL at.
- The HTTP/1.1 episode covers the protocol Berners-Lee wrote and the form it took once the IETF formalised it in 1997 — persistent connections, chunked encoding, host headers, and the head-of-line blocking that everything since has been trying to undo.
- The HTTP/2 episode is the 2015 sequel — same semantics, binary framing, multiplexing many requests over one TCP connection, HPACK header compression. Why the browser stopped opening six parallel connections per origin.
- The HTTP/3 episode is the 2022 coda — same HTTP semantics again, but the transport is now QUIC over UDP, and TCP-level head-of-line blocking finally goes away. By 2025, around 35% of web traffic uses it.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
