---
id: ntp
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: NTP
synopsis: Why your timestamp is correct to within milliseconds — and the era rollover on 7 February 2036.
podcast_target_minutes: 15
position_in_book: 58 of 75
listening_order:
  prev: utilities-security/ssh
  next: utilities-security/oauth-and-jwt
related_protocols: [ntp, ip]
related_pioneers: [david-mills, vint-cerf]
related_outages: []
related_frontier: []
related_rfcs: [958, 5905]
images: []
visual_cues:
  - "A portrait of David Mills at a workstation with an oversized display and screen-reader headphones, dated 2022, with a wall calendar reading 17 January 2024 in the background."
  - "The NTP family tree as a vertical timeline: RFC 778 (1981), RFC 958 (1985), RFC 1305 (1992) with Marzullo, RFC 5905 (June 2010), draft NTPv5 (March 2026)."
  - "A single NTP exchange diagrammed as four timestamps T1, T2, T3, T4 with the equations for offset theta and round-trip delta written underneath."
  - "A countdown clock pinned to 7 February 2036 06:28:16 UTC, captioned 'NTP era rollover — 136.19 years per era, prime epoch 1900-01-01'."
  - "A bar chart of the 10 February 2014 attack: a 234-byte monlist request on the left, a 48 KB reply on the right, and a 400 Gbps total at the top, captioned 'amplification ~206x'."
---

# Part IX, Chapter — NTP

## The hook

David L. Mills, the Father Time of the Internet, was visually impaired from birth and completely blind by 2022. He kept working on the Network Time Protocol from his home in Newark, Delaware, using oversized displays and screen readers, until he died on 17 January 2024 at the age of eighty-five. Vint Cerf wrote the obituary on the Internet History mailing list. Poul-Henning Kamp called Mills the grandfather of the internet. The protocol he designed at the University of Delaware in 1981 still keeps every device on Earth within milliseconds of the same clock — and it now has to survive a calendar event scheduled for 7 February 2036 at 06:28:16 UTC.

## The story

### David Mills, Father Time of the Internet

Mills designed NTP at the University of Delaware on DARPA funding. The first formal specification, RFC 958, shipped in September 1985. Before that, RFC 778 in 1981 had already documented the DCNET Internet Clock Service that NTP grew out of. RFC 1305 in 1992 introduced NTPv3 with Marzullo's algorithm — Keith Marzullo's 1984 consensus computation that takes time samples from multiple servers, throws out the outliers, and returns the surviving median as the new local time. That algorithm has not changed in forty years. The current canonical specification is RFC 5905, published in June 2010, defining NTPv4.

Mills was visually impaired from birth — childhood glaucoma surgery preserved partial vision in one eye. From 2012 his sight deteriorated, and by 2022 he was completely blind. He kept shipping NTP work. The pioneer episode for him sits next to this chapter; the obituary that opened the hook is from Cerf, whose own episode in the TCP/IP part covers the rest of his career.

The mechanism, in one paragraph, before we hand it off. A client samples the round-trip time to a server — call it delta — and the apparent offset between the two clocks — call it theta. It then assumes the server's true time was theta plus or minus delta over two. It does this against several servers, clusters out the obvious outliers, and accepts the surviving median. That is the kernel of the whole protocol. The full picture — the four timestamps in the packet, the discipline loop that steers the local oscillator, the stratum hierarchy from atomic clock down to your laptop — is the NTP episode's job.

### Era Rollover: 7 February 2036 at 06:28:16 UTC

NTP's 64-bit timestamp format counts seconds and fractions from a prime epoch of 1900-01-01 00:00:00 UTC. That epoch is older than ARPANET, older than UNIX, older than every other timestamp standard in computing. The seconds field is 32 bits wide, so an era spans two to the thirty-second seconds — about 136.19 years. The first era ends, and the second era begins, on 7 February 2036 at 06:28:16 UTC. That is the rollover.

The protocol itself handles eras correctly because the full 64-bit math is unambiguous, but many client implementations short-circuit to 32-bit arithmetic and will need fixes before 2036. The Y2036 work has been quietly underway since 2020. This is one of the engineering deadlines the industry has actually been preparing for instead of denying.

### The 2012 Leap-Second Bug, And the End of Leap Seconds

