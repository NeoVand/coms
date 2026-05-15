---
id: famous-outages/mitnick-1994
type: chapter
part_id: famous-outages
part_label: XI
part_title: Famous Outages
title: Mitnick vs Shimomura 1994 — When TCP Trusted Its Own Sequence Numbers
synopsis: A TCP sequence-prediction attack on Christmas Day.
podcast_target_minutes: 12
position_in_book: chapter 66 of 75
listening_order:
  prev: famous-outages/as-7007-1997
  next: famous-outages/pakistan-youtube-2008
related_protocols: [tcp, ip, ssh, tls]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9293, 1948]
images: []
visual_cues:
  - "A 1994 SPARCstation in a San Diego home office, Christmas lights blurred in the background, terminal showing an open root shell."
  - "Diagram of the six-step sequence-prediction attack: SYN flood on the trusted host, spoofed SYN to the target, predicted ISN, forged ACK, established connection."
  - "Side-by-side: the deterministic ISN counter from RFC 793 (increment by 128,000 per second, 64,000 per connection) versus the hashed four-tuple of RFC 1948."
  - "Map tracing Mitnick's dial-up POPs from San Diego back to Raleigh, North Carolina — passive monitoring, traffic analysis, direction-finding equipment."
  - "An rsh .rhosts file with a single trusted hostname, with a red overlay reading 'authentication = source IP'."
---

# Part XI, Chapter — Mitnick vs Shimomura 1994 — When TCP Trusted Its Own Sequence Numbers

## The hook
On Christmas Day 1994, Kevin Mitnick walked into Tsutomu Shimomura's home computer at the San Diego Supercomputer Center without typing a password. He didn't need one. He talked TCP into believing a connection that had never happened — and Berkeley Unix did the rest.

## The story

### When TCP Trusted Its Own Sequence Numbers
Early TCP implementations chose initial sequence numbers from a counter that incremented by 128,000 every second, plus another 64,000 for every new connection. That formula was written into RFC 793 in 1981. Postel and Cerf made it deterministic on purpose — they wanted ISNs to be reproducible during debugging. In 1981 the threat model didn't include attackers forging entire connections from across the country.

The flaw was simple. If you knew the rough current value of that counter, you could predict the next ISN a target would pick. And if you could predict the ISN, you could forge an entire TCP connection that the victim would believe was legitimate.

The Christmas Day attack ran in six steps. First, Mitnick aimed a SYN flood at a trusted internal host, exhausting its ability to respond. Second, he sent a SYN to Shimomura's machine, source-spoofed to look like it came from that trusted host. Third, the target sent a SYN-ACK back to the silent trusted host, choosing a fresh ISN. Fourth, Mitnick predicted that ISN from the formula plus a sample he had taken earlier. Fifth, he sent a forged ACK back to the target with the predicted sequence number. Sixth, the target saw a valid ACK and marked the connection established. Mitnick now had a TCP connection that appeared to originate from a host Shimomura's machine trusted.

The mechanism story for the three-way handshake itself — SYN, SYN-ACK, ACK, sequence numbers, the lot — is the second half of the TCP episode. What matters here is that the attack didn't break TCP. It exploited a property TCP was designed to have.

### rsh, rlogin, and the multiplier
Sequence prediction by itself is not catastrophic. It just lets you forge a connection. The reason Christmas 1994 became a famous incident is that Berkeley Unix's `.rhosts` mechanism trusted the source IP address of an incoming connection as authentication. Forge the source IP, get the trust. Mitnick landed his forged connection from a host listed in Shimomura's `.rhosts` file, and that gave him root access without ever being asked for a password.

SSH — which Tatu Ylönen wrote in Helsinki in 1995, partly in response to incidents like this one — replaced `.rhosts` with cryptographic identity. Even a perfectly forged TCP connection cannot impersonate someone without their private key. The full SSH story, key exchange and all, is the SSH episode.

### The Manhunt
Shimomura, a security researcher, took the intrusion personally. He spent two months tracing the attack back to Mitnick. Passive monitoring of compromised hosts. Traffic analysis to triangulate Mitnick's dial-up POPs. And finally direction-finding equipment to locate his physical address in Raleigh, North Carolina. Mitnick was arrested on 15 February 1995.

