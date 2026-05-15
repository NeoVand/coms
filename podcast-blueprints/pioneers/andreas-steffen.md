---
id: andreas-steffen
type: pioneer
name: Andreas Steffen
years: "c. 1955–"
title: Founder and lead of strongSwan
org: OST Eastern Switzerland University of Applied Sciences (formerly HSR Rapperswil); strongSwan project lead
podcast_target_minutes: 6
protocols: [ipsec]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Andreas Steffen
  credit: null
visual_cues:
  - "Portrait composition: a Swiss university professor at a Linux workstation in Rapperswil, terminal open to an IKEv2 negotiation log, Lake Zurich visible through the window"
  - "A rack of cloud-hyperscaler VPN gateways with the strongSwan project logo overlaid, captioned 'shipped in every major public cloud's VPN image'"
  - "A hardened secunet SINA box on a desk in a German government office, lid open, the strongSwan userspace daemon running inside, dated June 2022 for the secunet acquisition"
  - "A timeline running from HSR Rapperswil academic project to global IPsec stack, with the IETF logo branching off for the Trusted Network Connect work"
---

# Andreas Steffen

## In one sentence
Andreas Steffen is the Swiss professor who founded and led strongSwan — the open-source IPsec and IKEv2 stack that ended up running inside every major cloud VPN gateway, every German high-security SINA box, and most Linux-based IoT gateways shipped this decade.

## The hook (cold-open)
Pick almost any site-to-site VPN tunnel in production today and there is a good chance the userspace doing the key exchange is strongSwan. It started as an academic project at a university of applied sciences in Rapperswil, Switzerland. Two decades later, in June 2022, the German security vendor secunet acquired it outright to anchor its government-grade SINA product line. The professor who started it, Andreas Steffen, is the reason a single open-source IPsec implementation became the default on Linux.

## The work

### strongSwan — the IPsec stack
Steffen's central contribution is strongSwan, the most-deployed open-source IPsec and IKEv2 stack on Linux. The mechanism — how IPsec authenticates peers, exchanges keys, and wraps packets in its Layer-3 cryptographic envelope — belongs to the IPsec episode. What matters here is the production: strongSwan ships in every cloud-hyperscaler VPN gateway image, in every secunet SINA high-security solution used by the German federal government, and in essentially every Yocto-derived IoT gateway that needs a hardened tunnel. Few open-source security projects of European origin have run as long, or shipped as widely, as this one.

### HSR Rapperswil and the academic origin
The project started at HSR Rapperswil — now OST, the Eastern Switzerland University of Applied Sciences — where Steffen was a professor. That origin matters: strongSwan is one of the longest-running successful open-source security projects to come out of a European academic institution, and it kept that academic discipline about specifications and interoperability long after it became infrastructure.

### IETF and Trusted Network Connect
Beyond the codebase, Steffen has been a long-running contributor to IETF security work, including Trusted Network Connect — the TNC framework — and the PT-EAP transport for it. That work pushed posture-assessment ideas, asking whether an endpoint is trustworthy before it gets onto the network, into the standards track alongside the IPsec stack itself.

### secunet acquisition, 2022
In June 2022, secunet acquired strongSwan. For an open-source project that had run on academic and community footing for years, the acquisition formalised what was already true in practice: strongSwan had become production infrastructure for the kind of customers — national governments, hyperscale clouds, embedded vendors — who need a vendor on the other end of a support contract.

## Where they appear in the book
The dump lists no book chapters that reference Steffen directly. The protocol he shaped — IPsec — has its own episode, and that is the place to follow the mechanism story.

## See also (other pioneer episodes)
The closest cross-promotion is the IPsec episode itself, which covers the protocol family that strongSwan implements end to end. For listeners interested in the broader open-source security infrastructure story, queue any other pioneer episode in the same orbit — the people who built the long-running implementations that quietly became the default everywhere.

## Sources

**Homepage**
- [strongSwan — project homepage](https://strongswan.org)
