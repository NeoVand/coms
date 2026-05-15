---
id: what-is-a-protocol
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: What Is a Protocol?
synopsis: What a protocol is, and why every machine on the planet agrees to follow them.
podcast_target_minutes: 15
position_in_book: 1 of 75
listening_order:
  prev: null
  next: foundations/layer-model
related_protocols: [ethernet, ip, tcp, tls, dns, http1, ssh, mcp]
related_pioneers: [jon-postel, vint-cerf, bob-kahn, bob-metcalfe, david-boggs, tim-berners-lee, david-clark]
related_outages: []
related_frontier: []
related_rfcs: [9293, 760, 1122]
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/TCP_Three-Way_Handshake.svg/500px-TCP_Three-Way_Handshake.svg.png
    caption: The TCP three-way handshake drawn as a sequence diagram. SYN proposes a connection, SYN-ACK accepts and proposes back, ACK seals it. After 1.5 round trips both sides have synchronised sequence numbers and can begin sending real data.
    credit: Image — Wikimedia Commons / public domain
visual_cues:
  - "A stack of seven cooperating protocols loading one web page — Ethernet at the bottom, then IP, TCP, TLS, DNS off to the side feeding addresses, HTTP at the top — each labelled with its single job."
  - "A sequence diagram of the TCP three-way handshake — SYN, SYN-ACK, ACK — with wall-clock arrows and the phrase 'now both sides have agreed on sequence numbers' underneath."
  - "Three columns headed Format, Sequence, Failure handling — each with a tiny TCP example: a 16-bit port field, the SYN/SYN-ACK/ACK ladder, and a retransmit-after-timeout arrow."
  - "A timeline of foundational protocol births — 1973 Ethernet at Xerox PARC, 1974 TCP at Stanford, 1989 the Web at CERN, 1995 SSH at Helsinki, 2024 MCP at Anthropic — five dots, fifty-one years."
  - "A wall of RFC covers — RFC 760, RFC 1122, RFC 9293 — captioned 'no Microsoft Internet, no Apple Internet, no Google Internet — just documents anyone can read.'"
---

# Part I, Chapter — What Is a Protocol?

## The hook

When you load a web page, dozens of protocols cooperate without you noticing. Ethernet carries the bits across your office. IP gets the packets to the right city. TCP makes sure none are lost. TLS encrypts the contents. DNS turned the URL into an address. HTTP is the request the server actually answers. Each one minds its own job; each one trusts the others to do theirs. This first chapter of the book is about the rule that makes all of that possible — the rule that no single company owns any of these documents.

## The story

### Rules Two Machines Agree On

A protocol is a set of rules that two systems agree to follow so they can exchange information. The dictionary definition would tell you it's a sequence of moves; the engineering one is sharper. A protocol is a shared specification — a document that any third party can read and implement, such that two implementations written by people who have never met can interoperate on the first try.

That last phrase is the whole game. Two implementations. Different teams. Different languages. Different decades. They plug in and they work. That is what the word "protocol" means in our world, and it is what separates a protocol from an API, a library, or a product.

The deeper trick is that protocols are public. They're described in plain text in documents called RFCs — Requests for Comments — published openly by the IETF, the Internet Engineering Task Force. Anyone can read RFC 9293 and write a TCP stack. No single company owns the rules. This is the fact that made the internet possible. There is no Microsoft Internet, no Apple Internet, no Google Internet. There is the internet, defined in documents, implemented by everyone who needs to.

That choice — open text documents instead of proprietary specs — was not inevitable. It was a cultural decision made by a small group of engineers in the 1970s and defended by them for fifty years. Most of the rest of this book is the story of how that defence held.

### Three Things Every Protocol Specifies

Read enough protocol specifications and the same three concerns repeat.

First, format. What does a message on the wire look like? TCP says: 16 bits source port, 16 bits destination port, 32 bits sequence number, 32 bits acknowledgement number, then 4 bits header length, then six flag bits in a fixed order, then a 16-bit window. HTTP says: a verb, a space, a URI, a space, a version string, then a CRLF, then headers, then a blank line, then the body. The format defines what is legal. Send a TCP segment with the bits in the wrong order and the receiver does not see "almost a TCP segment." It sees garbage.

Second, sequence. What order are messages exchanged in? TCP's three-way handshake is a sequence — SYN, then SYN-ACK, then ACK. A server that receives an ACK without a preceding SYN simply drops it. TLS has a similar choreography — ClientHello, then ServerHello, then Certificate, then KeyExchange, then Finished. The sequence defines what is meaningful at any point in the conversation. How that handshake actually works for TCP is the meat of the TCP episode; how it works for TLS is the TLS episode. Here we just notice that every protocol has one.

Third, failure handling. What happens when a message is lost, corrupted, duplicated, or arrives out of order? TCP retransmits after a timeout. HTTP returns a 5xx status. TLS aborts the connection on a bad MAC. The failure handling is what separates a working protocol from one that hangs the first time the network hiccups — and historically it is where most of the engineering work has gone. The 1986 congestion collapse, which gets its own chapter later in the book, is fundamentally a story about TCP's failure handling being wrong and what it took to fix it.

