---
id: wireguard
type: protocol
name: WireGuard
abbreviation: WG
etymology: "[W]ire[G]uard — the abbreviation lives in `wg(8)`, `wg-quick(8)`, and the `wg0` interface name"
category: utilities
year: 2016
rfc: null
standards_body: null
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [ipsec, udp, ip, ipv6, tls, nat-traversal, quic]
related_pioneers: [jason-donenfeld, trevor-perrin, avery-pennarun]
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Logo_of_WireGuard.svg/250px-Logo_of_WireGuard.svg.png
    caption: The WireGuard logo. The dragon-snake is inspired by a stone engraving of the mythological Python that Jason Donenfeld saw at a museum in Delphi. The serpent doubles as a quiet jab at IPsec's many heads.
    credit: Image — Wikimedia Commons / WireGuard
visual_cues:
  - "A side-by-side line-count bar chart. WireGuard's Linux kernel module at about 4,000 lines, OpenVPN's core at 100,000+, the IPsec stack — strongSwan plus Linux XFRM — at hundreds of thousands. Logarithmic x-axis. The WireGuard bar is so short it looks like a typo."
  - "The Noise_IKpsk2 handshake as a sequence diagram. Alice on the left, Bob on the right. Arrow one: 148-byte Handshake Initiation, with little call-outs for unencrypted ephemeral, encrypted static (AEAD), encrypted TAI64N timestamp, MAC1, MAC2. Arrow two: 92-byte Handshake Response, with the four DHs annotated underneath. Arrow three: first Transport Data — labelled 'implicit key confirmation'. Total wall-clock annotation: one round trip."
  - "Cryptokey routing as one trie. A radix tree where each leaf is an `AllowedIPs` prefix and each is colour-coded to its peer's Curve25519 public key. Two arrows leave the tree: one labelled 'outbound: pick the peer', one labelled 'inbound: drop if inner src not in this peer's prefixes'. Caption: 'One mechanism, both jobs — routing AND ACL.'"
  - "A 1500-byte Ethernet frame with WireGuard overhead stacked on top. From the outside in: outer IPv4 header (20 B, blue), UDP header (8 B, green), WireGuard header (16 B — type, receiver index, 64-bit counter — yellow), inner encrypted payload (grey, with a Poly1305 16-byte tag at the end in red). Inner MTU label on the right: 1440 for v4, 1420 for v6. Caption: 'About 4% inflation on a 1400-byte payload.'"
  - "A map of Russia in 2024. ISPs across the country light up one by one, week by week, each turning red as the TSPU box at that ISP learns to drop the fixed 148-byte handshake. Caption: 'Same crypto. Same code. Different fingerprint.' A second panel shows AmneziaWG's response: random junk bytes, randomised header types in H1–H4 ranges, optional QUIC mimicry."
  - "A two-panel diagram of Rosenpass running alongside WireGuard. Left panel: WireGuard's UDP tunnel, fast path. Right panel: Rosenpass daemon doing a Classic McEliece + Kyber key exchange every 120 seconds, then writing the result into WireGuard's PSK slot. Caption: 'No kernel patch. Post-quantum on the slow road, classical on the fast road.'"
---

# WG — WireGuard

## In one breath

WireGuard is a layer-3 secure tunnel that wraps IP packets inside UDP after a single round-trip handshake, using exactly one ciphersuite and exactly four message types. The whole Linux kernel module is about 4,000 lines of code — versus 100,000+ for OpenVPN's core and a six-figure footprint for the IPsec stack. If you have used Cloudflare WARP, a Tailscale node, NordVPN's NordLynx protocol, Mullvad, Mozilla VPN, or ProtonVPN in the last few years, your traffic has ridden over WireGuard.

## The pitch (cold-open)

In August 2018, Linus Torvalds — not a man famous for compliments — looked at four thousand lines of C from a stranger named Jason Donenfeld and called it *"a work of art."* Compared, he said, to *"the horrors that are OpenVPN and IPsec."* Eighteen months later, Linux 5.6 shipped with WireGuard built in. Today it runs on tens of millions of devices, has been formally verified four times by four different teams in four different proof assistants, and was deliberately never standardised by the IETF. And then, in 2024, Russian censors finally figured out how to block it — not by breaking the crypto, but by noticing that every WireGuard handshake is exactly 148 bytes long.

## How it actually works

The whole protocol is six steps. We will walk them in order, from the moment a peer comes up to the rekey 120 seconds later.

**Step one. Identity is the public key.** Each peer holds one 32-byte Curve25519 keypair. There are no certificates, no PKI, no usernames. The public key is the identity. You exchange them out of band — over `scp`, GitHub, or a Tailscale control plane — and that is the entire trust setup.

