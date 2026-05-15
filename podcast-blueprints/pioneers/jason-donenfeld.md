---
id: jason-donenfeld
type: pioneer
name: Jason A. Donenfeld
years: "c. 1989–"
title: Creator of WireGuard
org: Edge Security (zx2c4.com); Linux kernel developer; Linux RNG maintainer since 2022
podcast_target_minutes: 8
protocols: [wireguard]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Jason A. Donenfeld
  credit: null
visual_cues:
  - "Portrait composition: a young kernel developer at a dark Linux workstation, terminal split between a four-thousand-line wireguard.c and a strace of an IPsec daemon, the zx2c4.com banner pinned in a browser tab"
  - "Side-by-side line-count comparison: a tiny stack of paper labelled 'WireGuard, ~4,000 lines' beside a knee-high stack labelled 'OpenVPN core, 100,000+ lines' and a head-high stack labelled 'strongSwan + Linux XFRM'"
  - "An LKML email rendered in monospace, dated August 2018, with Linus Torvalds's line 'a work of art' highlighted, and a Linux 5.6 release tag dated 29 March 2020 pinned beside it"
  - "A funder collage: logos for Open Technology Fund, NLnet, Mullvad, Tailscale, Jump Trading, Fly.io and Germany's Sovereign Tech Fund arranged around a WireGuard handshake diagram"
  - "A close-up of Linux kernel source tree with random.c open in an editor, captioned 'maintainer since 2022'"
---

# Jason A. Donenfeld

## In one sentence
Jason Donenfeld is the developer who, frustrated with IPsec and OpenVPN, wrote a four-thousand-line in-kernel VPN called WireGuard as a side project, got Linus Torvalds to call it "a work of art" on the kernel mailing list, and then took over maintenance of the Linux kernel's random number generator.

## The hook (cold-open)
In 2015 a young engineer started writing a VPN to scratch a personal itch — IPsec was architecturally sprawling, OpenVPN was slow, and both were painful to audit. The first public snapshot of WireGuard appeared on 30 June 2016. The whole Linux kernel module was about four thousand lines of code — against more than a hundred thousand for OpenVPN's core, and a six-figure footprint for strongSwan plus the Linux XFRM stack underneath it. In August 2018, Linus Torvalds wrote on the kernel mailing list that the code was "a work of art." On 29 March 2020 it was mainlined in Linux 5.6. The mechanism story belongs to the WireGuard episode. This one is about the engineer.

## The work

### WireGuard, 2015–2020
Donenfeld started WireGuard in 2015 out of frustration with the architectural sprawl of IPsec and OpenVPN. The first public code snapshot landed on 30 June 2016 under the zx2c4 banner — his long-running personal handle and the domain his work has shipped under for years. The whitepaper was presented at NDSS 2017, and the design choices it argued for — a single opinionated modern crypto suite, no algorithm negotiation, no certificates, peers identified by static public keys, the whole kernel module under four thousand lines — are what the WireGuard episode unpacks in detail. What matters here is the trajectory: in August 2018 Linus Torvalds called the code "a work of art" on LKML, and on 29 March 2020 WireGuard was mainlined into Linux 5.6. The same protocol now ships inside macOS, iOS, Windows, Android, every major BSD, every consumer VPN service of consequence, and — wrapped in a control plane — inside Tailscale, which has its own pioneer episode on Avery Pennarun.

### The platform ports
WireGuard the kernel module was only ever going to be one front. Donenfeld also wrote **wireguard-go** — the cross-platform userspace reference implementation that runs everywhere the kernel module doesn't. He wrote **Wintun**, the Windows TUN driver that the Windows port needed and that several other tunnel projects ended up adopting. And he wrote **wireguard-nt**, a native Windows kernel module to bring Windows performance closer to the Linux in-kernel path. Three separate ports, one engineer, all under the zx2c4 umbrella.

### Linux RNG maintainer, 2022
In 2022 Donenfeld took over maintenance of `random.c`, the Linux kernel's random number generator. That is a different kind of responsibility from shipping a new protocol: it is the entropy source that every cryptographic operation on a Linux machine depends on, and it had been quietly under-maintained for years. The same engineer who argued WireGuard should use one fixed modern crypto suite is now the person responsible for the kernel's primary source of cryptographic randomness.

### Funding the work
The WireGuard work has been funded over the years by an unusually broad coalition: the Open Technology Fund, NLnet, Mullvad, Tailscale, Jump Trading, Fly.io, and Germany's Sovereign Tech Fund — the last of which contributed more than two hundred and nine thousand euros in 2023 alone. That funding mix — Western privacy foundations, consumer VPN providers, a quant trading firm, a cloud platform, and a national government's open-source program — is itself a signal of how deep into infrastructure WireGuard has gone.

### Refusing the IETF
One thing Donenfeld is famous for not doing is taking WireGuard through the IETF. In his own words: *"I have a very low opinion of internet standards… WireGuard is one of the first times in my career I've seen something get this much adoption without having to get through the filter of the IETF."* WireGuard reached every major operating system and the Linux mainline without ever being an RFC. That is a deliberate counter-example to the standards-first model that produced IPsec, and it is part of why the episode on WireGuard is also, implicitly, an episode about how protocols get adopted in 2026.

## Quotes
On the size of the codebase, from the WireGuard whitepaper at NDSS 2017: *"WireGuard can be simply implemented for Linux in less than 4,000 lines of code, making it easily audited and verified."* The line is the thesis statement of the whole project — small enough to read in an afternoon, small enough to audit, small enough to fit in a kernel module without apology.

On standards bodies, in interviews around the time WireGuard was being mainlined: *"I have a very low opinion of internet standards… WireGuard is one of the first times in my career I've seen something get this much adoption without having to get through the filter of the IETF."* It is the quote that gets reached for whenever someone debates whether a new internet protocol still needs an RFC to win.

## See also (other pioneer episodes)
The clearest cross-promotion is Avery Pennarun, the Tailscale co-founder — the pioneer episode on Pennarun covers how Tailscale wrapped Donenfeld's four-thousand-line module in the control plane, identity, and NAT-traversal layers WireGuard intentionally leaves out, and how that combination became the way most engineering teams encounter WireGuard at all.

For the opposite design philosophy in the same problem space, queue the Andreas Steffen episode — Steffen led strongSwan, the most-deployed open-source IPsec stack on Linux, and he is the engineer Donenfeld was implicitly arguing against when he set the four-thousand-line target. The Charlie Kaufman episode covers IKEv2 from the standards side and is the third corner of the same triangle.

## Sources

**Papers**
- [WireGuard: Next Generation Kernel Network Tunnel — NDSS 2017](https://www.wireguard.com/papers/wireguard.pdf)

**Wikipedia**
- [Jason A. Donenfeld — Wikipedia](https://en.wikipedia.org/wiki/Jason_A._Donenfeld)

**Homepage**
- [zx2c4.com](https://www.zx2c4.com/)
