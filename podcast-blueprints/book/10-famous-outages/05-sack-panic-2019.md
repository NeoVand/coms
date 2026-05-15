---
id: famous-outages/sack-panic-2019
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: SACK Panic 2019
synopsis: A single TCP packet panics the Linux kernel.
podcast_target_minutes: 12
position_in_book: chapter 69 of 75
listening_order:
  prev: famous-outages/china-telecom-2010
  next: famous-outages/centurylink-2020
related_protocols: [tcp, ip]
related_pioneers: []
related_outages: [sack-panic-2019]
related_frontier: []
related_rfcs: [2018]
images: []
visual_cues:
  - "A single malicious TCP segment with a tiny MSS field circled, arrowing into a Linux kernel block that splinters into a panic screen."
  - "Timeline bar from October 1996 (RFC 2018) to June 17, 2019 (CVE-2019-11477), with a red marker at 2009 where the frags_per_skb limit was raised."
  - "Side-by-side: a 16-bit gso_segs counter at 65,535 ticking over to overflow, next to a kernel BUG_ON() stack trace."
  - "World map of Linux servers lighting up red as patches roll out in waves over the days following June 17, 2019."
  - "Diagram of a sysctl emergency lever labeled net.ipv4.tcp_sack with an off-switch next to a running kernel."
---

# Part XI, Chapter — SACK Panic 2019

## The hook
A protocol option in widespread use for 23 years had a remote-trigger denial-of-service bug nobody noticed. One TCP packet, no authentication, and any Linux server on the internet would reboot. The lesson the industry took from June 2019: code stability is not code correctness.

## The story

### Integer Overflow in the Most Critical Data Path
In June 2019, Netflix security researcher Jonathan Looney found that a maliciously crafted TCP packet — carrying a carefully chosen pattern of Selective Acknowledgement options — could trigger an integer overflow inside the Linux kernel's TCP stack. The result was a kernel panic. The host went down.

The bug got a number, CVE-2019-11477, and a name: SACK Panic. It affected every Linux kernel from 2.6.29, released in 2009, through 5.1, released in 2019. Ten years of unpatched code, sitting in the heart of every Linux server on the internet. Service providers, cloud hyperscalers, container hosts, embedded systems — all simultaneously vulnerable. A single TCP packet would do it. No login, no handshake beyond the connection itself, no authentication.

The disclosure was coordinated. Red Hat, Canonical, SUSE, Debian, AWS, Google, and the Linux kernel team all had patches ready when the public advisory dropped on 17 June 2019. Patches shipped within hours. But rolling them out across the global Linux fleet took weeks. For most of June, large chunks of the internet were running known-vulnerable kernels and praying nobody pointed an exploit at them.

How TCP itself works — the connection setup, the sequence numbers, the retransmission machinery — is the TCP episode's job. What we care about here is one small option on top of that machinery, and how a 23-year-old line of logic produced a one-packet kill switch for half the internet.

### How a 23-Year-Old Option Survived Undetected
Selective Acknowledgement — SACK — was specified in RFC 2018, published in October 1996. It lets a TCP receiver tell the sender exactly which non-contiguous byte ranges have arrived, instead of the cumulative acknowledgement only being able to say "I have everything up to byte N." On a lossy path, that turns retransmission from a guessing game into a precise repair. SACK had been working correctly for 23 years.

The bug was not in SACK's logic. The bug was in a specific edge case where SACK met another piece of the kernel: the frags_per_skb limit, raised in 2009 to support larger send buffers. The Linux kernel tracks the segments-in-flight on a single socket buffer in a 16-bit counter called gso_segs. A remote peer is allowed to advertise a tiny Maximum Segment Size — the MSS field is right there in the TCP options. If the MSS is small enough, a single sk_buff splits into more than 65,535 segments. The 16-bit counter overflows. The kernel's BUG_ON assertion fires. The system panics.

That code path had been live in production since 2009. It survived for ten years for four reasons. The trigger required a combination of TCP options that no real client sent in normal traffic. The Linux test suite did not fuzz SACK option boundaries. Most performance benchmarks did not exercise the path. And SACK had a reputation as battle-tested code, so engineers focused new attention on newer features instead.

Looney found it by writing a fuzzer that combined SACK with TCP's other options in unusual sequences. The same fuzzer found three more related bugs — CVE-2019-11478, the SACK Slowness bug, and CVE-2019-11479, an excessive resource consumption case from extremely low MSS values — all patched in the same coordinated June 2019 disclosure. This is one of the incidents we cover in the Famous Outages part of the book; the outage entry has the full cascade.