### Postel's Law

There is one sentence from this era that every working protocol engineer has had to think about. **Be conservative in what you send, be liberal in what you accept.** Jon Postel wrote that in the introduction to RFC 760 in 1980, and Bob Braden repeated it in RFC 1122 in 1989. It is called the Robustness Principle, and for the foundational decades of the internet it was the principle that let two slightly-different implementations interoperate at all. If your TCP stack is strict about every spec quirk, you will refuse to talk to half the world. If you are a little forgiving, the internet works.

Modern thinking has reversed Postel's Law for security-sensitive protocols. Being liberal in what you accept means accepting attack inputs, and a generation of vulnerabilities has come from parsers that tried too hard to make sense of bad data. But for the era we're talking about, it was the principle that held the network together.

### Where Protocols Come From

Protocols are not born in committees. They are usually written by one or two engineers solving a specific problem, deployed for a few years, then standardised once the design has survived production. The pattern repeats again and again across this book.

TCP was designed by Vint Cerf and Bob Kahn in 1974 to connect three networks that did not share a fabric. Ethernet was sketched by Bob Metcalfe and David Boggs at Xerox PARC in 1973 to connect Alto workstations to a laser printer over a coaxial cable. The Web was a memo by Tim Berners-Lee at CERN in 1989. SSH was Tatu Ylönen's response to a password-sniffing attack at Helsinki University in the mid-1990s. MCP was Anthropic's response to N-by-M tool integrations in November 2024 — the most recent entry on this list, and a reminder that the pattern is still alive.

Five protocols, five small teams, five different decades, the same shape every time. One specific problem. One implementation. Then, much later, a standard.

The IETF's job is not to invent these protocols. It is to document them, review them, and — often years later — anoint them as standards. The motto is **rough consensus and running code** — a phrase from David Clark at IETF 24 in Cambridge in July 1992. The "running code" half is doing most of the work. A protocol nobody has implemented is not a real protocol.

## The figures

### Vint Cerf

Co-author of TCP/IP. Stanford, then DARPA, now Google's Chief Internet Evangelist. With Bob Kahn he wrote the 1974 paper "A Protocol for Packet Network Intercommunication" in IEEE Transactions on Communications — the paper that coined the word "internet" and described a single Transmission Control Program that would later split into TCP and IP. He edited or co-edited many of the early TCP RFCs at Stanford with Yogen Dalal and Carl Sunshine, including RFC 675 in December 1974, the first detailed TCP specification. Turing Award 2004, Presidential Medal of Freedom 2005. There is a separate episode on him.

### Bob Kahn

Co-author of TCP/IP. Conceived open-architecture networking while managing the ARPANET project at DARPA, then in late 1972 started sketching how to interconnect packet-switched networks that did not look like ARPANET — radio nets, satellite nets, eventually Ethernets. Recruited Vint Cerf to collaborate. Designed the protocols at the gateways — what we now call routers — including best-effort delivery, end-to-end reliability at the hosts, and gateways that hide Layer 2 differences from the endpoints. Founded the Corporation for National Research Initiatives in 1986. Turing Award 2004, Presidential Medal of Freedom 2005.

### Jon Postel

RFC Editor, IANA steward, ISI. Edited the foundational TCP/IP RFCs — RFC 791 for IPv4 in September 1981, RFC 792 for ICMP, RFC 793 for TCP, and RFC 768 for UDP in August 1980, three pages and the most spartan and durable spec in networking. He served as the RFC Editor for nearly three decades. He argued, with David Reed, for splitting the original monolithic TCP into IP plus a separate transport layer in 1978 — the architectural decision that made UDP and decades later QUIC possible. He ran IANA single-handedly from his office at ISI for over a decade. Internet Hall of Fame 2012. Lived 1943 to 1998. There is a separate episode on him.

### Bob Metcalfe

Inventor of Ethernet. Built the first 2.94 Mbps Ethernet in 1973 at Xerox PARC with David Boggs to connect Alto workstations to laser printers. Co-authored the seminal paper "Ethernet: Distributed Packet Switching for Local Computer Networks" in *Communications of the ACM* in July 1976. Co-authored the DIX — Digital, Intel, Xerox — Ethernet specification in 1980, which IEEE 802.3 ratified in 1983. Founded 3Com in 1979 to commercialise it. Four decades later every wired network on the planet, from your home router to an 800-gigabit AI training cluster, runs Ethernet at the link layer. Turing Award 2022.

### David Boggs

Co-inventor of Ethernet. Built the original 2.94 Mbps coaxial-cable system at Xerox PARC with Bob Metcalfe in 1973, designed and built much of the original PARC Ethernet hardware, and co-authored the 1976 CACM paper that introduced Ethernet to the world. Later developed the PARC Universal Packet architecture and worked at DEC on early routing systems. Lived 1950 to 2022.

