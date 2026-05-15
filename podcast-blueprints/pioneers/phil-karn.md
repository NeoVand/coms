---
id: phil-karn
type: pioneer
name: Phil Karn
years: "1956–"
title: IPsec contributor; "code is speech" plaintiff
org: Qualcomm, ARDC
podcast_target_minutes: 8
protocols: [ipsec, tcp]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Phil Karn
  credit: null
visual_cues:
  - "Portrait composition: a wiry engineer at a workbench with a packet radio TNC, an early-90s laptop running KA9Q NOS, and a stack of IETF drafts"
  - "Split-frame courtroom graphic: on one side a hardback copy of Bruce Schneier's Applied Cryptography labelled 'protected speech', on the other a 3.5-inch floppy of the same source code labelled 'munition under ITAR'"
  - "A whiteboard with the Karn's Algorithm rule written out: ignore RTT samples taken from retransmitted segments; back off the timer on retransmit"
  - "An IPsec ESP packet diagram with RFC 1827 stamped in the corner and Karn's name in the acknowledgements line"
  - "A Qualcomm badge from the early 1990s next to an ARDC logo, marking the two halves of his career"
---

# Phil Karn

## In one sentence
Phil Karn is the engineer who wrote one of the first public-domain TCP/IP stacks, whose three-line fix to the TCP round-trip timer ships in every TCP implementation on Earth, and who took the U.S. State Department to court to establish that source code is protected speech.

## The hook (cold-open)
In 1994 the State Department told Phil Karn that the printed book of Bruce Schneier's *Applied Cryptography* was a First Amendment-protected publication he could export freely — but the floppy disk in the back of the same book, containing the same source code as ASCII text, was a regulated munition under ITAR. Karn sued. Five years of litigation later, the export controls on cryptography had been rewritten, and one of the founding precedents for "code is speech" in U.S. law sat in the case books under his name. Without that fight, IPsec could not have shipped commercially.

## The work

### KA9Q — a public-domain TCP/IP stack for amateur radio
Karn — call sign KA9Q — wrote KA9Q NOS, one of the first public-domain implementations of the TCP/IP protocol suite. It started as a way to run TCP/IP over amateur packet radio links and grew into a full networking stack that ran on early PCs and a generation of embedded gear. For many engineers in the late 1980s and early 1990s, KA9Q was the TCP/IP code they actually read — the one that taught them how the stack we cover in the TCP episode worked end to end, because the source was right there.

### Karn's Algorithm — fixing the TCP round-trip timer
While he was inside the TCP code, Karn found a subtle bug in how every implementation was estimating round-trip time. When a segment was retransmitted, the receiver's acknowledgement could be for the original transmission or the retransmission, and a stack with no way to tell would poison its RTT estimate either way. Karn's fix is now called Karn's Algorithm: do not sample RTT from retransmitted segments, and back off the retransmit timer exponentially on each retry. It is a few lines of code. It is in every TCP stack on Earth. The deeper mechanics belong to the TCP episode.

### IPsec — contributor to the original ESP spec
Karn is acknowledged in RFC 1827, the original Encapsulating Security Payload specification — the document that defined the cryptographic envelope IPsec uses to wrap a packet. The protocol mechanics, and the long IETF effort that turned the early-90s drafts into the standard that runs every site-to-site VPN and every 3GPP mobile-core backhaul today, belong to the IPsec episode. What matters for the biography is that he was in the room while it was being designed.

### Karn v. U.S. State Department
The lawsuit ran from 1994 to 1999. The factual setup was the absurdity above — same code, two media, two regulatory regimes. The legal stakes were enormous: if source code on a floppy was a munition, the entire open-source cryptography ecosystem was illegal to publish on the internet. Karn lost at the district level and pursued the appeal; while it was in the courts, the executive branch moved. In 1996 the export controls on cryptography were significantly liberalised, and by 1999 most software crypto could be exported without a licence. The case is one of the founding "code is speech" precedents in U.S. law, and it is the regulatory unlock that made commercial IPsec, SSL, SSH, and the whole modern crypto deployment possible.

### Qualcomm and ARDC
Karn spent two decades as an engineer at Qualcomm, from 1991 through retirement, working on the cellular and data systems that became the backbone of mobile networking. After Qualcomm he served as President of Amateur Radio Digital Communications, the foundation that funds open networking and amateur radio research from the proceeds of the AMPRNet IPv4 address space — the same /8 he had been part of stewarding since the early days. He is now President Emeritus.

## See also (other pioneer episodes)
Karn's IPsec work overlaps with several other pioneers worth queueing up next. Randall Atkinson edited the original IPsec architecture RFCs in the 1990s — the suite that Karn's RFC 1827 contribution sits inside. Charlie Kaufman carried IKEv2 through three RFCs and twenty years of deployment, giving IPsec the key-exchange protocol it uses today. Andreas Steffen built the strongSwan reference implementation. And on the TCP side, Van Jacobson's congestion-control work and Karn's RTT fix are the two pieces of late-80s TCP engineering that are still in every stack — the Jacobson episode is the natural companion to this one.

## Sources

**Wikipedia**
- [Phil Karn — Wikipedia](https://en.wikipedia.org/wiki/Phil_Karn)
