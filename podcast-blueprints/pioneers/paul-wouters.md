---
id: paul-wouters
type: pioneer
name: Paul Wouters
years: "c. 1971–"
title: Libreswan maintainer; IETF Security Area Director
org: Aiven Senior Security Architect (previously Red Hat)
podcast_target_minutes: 6
protocols: [ipsec]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Paul Wouters
  credit: null
visual_cues:
  - "Portrait composition: a security engineer at a Linux workstation, terminal showing a Libreswan IKEv2 negotiation log, an IETF badge clipped to a lanyard"
  - "A Red Hat Enterprise Linux box on a server rack with the Libreswan daemon highlighted as the default IPsec stack"
  - "Cover of NIST Special Publication 800-77 Revision 1, 'Guide to IPsec VPNs', author line zoomed in"
  - "A genealogy diagram tracing FreeS/WAN to Openswan to Libreswan, with Wouters as the through-line maintainer"
---

# Paul Wouters

## In one sentence
Paul Wouters is the engineer who has carried the open-source IPsec lineage from FreeS/WAN through Openswan to Libreswan, shipped it as the default VPN stack in Red Hat Enterprise Linux, and then served two terms as the IETF Security Area Director that oversees the working groups setting the standards he implements.

## The hook (cold-open)
If you have used IPsec on Linux in the last decade, you have almost certainly depended on a binary Paul Wouters maintains, an RFC he co-authored, or a NIST guidance document he wrote. He is the through-line on three projects that are really one project — FreeS/WAN, Openswan, and now Libreswan — and the through-line at the IETF on the working group that keeps IPsec current. The mechanism story belongs to the IPsec episode. This one is about the person who has kept that mechanism running in production for twenty-plus years.

## The work

### Libreswan and the FreeS/WAN lineage
Wouters' central contribution is Libreswan, the descendant of FreeS/WAN and Openswan, and the default IPsec stack shipped in Red Hat Enterprise Linux. The cryptography, the key exchange, the Layer-3 envelope — all of that belongs to the IPsec episode. What matters here is that the open-source IPsec lineage on Linux did not die between projects; it was carried forward by a small group of maintainers, with Wouters as the most consistent name on the list. Libreswan is what enterprise Linux administrators reach for when they need a site-to-site VPN that ships, gets patched, and is supported by the distribution vendor.

### IETF Security Area Director
Wouters has served two terms as Security Area Director at the IETF — one of the most senior steering positions in the standards body, with oversight of the working groups that produce the security RFCs the rest of the industry implements. He is also deeply involved in the IPSECME working group, the home of the IPsec and IKEv2 standards he ships in code. Few people in the IPsec world sit on both sides of the line — implementer of the running code and director of the rough consensus — at the same time.

### NIST SP 800-77 Revision 1
Wouters is an author of NIST Special Publication 800-77 Revision 1, the United States government's Guide to IPsec VPNs. That document is the reference text federal agencies and their contractors are expected to follow when they deploy IPsec. Writing it pulled the implementer's perspective into the official deployment guidance, which is a rare path for an open-source maintainer to take.

### Day job — Red Hat to Aiven
Wouters' professional home for years was Red Hat, where Libreswan's status as the default RHEL IPsec stack was not a coincidence. He is now Senior Security Architect at Aiven, the managed open-source data platform company, while continuing the upstream Libreswan and IETF work.

## Where they appear in the book
The dump lists no book chapters that reference Wouters directly. The protocol he shaped — IPsec — has its own episode, and that is the place to follow the mechanism story, including IKEv2 key exchange and the modern AEAD ciphersuites that the IPSECME working group has standardised on his watch.

## See also (other pioneer episodes)
The closest cross-promotion is the Andreas Steffen episode — Steffen founded and leads strongSwan, the other dominant open-source IPsec stack on Linux, and the two projects together cover most of the production IPsec deployed today. For listeners interested in the IETF side of IPsec rather than the implementation side, queue any other pioneer episode in the IPSECME orbit; the working group has produced a generation of named contributors whose work shows up in the same RFCs Wouters has co-authored.

## Sources

**Homepage**
- [Paul Wouters — nohats.ca](https://nohats.ca/wordpress/)