The story became Shimomura's 1996 book *Takedown* and a Hollywood movie. The technical legacy outlived the celebrity.

### The Fix in the Stack
RFC 1948, by Steve Bellovin in 1996, replaced the predictable ISN formula with a hashed function of the connection four-tuple plus a per-boot secret. RFC 6528, by Larry Joncheray and Fernando Gont in 2012, tightened it further. Modern stacks use cryptographically random ISNs per RFC 9293 §3.4.1, and predicting them is computationally infeasible.

The deeper fix was in the trust model, not the sequence number. Before 1995, "this connection comes from a trusted IP" was treated as sufficient authentication on most internal networks. After 1995, the entire industry moved toward cryptographic authentication that didn't depend on transport-layer trust. SSH replaced rsh, rlogin, and telnet within five years. TLS added per-connection cryptographic verification on top of TCP — the lock icon in your browser is the descendant of this lesson, and the full story is the TLS episode. Modern zero-trust architectures take it further: every connection is treated as untrusted until cryptographically authenticated, regardless of source IP.

The Mitnick attack is the canonical example of why "the source IP says it's a trusted host" is never enough.

## The figures

### RFC 9293 — Transmission Control Protocol (TCP)
The current consolidated TCP standard, edited by Wes Eddy and published in 2022. It obsoletes RFC 793 and a half-dozen later patches into a single document. Section 3.4.1 specifies that initial sequence numbers must be generated to make prediction infeasible — the direct closure of the hole Mitnick walked through.

### RFC 1948 — Defending Against Sequence Number Attacks
Steve Bellovin's 1996 informational RFC, written in the wake of the Mitnick incident. It proposes generating ISNs as a hash of the connection four-tuple — source IP, source port, destination IP, destination port — combined with a per-boot secret, so that an attacker who has never seen the secret cannot predict the number for a connection they did not initiate.

## What it taught the industry
Three changes that are now standard date back to lessons from this incident.

Initial sequence numbers became unpredictable by default. Every modern TCP stack — Linux, FreeBSD, the Windows kernel, the BSDs in macOS and iOS — generates ISNs that an off-path attacker cannot guess. The formula in RFC 793 is gone from production code. The mechanism story belongs to the TCP episode.

Source-IP authentication is dead. The `.rhosts` file is a museum piece. SSH replaced rsh, rlogin, and telnet across the industry within five years of Mitnick's arrest. Cryptographic identity, not network position, became the unit of trust.

Zero trust became the default architecture. The line of reasoning that starts at Christmas 1994 and runs through TLS, mutual TLS, SPIFFE, and BeyondCorp ends at the same conclusion: every connection is untrusted until proven otherwise, and proof means cryptography, not an IP header.

## Listening order

- **Before this chapter:** *"AS 7007 1997" — sets up the pattern of single-machine failures cascading across the whole internet, this time through routing rather than authentication.*
- **After this chapter:** *"Pakistan/YouTube 2008" — another incident where a forged announcement, this time at the BGP layer, gets believed by the rest of the network.*

## Where to go deeper
- The TCP episode picks up the mechanism story — the three-way handshake, sequence numbers, the SYN-ACK exchange that Mitnick exploited.
- The SSH episode covers Tatu Ylönen's 1995 replacement for rsh and rlogin — version negotiation, key exchange, public-key authentication, the cryptographic identity that ended source-IP trust.
- The TLS episode is the parallel story for application traffic — confidentiality, integrity, and authentication over TCP, with the 1.3 handshake reduced to a single round trip.
- The IP episode covers the IPv4 header fields that made source spoofing possible in the first place, and the routing model that has no built-in defence against it.

## Visual cues for image generation
- A 1994-era SPARCstation in a San Diego home office, Christmas lights blurred behind it, an open root shell on the terminal.
- The six-step sequence-prediction attack laid out as a sequence diagram: SYN flood, spoofed SYN, predicted ISN, forged ACK, established connection.
- The deterministic ISN counter from RFC 793 — increment by 128,000 per second, 64,000 per connection — next to the hashed four-tuple from RFC 1948.
- A trace from San Diego back to Raleigh, North Carolina, marked with the three techniques Shimomura used: passive monitoring, traffic analysis, direction-finding.
- An rsh `.rhosts` file with a single trusted hostname, overlaid with the caption "authentication = source IP".
