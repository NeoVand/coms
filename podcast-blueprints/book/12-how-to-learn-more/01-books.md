---
id: how-to-learn-more/books
type: chapter
part_id: how-to-learn-more
part_label: XIII
part_title: How to Learn More
title: Books
synopsis: Tanenbaum, Stevens, Kurose & Ross, Grigorik, the systems-approach textbook.
podcast_target_minutes: 12
position_in_book: chapter 81 of 84
listening_order:
  prev: how-to-learn-more/rfcs-to-read
  next: how-to-learn-more/courses
related_protocols: [tcp, ip, tls, http1, http2, http3, webrtc]
related_pioneers: [radia-perlman]
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "Five book covers laid out in reading order — Tanenbaum's Computer Networks (6th ed., 2021), Stevens' TCP/IP Illustrated Volume 1 (2nd ed., 2011), Kurose and Ross's Computer Networking: A Top-Down Approach (8th ed., 2021), Peterson and Davie's Computer Networks: A Systems Approach (6th ed., 2022), Grigorik's High Performance Browser Networking (O'Reilly, 2013)."
  - "Two arrows over a stack of layers — one labelled 'Tanenbaum: bottom-up, physical first' starts at the wire and points up, the other labelled 'Kurose & Ross: top-down, application first' starts at HTTP and points down."
  - "A page from Stevens Volume 1 — protocol diagram on the left, real packet capture hex dump on the right, both showing the same TCP segment."
  - "A bookshelf labelled 'specialised reading' — Bonaventure's free online textbook, Perlman's Interconnections (2nd ed., 2000), and a thin staple-bound RFC 1180 from 1991, 28 pages, captioned 'still the cleanest 28 pages on TCP/IP after 35 years.'"
  - "A portrait of Radia Perlman over the line 'I think that I shall never see / A graph more lovely than a tree.' with a small spanning-tree diagram underneath."
---

# Part XIII, Chapter — Books

## The hook

If you want to keep going after this book, the next step is other books. Five of them, in a specific order. One textbook to build the map. One book of packet traces to learn what is actually on the wire. One alternative textbook for a different angle. One systems-design book for the why behind the protocols. And one book on what matters for the web. Plus three short ones for specific corners. That is the entire reading list.

## The story

### Five Books, In Recommended Reading Order

The list is short on purpose. Networking has thousands of books. Most of them repeat the same material with slightly different diagrams. These five do not.

Start with **Andrew Tanenbaum, Computer Networks, sixth edition, 2021.** It is the textbook most networking courses use. It works bottom-up — physical layer first, application layer last — and it is strong on history and intuition. It is weaker on operational practice. You will not learn how to debug a production outage from Tanenbaum. You will learn the shape of the field.

Then read **W. Richard Stevens, TCP/IP Illustrated, Volume 1**, in the second edition by Kevin Fall and Gary Wright, 2011. This is the book to read after a textbook. Each chapter pairs a protocol description with a packet trace from a real capture. You read about the TCP three-way handshake — and how the handshake actually works is the meat of the TCP episode — and on the next page you see the SYN, SYN-ACK, ACK on the wire, with the bytes labelled. Volume 2, the BSD source-code volume, is a deep dive for systems engineers writing their own stacks.

The other major textbook is **Kurose and Ross, Computer Networking: A Top-Down Approach, eighth edition, 2021.** Where Tanenbaum starts at the physical layer, Kurose and Ross start at the application layer and work down. That choice makes it more accessible for readers who are not coming from a CS background — you start with HTTP, which most engineers have already met, and only later get to Ethernet and routing. The companion problem sets and lab assignments are excellent. Pick whichever orientation matches how your own brain works; you do not need both.

For the design pressures behind the protocols, read **Larry Peterson and Bruce Davie, Computer Networks: A Systems Approach, sixth edition, 2022.** This is the systems-approach book. It explains networking as a system rather than a sequence of protocols — why this trade-off, why that constraint, why this layer ended up where it did. It is the book for engineers who want to understand the design decisions, not just the specs. The free online edition is updated more often than the print one.

The fifth and most operational book is **Ilya Grigorik, High Performance Browser Networking, O'Reilly, 2013.** It is the book on what actually matters for web performance. It covers TCP, TLS, HTTP/1.1, HTTP/2, WebRTC, and the browser networking APIs — the mechanism details for each of those live in their own protocol episodes. The 2013 publication date means it predates HTTP/3 and the QUIC spec, so for the HTTP/3 story you go to the HTTP/3 episode instead. Even with that gap, Grigorik is still the single most useful book for full-stack web developers who want to debug latency.

### Specialised Reading

Three more books for specific corners.

**Olivier Bonaventure, Computer Networking: Principles, Protocols and Practice**, free online, is a lighter alternative to Tanenbaum. If the 1,000-page commitment is too much, start here.

**Radia Perlman, Interconnections, second edition, 2000**, is the routing and switching deep dive — written by the inventor of the Spanning Tree Protocol. The Ethernet episode and the bridging-versus-routing material in the OSI chapters both lean on the framing this book established. The next short section of this episode is about Perlman herself.

And **Marc Greis, RFC 1180: A TCP/IP Tutorial, 1991**, is 28 pages, free, 35 years old, and still the cleanest introduction to the basics. If you want one document to hand to a junior engineer who has never thought about networking, this is it. The RFCs Worth Reading chapter, just before this one, has the longer list.

## The figures

### Radia Perlman

Born 1951. Worked at Digital Equipment Corporation, then Sun, then Intel. In 1985 she invented the Spanning Tree Protocol, standardised as IEEE 802.1D, which made redundant Ethernet topologies possible by automatically discovering loops and disabling the redundant links without operator intervention. Without Spanning Tree, every backbone Ethernet network in the world would broadcast-storm itself to death. She later designed TRILL, Transparent Interconnection of Lots of Links, and contributed to the IS-IS routing protocol. She holds over 100 patents and is often called the Mother of the Internet for the loop-prevention work that made every multi-switch Ethernet network possible. Internet Hall of Fame in 2014, SIGCOMM Award in 2010, USENIX Lifetime Achievement Award in 2007. Her textbook, Interconnections: Bridges, Routers, Switches and Internetworking Protocols, is the gold standard on bridging versus routing — and the reason her name appears on this reading list. She also wrote a poem about it: "I think that I shall never see / A graph more lovely than a tree."

## Listening order

- **Before this chapter:** *RFCs Worth Reading — the short list of foundational documents to read straight from the source, before you turn to the textbooks.*
- **After this chapter:** *Courses — the lectures and online courses that complement the books, for people who learn better with a voice and a whiteboard.*

## Where to go deeper

- The TCP episode picks up the mechanism story — three-way handshake, slow start, AIMD, fast retransmit — that Stevens shows on the wire and Tanenbaum frames in theory.
- The IP episode covers the addressing and routing model that Peterson and Davie take as their starting case study.
- The TLS episode covers the 1.3 handshake and the certificate trust model that Grigorik treats at the application level.
- The HTTP/1.1, HTTP/2, and HTTP/3 episodes carry the web-protocol story past Grigorik's 2013 cutoff — head-of-line blocking, multiplexing, and the move to QUIC.
- The WebRTC episode covers the ICE, STUN, TURN, DTLS and SRTP stack that Grigorik introduces from the browser-API side.
- The Ethernet episode and the Spanning Tree material in the Layer 2 part of the book pick up Perlman's Interconnections in protocol form.
