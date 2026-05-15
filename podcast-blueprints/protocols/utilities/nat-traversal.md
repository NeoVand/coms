---
id: nat-traversal
type: protocol
name: NAT Traversal
abbreviation: STUN/TURN/ICE
etymology: "[S]ession [T]raversal [U]tilities for [N]AT (STUN, recycled from the 2003 [S]imple [T]raversal of [U]DP through [N]ATs); [T]raversal [U]sing [R]elays around [N]AT (TURN); [I]nteractive [C]onnectivity [E]stablishment (ICE)"
category: utilities
year: 2003
rfc: RFC 8489 / 8656 / 8445
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [udp, tcp, tls, webrtc, rtp, sip, sdp, quic, dns, ipv6, websockets]
related_pioneers: [jonathan-rosenberg, justin-uberti, bryan-ford, saikat-guha]
related_outages: []
related_frontier: []
related_rfcs: [8489, 8656, 8445, 8838, 7675, 7635]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/NAT_Concept-en.svg/500px-NAT_Concept-en.svg.png
    caption: The reason NAT traversal exists. A NAT router rewrites the 5-tuple of every outbound flow, mapping many internal addresses onto one public IP. STUN reveals what the world sees, TURN relays when nothing direct works, and ICE picks the path.
    credit: Image — Wikimedia Commons / CC BY-SA
visual_cues:
  - "The three-protocol stack in one frame: a probe icon labelled STUN with an arrow up to a public server, a relay icon labelled TURN with packets flowing through it, and an orchestrator icon labelled ICE coordinating both. Dependency arrows in the middle. Captioned 'Probe, relay, orchestrator.'"
  - "A candidate priority pyramid: 'host 126' at the apex in dark green, 'peer-reflexive 110' below in lighter green, 'server-reflexive 100' in yellow, 'relay 0' at the wide red base. To the right, the actual ICE pair-priority formula 2^32 * min(G,D) + 2 * max(G,D) + (G>D?1:0) in monospace."
  - "Pricing comparison cards for managed NAT-traversal: Google STUN labelled 'free, anycast, 19302' in blue; Cloudflare Realtime TURN labelled '$0.05/GB, 1000 GB/month free, 335+ locations' in orange; Twilio NTS labelled 'usage-based' in red; Tailscale DERP labelled 'subscription-bundled' in purple. Caption: 'Address discovery is cheap. Relayed bytes are not.'"
  - "An annotated STUN Binding Success packet hex dump on a dark background: bytes 01 01 00 0c (Binding Success, length 12) in cyan, 21 12 a4 42 (magic cookie) in yellow with the label 'magic cookie 0x2112A442', then the 12-byte transaction ID in grey, then the XOR-MAPPED-ADDRESS attribute decoded to '198.51.100.7 : 55432' in green."
  - "A symmetric-NAT failure scenario: Alice in an AWS VPC on the left, Bob in an Azure VNet on the right, each behind a cloud NAT box randomising source ports. A red X over a dotted line attempting direct UDP between them. A solid green line routing through a TURN relay in the middle. Caption: 'Two cloud peers almost never form a direct path.'"
  - "The CVE-2020-26262 lesson as a flow diagram: one inner box labelled '127.0.0.1 (blocked)', a second labelled '0.0.0.0 (bypass)', a third labelled '::1 (bypass)', a fourth labelled '::ffff:127.0.0.1 (bypass-of-the-fix, 2024)'. All four arrows point to a server marked 'TURN host loopback'. Caption: 'Loopback is an idea, not an address.'"
---

# STUN / TURN / ICE — NAT Traversal

## In one breath

NAT traversal is the three-protocol bundle that lets two devices behind home routers, corporate firewalls, or cloud NAT gateways actually find each other on an internet built around private addresses. STUN learns your public address, TURN relays your media when direct paths fail, and ICE picks the best working path between every candidate pair. Every WebRTC call in your browser, every SIP softphone on the public internet, every Tailscale mesh, and every modern voice agent rides on this stack — and it all shares one 20-byte STUN header and one magic cookie, `0x2112A442`.

## The pitch (cold-open)

Every Google Meet, every Discord voice channel, every WhatsApp call: three protocols you have never heard of conspire to make it work. STUN tells your laptop the IP address the rest of the internet sees. TURN smuggles your audio through a public relay when your home router refuses to cooperate. And ICE is the conductor — it gathers every possible network path between you and the person you're calling, races them, and picks the fastest one that works. They were invented for SIP phones in 2003. Today they ship in 1.21 million lines of WebRTC code in your browser, and they are the reason peer-to-peer is still possible on an internet built around middleboxes.

## How it actually works

All three protocols share the same 20-byte STUN header, the same TLV attribute encoding, and the same magic cookie. The default ports are 3478 for cleartext UDP or TCP and 5349 for TLS or DTLS. In hostile networks, port 443 over TLS is the practical fallback. The wire is intentionally simple: the top two bits of the first byte are zero, which lets a receiver demultiplex STUN against RTP, DTLS, and even QUIC on a shared socket.

