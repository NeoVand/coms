---
id: ted-lemon
type: pioneer
name: Ted Lemon
years: "c. 1962–"
title: DHCP and DNS-SD elder; lead author of SRP (RFC 9665)
org: Apple, previously Fastly and Nominum
podcast_target_minutes: 6
protocols: [dhcp, mdns-dns-sd]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Ted Lemon, longtime IETF contributor and lead author of the Service Registration Protocol
  credit: null
visual_cues:
  - "Candid portrait of an American protocol engineer at an IETF working-group session, laptop open with a draft RFC, name badge reading 'Ted Lemon — Apple' in the foreground"
  - "Cover of The DHCP Handbook (Macmillan, 2002) on a desk beside a coffee-stained printout of RFC 9665 dated June 2025"
  - "A smart-home scene: a Matter-branded bulb, a Thread border router, and a home Wi-Fi access point, with thin labelled arrows showing a service-registration message flowing from the bulb out to a wide-area DNS zone"
  - "Diagram aesthetic: a link-local mDNS multicast cloud on the left, a wide-area DNS tree on the right, an SRP arrow bridging them, captioned 'home.arpa.'"
---

# Ted Lemon

## In one sentence
Ted Lemon is the IETF engineer who literally co-wrote the book on DHCP, then spent the next two decades on the unglamorous DNS plumbing that turns "plug it in" into "it just works" — and in June 2025 shipped the protocol that finally extends that magic from your living-room LAN to the wider internet.

## The hook (cold-open)
In 2002, Macmillan published The DHCP Handbook by Ralph Droms and Ted Lemon. For more than twenty years it was the canonical text on the protocol that hands out IP addresses to every laptop, phone, and thermostat that joins a network. Twenty-three years later, in June 2025, the IETF published RFC 9665 — the Service Registration Protocol, SRP — with Lemon as lead author and Stuart Cheshire as co-author. SRP is what makes Matter and Thread devices discoverable beyond the link-local cloud of mDNS. The same engineer who documented how a device gets onto a network in 2002 is now defining how it announces itself to the rest of the internet in 2025.

## The work

### The DHCP years
Lemon's name on networking starts with DHCP — the Dynamic Host Configuration Protocol that assigns IP addresses automatically when you plug a device into a network, the protocol we cover in the DHCP episode. With Ralph Droms, the original DHCP author, Lemon co-wrote The DHCP Handbook, published by Macmillan in 2002. It became the reference text on dynamic host configuration: how leases work, how the four-message handshake plays out, how options are negotiated. He carried the work forward into the IPv6 era as a co-author of RFC 8415, the 2018 modernisation of DHCPv6.

### Special-use names and the home network
In 2018 Lemon co-authored RFC 8375, which reserved the special-use domain name `home.arpa.` for residential home networks. It is a small RFC and an unglamorous one, but it is the official answer to a question that had no good answer for two decades: what name should a home router put on the local zone it serves to the devices behind it? `home.arpa.` is now the standardised reply.

### SRP — RFC 9665, June 2025
The headline contribution is RFC 9665, the Service Registration Protocol, published in June 2025 with Lemon as lead author and Stuart Cheshire — there's a separate episode on him — as co-author. SRP extends DNS-SD, the service-discovery layer covered in the mDNS / DNS-SD episode, from the link-local multicast world out to wide-area DNS. The concrete deployment context is the smart home: Thread border routers and Matter ecosystems need a way for a battery-powered light bulb or door sensor to register its services with a name server that lives off the local link. SRP is that registration protocol. As Matter and Thread roll out across consumer hardware, SRP is the glue that lets a device on a low-power mesh advertise itself to the wider network.

### Current work
Lemon is still actively shipping at the IETF. He is the editor of `draft-tlmk-infra-dnssd`, dated July 2025, and `draft-ietf-dnssd-advertising-proxy`, the current March 2024 revision — both extensions of the same DNS-SD-over-wide-area story that SRP started. The biographical arc here is a quietly consistent one: pick the protocol families that determine whether a network is usable for ordinary humans, and stay on them for thirty years.

## Where they appear in the book
The dump records no book chapters that reference Ted Lemon directly. His protocols — DHCP and mDNS / DNS-SD — each have their own chapters, and the protocol episodes are where his work shows up in mechanism form.

## See also (other pioneer episodes)
The natural companion is Stuart Cheshire — Cheshire is the co-author on RFC 9665 and the original architect of DNS-SD itself, so the SRP story is jointly theirs. Lemon's DHCP work sits next to Ralph Droms's, the protocol's original author and Lemon's co-author on The DHCP Handbook. If you want the protocols rather than the person, the DHCP episode and the mDNS / DNS-SD episode are the next two to play.

## Visual cues for image generation
- Candid portrait of a protocol engineer at an IETF working-group session, laptop open with a draft RFC on screen, name badge reading "Ted Lemon — Apple."
- The 2002 Macmillan cover of The DHCP Handbook on a desk, alongside a printed copy of RFC 9665 dated June 2025.
- Smart-home composition: a Matter bulb, a Thread border router, a home Wi-Fi access point, with a thin labelled arrow showing an SRP registration message leaving the bulb and reaching a wide-area DNS zone.
- Diagram aesthetic: a link-local mDNS multicast cloud on the left, a wide-area DNS tree on the right, an SRP arrow bridging the two, with the label `home.arpa.` underneath.

## Sources

**Homepage**
- [Ted Lemon — IETF datatracker](https://datatracker.ietf.org/person/mellon@fugue.com)
