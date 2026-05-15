---
id: greg-hudson
type: pioneer
name: Greg Hudson
years: "c. 1976–"
title: MIT Kerberos lead maintainer
org: MIT Kerberos Consortium
podcast_target_minutes: 6
protocols: [krb5]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Greg Hudson
  credit: null
visual_cues:
  - "Portrait composition: a long-tenure MIT engineer at a terminal in the Stata Center, screen open to a krb5 release-notes diff for 1.22, the three-headed-dog Kerberos mascot pinned to the cubicle wall"
  - "A git log of MIT krb5 commits stretching from the late 1990s to 2025, with the 1.18 through 1.22 release tags highlighted along a vertical timeline"
  - "Layered diagram of the systems sitting on top of MIT krb5 — every Linux distribution, FreeIPA, Hadoop, NFSv4, the macOS Kerberos stack — captioned 'one C codebase, this much production'"
  - "A maintainer's screen showing the CVE-2024-37370 and CVE-2024-37371 advisory side-by-side with the 1.21.3 patch commit"
---

# Greg Hudson

## In one sentence
Greg Hudson is the MIT engineer whose patch commits to the `krb5` C codebase are, in 2026, the ground truth for how Kerberos actually behaves on every Linux distribution, every FreeIPA install, every Hadoop cluster, and every NFSv4-with-security mount on the planet.

## The hook (cold-open)
Kerberos is one of those protocols whose specification you can read in a weekend and whose real behaviour lives in a single C codebase at MIT. That codebase is `krb5`. Hudson has been at MIT working on it since the late 1990s and took over the lead-maintainer role from Sam Hartman in the mid-2010s. Every release in the 1.18 through 1.22 era — the entire 2020 to 2025 stretch — shipped under his stewardship. When a Linux distribution ships a Kerberos client, when a Windows domain talks to a Linux KDC, when a Hadoop job authenticates to HDFS, the bytes on the wire are the bytes Hudson's patches produce.

## The work

### Lead maintainer of MIT krb5
Hudson is the long-running lead maintainer of MIT's `krb5` — the canonical C implementation of Kerberos and the upstream that almost every non-Microsoft Kerberos deployment derives from. The protocol itself — tickets, not tokens; the trusted third party; mutual authentication without ever sending the password — belongs to the Kerberos episode. What matters here is the production: `krb5` is the codebase used by every Linux distribution, by FreeIPA, by Hadoop, by NFSv4, and by the parts of the macOS Kerberos stack that are not Heimdal-derived. He took the lead-maintainer role over from Sam Hartman in the mid-2010s, after already having been at MIT on the project since the late 1990s.

### The 1.18 through 1.22 release era, 2020–2025
The releases Hudson has shepherded from 2020 to 2025 are the ones currently sitting under production Kerberos deployments worldwide. The 1.22 release in August 2025 added PKINIT support for elliptic-curve Diffie-Hellman, bringing the public-key bootstrap path forward to modern curves. Earlier in the cycle came Unix-domain socket transport for local KDC traffic, IAKerb realm discovery for clients that do not know which realm to talk to, and the paChecksum2 pre-authentication data type. The 1.21.3 release was the response to CVE-2024-37370 and CVE-2024-37371 — two GSS-API message-token vulnerabilities that had to be patched across the whole installed base. None of those line items are individually famous, and that is the point: this is the work of a maintainer whose job is to keep a thirty-year-old protocol shippable for another decade.

## Where they appear in the book
The dump lists no book chapters that reference Hudson directly. The protocol he maintains — Kerberos — has its own episode, and that is the place to follow the ticket-granting mechanism, the trusted third party, and the rest of the story.

## See also (other pioneer episodes)
The natural cross-promotion is the Kerberos episode itself, which covers the protocol Hudson's codebase implements end to end. For listeners interested in the broader pattern of long-tenure maintainers who keep foundational internet infrastructure shippable decade after decade, queue any other pioneer episode in the same orbit — the people whose names rarely appear in the trade press but whose commits define the actual behaviour of the network.

## Sources

**Homepage**
- [MIT Kerberos — project homepage](https://web.mit.edu/kerberos/)