A WebRTC call between two laptops walks through the stack like this.

**Step one — gather host candidates.** Each ICE agent enumerates its local interfaces and binds UDP sockets on every routable address. These host candidates are tried first. They win on the same LAN or a VPN that already routed both peers together.

**Step two — STUN: learn your public address.** The agent sends a 20-byte Binding Request to a public STUN server, typically `stun.l.google.com:19302`. The server replies with the source IP and port it observed, encoded in the `XOR-MAPPED-ADDRESS` attribute. That is the agent's server-reflexive candidate — what peers will see when packets exit the NAT. The XOR encoding exists because some NATs used to rewrite raw address bytes inside payloads in a misguided attempt at a generic ALG; XORing with the magic cookie hides the address from those dumb middleboxes.

**Step three — TURN: allocate a relay.** If direct paths might fail, the agent also sends an `Allocate` request to a TURN server using long-term credentials. The server returns `XOR-RELAYED-ADDRESS` — a public IP and port the peer can hit. The default allocation lifetime is 600 seconds; clients refresh at around 450 seconds. TURN messages are STUN-formatted, with `REQUESTED-TRANSPORT` set to 17 for UDP, plus `USERNAME`, `REALM`, `NONCE`, and `MESSAGE-INTEGRITY-SHA256`.

**Step four — trickle and pair.** Candidates are signalled to the other peer as they arrive (RFC 8838, Trickle ICE) over the application's signalling channel — a WebSocket, a SIP message, whatever. Each side pairs every local candidate with every remote candidate and assigns a priority: host 126, peer-reflexive 110, server-reflexive 100, relay 0. The pair priority formula is `2^32 * min(G,D) + 2 * max(G,D) + (G>D?1:0)`, where G is the controlling agent's candidate priority and D is the controlled's.

**Step five — connectivity checks.** Both agents fire STUN Binding Requests across every pair using short-term ICE credentials — the `ufrag` and `pwd` exchanged in the SDP. The first pair to round-trip becomes a valid pair. The controlling agent then nominates one with the `USE-CANDIDATE` attribute.

**Step six — keep the path alive.** Consent freshness, defined in RFC 7675, fires a STUN Binding Indication every roughly 15 seconds on the selected pair. If no response comes back in around 30 seconds, the agent declares the session dead and triggers an ICE restart. TURN allocations refresh every 450 seconds to stay below the 600-second timeout. Permissions on TURN — installed per peer IP via `CreatePermission` — live for 5 minutes and need refreshing too.

### Header at a glance

The STUN message is a 20-byte fixed header followed by zero or more type-length-value attributes.

- **First two bits:** always zero. Free demux key against RTP, which starts with `10`, and DTLS, which starts with `20+`.
- **Message type, 14 bits:** 12 bits of method interleaved with 2 bits of class (`00` request, `01` indication, `10` success response, `11` error). Binding Request is `0x0001`; Binding Success is `0x0101`; Allocate is `0x0003`.
- **Message length, 16 bits:** byte count of attributes only, padded to a multiple of four.
- **Magic cookie, 32 bits:** the fixed value `0x2112A442`. Lets receivers separate STUN from RTP, DTLS, and QUIC on the same socket.
- **Transaction ID, 96 bits:** cryptographically random, echoed by the server, used to correlate request and response and to XOR the IPv6 mapped address.

Common attributes worth knowing by hex: `0x0008` `MESSAGE-INTEGRITY` (HMAC-SHA1, legacy), `0x001C` `MESSAGE-INTEGRITY-SHA256` (new in RFC 8489), `0x0020` `XOR-MAPPED-ADDRESS`, `0x0016` `XOR-RELAYED-ADDRESS`, `0x000D` `LIFETIME`, `0x0019` `REQUESTED-TRANSPORT`, `0x8028` `FINGERPRINT` (a CRC-32 of the message XORed with `0x5354554E` — the ASCII bytes for `STUN`).

### State machine in three sentences

An ICE agent moves from `Idle` into `Gathering`, then into `Checking` once at least one local and one remote candidate exist, then into `Nominating` once the controlling side has at least one valid pair, then into `Completed` when the nominated pair is acknowledged. Failure has two paths: the Patiently Awaiting Connectivity timer (RFC 8863, ICE-PAC) expires with no valid pairs, or consent freshness silently dies on a previously working pair. Either path lands in `Failed`, and an ICE restart with a new `ufrag`/`pwd` pair takes you back to `Gathering`. STUN itself is request-response; TURN keeps a per-client `Allocation` data structure with a 600-second default lifetime; the rest of the state lives in the ICE agent.

### Reliability and security mechanics

STUN over UDP retransmits with an initial RTO of 500 milliseconds, doubling, with seven attempts and an Rm of 16 — total timeout around 39.5 seconds. Over TCP or TLS, there is no STUN-level retransmit and Ti defaults to 39.5 seconds.

