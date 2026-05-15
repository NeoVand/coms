---
id: lennart-poettering
type: pioneer
name: Lennart Poettering
years: "1980–"
title: Co-author of Avahi; author of PulseAudio and systemd
org: Microsoft, ex-Red Hat
podcast_target_minutes: 6
protocols: [mdns]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: Portrait of Lennart Poettering
  credit: null
visual_cues:
  - "Portrait composition: software engineer at a desk in Hamburg, terminal open to a systemd unit file, an Avahi service-discovery browser listing printers and Chromecasts on a second monitor"
  - "Three stacked package logos representing the trio he is best known for — PulseAudio, Avahi, systemd — each tagged with its release year"
  - "Wide shot of a home LAN: laptop, printer, AirPlay speaker, Matter light bulb, all radiating dotted lines toward a single multicast group, captioned 'Avahi: zero-configuration discovery'"
---

# Lennart Poettering

## In one sentence
Lennart Poettering is the German engineer who, between 2004 and 2010, wrote three of the pieces of plumbing that nearly every Linux machine in the world now boots with: the Avahi service-discovery daemon, the PulseAudio sound server, and the systemd init system.

## The hook (cold-open)
If you have ever plugged a laptop into a network and watched a printer, a Chromecast, or an AirPlay speaker just appear, on Linux the daemon answering those multicast queries is almost certainly Avahi — and Avahi was Lennart Poettering's first big project, started in 2004 with Trent Lloyd. Six years later he shipped systemd, the init system that now starts essentially every mainstream Linux distribution. He was born in Guatemala City in 1980, raised in Rio de Janeiro and Hamburg, spent fourteen years at Red Hat, and joined Microsoft in 2022. The biographical interesting thing about Poettering is not just the software — it is that one engineer authored or co-authored more than forty free-software projects, three of which became defaults for an entire operating system family.

## The work

### Avahi, 2004–2005
Poettering's contribution to the service-discovery world was Avahi, co-authored with Trent Lloyd starting in 2004. Avahi is the dominant Linux and BSD implementation of multicast DNS and DNS-based service discovery — the protocol we cover in the mDNS and DNS-SD episode. The mechanism is simple to state: DNS, shouted to a link-local multicast group, so every printer, Chromecast, AirPlay speaker, and Matter device on your LAN can find each other with zero configuration. Avahi is the daemon that makes that work on a Linux box. It is the reason "it just appeared on the network" is a sentence Linux users get to say.

### PulseAudio, 2004
Also in 2004, Poettering started PulseAudio, which became the dominant Linux sound server — the layer between applications that want to make noise and the kernel's audio drivers. It is the boring infrastructure that lets a video call, a music player, and a notification chime share the same speakers without fighting. For a decade and a half, if a Linux desktop was playing audio, PulseAudio was almost certainly in the path.

### systemd, 2010
The third project, and the one that made him a household name in the Linux community, is systemd, started in 2010. systemd replaced the old SysV-style init scripts with a single service manager that handles boot, daemons, logging, sockets, timers, and much more. Today it is the init system on Debian, Ubuntu, Fedora, Red Hat Enterprise Linux, SUSE, Arch, and most other mainstream distributions. The systemd debates were occasionally vitriolic — there is a long-running argument in the free-software world about whether one project should own that much of the boot path — and Poettering himself has spoken publicly about the difficulty of working in open source under sustained personal attack.

### Red Hat to Microsoft
Poettering was at Red Hat from at least 2008 until 2022, which is the period across which all three of these projects matured into defaults. In 2022 he moved to Microsoft, where he continues to work on systemd and related Linux plumbing.

## See also (other pioneer episodes)
Avahi is one half of the mDNS and DNS-SD story; the other half is the Apple side, where Stuart Cheshire designed the protocol and shipped the reference implementation as Bonjour. The Stuart Cheshire episode is the place to hear the protocol-design story that Avahi implements on Linux.

## Sources

**Wikipedia**
- [Lennart Poettering — Wikipedia](https://en.wikipedia.org/wiki/Lennart_Poettering)

**Homepage**
- [0pointer.net](https://0pointer.net/)
