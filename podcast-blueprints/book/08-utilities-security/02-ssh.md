---
id: utilities-security/ssh
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: SSH
synopsis: Encrypted shells, port forwards, and SCP — written by Tatu Ylönen in Helsinki, July 1995.
podcast_target_minutes: 15
position_in_book: chapter 57 of 75
listening_order:
  prev: utilities-security/tls
  next: utilities-security/ntp
related_protocols: [ssh, ftp, tcp, tls, http3, quic]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A 1995 Helsinki University of Technology terminal next to a sniffed cleartext password packet, with port 22 highlighted between port 21 and port 23."
  - "Timeline strip across 1995, 1999, 2022, 2023, 2024, 2025 marking SSH-1, OpenSSH fork, scp-uses-sftp, Terrapin, XZ backdoor and regreSSHion, ML-KEM default."
  - "An SSH session multiplexing four channels — interactive shell, port-forwarded TCP, SCP transfer, X11 display — fanning out from one encrypted tunnel."
  - "A two-stage diagram of the XZ backdoor: liblzma 5.6.0 hook examining an RSA modulus, then triggering system() before sshd authentication completes."
  - "OpenSSH 10.0 release card showing DSA crossed out and mlkem768x25519-sha256 set as default key exchange, dated 9 April 2025."
---

# Part IX, Chapter — SSH

## The hook
"OpenSSH 9.0, April 2022, switched the scp command to use SFTP under the hood by default. After 27 years, the SCP wire protocol is finally being replaced by the protocol that was supposed to replace it from the beginning." That sentence is the whole chapter in miniature. A protocol born in a Helsinki university lab in 1995, with a port number chosen because it sat neatly between FTP and Telnet, is still the way every developer on Earth touches a server — and it is still being rebuilt under their feet.

## The story

### A Replacement for Telnet, Born in Helsinki
Tatu Ylönen at Helsinki University of Technology wrote SSH in July 1995 after a password-sniffing attack on the university network. He released it as freeware. By the end of the year there were roughly 20,000 users in 50 countries. The attack worked for a boring reason: Telnet, RSH, and FTP — the standard remote-access protocols of the day — sent everything in cleartext. Anyone with a tap on the wire could read your password as you typed it. SSH was designed as a drop-in replacement that nobody could sniff.

The port-22 origin story is one of the small, deliberate choices that ended up baked into every Linux box on the planet. Ylönen picked 22 because it sat between telnet on 23 and FTP on 21. On 10 July 1995 he emailed Joyce K. Reynolds at IANA. She replied the next day, assigned port 22, and listed him as point of contact. The reasoning was aesthetic — telnet, FTP, and SSH form a contiguous range — and in 30 years nobody has seriously questioned it.

The mechanism is the part this episode will not belabour. SSH uses public-key crypto for host and user authentication, Diffie-Hellman for key exchange, and a symmetric cipher — originally 3DES, now ChaCha20-Poly1305 or AES-GCM — for the session itself. Once authenticated, a single SSH connection multiplexes multiple channels over the same encrypted tunnel: an interactive shell, a port-forwarded TCP connection, an SCP file transfer, an X11 display. How that tunnel is actually built — version negotiation, key exchange, the channel layer — is the SSH protocol episode. Here we are after the story.

The story takes a sharp turn on 26 September 1999. The OpenBSD team forked OpenSSH from Björn Grönvall's OSSH, which was itself a re-derivation of Ylönen's last freely-licensed version, ssh-1.2.12. Theo de Raadt, Markus Friedl, Niels Provos, Bob Beck, Aaron Campbell and Dug Song built the core, and Damien Miller and Darren Tucker did the portability work that lets the rest of the operating-system world consume it. From that point on, the de-facto standard SSH implementation is OpenBSD upstream, with every Linux distro downstream.

### SFTP Is Not "FTP Over SSH"
The single most-misunderstood fact in this chapter: SFTP is not FTP over SSH. It is a wholly distinct file-transfer protocol that runs as a subsystem request inside an SSH session channel. The spec is `draft-ietf-secsh-filexfer-13`, from 2006, and it was never published as an RFC.