Authentication has two flavours. Short-term credentials are exchanged out of band — ICE does this via SDP `ufrag`/`pwd`. Long-term credentials are TURN's mechanism: the client first sends with no auth, the server replies `401` with `REALM`, `NONCE`, and (in RFC 8489) `PASSWORD-ALGORITHMS`, and the client retries with `USERNAME` (or anonymised `USERHASH`), the chosen `PASSWORD-ALGORITHM`, and `MESSAGE-INTEGRITY-SHA256`. The "nonce cookie" is 13 bytes: the literal string `obMatJos2` plus 4 base64 characters of a 24-bit Security-Features bitmap, used to negotiate algorithm features and prevent bid-down attacks.

For confidentiality, STUN and TURN ride over (D)TLS on port 5349 — and in practice over TLS on 443 to punch through corporate firewalls. The media itself is separately encrypted by DTLS-SRTP (RFC 5764), so when a TURN relay is in the middle, your audio is doubly encrypted on the client-relay leg.

## Where it shows up in production

**Google's STUN fleet** runs at `stun.l.google.com` and `stun1` through `stun4`, anycast, free, baked into every default WebRTC sample. It is the most-used reflexive-address probe on the internet. Google's `libwebrtc` library — the ICE agent in Chrome — was 1.21 million lines of code by the end of 2018, roughly three times the Space Shuttle's primary flight software, per Justin Uberti's January 2019 tweet.

**Cloudflare Realtime TURN** went GA in late 2024 across 335+ anycast locations. Pricing is $0.05 per relayed gigabyte egress, with the first 1,000 gigabytes per month free, and the service is free entirely when paired with the Cloudflare SFU. It is the first credible challenger to Twilio's Network Traversal Service. Per-allocation guards rate-limit anything above 5 new IPs per second and 50 to 100 megabits per second, defending against TURN-as-open-proxy abuse. In 2024, Cloudflare partnered with Hugging Face to provide free TURN to FastRTC users.

**Tailscale** uses STUN-style probes to find a direct path between WireGuard peers and reports more than 90% direct-path success in their public engineering writeups. The remainder falls back to their proprietary DERP relays — "Designated Encrypted Relay for Packets" — which are philosophically equivalent to TURN but use WireGuard keys and HTTPS on port 443 rather than RFC 8656.

**Microsoft Teams, Discord voice, Apple FaceTime, Zoom Phone, WhatsApp voice, and Slack Huddles** all run their own ICE/STUN/TURN backbones. Microsoft Teams uses TURN behind Azure Front Door at the scale of hundreds of millions of users. Discord historically used Twilio TURN as one component supplemented with proprietary relays. Slack Huddles is WebRTC-based with a commercial TURN backplane. Apple, Zoom, and WhatsApp run closed-source relays with the same core algorithm.

**The open-source reference** is `coturn` — around 14k GitHub stars, the de facto Linux TURN binary, maintained by Pavel Mihály Mészáros ("misi") after Oleg Moskalenko's original `rfc5766-turn-server` work. It runs Jitsi Meet, Nextcloud Talk, Matrix Synapse, and uncountable in-house deployments. Non-browser ICE stacks worth knowing: Pion (Go), libnice, libjuice, Janus, mediasoup.

A useful operational number: Justin Uberti and Mozilla reported on `discuss-webrtc` in 2019 that 80–90% of WebRTC calls succeed on host or server-reflexive paths and never need TURN. The exception is public-cloud egress NATs — AWS NAT Gateway, default Azure NAT, and default GCP Cloud NAT all randomise source port per destination, which is the worst case for hole punching. Two peers behind cloud NATs almost never form a direct UDP path. Only GCP's Endpoint-Independent Mapping mode opts out.

## Things that go wrong

**The WebRTC IP-leak class incident, 2015 to 2019.** Sites used `RTCPeerConnection` purely to harvest host candidates — local LAN IPs and, for VPN users, the underlying ISP IP. The Mozilla tracking bug went back to 2014. Justin Uberti and Eric Rescorla wrote `draft-ietf-rtcweb-mdns-ice-candidates` with Apple, and Chrome rolled the mitigation out to 50% of users in M75 and fully in M76 in August 2019. Private IPs were replaced with per-origin `<UUID>.local` mDNS names.

The lesson was that the original WebRTC spec privileged "make calls work" over privacy. The fix taught a second lesson: third-party ICE stacks that did not know how to resolve mDNS candidates — notably Unreal Pixel Streaming and several commercial SFUs — saw call-setup regressions until they implemented peer-reflexive fallback. A privacy fix in one stack became a connectivity bug in everyone else's.

**`coturn` CVE-2020-26262, the loopback bypass.** Sandro Gauci's team at Enable Security found that `coturn`'s default loopback block applied only to `127.x.x.x`. Sending `CreatePermission` or `CONNECT` with `XOR-PEER-ADDRESS=0.0.0.0` routed packets to local services on the TURN host. So did `[::1]` and `[::]` on IPv6. Three forms of the same address, three loopback bypasses. Fixed in `coturn` 4.5.2 in January 2021.

