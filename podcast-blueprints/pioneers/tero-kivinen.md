---
id: tero-kivinen
type: pioneer
name: Tero Kivinen
years: "c. 1970–"
title: IKEv2 long-running editor
org: SSH Communications Security, AuthenTec, INSIDE Secure (Helsinki)
podcast_target_minutes: 6
protocols: [ipsec]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Tero Kivinen
  credit: null
visual_cues:
  - "Portrait composition: a Finnish security engineer at a desk in Helsinki, surrounded by stacks of IETF drafts spanning two decades, an open laptop showing an IKEv2 RFC under edit"
  - "A bookshelf of IPsec RFCs side by side — RFC 7296, RFC 7427, RFC 7670, RFC 6467, RFC 7815 — with the same editor name visible on every spine"
  - "The SSH Communications Security logo over a Helsinki skyline, a thin line connecting it to the IETF logo to suggest a twenty-year working-group thread"
  - "A site-to-site VPN diagram across the public internet — two enterprise routers with an IKEv2 / IPsec tunnel between them, annotated 'edited by Kivinen'"
---

# Tero Kivinen

## In one sentence
Tero Kivinen is the Helsinki engineer who has written down, in normative IETF prose, what an IPsec implementation actually does — more times than anyone else alive.

## The hook (cold-open)
Pick any modern IPsec deployment. A site-to-site VPN between two enterprise sites. A 3GPP mobile-core backhaul tunnel. The built-in IKEv2 client on macOS, iOS, Windows, or Android. The wire protocol underneath all of them is specified in a small set of RFCs, and one name shows up on the editor line again and again across roughly twenty years. Tero Kivinen was sitting at SSH Communications Security in Helsinki when the original IKEv1 was being designed, and he never left the working group.

## The work

### Co-author of RFC 7296 — IKEv2
Kivinen is a co-author of RFC 7296, the 2014 specification of the Internet Key Exchange protocol version two — the handshake that negotiates the cryptographic keys IPsec uses to protect traffic. RFC 7296 is the Internet Standard that every current IPsec stack tracks. The mechanics of the handshake belong to the IPsec episode; what matters here is that Kivinen's name is on the document that defines it.

### The supporting IKEv2 RFCs
Around RFC 7296, Kivinen authored or co-authored a set of RFCs that fill in what real deployments need. RFC 7427 specifies signature authentication for IKEv2, broadening the set of credentials a peer can present. RFC 7670 adds raw public keys, so a deployment can authenticate without a full PKI. RFC 6467 defines a secure-password framework for IKEv2. RFC 7815 specifies a minimal IKEv2 initiator — the cut-down profile that a constrained device can implement without dragging in the full protocol surface. Together they are the unglamorous but load-bearing edges of a working VPN ecosystem.

### Twenty years inside one working group
Kivinen's career in IPsec started at SSH Communications Security in Helsinki during the original IKEv1 design, and continued through AuthenTec and then INSIDE Secure as the company changed hands. Across all of that he stayed with IPsec through every architectural revision. The biographical fact worth holding onto is the duration: a single engineer, in one working group, carrying the same protocol family forward for two decades.

## See also (other pioneer episodes)
Kivinen's IPsec story overlaps with several other pioneers worth queuing after this one. Charlie Kaufman is the lead editor of the IKEv2 RFCs across the same span — the Kaufman episode is the natural companion to this one. Andreas Steffen built strongSwan, the reference IPsec implementation that runs on Linux and Android and validates the specs that Kivinen and Kaufman wrote. Paul Wouters maintains libreswan and serves as an IETF security area director. The IPsec protocol episode itself is where the handshake mechanics get told properly.

## Sources

**Homepage**
- [Tero Kivinen — IETF datatracker](https://datatracker.ietf.org/person/kivinen@iki.fi)