For nearly three decades the `scp` command and the SCP wire protocol coexisted with SFTP, even though SFTP was meant to replace SCP from the beginning. OpenSSH 9.0 in April 2022 finally flipped the switch — `scp` now speaks SFTP under the hood by default. RHEL 9 went further and deprecated the SCP wire protocol entirely. After 27 years, the protocol that was supposed to replace SCP is finally replacing it.

### The 2024 Year of CVEs
Two SSH events from 2024 deserve their own paragraph. Three, really — the third one slipped in just before the year began.

CVE-2024-3094, the XZ Utils backdoor, was disclosed on 29 March 2024. Andres Freund, a Postgres maintainer at Microsoft, found a multi-stage backdoor in liblzma 5.6.0 and 5.6.1 while investigating a 500-millisecond regression in SSH login latency on Debian sid. A 500-millisecond regression. The backdoor was planted by a maintainer using the name "Jia Tan", who had spent over two years — November 2021 to February 2024 — gaining maintainer status through what looks like sock-puppetry. The hook examined the RSA modulus N of the public key supplied during pubkey auth and, if it contained a payload signed with the attacker's Ed448 key, executed arbitrary commands via `system()` before authentication completed. CVSS 10.0. No stable distribution shipped it. It was caught in development. It is the closest call open-source supply chain has ever had, and the trigger that found it was a developer who refused to ignore half a second of unexplained latency.

CVE-2024-6387 — "regreSSHion" — was disclosed by Qualys on 1 July 2024. Pre-auth, unauthenticated remote code execution as root, in `sshd` on glibc-based Linux. The bug is a signal-handler race: the `SIGALRM` handler calls `syslog()`, which is not async-signal-safe. The lineage is what makes it tragic. It is a regression of CVE-2006-5051, originally reported by Mark Dowd in 2006. The 2006 fix was wrapped in a `#ifdef DO_LOG_SAFE_IN_SIGHAND` guard. In October 2020, OpenSSH 8.5p1's logging refactor accidentally dropped the directive. Qualys identified roughly 14 million internet-exposed OpenSSH instances potentially in scope.

And just before the year began, CVE-2023-48795 — Terrapin — was disclosed on 18 December 2023 by Bäumer, Brinkmann, and Schwenk at Ruhr University Bochum. It went on to win best paper at USENIX Security 2024. A man-in-the-middle can delete a chosen number of encrypted packets from the start of an SSH channel without detection, because the per-direction sequence numbers begin counting before the first encrypted message. The mitigation is the "Strict KEX" extension, which OpenSSH shipped in 9.6 in December 2023.

### Post-Quantum SSH Shipped Before TLS
OpenSSH 10.0 landed on 9 April 2025 and changed the defaults again. It removed DSA entirely. It made `mlkem768x25519-sha256` the default key exchange. It split user-auth into a separate `sshd-auth` binary. It disabled finite-field Diffie-Hellman on the server side by default. OpenSSH 10.1 in October 2025 began warning when a non-PQ key exchange is selected; 10.2 followed on 10 October 2025, and 10.3 on 2 April 2026.

The headline matters: SSH was the first widely deployed protocol to ship post-quantum crypto by default — six months before TLS X25519MLKEM768 reached default-on in iOS 26. The deployment story is the same in both cases. NIST FIPS 203 in August 2024 nailed down the standard, the OpenSSH team standardised the codepoint, OpenBSD shipped the upstream, and Linux distributions consumed it from there.

The standards side is moving in parallel. The IETF Secure Shell Maintenance working group — sshm — was chartered in August 2024, with chairs Job Snijders of Fastly and Stephen Farrell of Trinity College Dublin. It is the first working group dedicated to SSH in over a decade. Active drafts include `draft-ietf-sshm-mlkem-hybrid-kex` from Kampanakis, Stebila, and Hansen, which formalises the `mlkem768x25519-sha256` hybrid OpenSSH already ships, and an experimental `draft-michel-ssh3` from UCLouvain that re-implements an SSH-equivalent on top of HTTP/3 and QUIC, claiming 3-RTT session establishment versus SSH's 5-to-7. That last one is a research prototype; the QUIC episode and the HTTP/3 episode handle the transport story.