### Tim Berners-Lee

Inventor of the World Wide Web at CERN. Created HTTP, HTML, and URLs between 1989 and 1991 — the three pillars of the web. Built the first web browser and editor, called WorldWideWeb, and the first web server, called CERN httpd, on a NeXT cube. The first website went live by Christmas 1990. CERN released the technology royalty-free on the 30th of April 1993. Founded the World Wide Web Consortium, the W3C, in 1994 and continues to direct it from MIT. The 60-second narrated hook of internet history is "Vint Cerf made the network of networks; Tim Berners-Lee made the application that turned it into something every human uses." Turing Award 2016.

### David Clark

Chief Protocol Architect of the Internet from 1981 to 1989, when most of the architectural decisions that shape the internet today were made — the end-to-end principle, the four-layer model, the separation of mechanism from policy. He distilled the IETF's working culture into one sentence at IETF 24 in Cambridge in July 1992: "We reject: kings, presidents and voting. We believe in: rough consensus and running code." That single quote is the closest thing the IETF has to a national anthem. Still at MIT CSAIL.

### RFC 9293 — Transmission Control Protocol

Published in August 2022, edited by Wesley Eddy of MTI Systems. This is the current TCP standard. It obsoletes the original RFC 793 from 1981 along with six other patches accumulated over forty years — RFC 879, 2873, 6093, 6429, 6528, and 6691 — and rolls them into a single internet-standard document. The header format is in section 3.1, sequence numbers in 3.4, the three-way handshake in 3.5, sliding-window flow control in 3.8.

### RFC 760 — DoD Standard Internet Protocol

Published in 1980 by Jon Postel. Now historic, obsoleted by RFC 791 a year later. Two reasons it shows up in this chapter: it was the document that introduced the Robustness Principle in its introduction, and it is one of the cleanest examples of a protocol going from "running code at DARPA" to "standard everyone implements" in the era this chapter is about.

### RFC 1122 — Requirements for Internet Hosts, Communication Layers

Published in October 1989, edited by Bob Braden. Internet Standard. The companion document that told implementers what a TCP/IP host actually had to do — every MUST, SHOULD, and MAY for hosts on the early internet. Re-stated Postel's Robustness Principle, and for nearly two decades it was the document a vendor checked against when claiming TCP/IP support.

## Listening order

- **Before this chapter:** This is the first chapter of the book — there is nothing before it. Start here.
- **After this chapter:** *"The Layer Model"* — the next chapter takes the seven protocols we just listed cooperating to load a web page and stacks them, so that you can see why each one trusts the layer below it and exposes a clean interface to the layer above.

## Where to go deeper

- The Ethernet episode picks up the story of Metcalfe and Boggs at PARC, the move from shared coaxial cable through hubs to switches, and the climb from 10 megabits to 800 gigabits.
- The IP episode covers the 32-bit address space, the TTL field, NAT as a stopgap, and the long migration to IPv6's 128 bits.
- The TCP episode is the full mechanism story — three-way handshake, sequence numbers, retransmission, flow control, and the congestion-control evolution from Tahoe and Reno through CUBIC to Google's BBRv3.
- The TLS episode explains the three guarantees — confidentiality, integrity, authentication — and why TLS 1.3 in 2018 cut the handshake from two round trips to one.
- The DNS episode walks the hierarchy from your stub resolver up to the 13 root server clusters and back down through the TLD and authoritative servers, and covers DNSSEC, DoT, and DoH.
- The HTTP/1.1 episode is the request-response cycle, persistent connections, host headers, head-of-line blocking, and the six-parallel-connections workaround that motivated HTTP/2 and HTTP/3.
- The SSH episode covers the encrypted shell, public key authentication, and the port-forwarding tricks that turn SSH into the developer's Swiss Army knife.
- The MCP episode is the newest one on this list — Anthropic's November 2024 protocol that collapsed the N-by-M AI tool-integration matrix to N plus M, and crossed 97 million SDK downloads per month by early 2026.

## Visual cues for image generation

- A stack of seven cooperating protocols loading one web page — Ethernet at the bottom, then IP, TCP, TLS, DNS off to the side feeding addresses, HTTP at the top — each labelled with its single job.
- A sequence diagram of the TCP three-way handshake with wall-clock arrows — SYN, SYN-ACK, ACK — and the phrase "now both sides have agreed on sequence numbers" beneath.
- Three columns headed Format, Sequence, Failure handling — each with one TCP example: a 16-bit port field, the SYN/SYN-ACK/ACK ladder, and a retransmit-after-timeout arrow.
- A timeline of foundational protocol births — 1973 Ethernet at Xerox PARC, 1974 TCP at Stanford, 1989 the Web at CERN, the mid-1990s SSH at Helsinki, 2024 MCP at Anthropic.
- A wall of RFC covers — RFC 760, RFC 1122, RFC 9293 — captioned "no Microsoft Internet, no Apple Internet, no Google Internet — just documents anyone can read."