On the boundary between 30 June and 1 July 2012, the Linux kernel's leap-second handler updated the internal time variable without calling the routine that notifies the high-resolution timer subsystem. Tasks waiting on futexes with absolute deadlines pegged their CPUs at one hundred percent. Reddit, LinkedIn, Mozilla, Yelp, Foursquare, and the Amadeus airline reservation system all went down — flight delays at Qantas and others were directly attributable. The on-call workaround was almost a joke: running `date -s "$(date)"` to set the clock to itself was enough to unblock the futex queue. The Famous Outages part of the book covers it in full as a leap-second incident; here it matters because it shows what happens when a one-second discontinuity meets a kernel that did not expect one.

Eighteen months earlier, on 10 February 2014, NTP itself was the weapon. The legacy `monlist` query in pre-4.2.7 ntpd accepted a 234-byte request and returned up to 600 IP-address entries — about 48 kilobytes back for a fraction of a kilobyte sent. With a spoofed source address that becomes a 206-fold amplifier. On 10 February 2014, an attacker pointed enough of those amplifiers at a single Cloudflare customer to deliver roughly 400 gigabits per second — at the time, the largest distributed denial-of-service attack ever recorded. Black Lotus reported that 69 percent of all DDoS traffic in early January 2014 was NTP reflection. Modern ntpd disables `monlist` by default; the IP episode covers the spoofed-source enabler, and the famous-outages part covers the attack itself.

Then the leap-second story finally turned. On 18 November 2022, Resolution 4 of the 27th General Conference on Weights and Measures decided that the maximum value of UT1 minus UTC will be increased in or before 2035 — leap seconds will be abandoned. The World Radiocommunication Conference in Dubai in December 2023 formally recognised the resolution. Russia opposed the change because GLONASS uses leap seconds inside its own protocol. Most distributed-systems engineers consider the abolition a major win: leap-second smearing has caused more outages over fifty years than the time accuracy was worth.

### The 2024 Modernisation — Rust, SPTP, NTPv5

Three things happened almost simultaneously in late 2023 and early 2024 that together amount to the largest change to internet timekeeping in a generation.

Meta open-sourced SPTP — Simple PTP — in February 2024. It delivers the same accuracy as PTPv2 unicast at roughly forty percent of the CPU, seventy percent of the memory, and fifty percent of the network bandwidth. It is what powers Meta's datacenter time fabric serving more than a hundred thousand clients.

AWS shipped the Nitro PTP Hardware Clock from November 2023, and has expanded it since. It delivers microsecond-level accuracy where NTP delivers about a millisecond. Crucially, the PHC does not smear leap seconds — it follows UTC standards exactly.

ntpd-rs, from the Tweede golf team and the Trifecta Tech Foundation under the Pendulum project, is a memory-safe Rust implementation of NTP. It reached version 1.0.0 in October 2023, was deployed at Let's Encrypt, and is packaged in Debian, Ubuntu, and Fedora. The Rust rewrite of NTP belongs to the same family of memory-safe-daemon efforts that followed Heartbleed and the era of high-profile C-language vulnerabilities.

Specifications kept moving too. RFC 9523, published in February 2024, standardises Khronos — a secure outlier-rejection watchdog by Rozen-Schiff, Dolev, Mizrahi, and Schapira that provably resists up to roughly one-third compromised servers. And `draft-ietf-ntp-ntpv5-08` from March 2026, by Lichvar and Mizrahi, is the first ground-up redesign of NTP since 1992: it removes the old modes 1, 2, 5, 6, and 7, leaving only client and server, and adds an explicit 16-bit era number that extends the unambiguous range to about thirty-five thousand years.

One more incident belongs in the picture. From 11 to 18 July 2019, Galileo's Precise Timing Facility in Oberpfaffenhofen suffered a complete six-day service loss after a PTF upgrade went wrong with the redundant standby unavailable. It is the cautionary tale for stratum-zero GNSS users and the reason serious operators run holdover oscillators — rubidium or oven-controlled crystal — to ride out an upstream outage.

And the regulatory frame around all of this. MiFID II RTS 25, in force across European financial markets since January 2018, mandates that trading venues' clocks diverge from UTC by no more than one hundred microseconds for high-frequency trading and one millisecond for non-HFT. NTP is now a regulated function in financial services. Operating an NTP server with insufficient accuracy is a compliance violation, not just an engineering nuisance.

## The figures