### The Old Wounds Still Show
Two final entries explain why the OpenSSH 10.0 cleanup is so blunt.

On 24 March 2023, GitHub's RSA SSH host private key was briefly, inadvertently published in a public GitHub repository. Users worldwide had to run `ssh-keygen -R github.com` and re-trust. The visible cost was the remediation; the deeper lesson was about how secrets get handled in shared development infrastructure.

The deeper reason DSA is finally gone in OpenSSH 10.0 goes back to "Mining Your Ps and Qs" by Heninger and colleagues at USENIX Security 2012. They found 0.03% of RSA SSH host keys and 1.03% of DSA keys exposed because of weak entropy at first boot, and computed thousands of private keys via batch-GCD. DSA's per-signature random number is too easy to get wrong. After 13 years of warnings, the OpenSSH team simply removed the algorithm.

## The figures
This chapter has no embedded pioneer, outage, frontier or RFC slots — every figure mentioned is woven into the story above.

## What you'd see in the simulator
The SSH simulator in the app walks an SSH connection establishment end to end. You would press play and see version negotiation first — the client and server exchanging banners that announce protocol and software version. Then key exchange: a Diffie-Hellman round that the simulator visualises as the two sides combining a public value with a private secret to derive the same shared key. Authentication follows — by default, public-key auth, with the client signing a challenge using its private key and the server verifying against the stored public key. Then the encrypted interactive channel opens, and you would see plaintext keystrokes on the client side becoming opaque ciphertext on the wire. The full step-by-step mechanism is the SSH protocol episode; here it is enough to see the four phases — version, key exchange, auth, channel — line up.

## What it taught the industry
SSH taught the industry three things, in three different decades.

In the 1990s, it proved that a single grad student responding to a single password-sniffing incident could displace an entire family of cleartext protocols — Telnet, RSH, FTP — within a few years, simply by being a drop-in replacement that nobody could sniff.

In the 2020s, it became the canary for open-source supply-chain attacks. The XZ backdoor was caught because SSH login latency went up by half a second, and one developer cared enough to chase it.

And in 2025, it became the proof that post-quantum cryptography can ship by default in production infrastructure. The TLS episode and the QUIC episode are still catching up. SSH got there first, by way of OpenBSD, six months ahead.

## Listening order
- **Before this chapter:** "TLS" — the transport-layer encryption story that runs underneath HTTPS sets up why a protocol like SSH, born outside the TLS lineage, had to invent the same primitives independently.
- **After this chapter:** "NTP" — once you can log in securely, the next utility every server needs is the right time, and NTP has its own decades-deep history of pioneers and abuse.

## Where to go deeper
- The SSH protocol episode picks up the mechanism story — version negotiation, key exchange, the channel layer, port forwarding, and how the subsystem request that hosts SFTP actually works.
- The FTP episode explains the dual-channel control-plus-data architecture that SCP and SFTP were built to leave behind.
- The TCP episode covers the reliable transport every SSH session sits on top of, and the BBR/CUBIC congestion-control story behind today's SSH throughput.
- The TLS episode is the parallel-universe encryption story — same goals, different lineage — and explains why SSH shipping ML-KEM first was a real milestone.
- The QUIC episode and the HTTP/3 episode are where the experimental `draft-michel-ssh3` work lives — an SSH-equivalent re-imagined on top of QUIC's 1-RTT handshake.

## Visual cues for image generation
- A 1995 Helsinki University of Technology terminal next to a sniffed cleartext password packet, with port 22 highlighted between port 21 and port 23.
- Timeline strip across 1995, 1999, 2022, 2023, 2024, 2025 marking SSH-1, the OpenSSH fork, scp-uses-SFTP, Terrapin, the XZ backdoor and regreSSHion, and the ML-KEM default.
- A single SSH session multiplexing four channels — interactive shell, port-forwarded TCP, SCP transfer, X11 display — fanning out from one encrypted tunnel.
- Two-stage diagram of the XZ backdoor: liblzma 5.6.0 hook examining an RSA modulus, then triggering `system()` before sshd authentication completes.
- OpenSSH 10.0 release card showing DSA crossed out and `mlkem768x25519-sha256` set as the default key exchange, dated 9 April 2025.
