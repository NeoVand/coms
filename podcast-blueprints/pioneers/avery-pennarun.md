---
id: avery-pennarun
type: pioneer
name: Avery Pennarun
years: "c. 1975–"
title: Co-founder & CEO of Tailscale
org: Tailscale, ex-Google
podcast_target_minutes: 6
protocols: [wireguard, stun]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Avery Pennarun
  credit: null
visual_cues:
  - "Portrait composition: software engineer at a standing desk in a Toronto loft, laptop open to a tailnet ACL JSON file, WireGuard handshake diagram on a second monitor"
  - "Whiteboard sketch of two laptops behind home routers, dotted hole-punched line between them through STUN, a fallback DERP relay drawn off to the side"
  - "Side-by-side: a thick legacy corporate VPN appliance in a rack on the left, a small mesh-of-dots tailnet diagram on the right, captioned with the BeyondCorp + WireGuard thesis"
---

# Avery Pennarun

## In one sentence
Avery Pennarun is the engineer who took a four-thousand-line Linux VPN module called WireGuard, wrapped it in a control plane and a NAT-traversal mesh, and made it the way most engineering teams in 2026 actually deploy a private network.

## The hook (cold-open)
WireGuard, the kernel module Jason Donenfeld shipped in 2016, is famously small and famously fast — and famously hard to operate at company scale, because by design it has no key distribution, no identity, and no NAT-traversal story. In 2019, Avery Pennarun and three co-founders started a Toronto company called Tailscale to ship exactly that missing layer. Six years later Tailscale crossed ten thousand paying customers, raised a Series C, and became the default answer to "how do we connect our laptops, servers and clouds privately." The biographical interesting thing is that the company's whole pitch — mesh networking plus zero-trust auth obsoletes the corporate VPN — is the thesis Google had quietly shipped internally as BeyondCorp while Pennarun was a staff engineer there.

## The work

### Tailscale, 2019
Pennarun co-founded Tailscale in 2019 with David Crawshaw and David Carney; Brad Fitzpatrick joined in January 2020. The product wraps WireGuard — the protocol we cover in the WireGuard episode — with the layers WireGuard intentionally leaves out. There is a control plane that handles key exchange and identity. There is a NAT-traversal coordinator that does STUN-style hole-punching so two laptops behind home routers can find each other directly; we cover that mechanism in the STUN, TURN and ICE episode. There is a proprietary relay called DERP that plays the TURN role when direct paths fail. And there is a policy layer — the "tailnet" with ACLs — that gives the whole mesh an authorisation story. The single biggest reason engineering teams encounter WireGuard in 2026 is via Tailscale, not via raw `wg-quick`.

### The BeyondCorp + WireGuard thesis
Pennarun is the public spokesperson for a specific architectural argument: that the combination of a modern mesh VPN and zero-trust authentication makes the traditional perimeter corporate VPN obsolete. It is a thesis with two halves. The mesh half is WireGuard, deployed peer-to-peer instead of hub-and-spoke. The zero-trust half is BeyondCorp — Google's internal model where every request is authenticated and authorised on its own, with no implicit trust granted by being "on the network." Pennarun was a staff engineer at Google before founding Tailscale, and the company is in many ways the productisation of that internal Google idea for everyone else.

### The business
Tailscale crossed ten thousand paying customers and closed its Series C in 2025. Pennarun has been CEO since founding. He is based in Toronto and writes at apenwarr.ca, which is one of the more widely-read engineering blogs in the systems community.

## See also (other pioneer episodes)
The protocol Tailscale wraps is WireGuard — the WireGuard episode covers Jason Donenfeld's design choices and the reason the codebase is so small.

The NAT-traversal machinery Tailscale rebuilt — STUN, TURN, ICE — has its own episode; that's the place to hear the mechanism story Pennarun's team had to re-implement to get two laptops behind home routers to talk directly.

## Sources

**Wikipedia**
- [Tailscale — Wikipedia](https://en.wikipedia.org/wiki/Tailscale)

**Homepage**
- [apenwarr.ca](https://apenwarr.ca/)