### David L. Mills

Mills designed NTP at the University of Delaware and COMSAT Labs in 1981, and refined it for over four decades — through RFC 958, RFC 1119, RFC 1305, and RFC 5905. The clock-discipline mathematics he chose, paired with Marzullo's algorithm, has held up since the 1980s and now underpins every other clock-sync protocol in production, from PTP to GPS-disciplined oscillators. He also built the early NSFNET Fuzzball routers and the gateway algorithms that ran the original NSFNET backbone. Without Mills, every TLS certificate validation, every Kerberos ticket, every distributed log timestamp would be unreliable. He was inducted into the Internet Hall of Fame and won the IEEE Internet Award, both in 2013. There is a full pioneer episode for him.

### Vint Cerf

Cerf wrote Mills's obituary on the Internet History mailing list in January 2024 — that is why he appears in this chapter. His own story is the TCP/IP one: co-inventor of TCP/IP with Bob Kahn, co-author of the 1974 paper that coined the word "internet," editor of many of the early TCP RFCs at Stanford, ACM Turing Award in 2004, Presidential Medal of Freedom in 2005, and now Google's Chief Internet Evangelist. The Vint Cerf episode picks up the rest.

### RFC 958 — Network Time Protocol (NTP)

Published in 1985 by D. Mills. Historic status, since obsoleted by RFC 1059, RFC 1119, RFC 1305, and finally RFC 5905. This is the document that first put NTP on the table as an internet specification.

### RFC 5905 — Network Time Protocol Version 4: Protocol and Algorithms Specification

Published in June 2010 by D. Mills, J. Martin, J. Burbank, and W. Kasch. Proposed Standard. This is the current canonical NTPv4 specification — the document every modern NTP implementation tracks. The NTP episode opens its mechanism story from RFC 5905.

## What you'd see in the simulator

Press Play on the NTP simulation and you'll see a single 48-byte UDP exchange. The client stamps the moment the request leaves — call it T1. The server stamps the moment the request arrives — T2 — and the moment its reply leaves — T3. The client stamps the moment the reply gets back — T4. From those four timestamps, the client computes the round-trip delay and the offset between the two clocks in two short equations, and that is what keeps every device on the internet within milliseconds of the correct time. The simulation lets you see the four timestamps line up in real time.

## What it taught the industry

Three lessons from forty years of NTP have hardened into industry defaults.

Time is infrastructure, not a feature. Every TLS certificate has a validity window. Every Kerberos ticket has an expiry. Every distributed log is correlated by timestamp. When the clock is wrong, all of those break in ways that look like other bugs. Mills's forty years of stewardship is the reason the industry treats clock skew as a first-class operational concern.

A reflection vector is whatever you let it be. The 2014 monlist disaster is the canonical example of what happens when a debugging command returns far more data than it accepts and the underlying transport allows source-address spoofing. The fix was not just disabling monlist; it was a generation of operators learning to audit every UDP service for amplification ratio.

Decade-scale calendar events are real engineering work. Y2K was the obvious one. The 2038 UNIX time_t rollover is the next. Between them sits NTP's 7 February 2036 era boundary. The protocol itself handles it; the embedded systems with shortcut implementations are the long tail. The lesson is that quiet, multi-year remediation work is how the internet survives its own deep-time arithmetic.

## Listening order

- **Before this chapter:** *SSH* — Tatu Ylönen's encrypted-shell story from Helsinki in July 1995, and the segue from secure remote access into the broader utilities of the internet stack that NTP belongs to.
- **After this chapter:** *OAuth 2.1 and JWT* — the modern identity layer, where token expiry depends on the same correct-clock guarantee NTP provides.

## Where to go deeper

- The NTP episode is the mechanism deep-dive — the four-timestamp packet exchange, Marzullo's algorithm, the stratum hierarchy from atomic clock down to your laptop, and the clock-discipline loop that steers the local oscillator.
- The IP episode is the substrate — the source-address spoofing that made the 2014 monlist amplification possible lives in IP's connectionless, best-effort model.
- The David Mills pioneer episode is the full life — University of Delaware, COMSAT Labs, the NSFNET Fuzzballs, and forty years of careful stewardship of internet timekeeping.
- The Vint Cerf episode is the larger arc — TCP/IP, the 1974 paper that coined "internet," and the obituary that opened this chapter.
