---
id: osi-vs-tcp-ip
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The OSI vs TCP/IP War
synopsis: "Rough consensus and running code" — why the IETF won.
podcast_target_minutes: 12
position_in_book: 13 of 75
listening_order:
  prev: story-of-the-internet/the-1986-collapse
  next: story-of-the-internet/the-web-arrives
related_protocols: [tcp, ipv6, smtp]
related_pioneers: [david-clark]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: https://groups.csail.mit.edu/ana/People/DDC/future_ietf_92.pdf
    caption: David Clark's "A Cloudy Crystal Ball" slides from IETF 24, Cambridge, July 1992 — the talk that produced the IETF's defining sentence.
    credit: MIT CSAIL / David D. Clark
visual_cues:
  - "A split-screen poster. Left: a tall stack of bound ISO standards documents, gold-embossed, sitting on a committee-room table. Right: a humming Sun workstation with a terminal window, source code scrolling, a small printout of an RFC taped to the monitor. Caption: 'specifications vs running code, 1992.'"
  - "A side-by-side stack diagram. OSI seven layers (Application, Presentation, Session, Transport, Network, Data Link, Physical) with TP4 and CLNP labelled. TCP/IP four layers (Application, Transport, Internet, Link) with TCP and IP labelled. Arrows showing which OSI ideas survived: CLNP-style addressing into IPv6, X.500 into LDAP, X.400 displaced by SMTP."
  - "A pull-quote card with the David Clark sentence in big type: 'We reject: kings, presidents and voting. We believe in: rough consensus and running code.' Footer: David Clark, IETF 24, July 1992, Cambridge MA."
  - "A wall map of the late 1980s standards landscape: the US federal GOSIP procurement mandate stamped over Washington DC, European PTT logos clustered over Western Europe, ISO and ITU-T headquarters in Geneva — and a single arrow labelled 'BSD source tape, free' radiating out of Berkeley CA across the planet."
  - "A timeline running 1985 to 1995. Top track: OSI milestones — TP4, CLNP, X.400, X.500, GOSIP. Bottom track: IETF milestones — RFC 1122, congestion control deployed, IETF 24 (Clark talk highlighted), commercial NSFNET. The two tracks converge at 1995 with OSI fading and TCP/IP solid."
---

# Part II, Chapter — The OSI vs TCP/IP War

## The hook

In the late eighties, almost everyone official believed TCP/IP was a research project on borrowed time. The future, they said, was the OSI suite — seven layers, ratified by ISO, mandated by the US government, taught from textbooks in every European university. Then, in July 1992, an MIT engineer named David Clark stood up at an IETF meeting in Cambridge, Massachusetts, and said one sentence that decided the question. We reject kings, presidents and voting. We believe in rough consensus and running code. Three years later, OSI was effectively dead in production networks, and the sentence had become the closest thing the internet has to a national anthem.

## The story

### A Standards War Decided by Implementation

Through the late 1980s and early 1990s, the official consensus was unambiguous. TCP/IP was the academic prototype. The OSI suite was the real future. ISO and the ITU-T were promoting a seven-layer stack with a proper transport called TP4, a proper internetworking protocol called CLNP, a proper electronic mail protocol called X.400, and a proper directory protocol called X.500. The US government had a procurement mandate called GOSIP — the Government OSI Profile — that required OSI for federal systems. The European post and telecom monopolies threw their weight behind it. Universities taught the seven-layer model from textbooks, not because anyone ran it, but because everyone was sure they soon would.

The trouble was, OSI shipped specifications. The IETF shipped code.

How TCP itself worked under load — slow start, AIMD, fast retransmit, the six algorithms Berkeley wrote in response to the 1986 collapse — is the previous chapter and the TCP episode. What matters here is what those algorithms did to the standards war. Berkeley shipped a fix on tape. Every Unix on Earth got it for free. By the time the OSI committees were debating the next draft of TP4, TCP was a working protocol that had survived a near-death event in production. That is not an argument committees know how to answer.

In July 1992, David Clark gave a talk at the 24th IETF meeting in Cambridge titled *A Cloudy Crystal Ball — Visions of the Future.* Halfway through, he distilled the working culture of the IETF into a single sentence — the one that travels. We reject kings, presidents and voting. We believe in rough consensus and running code.

Read it again, slowly, because it is precise. *Rough* consensus, not unanimous. Small minorities cannot block a working spec. *Running* code, not just paper. Your idea must be implementable and demonstrable before it gets standardised. Together they describe a process that ships things, accepts that some of them are wrong, and iterates on the next draft. OSI's process did the opposite. Write the perfect specification. Ratify it through national-body votes. Deploy it once, fully formed.

By 1995, OSI was effectively dead in production networks. CLNP survived in the IS-IS routing protocol and as a trace heritage in the addressing model of IPv6 — the IPv6 episode picks up that thread. X.500 became LDAP. X.400 lost to SMTP, and every mail server you have ever talked to runs the protocol covered in the SMTP episode. The lesson generalised across the industry. The IETF's running-code test became the default expectation everywhere standards were made — at the W3C when it was founded in 1994 to standardise the web, and later at the WHATWG when it took over HTML from the W3C using exactly the same philosophy. Implementations first. Specs follow.

## The figures

### David D. Clark — who he is

Born 1944. Chief Protocol Architect of the Internet from 1981 to 1989, the eight years in which most of the architectural decisions that shape the internet today were made — the end-to-end principle, the four-layer model, the separation of mechanism from policy. He still works at MIT CSAIL. He won the IEEE Internet Award in 1990. The single sentence he delivered at IETF 24 in July 1992 — we reject kings, presidents and voting; we believe in rough consensus and running code — is the closest thing the IETF has to a national anthem, and it is the sentence this chapter is built around. The original slides are still online at MIT, and there is more on his career in the David Clark pioneer entry.

## Listening order

- **Before this chapter:** *The 1986 Congestion Collapse* — Van Jacobson and Mike Karels at Berkeley, six algorithms in one paper, a thousand-fold throughput recovery shipped on a BSD tape. That is the *running code* the next chapter is about. Without Berkeley's fix on tape, Clark's sentence in 1992 would not have landed the same way.
- **After this chapter:** *The Web Is Built On Top* — once TCP/IP won the transport war, the next layer up was wide open. Tim Berners-Lee at CERN took the open transport stack and built HTTP, HTML, and the first browser on top. The web exists because the war below it had already been decided.

## Where to go deeper

- **The TCP episode** is the protocol whose running-code success in the late 1980s made Clark's sentence land — the header layout, the state machine, the congestion-control toolkit, all the mechanism deferred from this chapter.
- **The IPv6 episode** is where the OSI ideas that did survive show up — the CLNP-style addressing influence, the 128-bit address space, the cleaner header. OSI lost the war but left fingerprints on the winner's successor.
- **The SMTP episode** is the protocol that ate X.400 alive — text-based, debuggable by hand, store-and-forward across every mail server on Earth. The IETF's running-code lesson, applied to email.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