**Step two. The Handshake Initiation.** The initiator sends one 148-byte UDP packet of type 1. Inside: a 32-byte ephemeral Curve25519 public key in the clear, a 48-byte AEAD-encrypted copy of the initiator's static public key (so passive observers cannot see who is calling), a 28-byte AEAD-encrypted TAI64N timestamp (the responder remembers the highest timestamp per peer and drops replays), then two 16-byte MACs. MAC1 proves the sender knows the responder's public key — without it the responder allocates no state at all. MAC2 is zero unless the responder is under load and has issued a cookie.

**Step three. The Handshake Response.** The responder sends one 92-byte type-2 packet — its own ephemeral public key, a 16-byte encrypted-empty AEAD ciphertext that proves key agreement, and the same MAC1/MAC2 pair. By the end of this round trip both sides have completed four Diffie-Hellman exchanges (the Noise_IK pattern, plus an optional pre-shared key mix), derived matching ChaCha20-Poly1305 sending and receiving keys, and wiped every ephemeral and chaining value from memory.

**Step four. Cryptokey routing.** Each `[Peer]` block in the config has an `AllowedIPs` field — a list of inner-IP prefixes. That single field is simultaneously the outbound routing table (which peer for which destination prefix) and the inbound ACL (drop the packet if the decrypted inner source IP is not in this peer's prefixes). One mechanism, both jobs. This is the design idea Donenfeld is proudest of. It replaces the SPDs, IKE selectors, and route policies that make up half an IPsec admin's mental model.

**Step five. Transport Data.** Every payload packet is a type-4 message: 16 bytes of WireGuard header (type, receiver index, 64-bit counter) wrapping a ChaCha20-Poly1305 ciphertext of the inner IP packet, with a 16-byte Poly1305 tag. The 64-bit counter is the AEAD nonce *and* the anti-replay sequence number — same number, two jobs. Each direction has its own key and its own counter; the receiver keeps a sliding window of about 2,000 entries to spot replays.

**Step six. Rekey every 120 seconds.** `REKEY_AFTER_TIME` is 120 seconds. `REKEY_AFTER_MESSAGES` is 2^60. Whichever fires first, the initiator triggers a fresh handshake with brand-new ephemerals; the prior session keys are wiped. After 180 seconds of total silence (`REJECT_AFTER_TIME`) the session is torn down. The application sees nothing — packets just keep flowing.

### Header at a glance

Four message types, each on UDP port 51820 by default:

- **Type 1 — Handshake Initiation, 148 bytes.** Type byte, three reserved bytes, 4-byte sender index, 32-byte unencrypted ephemeral, 48-byte encrypted static, 28-byte encrypted TAI64N timestamp, 16-byte MAC1, 16-byte MAC2.
- **Type 2 — Handshake Response, 92 bytes.** Type byte, three reserved, 4-byte sender index, 4-byte receiver index, 32-byte unencrypted ephemeral, 16-byte encrypted-empty ciphertext, MAC1, MAC2.
- **Type 3 — Cookie Reply, 64 bytes.** Sent only when the responder is under load. Carries an XChaCha20-Poly1305 encrypted cookie keyed off the sender's outer IP and a 24-byte nonce. The next handshake from that sender must include MAC2 keyed by this cookie.
- **Type 4 — Transport Data, variable.** Type, three reserved, 4-byte receiver index, 8-byte counter, then the AEAD ciphertext padded to a 16-byte multiple, then the Poly1305 tag.

The whole construction string baked into every implementation is the literal UTF-8 `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s` — 37 bytes. There is no version field. There is no algorithm-negotiation field. If WireGuard ever changes ciphersuite, it will be a new packet format and a deprecation cycle, not a runtime negotiation.

### State machine in three sentences

A peer is Closed until it sends a Handshake Initiation, at which point it is in HandshakeInitSent; if it gets a Cookie Reply it resends with MAC2, otherwise it waits for the Handshake Response and moves to HandshakeRespReceived. The transition to Established happens not on receipt of the response but on the first successful Transport Data exchange — that is the implicit key confirmation, and until it arrives the responder refuses to send. Every 120 seconds the initiator drops back to HandshakeInitSent for a fresh handshake, and after 180 seconds with no traffic in either direction the session goes back to Closed.

### Reliability, security, and DoS mechanics

WireGuard does not guarantee delivery or ordering — it is a datagram tunnel, not a stream. What it does guarantee is freshness and forward secrecy. The 64-bit counter never wraps under the rekey limits, so AEAD nonces never repeat under the same key. Forward secrecy is two-layer: per-message inside a session (because counters are unique) and per-handshake across sessions (because ephemerals are wiped after step three).

The DoS shield has two parts. Until MAC1 verifies, the responder allocates exactly zero memory — it just hashes the packet prefix and compares. If CPU contention crosses a threshold, the responder additionally requires MAC2 keyed off a freshly minted cookie that proves the sender owns the IP it claims to be at. And — this is the part nmap operators hate — if any check fails, WireGuard silently drops. No reply, no log line. The whitepaper puts it bluntly: the server is *"silent and invisible"* to unauthorised clients.

The optional pre-shared key slot is post-quantum hedge insurance. Mix a 32-byte symmetric secret into the chaining key during the handshake and you get hybrid security — even if Curve25519 falls to a quantum adversary tomorrow, an attacker also needs the PSK. This is exactly the slot Rosenpass uses.

## Where it shows up in production

**Cloudflare WARP — millions of consumer devices.** Cloudflare's consumer VPN — the WARP app paired with the 1.1.1.1 resolver — runs on **BoringTun**, Cloudflare's pure-Rust userspace WireGuard implementation. They open-sourced it in 2019. The BoringTun README's qualitative claim is *"successfully deployed on millions of iOS and Android consumer devices as well as thousands of Cloudflare Linux servers"*; widely cited "tens of millions of daily active devices" figures circulate but Cloudflare has not officially restated a current DAU number. WARP for Windows reached general availability on 13 January 2026. WARP also lets users pick MASQUE as an alternative tunnel protocol — more on that later.

**Tailscale — over 10,000 paying business customers.** Tailscale is mesh networking on top of WireGuard. Founded in 2019 by Avery Pennarun, David Crawshaw, and David Carney; Brad Fitzpatrick joined three days after announcing his exit from Google in January 2020. The control plane handles key exchange, NAT-traversal coordination via STUN-style hole-punching with a TLS-relay fallback they call DERP, and ACL-style "tailnet" policy. As of January 2025 they crossed 10,000 paying business clients — Mistral, Hugging Face, Cohere, Duolingo, Instacart among them — and over 500,000 weekly-active users, doubling their customer base in ten months. Their Series C closed April 2025: $160 million at a $1.45 billion post-money valuation. Roughly $45 million ARR, 250 employees, and they acquired Border0 in March 2026. The single biggest reason an engineering team encounters WireGuard in 2026 is via Tailscale, not via raw `wg-quick`.

**NordVPN NordLynx — millions of consumers.** NordVPN's flagship protocol since 2019. NordLynx wraps WireGuard in a custom double-NAT layer to solve a real problem with vanilla WireGuard: every peer gets a static inner IP by design, which is fine for site-to-site but useless for a VPN service that wants to assign per-session addresses. NordVPN does this in userspace. They added a post-quantum encryption layer on top of NordLynx in 2025. Their public marketing leans hard on the 4,000-line versus 100,000-line comparison.

**Mullvad — first commercial WireGuard provider.** Co-founder Fredrik Strömberg discovered WireGuard in summer 2016 and stood up the first public Mullvad WireGuard test server in early 2017. Mullvad funds upstream WireGuard development and is the default protocol on macOS, Linux, iOS, and Android. Mozilla VPN is white-labelled Mullvad. Mullvad partnered with Tailscale in September 2023 to provide exit-node coverage. They also ship WireGuard-over-TCP wrappers for hostile public Wi-Fi where UDP is blocked.

**Linux kernel mainline — every modern distribution.** WireGuard was mainlined in Linux 5.6 on 29 March 2020. About 4,000 lines of C in `drivers/net/wireguard/`. Available baseline in Debian, Ubuntu, Fedora, RHEL, Arch, openSUSE, Alpine. The kernel module is the canonical implementation; everything else — BoringTun, wireguard-go, wireguard-rs — is a userspace fallback for platforms without kernel access.

**The self-hosted long tail.** OPNsense and pfSense Community Edition since June 2021. IPFire mainlined kernel-WireGuard in June 2025 — one of the last firewall holdouts. Headscale is an open-source re-implementation of the Tailscale control plane. Algo VPN is Trail of Bits' opinionated single-script personal-VPN deployer. AVM Fritz!Box consumer routers ship WireGuard from FRITZ!OS 7.50. ProtonVPN, IVPN, and Surfshark all offer WireGuard tunnels.

## Things that go wrong

**Russian and Iranian DPI blocking, 2022 through 2025.** WireGuard's wire format is trivially fingerprintable. Handshake-init is always 148 bytes. Handshake-response is always 92 bytes. The type byte is always 1, 2, 3, or 4. Russia's TSPU boxes — *Technical Means of Countering Threats*, installed at every major ISP — learned to identify and silently drop WireGuard handshakes. As one operator put it: *"Through most of 2024, my WireGuard tunnels worked fine. Then they started dropping — not all at once, but ISP by ISP, week by week. Handshakes just stopped completing. No error, no timeout — the packets simply vanished."* The response was AmneziaWG, a fork from Russia's Amnezia VPN team. It randomises the junk bytes before the handshake, randomises the message-type integers as ranges H1–H4 instead of fixed 1–4, and adds random S1/S2 padding. AmneziaWG 2.0 in late 2025 went further with optional QUIC/DNS protocol mimicry. The crypto core is unchanged — it is still Noise_IKpsk2 with Curve25519 and ChaCha20-Poly1305 — only the framing differs. Late-2025 scale: the AmneziaWG Android client alone has over 500,000 Google Play downloads. ProtonVPN now ships AmneziaWG configs for Russian users. This is the canonical real-world failure of Donenfeld's "no obfuscation" stance.

**FreeBSD 13.0 pulled WireGuard in March 2021.** The FreeBSD port was imported on 29 November 2020. It was pulled from FreeBSD 13.0 in March 2021 after Donenfeld's emergency code review found multiple security and correctness issues that *"could not be completed quickly."* pfSense Community Edition 2.5.0 and pfSense Plus 21.02 had to remove it too. The package was rewritten by community member Christian McDonald, sponsored by Netgate, and restored in May 2021. Root cause: a downstream port that drifted from the in-tree Linux reference without adequate review. The lesson the industry took: even with a small, audit-friendly protocol, a sloppy reimplementation will burn you.

**The Dowling and Paterson identity-hiding gap, January 2018.** A formal cryptographic analysis by Benjamin Dowling and Kenny Paterson (ePrint 2018/080, ACNS 2018) found that, treated as a key-exchange protocol in isolation, WireGuard's first two messages do not meet the standard "key-indistinguishability after key exchange" definition. The reason: the key-confirmation step *is* the first encrypted data packet, so the session key is in use before any clean separation point. Their fix — for the proof, not the protocol — was to add a synthetic third message. This is not an attack. It is documentation that the original whitepaper's KCI argument had a subtle gap.

**The 2024 NDSS unified analysis anonymity flaw.** Bellet et al., *A Unified Symbolic Analysis of WireGuard*, NDSS 2024. The first paper to reconcile prior analyses of WireGuard in a single symbolic model across SAPIC+, ProVerif, and Tamarin. It confirmed an anonymity flaw and pointed to *"an implementation choice which considerably weakens"* the protocol's identity-hiding guarantee. The exact implementation flaw is in the body of the paper, not the abstract. Worth tracking for whatever Donenfeld's response will be — and for any v2 work.

**CVE-2021-46873 — the kill-packet state-disruption attack.** Documented by the Rosenpass team. By setting a system clock to a future date, an attacker can trick the initiator into generating a "kill packet" that inhibits future handshakes without needing any privileged access. The static keypair effectively becomes useless. The vector exists because many systems run NTP without authentication. Rosenpass's protocol explicitly adds cookies to defeat this class of attack — one of the reasons the project exists.

**The Wintun era on Windows, 2020 through 2021.** Early Windows WireGuard releases shipped against the OpenVPN-era TAP-Windows driver, which had a history of bluescreen-class bugs. Donenfeld wrote a new userspace tunnel driver, **Wintun**, signed by Microsoft. In August 2021 the native Windows kernel implementation **wireguard-nt** shipped, finally moving WireGuard fully into the NT kernel and matching BoringTun's throughput. Pre-2021 "WireGuard on Windows" was wireguard-go plus Wintun — slow. Post-2021 it is wireguard-nt — fast.

## Common pitfalls (for the practitioner)

**`AllowedIPs` is your routing table AND your ACL.** A single field on each peer does both jobs. If a peer is supposed to be a remote subnet, put the subnet in `AllowedIPs`. If it is a single road-warrior laptop, put just its `/32`. If it is your "send all my traffic through the VPN" exit node, use `0.0.0.0/0, ::/0` — and remember to add `PostUp` rules for masquerading. On Linux `wg-quick` reads `AllowedIPs` and installs matching routes; if you set `Table = off` to skip kernel route management, you must install routes yourself. The single most common config bug is forgetting one half of the routing/ACL coupling.

**No dynamic IPs out of the box.** Vanilla WireGuard refuses to do DNS lookups on `Endpoint =`. The kernel module is keep-it-simple — there is no resolver in there. `wg-quick(8)` resolves hostnames at interface-up time only. If your peer's ISP reboots them and they get a new outer IP, the tunnel sits dead until something refreshes the endpoint. The fix for road-warriors: have the dynamic peer connect *out* to a fixed endpoint and use `PersistentKeepalive` to hold the NAT binding warm. For dynamic-IP servers, run `reresolve-dns.timer` — Donenfeld's own systemd timer that periodically re-resolves `Endpoint =`.

**`PersistentKeepalive` is off by default.** Behind NAT, set it to 25 seconds on at least one side. NAT tables typically evict idle UDP four-tuples after 30 seconds. If both sides are behind NAT and neither sets keepalive, the tunnel will stall the moment a mapping expires.

**MTU 1420 unconditionally.** WireGuard adds 60 bytes of overhead on IPv4 paths and 80 bytes on IPv6. So inner MTU is 1500 minus 60 = 1440 for v4, 1500 minus 80 = 1420 for v6. `wg-quick` installs 1420 unconditionally so the same interface works on either family without PMTUD black-holes. When you see "tunnel works fine for SSH but breaks on large HTTPS downloads," you are almost always looking at MTU misconfiguration plus a path that drops *Fragmentation Needed* ICMP.

**DPI-resistance is not in the protocol.** If you operate from or to a censorious network, vanilla WireGuard's invariant 148-byte and 92-byte handshakes are a liability. Deploy AmneziaWG, or fall back to MASQUE CONNECT-IP over HTTP/3.

## Debugging it

**Three Wireshark and tcpdump filters every WireGuard admin should know.** First, `udp.port == 51820` — the canonical default port. Useful but not exhaustive: WARP, NordLynx, and Mullvad commonly use non-default ports. Second, the `wg` dissector — Wireshark's built-in WireGuard parser, added in Wireshark 3.0 in 2019. With the right key log it parses the type byte, sender and receiver indices, counter, and the inner packet. Third, `udp port 51820 and len > 100` in tcpdump syntax — a quick way to grab Handshake Initiations (148 bytes) while ignoring keepalives (32 bytes of empty Transport Data).

The reader caveat: beyond the first byte, every WireGuard packet body is either an X25519 group element (handshake) or AEAD ciphertext plus Poly1305 tag (data). Without keys, DPI sees structureless random bytes. This is the property that hides your payload from the network — and the property that lets a censor spot WireGuard's distinctive fixed-size envelope.

**Tooling.** `wg(8)` is the low-level command — show and set peers, keys, and `AllowedIPs`. `wg-quick(8)` is the high-level wrapper that reads `/etc/wireguard/wg0.conf` and runs `ip link / addr / route` for you. `wg syncconf wg0 <(wg-quick strip wg0)` does atomic reconfiguration without bringing the interface down. `wgcf` generates WireGuard configs for Cloudflare WARP. `wg-easy` is a small web UI for personal deployments. `wg show` is the universal status command — it tells you the public key, the listening port, each peer's endpoint, last-handshake time, and per-peer transfer counters.

**Throughput expectations.** In-kernel Linux on commodity hardware does multi-Gbps, often above 10 Gbps on AVX2-capable x86_64 with the in-kernel `chacha20-poly1305-x86_64` path. BoringTun in Rust userspace does 1.5 to 3 Gbps. wireguard-go does 1 to 2 Gbps. The kernel module wins because it can do crypto on the SKB without leaving kernel context. On Windows, the August 2021 wireguard-nt closed the gap — pre-2021 you were on wireguard-go plus Wintun and it was slower.

## What's changing in 2026

**March 2026 — Tailscale acquired Border0.** Continuing the consolidation around mesh-VPN identity and ACL primitives.

**13 January 2026 — Cloudflare WARP for Windows reaches general availability.** Same WARP client, now first-class on Windows. WARP also exposes MASQUE as an alternative tunnel protocol; the docs spell out 1330–1350 byte MSS for MASQUE versus 1340–1360 for WireGuard.

**January 2026 — Iran International reports WireGuard use during the 2026 Iran protests, "albeit with limited success."** The cat-and-mouse with state DPI continues.

**Late 2025 — AmneziaWG 2.0 ships dynamic header ranges and QUIC/DNS mimicry.** The H1–H4 type bytes are now ranges instead of fixed values, defeating signature databases. The crypto core stays bit-identical to WireGuard.

**June 2025 — IPFire adds WireGuard support using the Linux kernel implementation.** One of the last firewall holdouts.

**2025 — NordVPN adds post-quantum encryption on top of NordLynx.** They appear to have implemented their own hybrid PQ layer rather than adopting Rosenpass.

**April 2025 — Tailscale closes its Series C: $160 million at $1.45 billion post-money.** Total funding $275 million. Roughly $45 million ARR, 250 employees.

**January 2025 — Tailscale crosses 10,000 paying business clients.** Doubled the customer base in ten months. Over 500,000 weekly-active users.

**April 2024 — Rosenpass 1.0 ships.** Andreas Hülsing's group at TU/e with Karolin Varner. A pure-Rust daemon that runs alongside WireGuard, performs a Classic McEliece + Kyber key exchange every 120 seconds, and feeds the resulting symmetric key into WireGuard's existing PSK slot. Formally verified in ProVerif. Closes the harvest-now-decrypt-later threat without changing the kernel module.

**February 2024 — NDSS paper "A Unified Symbolic Analysis of WireGuard" by Bellet et al.** Confirmed an anonymity flaw and flagged an implementation choice that weakens security. Worth watching for Donenfeld's response.

**November 2023 — Germany's Sovereign Tech Fund granted Edge Security over €209,000.** Donenfeld's company is now well-funded — the project joins the Open Technology Fund, NLnet, Mullvad, Tailscale, Jump Trading, and Fly.io as steady backers. A meaningful change from the single-maintainer hobbyist days of 2016 through 2018.

## Fun facts (host material)

**The "4,000 lines of code" claim is in the whitepaper itself.** From Donenfeld's NDSS 2017 paper: *"WireGuard can be simply implemented for Linux in less than 4,000 lines of code, making it easily audited and verified."* For comparison, OpenVPN's core (not counting OpenSSL) is north of 100,000 lines, and the equivalent Linux IPsec stack — XFRM plus strongSwan plus libraries — is in the six digits. The order of magnitude has not changed in the nine years since. NordVPN's marketing leans on it. So does every Mullvad blog post. It is the single most-cited number in WireGuard literature.

**Linus called it "a work of art."** On 2 August 2018, in a postscript to a Linux 4.18 networking pull-request acknowledgement on LKML, Torvalds wrote: *"I see that Jason actually made the pull request to have wireguard included in the kernel. Can I just once again state my love for it and hope it gets merged soon? Maybe the code isn't perfect, but I've skimmed it, and compared to the horrors that are OpenVPN and IPsec, it's a work of art."* Phoronix reported it on 3 August. LWN's Jonathan Corbet analysed it on the 6th. It took another nineteen months to actually merge — Linux 5.6 in March 2020 — but the endorsement set the trajectory.

**No IETF RFC, by design.** Donenfeld on the *Security Cryptography Whatever* podcast in December 2021: *"I have a very low opinion of internet standards, cryptography and internet standards… WireGuard is one of the first times in my career I've seen something get this much adoption without having to get through the filter of the IETF. I worry that publishing an RFC might send the wrong message where — oh, it sends the right bits on the wire, it's done — that's not good enough."* There is no WireGuard RFC. There is RFC 8922 from 2020, which describes WireGuard externally for the IETF's Transport Services document, but it is not normative.

**The logo is a snake from Delphi.** The dragon-snake is inspired by a stone engraving of the mythological Python that Donenfeld saw at a museum in Delphi, Greece. The serpent doubles as a quiet visual jab at IPsec — many heads, one body.

**Tailscale was named after a Google paper.** "The Tail at Scale," Google 2013, on long-tail latency in distributed systems. The product's architecture is explicitly Google BeyondCorp plus WireGuard. Co-founder Brad Fitzpatrick announced his exit from Google in January 2020 and joined Tailscale three days later. He had previously built LiveJournal, memcached, and OpenID, and spent a decade on the Go language team.

**"Amnezia" is the Russian transliteration of "amnesia."** The parent VPN circumvention project is named to make the censor *forget* your packets exist. AmneziaWG is the WireGuard fork inside that project. In late 2024, Russia's Roskomnadzor blocked over 197 commercial VPN services — that is the catalyst.

## Where this connects in the book

The dump records no book chapters that reference WireGuard. There are no chapter episodes to compress to here.

## See also (other protocol episodes)

**The IPsec episode is the one to listen to right after this one.** WireGuard's whitepaper opens with "aims to replace both IPsec for most use cases." The honest scorecard: IPsec wins on algorithmic agility, the carrier and SD-WAN ecosystem, and regulatory acceptance — FIPS, Common Criteria, NIST validation. WireGuard wins on code surface (about 4,000 lines versus hundreds of thousands), audit cost (tractable in an afternoon versus hard), configuration model (one `.conf` file versus the SPD/SAD/IKE policy soup), and mobility — any authenticated packet updates a peer's endpoint, where IPsec only gets partial roaming via MOBIKE.

**The UDP episode is the substrate everything in this story sits on.** WireGuard speaks UDP and only UDP. No TCP, no QUIC. That is how it gets multi-Gbps in-kernel performance and survives NAT — every reply comes from the same outer source-IP and port the peer just sent to. It is also the reason public Wi-Fi networks that block UDP break WireGuard, and the reason Mullvad ships a WireGuard-over-TCP wrapper.

**The QUIC episode covers the tunnel protocol that may eventually displace WireGuard on hostile networks.** RFC 9484 — CONNECT-IP, also known as MASQUE — tunnels IP packets inside QUIC. Cloudflare WARP already lets users pick MASQUE as an alternative to WireGuard. The trade-off is real: MASQUE looks indistinguishable from a regular HTTPS connection and is invisible to a TSPU box, but you pay in head-of-line blocking, more overhead, and TCP-like loss behaviour. Expect Cloudflare and Tailscale-adjacent products to ship MASQUE-as-fallback over the next two years.

**The TLS episode covers the per-stream alternative.** TLS is per-TCP-stream and provides ordered, reliable, encrypted bytes — it is what every "SSL VPN" actually rides. WireGuard is per-UDP-packet, layer 3, and explicitly does not guarantee delivery or ordering. The right framing for the comparison is not "secure tunnel versus secure tunnel" but "transport security versus datagram tunnel."

**The IP and IPv6 episodes cover what WireGuard tunnels.** WireGuard is layer 3 — what travels inside the encrypted UDP datagram is a complete inner IP packet. The same WireGuard interface carries both IPv4 and IPv6 inner traffic, which is why `wg-quick` defaults to MTU 1420 unconditionally — pessimistic for v4, exact for v6.

**The NAT-traversal episode covers the layer Tailscale and NordVPN add on top.** Vanilla WireGuard does not traverse symmetric NATs by itself. Tailscale layers STUN-based binding discovery, hole-punching, and a TLS-relay fallback called DERP — "Designated Encrypted Relay for Packets" — which behaves like TURN. NordVPN's Meshnet uses an in-tunnel "WG-STUN" trick to discover NAT translations without breaking WireGuard's privacy guarantees. This is the secret sauce most consumer mesh-VPN products add on top of the bare WireGuard primitive.

## Visual cues for image generation

- A side-by-side line-count bar chart with a logarithmic x-axis. WireGuard's Linux kernel module at about 4,000 lines, OpenVPN's core at 100,000+, the IPsec stack at hundreds of thousands. The WireGuard bar is so short it looks like a typo. Caption: *"The single most-cited number in WireGuard literature."*
- The Noise_IKpsk2 handshake as a sequence diagram. Alice on the left, Bob on the right. Arrow one: 148-byte Handshake Initiation, with call-outs for unencrypted ephemeral, AEAD-encrypted static, AEAD-encrypted TAI64N timestamp, MAC1, MAC2. Arrow two: 92-byte Handshake Response, with the four DHs annotated underneath. Arrow three: first Transport Data labelled *"implicit key confirmation."* Total wall-clock annotation: one round trip.
- Cryptokey routing as one trie. A radix tree where each leaf is an `AllowedIPs` prefix, colour-coded to a peer's Curve25519 public key. Two arrows leave the tree: one *"outbound: pick the peer,"* one *"inbound: drop if inner src not in this peer's prefixes."* Caption: *"One mechanism, both jobs."*
- A 1500-byte Ethernet frame with WireGuard overhead stacked on top. Outer IPv4 header (20 B), UDP header (8 B), WireGuard header (16 B — type, receiver index, 64-bit counter), inner encrypted payload, 16-byte Poly1305 tag at the end. Inner MTU label: 1440 for v4, 1420 for v6. Caption: *"About 4% inflation on a 1400-byte payload."*
- A map of Russia in 2024. ISPs across the country light up red one by one, week by week, each turning red as the local TSPU box learns to drop the fixed 148-byte handshake. A second panel shows AmneziaWG's response: random junk bytes, randomised header types in H1–H4 ranges, optional QUIC mimicry. Caption: *"Same crypto. Same code. Different fingerprint."*
- A two-panel diagram of Rosenpass running alongside WireGuard. Left panel: WireGuard's UDP tunnel as the fast path. Right panel: Rosenpass daemon doing a Classic McEliece + Kyber key exchange every 120 seconds, then writing the result into WireGuard's PSK slot. Caption: *"No kernel patch. Post-quantum on the slow road, classical on the fast road."*

## Sources

**Papers**

- [Donenfeld 2017 — *WireGuard: Next Generation Kernel Network Tunnel*, NDSS](https://www.wireguard.com/papers/wireguard.pdf)
- [Donenfeld and Milner 2018 — *Formal Verification of the WireGuard Protocol* (Tamarin)](https://www.wireguard.com/papers/wireguard-formal-verification.pdf)
- [Dowling and Paterson 2018 — *A Cryptographic Analysis of the WireGuard Protocol*, ACNS](https://eprint.iacr.org/2018/080)
- [Bellet et al. 2024 — *A Unified Symbolic Analysis of WireGuard*, NDSS](https://www.ndss-symposium.org/wp-content/uploads/2024-364-paper.pdf)
- [Hülsing, Ning, Schwabe, Weber, Zimmermann 2020 — *Post-Quantum WireGuard*](https://eprint.iacr.org/2020/379)
- [Rosenpass whitepaper](https://rosenpass.eu/whitepaper.pdf)
- [Noise Protocol Framework spec](https://noiseprotocol.org/noise.pdf)

**Vendor and engineering blogs**

- [WireGuard official protocol page](https://www.wireguard.com/protocol/)
- [WireGuard formal verification page](https://www.wireguard.com/formal-verification/)
- [Cloudflare — *BoringTun, a userspace WireGuard implementation in Rust*](https://blog.cloudflare.com/boringtun-userspace-wireguard-rust/)
- [Cloudflare WARP download docs (MTU and protocol selection)](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/)
- [Cloudflare changelog — WARP for Windows GA, 13 Jan 2026](https://developers.cloudflare.com/changelog/post/2026-01-13-warp-windows-ga/)
- [NordVPN — NordLynx protocol page](https://nordvpn.com/blog/nordlynx-protocol-wireguard/)
- [NordVPN — *How we achieved NAT traversal with WireGuard*](https://nordvpn.com/blog/achieving-nat-traversal-with-wireguard/)
- [Mullvad — *WireGuard is the future*, 2017](https://mullvad.net/en/blog/wireguard-future)
- [Mullvad — *Why WireGuard?*](https://mullvad.net/en/help/why-wireguard)
- [Mullvad — *Introducing WireGuard over TCP and IPv6*](https://mullvad.net/en/blog/introducing-wireguard-over-tcp-and-ipv6)
- [Rosenpass project](https://rosenpass.eu/)
- [AmneziaWG documentation](https://docs.amnezia.org/documentation/amnezia-wg/)
- [AmneziaWG 2.0 self-host write-up](https://dev.to/bivlked/amneziawg-20-self-host-an-obfuscated-wireguard-vpn-that-bypasses-dpi-4692)

**News**

- [Phoronix — *Linus Torvalds Likes The WireGuard VPN*, 3 Aug 2018](https://phoronix.com/news/Linus-Likes-WireGuard)
- [LWN — *WireGuarding the mainline*, 6 Aug 2018](https://lwn.net/Articles/761939/)
- [Kernel Newbies — Linux 5.6 release notes, 29 Mar 2020](https://kernelnewbies.org/Linux_5.6)
- [The Register — *WireGuard VPN protocol mainlined into Linux*, 8 Dec 2021](https://www.theregister.com/2021/12/08/wireguard_linux/)
- [Security Cryptography Whatever podcast — *WireGuard with Jason Donenfeld*, Dec 2021](https://securitycryptographywhatever.com/2021/12/05/wireguard-with-jason-donenfeld/)
- [BetaKit — *Tailscale hits 10,000 paid business clients*, Jan 2025](https://betakit.com/tailscale-hits-10000-paying-customers-as-it-pushes-into-broader-go-to-market-fit/)
- [BetaKit — Tailscale Series C coverage, Apr 2025](https://betakit.com/corporate-vpn-startup-tailscale-secures-230-million-cad-series-c-on-back-of-surprising-growth/)

**Wikipedia**

- [Wikipedia — WireGuard](https://en.wikipedia.org/wiki/WireGuard)
- [Wikipedia — Tailscale](https://en.wikipedia.org/wiki/Tailscale)
- [Wikipedia — Brad Fitzpatrick](https://en.wikipedia.org/wiki/Brad_Fitzpatrick)
- [Wikipedia — Jason A. Donenfeld](https://en.wikipedia.org/wiki/Jason_A._Donenfeld)