The lesson played out a second time. Four years later, in 2024, a researcher tried `::ffff:127.0.0.1` — an IPv4 address embedded in an IPv6 — and found the original fix did not check `IN6_IS_ADDR_V4MAPPED`. Three functions in `src/client/ns_turn_ioaddr.c` (`ioa_addr_is_loopback`, `ioa_addr_is_zero`, `addr_less_eq`) needed updating. The second fix shipped in `coturn` 4.9.0. Loopback is not one address. It is an idea. Ideas are harder to filter than addresses.

**`coturn` CVE-2020-6061 / 6062, the admin-port DoS.** Cisco Talos found that a specially crafted HTTP POST to `coturn`'s admin web server caused either a heap out-of-bounds read (CVSS 7.0) or a NULL-pointer dereference (CVSS 5.9). Root cause: `strtok_r` returning NULL on an empty left split being fed to `strdup`. Fixed in `coturn` 4.5.1.x. Operational lesson: never expose `coturn`'s admin web port to the internet.

**The `coturn` nonce-predictability flaw, versions 4.6.2r5 through 4.7.0-r4.** A post-refactor regression replaced OpenSSL `RAND_bytes` with libc `random()` for nonces and port randomisation. Approximately 50 sequential unauthenticated `Allocate` requests were enough to reconstruct the RNG state, predict the next nonce, and authenticate while spoofing source IPs. Fixed in a subsequent 4.x release. The class of risk: never let TURN authentication entropy depend on stdlib RNG.

**TURN credential leaks in mobile apps.** A recurring class of incident, not a single one. Hard-coded TURN long-term credentials in shipped mobile apps get extracted with `apktool` or `Frida`, and then the relay becomes a free SOCKS-style proxy into your private network — the same threat model as CVE-2020-26262, but with the credentials handed to the attacker. The cure is short-lived credentials minted server-side per session via a REST API HMAC pattern, or third-party authorisation per RFC 7635.

**Tenable's WebRTC ICE port scan, 2019.** Jacob Baines showed that Chrome could be coerced into scanning the LAN by configuring 255 TURN URIs pointing at local addresses. The `icecandidateerror` events fired quickly enough on closed ports to enumerate them. Even client-side ICE has security surface.

**Cloud NAT as chronic symmetric NAT.** AWS, default Azure, and the default GCP Cloud NAT randomise source port per destination — exactly the worst case for hole punching. The result: any inter-cloud P2P scenario falls back to relays. For Tailscale, Discord, Teams, and similar P2P-leaning systems, this is the dominant blocker on direct-path success rates.

## Common pitfalls (for the practitioner)

**Hard-coding TURN credentials in mobile or desktop binaries.** Anyone with `apktool` extracts them in minutes and uses your relay as an open SOCKS-style proxy. Cure: short-lived credentials minted server-side per session (TURN REST API pattern — HMAC of `expiry:username` with a shared secret), or RFC 7635 third-party authorisation.

**Cloud NATs are symmetric — budget for relay traffic.** AWS, default Azure, and default GCP Cloud NAT all randomise source port per destination. Two peers behind cloud NATs almost never form a direct UDP path. Only GCP's Endpoint-Independent Mapping mode opts out. If either peer is in a public cloud, plan and pay for relayed bytes.

**Forgetting consent freshness.** RFC 7675 requires a Binding Indication every roughly 15 seconds, with the session declared dead after about 30 seconds of silence. A common bug: NAT bindings on aggressive home routers time out faster than the keepalive cadence, so the agent thinks data is flowing while the path is silently dead. Cure: tune the consent interval down, or fall back to relayed mode.

**Trusting the RFC 3489 NAT-type discovery tree.** "What kind of NAT am I behind?" was deprecated in 2008. Many production codebases still inherit it from old SIP stacks. Delete it. Real NATs lie, drift, and behave differently per peer.

**Putting `coturn`'s admin web port on a public IP.** Multiple CVEs make this dangerous. Bind to `127.0.0.1` and expose only via SSH tunnel.

**Permission-lifetime mismatches.** TURN permissions live for 5 minutes and are per peer IP, not per port. If you set them up once and never refresh, inbound packets stop arriving after 5 minutes and the failure is usually misdiagnosed as "the NAT closed."