### Code stability is not code correctness
Code that has not changed in years is code that has not been re-tested in years. The networking community before 2019 had implicitly trusted battle-tested code more than freshly-shipped code. SACK Panic reversed that intuition. Modern Linux kernel development now treats the network stack as a continuous fuzzing target — syzkaller, the Google-led effort, runs against every commit. Most CVE-quality bugs found since 2019 in the kernel's TCP path have come from this fuzzing infrastructure, not from human review.

## The figures

### SACK Panic — A One-Packet Linux Kernel Crash
Netflix's Jonathan Looney found that the right TCP SACK option pattern would crash the Linux kernel — a single TCP packet, no authentication, instant remote denial of service. The attacker opened a TCP connection and advertised a tiny MSS, the kernel computed gso_segs above 65,535, the 16-bit counter overflowed, and the kernel panicked. CVSS 7.5. The mainline patch shipped within days; the interim mitigations were to disable SACK with `net.ipv4.tcp_sack=0` or to enforce a minimum MSS via the new `net.ipv4.tcp_min_snd_mss` sysctl.

### RFC 2018 — TCP Selective Acknowledgment Options
Published October 1996 by Mathis, Mahdavi, Floyd, and Romanow as a Proposed Standard. It defined the SACK option that lets a TCP receiver report exactly which non-contiguous ranges have arrived, so the sender can retransmit only what's missing. Universally supported by 2019, and the option whose 23-year-old code path produced the panic.

## What it taught the industry
Three operational changes are now standard in production Linux fleets.

Continuous fuzzing of network code paths. syzkaller runs against every Linux kernel commit, generating millions of random syscall and packet sequences per day. Most CVEs in the kernel's TCP and IP stack since 2019 have been found this way, not by humans reading patches.

Faster CVE response in distributed Linux environments. Before 2019, large fleets often took weeks to roll out a kernel patch — full reboot rotations, slow validation cycles. SACK Panic forced the industry to invest in live patching. Red Hat's kpatch, Canonical's Livepatch, and SUSE's kGraft can apply security fixes to a running kernel without a reboot. By 2026, hyperscalers routinely live-patch kernel CVEs across millions of hosts within hours.

Per-feature kill switches. The SACK Panic patch is gated behind the `net.ipv4.tcp_sack` sysctl, so operators can disable SACK entirely if a future bug surfaces — without waiting for a kernel update. Modern kernel networking is full of such switches: an emergency lever for every major optional feature.

There was one more downstream effect specific to TCP. The post-disclosure work fed into RACK-TLP, standardized as RFC 8985 in February 2021, which replaced the older "three duplicate ACKs" loss-detection rule with a time-based scheme. Better fuzzing exposed how brittle the old loss-detection logic was, and a cleaner replacement followed.

## Listening order

- **Before this chapter:** "China Telecom 2010" — a routing-layer accident that hijacked a slice of the global internet, setting up the question of how a single small change can ripple worldwide.
- **After this chapter:** "CenturyLink Flowspec 2020" — another one-rule, one-packet-class blast radius story, this time at the carrier layer.

## Where to go deeper
The TCP episode picks up the mechanism story — connection setup, sequence numbers, retransmission, and where SACK fits into TCP's loss recovery. The IP episode covers the layer underneath, where every TCP segment lives inside an IP packet, and why protocol number 6 in the IP header is what hands the segment up to TCP in the first place.

## Visual cues for image generation
- A single malicious TCP segment with a tiny MSS field circled, arrowing into a Linux kernel block that splinters into a panic screen.
- Timeline bar from October 1996, when RFC 2018 published, to 17 June 2019, when CVE-2019-11477 disclosed, with a red marker at 2009 where the frags_per_skb limit was raised.
- Side-by-side: a 16-bit gso_segs counter ticking from 65,535 over to zero, next to a kernel BUG_ON stack trace.
- A wave of Linux server icons turning from red to green over the days following 17 June 2019, showing patch rollout.
- A sysctl emergency lever labeled `net.ipv4.tcp_sack` next to a running kernel, with the off position highlighted.

## Sources
- [Netflix Security Bulletin — TCP SACK PANIC](https://github.com/Netflix/security-bulletins/blob/master/advisories/third-party/2019-001.md)
- [Red Hat — TCP SACK PANIC vulnerability](https://access.redhat.com/security/vulnerabilities/tcpsack)
- [RFC 2018 — TCP Selective Acknowledgment Options](https://www.rfc-editor.org/rfc/rfc2018)