**Not handling mDNS host candidates on the server side.** A non-browser ICE agent (Pion, libnice, gstreamer's `nicesrc`) needs to either resolve `*.local` via mDNS or fall back to peer-reflexive discovery. Otherwise connection rates from Chrome clients suffer.

## Debugging it

Wireshark display filters that pay rent immediately:

- `stun` — all STUN/TURN traffic, decoded with the built-in dissector.
- `stun.type == 0x0001` — Binding Requests.
- `stun.type == 0x0003` — TURN Allocate Requests.
- `stun.att.type == 0x0020` — only `XOR-MAPPED-ADDRESS` attributes.
- `udp.port == 3478` or `tcp.port == 5349` — default STUN/TURN ports cleartext or TLS.
- `stun.id == 0xa442b8d4...` — follow a single STUN transaction by its 96-bit ID.

CLI tools every ops engineer should know:

- `turnutils_stunclient stun.l.google.com` — the "hello world" of NAT traversal. Ships with `coturn`. Returns your public IPv4 and port.
- `turnutils_uclient -t -u user -w pass turn.example.com` — exercise a TURN allocation against your own server.
- `sudo tcpdump -nn -i en0 'udp port 3478'` — capture a live STUN flow.
- `chrome://webrtc-internals/` — what Chrome's ICE agent is doing right now: every candidate, every check, every state transition.
- Trickle ICE sample at `https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/` — paste your STUN/TURN config and watch candidates appear in real time.

In code, `iceTransportPolicy: 'relay'` on `RTCPeerConnection` discards host and srflx candidates and forces TURN-only — the single fastest way to validate that your TURN credentials, allowlists, and quotas are correct in CI.

Tunables that almost always need tuning. TURN allocation `LIFETIME` defaults to 600 seconds; refresh at 75% — every 450 seconds. On flaky cellular, drop to 300 with refresh at 200. STUN/ICE RTO defaults to 500 milliseconds; on a fast LAN, 100 milliseconds for connectivity checks gets a noticeably faster setup. Always include a `turns:turn.example.org:443?transport=tcp` URL — many corporate and hotel networks block 3478 UDP and 5349 TCP but pass 443 TCP.

OS knobs on Linux TURN servers: `net.core.rmem_max` and `wmem_max` at 16 MiB or higher on busy relays, `net.ipv4.udp_mem` raised proportionally, `nf_conntrack_udp_timeout_stream` at 180 seconds if there is a stateful firewall in front, `ulimit -n` at 65,535 or higher (a TURN allocation eats two file descriptors), and Reverse Path Filtering disabled if the host has multiple egress interfaces.

Operational metrics worth alerting on: TURN allocation success rate (alert under 99%), ICE connectivity-check success rate by candidate type, time-to-first-media and time-to-connected percentiles, and per-allocation packet rate against Cloudflare's conservative ceiling of 5 to 10 thousand packets per second and 50 to 100 megabits per second.

## What's changing in 2026

**January 2025 — iroh ships QUIC Address Discovery.** Number 0 / iroh moved from a STUN-only path to QUIC address discovery in production, exploiting the fact that QUIC and STUN can share a UDP socket because their top bits differ — QUIC long headers start with a 1, STUN's top two bits are zero. This is the strongest signal yet that `draft-seemann-quic-nat-traversal` and `draft-ietf-quic-address-discovery` are going to be real, and that QUIC's path validation and connection migration may eventually replace the STUN connectivity check entirely.

**December 2024 — `coturn` 4.9.0 closes the IPv4-mapped-IPv6 loopback bypass.** The fix for CVE-2020-26262 had checked `127.x.x.x` and `::1` but not `::ffff:127.0.0.1`. 4.9.0 hardens `ioa_addr_is_loopback` and friends. Anyone running `coturn` should be on this release or later.

**November 25, 2024 — Justin Uberti joins OpenAI to lead Real-Time AI.** After a decade as the architect of WebRTC at Google (Meet, Duo, Stadia), Uberti moved to OpenAI. The hire signals that the ICE/STUN/TURN stack is now load-bearing for low-latency voice agents, not just video calls — the same plumbing that ships your face on Google Meet now ships your voice into a GPT.

**September 2024 — Cloudflare Realtime TURN GA.** Cloudflare opened anycast TURN at `turn.cloudflare.com` across 335+ locations with $0.05/GB egress and 1,000 GB free per month — the first major price drop in managed NAT traversal in years. Free entirely when paired with Cloudflare's SFU. The first credible challenger to Twilio NTS in a decade.

**Ongoing — Tailscale's NAT-traversal-improvements series, 2024–2025.** Tailscale published a three-part public engineering series quantifying cloud-NAT pain (AWS NAT Gateway is "always symmetric"; default Azure is symmetric; default GCP offers Endpoint-Independent Mapping as opt-in). Internal direct-connection success rates are above 90% on the WireGuard-overlay model; cloud NATs are the dominant remaining blocker.

**MASQUE CONNECT-UDP (RFC 9298) is the structural alternative to TURN.** HTTP/3 tunnels for UDP datagrams that look exactly like normal HTTPS traffic. Cloudflare and Apple iCloud Private Relay already deploy MASQUE at scale. Expect commercial offerings positioning "TURN replacement via MASQUE" by 2027.

**Post-quantum (D)TLS for STUN/TURN control planes.** STUN-over-DTLS sits inside every WebRTC stack; the same hybrid PQ key-exchange work hardening web TLS (ML-KEM in TLS 1.3, in Chrome since 2024) applies directly. SCRAM-style password mechanisms with `MESSAGE-INTEGRITY-SHA256` provide a partial post-quantum defence against credential offline-attack, but pure HMAC is not a defence against record-now-decrypt-later. Plan to roll PQ-capable (D)TLS for any TURN deployment handling sensitive media before 2028.

## Fun facts (host material)

**The magic cookie spells "STUN" at the end of every packet.** STUN's `0x2112A442` is an IETF nod to the IP version field, but the `FINGERPRINT` attribute checksum is a CRC-32 XORed with `0x5354554E` — the ASCII bytes `S`, `T`, `U`, `N`. The protocol literally signs its own name on every packet. If you see that constant XOR-mixed with a CRC-32 in Wireshark, you are inside a STUN message.

**STUN changed what its own acronym means.** RFC 3489 in 2003 expanded STUN as "Simple Traversal of UDP through NATs" — a tool that classified NATs into four neat types: Full Cone, Restricted Cone, Port-Restricted Cone, and Symmetric. RFC 5389 in 2008 re-expanded the same letters as "Session Traversal Utilities for NAT" after Bryan Ford, Saikat Guha, and Paul Francis showed the four-flavours model was a myth — NATs lie, drift, and behave differently per peer. STUN became a toolkit, not a solution. Same letters. Very different scope.

**80 to 90% of WebRTC calls never need TURN.** Justin Uberti and Mozilla reported on `discuss-webrtc` in 2019 that 80–90% of calls succeed on host or server-reflexive paths. The reason, in Uberti's words: "TURN is expensive and lowers the quality of the call." Tailscale's mesh hits more than 90% direct as well. The exception is every cloud-default NAT — AWS, GCP, Azure — which is symmetric and forces relays.

**Jonathan Rosenberg is a top-10 RFC author of all time.** Counts vary by year and source — 56 RFCs in his Skype-era bio, around 70 to 71 in his Cisco bio. Always in the top 10. He is principal or co-author of SIP itself (RFC 3261), SDP offer/answer (RFC 3264), and every revision of STUN (3489, 5389, 8489), TURN (5766, 8656), and ICE (5245, 8445). He has been at Lucent, dynamicsoft, Cisco, Skype, back to Cisco, and since January 2019 is CTO and Head of AI at Five9.

**Bryan Ford's 2005 hole-punching paper measured 82% UDP and 64% TCP success across deployed NATs.** The work, with Pyda Srisuresh and Dan Kegel at USENIX ATC 2005, is the canonical academic NAT-traversal reference. It destroyed the four-flavours classification and, together with Saikat Guha and Paul Francis's IMC 2005 measurements, fed directly into the IETF BEHAVE-WG outputs (RFC 4787, 5382, 5508) that defined how to talk about real-world NAT behaviour.

**libwebrtc is roughly three times the size of the Space Shuttle's flight software.** Justin Uberti tweeted in January 2019 that Google's `webrtc.googlesource.com/src` repository was at 1.21 million lines of code, against roughly 400,000 for the Shuttle's primary flight software. And that is just the WebRTC library — before any JavaScript API or browser glue.

## Where this connects in the book

The dump lists no book chapters that reference NAT traversal directly. The story currently lives inside the protocol page itself; if a future chapter on the IPv4-exhaustion era, the SIP/VoIP wave, or the WebRTC redesign is added, this episode will hand off the historical narrative there and stay focused on mechanism, production, debugging, and what is changing in 2026.

## See also (other protocol episodes)

The dump has no formal vs/relationship comparison cards, but the natural cross-promo set is:

**The WebRTC episode.** WebRTC is the largest single consumer of the ICE/STUN/TURN stack — every browser ships a full ICE agent inside `RTCPeerConnection`, `iceServers` configures `stun:` and `turn:` URIs, and `iceTransportPolicy:'relay'` is the universal TURN-only debugging trick. If you have heard the WebRTC episode, NAT traversal is the substrate that makes the whole thing run on the actual internet.

**The SIP and SDP episodes.** SIP was the original carrier — ICE candidates ride as `a=candidate:` lines in SDP offer/answer, and SIP Outbound (RFC 5626) is a separate STUN usage that keeps a client-to-proxy flow open. Jonathan Rosenberg co-authored both SIP and STUN; the lineage is one engineer, two decades, the same fundamental problem.

**The QUIC episode.** QUIC's header was specifically designed to demultiplex from STUN on the same UDP socket — QUIC long headers start with a 1, STUN's top two bits are zero. iroh has shipped a STUN-to-QUIC address-discovery migration, and the IETF is actively working on QUIC NAT traversal. The long-term direction is folding NAT-traversal logic into the transport itself.

**The UDP and TCP episodes.** ICE prefers UDP because hole punching is reliable for UDP. TURN-TCP exists primarily because some firewalls drop UDP entirely, and TURN-over-TLS on port 443 is the practical fallback for hostile networks. The contrast with the UDP episode is everything: UDP is the medium NAT traversal was built for, TCP is the fallback the protocol grudgingly accommodates.

**The TLS episode.** STUN and TURN over (D)TLS provide confidentiality and integrity for the control channel. The media is separately encrypted by DTLS-SRTP (RFC 5764), so when TURN is in the middle, your audio is doubly encrypted on the client-relay leg.

**The DNS episode.** STUN URIs do SRV lookups (`_stun._udp.example.com`, default port 3478). TURN credentials are time-bound, so NTP skew matters too — a side cross-link to the NTP episode is appropriate.

**The IPv6 episode.** Modern STUN adds IPv6 support; the XOR-mapped-address encoding for IPv6 XORs against the magic cookie concatenated with the transaction ID. Chrome and Apple implement Happy Eyeballs–style ordering for ICE candidate pairs, so dual-stack hosts spend roughly half a second on IPv6-first attempts before IPv4 fallback.

## Visual cues for image generation

- **The three-protocol stack in one frame.** A probe icon labelled STUN with an arrow up to a public server, a relay icon labelled TURN with packets flowing through it, and an orchestrator icon labelled ICE coordinating both. Dependency arrows in the middle. Captioned "Probe, relay, orchestrator."
- **A candidate priority pyramid.** "host 126" at the apex in dark green, "peer-reflexive 110" below in lighter green, "server-reflexive 100" in yellow, "relay 0" at the wide red base. To the right, the actual ICE pair-priority formula `2^32 * min(G,D) + 2 * max(G,D) + (G>D?1:0)` in monospace.
- **Pricing comparison cards for managed NAT-traversal.** Google STUN labelled "free, anycast, port 19302" in blue; Cloudflare Realtime TURN labelled "$0.05/GB, 1,000 GB/month free, 335+ locations" in orange; Twilio NTS labelled "usage-based" in red; Tailscale DERP labelled "subscription-bundled" in purple. Caption: "Address discovery is cheap. Relayed bytes are not."
- **An annotated STUN Binding Success packet hex dump.** On a dark background: bytes `01 01 00 0c` (Binding Success, length 12) in cyan, `21 12 a4 42` (magic cookie) in yellow with the label "magic cookie 0x2112A442", then the 12-byte transaction ID in grey, then the `XOR-MAPPED-ADDRESS` attribute decoded to `198.51.100.7 : 55432` in green.
- **A symmetric-NAT failure scenario.** Alice in an AWS VPC on the left, Bob in an Azure VNet on the right, each behind a cloud NAT box randomising source ports. A red X over a dotted line attempting direct UDP. A solid green line routing through a TURN relay in the middle. Caption: "Two cloud peers almost never form a direct path."
- **The CVE-2020-26262 lesson as a flow diagram.** One inner box labelled "127.0.0.1 (blocked)", a second labelled "0.0.0.0 (bypass)", a third labelled "::1 (bypass)", a fourth labelled "::ffff:127.0.0.1 (bypass-of-the-fix, 2024)". All four arrows point to a server marked "TURN host loopback". Caption: "Loopback is an idea, not an address."

## Sources

**RFCs**

- [RFC 8489 — Session Traversal Utilities for NAT (STUN), 2020](https://www.rfc-editor.org/rfc/rfc8489.html)
- [RFC 8656 — Traversal Using Relays around NAT (TURN), 2020](https://www.rfc-editor.org/rfc/rfc8656.html)
- [RFC 8445 — Interactive Connectivity Establishment (ICE), 2018](https://www.rfc-editor.org/rfc/rfc8445.html)
- [RFC 8838 — Trickle ICE, 2021](https://datatracker.ietf.org/doc/rfc8838/)
- [RFC 8863 — ICE Patiently Awaiting Connectivity (ICE-PAC), 2021](https://datatracker.ietf.org/doc/rfc8863/)
- [RFC 7675 — STUN Usage for Consent Freshness, 2015](https://datatracker.ietf.org/doc/rfc7675/)
- [RFC 7635 — STUN Extension for Third-Party Authorization, 2015](https://datatracker.ietf.org/doc/rfc7635/)
- [RFC 7350 — DTLS as Transport for STUN, 2014](https://www.rfc-editor.org/rfc/rfc7350.html)
- [RFC 7065 — TURN URIs, 2013](https://datatracker.ietf.org/doc/rfc7065/)
- [RFC 7064 — STUN URI, 2013](https://www.rfc-editor.org/rfc/rfc7064.html)
- [RFC 6062 — TURN Extension for TCP Allocations, 2010](https://datatracker.ietf.org/doc/rfc6062/)
- [RFC 5780 — NAT Behavior Discovery Using STUN, 2010](https://datatracker.ietf.org/doc/rfc5780/)
- [RFC 5389 — Session Traversal Utilities for NAT (STUN), 2008](https://www.rfc-editor.org/rfc/rfc5389.html)
- [RFC 5128 — State of P2P Communication across NATs, 2008](https://datatracker.ietf.org/doc/rfc5128/)
- [RFC 4787 — NAT UDP Behavioral Requirements, 2007](https://datatracker.ietf.org/doc/rfc4787/)
- [RFC 3489 — STUN: Simple Traversal of UDP through NATs, 2003](https://datatracker.ietf.org/doc/html/rfc3489)
- [draft-seemann-quic-nat-traversal — Using QUIC to Traverse NATs](https://www.ietf.org/archive/id/draft-seemann-quic-nat-traversal-01.html)

**Papers**

- [Bryan Ford, Pyda Srisuresh, Dan Kegel — Peer-to-Peer Communication Across Network Address Translators, USENIX ATC 2005](https://www.usenix.org/legacy/event/usenix05/tech/general/full_papers/ford/ford.pdf)
- [Saikat Guha, Paul Francis — Characterization and Measurement of TCP Traversal Through NATs and Firewalls, IMC 2005](https://www.usenix.org/conference/imc-05/characterization-and-measurement-tcp-traversal-through-nats-and-firewalls)
- [Guha, Takeda, Francis — NUTSS: A SIP-Based Approach to UDP and TCP Network Connectivity, SIGCOMM FDNA 2004](https://www.cs.cornell.edu/people/francis/fdna02-guha1.pdf)

**Vendor and engineering blogs**

- [Cloudflare Realtime TURN docs](https://developers.cloudflare.com/realtime/turn/)
- [Cloudflare — Make your apps truly interactive with Cloudflare Realtime and RealtimeKit, 2025](https://blog.cloudflare.com/introducing-cloudflare-realtime-and-realtimekit/)
- [Cloudflare — Real-Time Communications at Scale, 2021](https://blog.cloudflare.com/announcing-our-real-time-communications-platform/)
- [Tailscale — How NAT traversal works (Dave Anderson)](https://tailscale.com/blog/how-nat-traversal-works)
- [Tailscale — How Tailscale is improving NAT traversal, part 1](https://tailscale.com/blog/nat-traversal-improvements-pt-1)
- [Tailscale — Improving NAT traversal, part 2: cloud environments](https://tailscale.com/blog/nat-traversal-improvements-pt-2-cloud-environments)
- [Tailscale — NAT traversal improvements, pt. 3: looking ahead](https://tailscale.com/blog/nat-traversal-improvements-pt3-looking-ahead)
- [iroh — Moving from STUN to QUIC Address Discovery](https://www.iroh.computer/blog/qad)
- [Marc Petit-Huguenin — On the Design of the STUN and TURN URI Formats](https://medium.com/@petithug/on-the-design-of-the-stun-and-turn-uri-formats-d8584f95c397)
- [Enable Security — Details about CVE-2020-26262](https://www.enablesecurity.com/blog/cve-2020-26262-bypass-of-coturns-access-control-protection/)
- [Enable Security — ES2021-01 advisory](https://www.enablesecurity.com/advisories/ES2021-01-coturn-access-control-bypass/)
- [Tenable Tech Blog — Using WebRTC ICE Servers for Port Scanning in Chrome (Jacob Baines, 2019)](https://medium.com/tenable-techblog/using-webrtc-ice-servers-for-port-scanning-in-chrome-ce17b19dd474)
- [BlogGeek.me — PSA: mDNS and .local ICE candidates are coming](https://bloggeek.me/psa-mdns-and-local-ice-candidates-are-coming/)
- [coturn 4.9.0 release notes](https://github.com/coturn/coturn/releases/tag/4.9.0)
- [Cloudflare Realtime TURN — Replacing existing TURN servers](https://developers.cloudflare.com/realtime/turn/replacing-existing/)

**News**

- [Justin Uberti on X — libwebrtc lines of code, January 2019](https://x.com/juberti/status/1083445783196663808)
- [Justin Uberti on X — joining OpenAI to lead Real-Time AI, November 2024](https://x.com/juberti/status/1861123495897465273)
- [PortSwigger Daily Swig — CoTURN patches denial-of-service and memory corruption flaws](https://portswigger.net/daily-swig/coturn-patches-denial-of-service-and-memory-corruption-flaws)
- [discuss-webrtc — Justin Uberti et al. on mDNS host candidate obfuscation](https://groups.google.com/g/discuss-webrtc/c/6stQXi72BEU)
- [NVD — CVE-2020-26262](https://nvd.nist.gov/vuln/detail/CVE-2020-26262)

**Wikipedia**

- [Wikipedia — STUN](https://en.wikipedia.org/wiki/STUN)
- [Wikipedia — Interactive Connectivity Establishment](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment)
- [Wikipedia — Jonathan Rosenberg (SIP author)](https://en.wikipedia.org/wiki/Jonathan_Rosenberg_(SIP_author))
- [Wikipedia — Justin Uberti](https://en.wikipedia.org/wiki/Justin_Uberti)
- [Wikipedia — Bryan Ford (computer scientist)](https://en.wikipedia.org/wiki/Bryan_Ford_(computer_scientist))
