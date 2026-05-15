---
id: mptcp
type: protocol
name: Multipath TCP
abbreviation: MPTCP
etymology: "[M]ulti[p]ath [TCP]"
category: transport
year: 2013
rfc: RFC 8684
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - story-of-the-internet/the-quic-redesign
  - transport/sctp
  - transport/mptcp
  - transport/quic
  - web-api/http3
  - patterns-failures/failure-modes
related_protocols: [tcp, tls, wifi]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/DifferenceTCP_MPTCP-en.png/500px-DifferenceTCP_MPTCP-en.png
    caption: TCP versus Multipath TCP — regular TCP sends data over a single path, while MPTCP splits traffic across multiple interfaces (Wi-Fi plus cellular, or dual Ethernet) at the same time, boosting throughput and providing seamless failover.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "A phone walking out of a coffee shop with two coloured streams flowing back to one server: a blue Wi-Fi stream fading from the router, an orange cellular stream brightening from a tower. Both streams labelled 'subflow' and joining inside the phone before reaching the application."
  - "The MPTCP option layout inside a TCP segment header. Highlight Kind=30 in the option list, then expand to show subtype 0x0 MP_CAPABLE with the 64-bit sender key, and subtype 0x2 DSS with its (DSN, SSN, length) mapping triple."
  - "Two parallel sequence-number axes side by side: a per-subflow TCP sequence number on the left, the connection-wide Data Sequence Number on the right. An arrow labelled 'DSS mapping' connects ranges on the left to ranges on the right."
  - "The MP_JOIN three-way exchange as a sequence diagram between phone-cellular and server: SYN with token plus nonce-A, SYN-ACK with HMAC-B plus nonce-B, ACK with HMAC-A. The HMAC inputs called out as 'HMAC-SHA256(Key-A || Key-B, Nonce-A || Nonce-B)'."
  - "A timeline of MPTCP's deployment milestones: September 2013 Apple iOS 7 ships Siri-over-MPTCP in stealth, June 2015 Korea Telecom launches GiGA LTE, March 2020 RFC 8684 plus Linux 5.6 mainline, 2024–2026 the kernel CVE wave."
  - "A scheduler decision diagram: incoming application bytes on the left, two subflows on the right (Wi-Fi at 5 ms RTT, cellular at 40 ms RTT). Boxes for Default-lowest-RTT, Round-robin, Redundant, BLEST, ECF, each with a one-line behaviour caption."
---

# MPTCP — Multipath TCP

## In one breath

Multipath TCP is the same TCP your kernel has spoken since 1981, but with a small bundle of TCP options that let one connection ride two or more network paths at the same time — Wi-Fi plus cellular on a phone, two Ethernet ports on a server, DSL plus 4G on a hybrid-access router. The application opens what looks like an ordinary socket; the kernel quietly opens a second TCP "subflow" over the other interface, scheduler picks which subflow gets each chunk, and a separate connection-wide sequence number puts the bytes back in order. If you have used Siri or Apple Music in the last decade, your packets have travelled this way without your asking.

## The pitch (cold-open)

In September 2013, a Belgian researcher named Olivier Bonaventure was packet-sniffing his own iPad and noticed something nobody had announced. iOS 7 was emitting a TCP option that wasn't in any TCP textbook — Kind 30, Multipath TCP — on every connection to Apple servers. Apple had silently shipped an experimental Internet standard on roughly half a billion phones, just to keep Siri from saying "Sorry, I didn't catch that" the moment you walked out of Wi-Fi range. The protocol it shipped is the most successful invisible transport of the last fifteen years. It runs in the Linux kernel, in every 5G core network on Earth via 3GPP ATSSS, and in the dozen Linux CVEs that landed during the 2024–2025 fuzzing wave. This episode is about how MPTCP works on the wire, where it actually runs, and why its successor — Multipath QUIC — is now in IETF Last Call.

## How it actually works

MPTCP lives at the transport layer, between IP and the application. To the application it is one byte stream and one socket. On the wire it is a coordinated bundle of TCP connections — "subflows" — that can each take a different network path. The whole protocol fits inside TCP's 40-byte options budget. That single constraint shaped almost every design choice.

Five steps make a connection.

First, the initial handshake carries an MP_CAPABLE option in the SYN. Both sides advertise that they speak MPTCP version 1 and exchange 64-bit keys. In the original 2013 wire format (RFC 6824) the initiator's key travelled in the SYN; in the current spec, RFC 8684 from March 2020, the initiator's key moves to the third ACK so the handshake survives SYN-cookie servers. Each side derives a 32-bit token by SHA-256-ing its own key and a 64-bit Initial Data Sequence Number from the lower bits.

Second, either endpoint can attach more subflows with MP_JOIN. A subflow is a brand-new TCP three-way handshake from a different (IP, port) pair. The SYN carries the receiver's token to identify which MPTCP connection it joins, plus a random nonce. The SYN-ACK and ACK exchange truncated and full HMAC-SHA256 values computed over both keys and both nonces. An off-path attacker can't forge a join because they don't know the keys.

Third, every data segment carries a Data Sequence Signal — DSS — option. Each subflow keeps its own normal TCP sequence numbers; DSS binds a contiguous run of those subflow bytes to a position in the connection-wide Data Sequence Number space. The receiver uses the DSN to put bytes back in order across all subflows before handing them to the app. DSS optionally carries a 16-bit checksum over the payload, which catches middleboxes that rewrite bytes.

Fourth, an MPTCP scheduler picks which subflow gets the next chunk. Linux's default is "lowest smoothed RTT" — fill the fast subflow until its congestion window is full, then move to the next. Other schedulers exist: round-robin, redundant (send each segment on every subflow for tail-latency wins), BLEST (predict head-of-line blocking and skip the slow path), and ECF, Earliest Completion First. The Linux scheduler is selectable via the `net.mptcp.scheduler` sysctl and there is an eBPF hook for custom logic.

Fifth, when a subflow dies, traffic shifts to the others without the application noticing. ADD_ADDR advertises a new address the peer can join on; REMOVE_ADDR retires one. MP_PRIO toggles a subflow between active and backup — iOS uses this to mark the cellular subflow as backup so it only kicks in when Wi-Fi degrades. MP_FAIL signals an unrecoverable DSN error and falls the whole connection back to plain TCP.

### Header at a glance

Everything MPTCP does is encoded as a TCP option with Kind 30 and a 4-bit subtype in the high nibble of the byte after Length. The subtype space is small and almost full:

- 0x0 MP_CAPABLE — negotiate MPTCP and exchange 64-bit keys.
- 0x1 MP_JOIN — add a subflow, authenticated with HMAC-SHA256.
- 0x2 DSS — Data Sequence Signal, carrying the connection-level Data ACK, the per-segment Data Sequence Mapping (DSN start, Subflow Sequence Number start, length), and an optional 16-bit DSS checksum over the mapped payload.
- 0x3 ADD_ADDR — advertise an additional address; in version 1 it carries an HMAC over the address and keys to stop the off-path hijack RFC 7430 documented.
- 0x4 REMOVE_ADDR — withdraw an address.
- 0x5 MP_PRIO — change subflow priority (active versus backup).
- 0x6 MP_FAIL — fall back to plain TCP.
- 0x7 MP_FASTCLOSE — force-close the whole MPTCP session, the moral equivalent of TCP RST.
- 0x8 MP_TCPRST — reason-coded RST that tears down one subflow without killing the connection.

The MP_CAPABLE option is 12 bytes in version 1. MP_JOIN is 12, 16, and 24 bytes across the three-way handshake. DSS is variable, typically 16 bytes per segment. The mptcp.dev FAQ pegs the per-packet overhead at roughly 1%.

### State machine in three sentences

MPTCP doesn't have its own state machine in the textbook sense — each subflow is a real, fully-spec-compliant TCP connection that runs through the standard CLOSED-to-TIME_WAIT lifecycle covered in the TCP episode. What sits above the subflows is a small connection-level state machine that tracks whether the session is MPTCP-capable (both keys exchanged), in fallback (MP_FAIL fired, treat the surviving subflow as plain TCP), or torn down (MP_FASTCLOSE seen). The trick is that any subflow can die at any moment and the connection above it survives as long as one subflow remains.

### Reliability, security, and "do no harm"

Two security properties worth stating clearly. The MP_JOIN HMAC stops off-path attackers from injecting subflows. But the keys themselves travel in cleartext during MP_CAPABLE — RFC 7430, the protocol's own threat analysis, calls this out. Anyone who eavesdrops on your very first round-trip knows the keys and can hijack later joins from anywhere on the Internet. TLS does not save you because TLS handshakes after MPTCP is up. The candidate fix is the 2025 draft "MPTCP with external keys" from Matthieu Baerts and Olivier Bonaventure, which authenticates joins with TLS or SSH session keys instead.

On the congestion-control side, the founding RFC 6182 demanded that MPTCP "do no harm" — an MPTCP connection sharing a bottleneck with a single-path TCP must not steal more than its fair share. RFC 6356 specified LIA, Linked Increase, the original coupled congestion control: each subflow runs its own congestion window but the increase function is coupled across subflows so the aggregate doesn't beat one TCP. Later coupled algorithms include OLIA (Pareto-optimal under stable loss), BALIA (a tunable LIA-OLIA hybrid that never made RFC), and Linux's wVegas. Note: BALIA is sometimes wrongly cited as RFC 8203 — that RFC is BGP graceful shutdown, unrelated. Single-path congestion controls like CUBIC or BBR are still selectable per subflow as the *base* algorithm, but using BBR per subflow without coupling violates the do-no-harm principle on shared bottlenecks.

## Where it shows up in production

**Apple, since 2013.** iOS 7 shipped MPTCP for Siri in September 2013 — the deployment Bonaventure caught in his packet trace. iOS 11 in 2017 opened the public API via `URLSessionConfiguration.multipathServiceType` and the Network framework. iOS 13 in 2019 enabled MPTCP for Apple Maps and Apple Music. At WWDC 2017, Apple disclosed concrete Siri numbers from the production fleet: 20% faster at the 95th percentile and a five-times reduction in network failures. At WWDC 2020 they reported 13% fewer Apple Music stalls and 22% shorter stall duration after enabling MPTCP for Music. Apple's scheduler is what they call "interactive mode" — spawn subflows immediately on Wi-Fi and cellular, evaluate per-packet RTT and loss, pick the best path. Apple deliberately disables ADD_ADDR — they only support client-initiated subflows because they consider server-advertised addresses a security risk.

**Korea Telecom GiGA LTE, since 2015.** In June 2015, KT launched the world's first commercial gigabit mobile service, bonding 3-band carrier-aggregation LTE with KT's Wi-Fi via an MPTCP SOCKS proxy. Initial handsets were the Samsung Galaxy S6 and S6 Edge with MPTCP enabled in firmware. Peak rate was advertised at 1.17 Gbit/s, observed around 800 Mbit/s, and the service had 5,500 active users within a month of launch. SungHoon Seo presented the deployment at IETF 93 in Prague. KT's consumer name for it, in Korean, is "GiGA Path."

**Linux upstream, since March 2020.** Mainline kernel 5.6 added `IPPROTO_MPTCP = 262` after a decade-long out-of-tree saga. Maintainers in 2026: Matthieu Baerts at NGI0, Mat Martineau, Paolo Abeni. The path manager is configured with `ip mptcp endpoint` and `ip mptcp limits`, or with the `mptcpd` userspace daemon for per-connection policy. RHEL 9 in May 2022 shipped `mptcpd` as the recommended config tool; RHEL 10 in May 2025 tracks kernel 6.12 LTS. The old multipath-tcp.org out-of-tree fork — the one that powered KT and Tessares for years — is officially deprecated; its last release v0.96 supports kernel 5.4 only.

**Tessares, Proximus, KPN, Telia, BT.** Tessares is the UCLouvain spin-off founded in 2015 with Proximus as a co-investor, productising MPTCP for Hybrid Access Networks — bonding DSL with 4G or 5G in places where neither alone is fast enough. The 2017 Frasnes-Lez-Anvaing pilot in rural Belgium added a steady-state 20 Mbit/s. KPN in the Netherlands, Telia in Lithuania, and BT for UK SME customers all deployed Tessares' technology. Proximus has been a Tessares shareholder since 2015 and the brand is now operationally integrated.

**3GPP ATSSS — Access Traffic Steering, Switching, Splitting.** Standardised in 3GPP Release 16 from December 2018, ATSSS uses MPTCP between user equipment and an MPTCP proxy in the 5G core's User Plane Function. The proxy protocol is RFC 8803, the 0-RTT TCP Convert Protocol, which lets a client speak MPTCP to the converter while the converter speaks plain TCP to a server that doesn't support it. Every 5G core network deploying ATSSS uses MPTCP under the hood.

## Things that go wrong

**The 2024–2025 Linux kernel CVE wave.** In March 2020 MPTCP landed in mainline. In 2024 the Linux kernel team became its own CVE Numbering Authority and pointed syzkaller at the new subsystem. Within a single year more than a dozen MPTCP CVEs landed: CVE-2024-40931 (uninitialised state on connect), CVE-2024-44974 (use-after-free in the path manager's address selection, CVSS 7.8), CVE-2024-45009 / CVE-2024-45010 / CVE-2024-50085 (path-manager counter and flag bugs), CVE-2025-23145 (NULL deref causing kernel panics), CVE-2025-40133, CVE-2025-40258 (race in `mptcp_schedule_work`), CVE-2025-68227 (logic error in the MPTCP-versus-BPF-sockmap fallback path), and into 2026 CVE-2026-31669 (slab-use-after-free in `__inet_lookup_established`).

None of these were exploitable RCEs in the wild — they were correctness and lifetime bugs surfaced by automated testing. Microsoft had to publish VEX advisories for Azure Linux. The lesson, captured in Matthieu Baerts' upstream review threads, is that *every interaction with another subsystem is a potential bug*. The fix is process: better selftests, stricter RCU discipline, mandatory checks against `sk_family` rather than `sk_prot`, a dedicated MPTCP CI gating GitHub PRs. The chapter on Failure Modes covers the broader pattern — mainlining an out-of-tree subsystem suddenly enters the CVE-counting machine and floods the advisory feed.

**Middlebox stripping.** Honda et al. measured at IMC 2011 that about a third of access networks strip or rewrite uncommon TCP options. Hesmans et al. in 2013 confirmed it for MPTCP specifically — non-trivial fractions of middleboxes silently drop Kind 30 or rewrite TCP sequence numbers without updating the embedded options, breaking SACK and MPTCP simultaneously. That study is, in effect, MPTCP's design brief: it is why the protocol must fall back gracefully to plain TCP on every middlebox path. The kernel knob that controls when to give up is `net.mptcp.syn_retrans_before_tcp_fallback`. Default 2.

**The on-path key disclosure.** RFC 7430's residual-threats analysis is the operational footnote nobody quotes enough. The MPTCP keys that authenticate every subflow you ever join are exchanged in cleartext at the start of the connection. An attacker present at the very first MP_CAPABLE handshake learns both keys and can later hijack joins from anywhere on the Internet. Twelve years passed between RFC 6824 in 2013 and the candidate fix, `draft-baerts-tcpm-mptcpext` in July 2025.

## Common pitfalls (for the practitioner)

- **KTLS turns off MPTCP.** As of 2026 Linux MPTCP and kernel TLS are mutually exclusive on the same socket. If you enable KTLS for offload, you lose MPTCP. The mptcp.dev FAQ documents this; there is no in-flight integration.
- **Asymmetric paths starve via head-of-line blocking.** Wi-Fi at 5 ms RTT plus cellular at 40 ms RTT plus the default lowest-RTT scheduler will let the cellular subflow's slow tail packets stall the receiver's reassembly buffer. Cure: switch to BLEST or ECF, and increase `tcp_rmem` and `tcp_wmem`.
- **NAT64 / CGNAT mismatches.** Joins from a NAT'd 4G interface to an IPv6-only server can fail silently if the path manager is configured for IPv4 only.
- **DSS checksum off by default.** `net.mptcp.checksum_enabled = 0` on most distros. Turn it on if you suspect any L4 load balancer or NAT modifies payloads.
- **In-kernel path manager is one global policy.** If you need per-connection rules — different scheduler for Maps versus Music — switch to the userspace `mptcpd` and the userspace path manager.
- **`net.mptcp.allow_join_initial_addr_port = 1` by default.** Joins to the initial 5-tuple are allowed. Turn off in datacentre LB scenarios where you want joins only on advertised addresses.
- **Apple's iOS stack refuses ADD_ADDR.** It only ever initiates subflows, never accepts a server-advertised address. Server-side test plans need to assume this.

## Debugging it

Start by confirming both peers actually negotiated MPTCP. In tcpdump or Wireshark look for `mptcp capable v1` on both sides of the SYN exchange. If you see it outbound and a plain SYN-ACK comes back, a middlebox stripped the option — diagnose with `traceroute -O mptcp` from newer iputils or with `tracebox` (`http://www.tracebox.org/`). The connection will silently fall back to plain TCP and `nstat -a | grep MPTcpExtMPCapableFallbackACK` will increment.

Useful tools and where they live:

- `ss -M` from iproute2 — per-MPTCP-socket subflow status, send and receive queues.
- `ip mptcp endpoint show` — list configured endpoints.
- `ip mptcp monitor` — real-time CREATED, CLOSED, ESTABLISHED events with token IDs.
- `/proc/net/mptcp` — kernel connection list with tokens and addresses.
- `nstat -a | grep -i Mptcp` — extended counter set, including `MPJoinAckHMacFailure` and `MPJoinSynAckHMacFailure` for HMAC verification failures (token misconfiguration or replay defences misfiring).
- Wireshark's MPTCP dissector decodes Kind 30 options including MP_CAPABLE, MP_JOIN with HMAC, DSS mapping, and ADD_ADDR with token.
- `mptcpd` over D-Bus exposes userspace path-manager events.
- Performance Co-Pilot ships `mptcp.*` metrics on RHEL 9 and later, ready to feed Grafana.
- `test.multipath-tcp.org` on port 80 returns "Welcome to test.multipath-tcp.org!" only if you actually negotiated MPTCP. `amiusingmptcp.de` is the browser-side equivalent.

Useful sysctls: `net.mptcp.enabled` (default 1 since Linux 5.7), `net.mptcp.scheduler`, `net.mptcp.path_manager` (since 6.15, which deprecated the older `pm_type`), `net.mptcp.add_addr_timeout`, `net.mptcp.allow_join_initial_addr_port`, `net.mptcp.stale_loss_cnt`, `net.mptcp.syn_retrans_before_tcp_fallback`, `net.mptcp.checksum_enabled`. To enable on a stock Linux:

```
sysctl -w net.mptcp.enabled=1
ip mptcp limits set subflows 4 add_addr_accepted 4
ip mptcp endpoint add 10.0.1.5 dev wlan0 subflow
ip mptcp endpoint add 192.0.2.7 dev eth0  signal
```

To force a legacy TCP binary onto MPTCP without source changes there are three helpers: `mptcpize` (LD_PRELOAD), `mptcpify` (eBPF cgroup hook), and `GODEBUG=multipathtcp=1` for Go programs. Application code that wants explicit control passes `IPPROTO_MPTCP` (262) to `socket()` — on Python that looks like `socket.socket(AF_INET, SOCK_STREAM, 262)`.

For deeper test work, `packetdrill` from the multipath-tcp project is the scriptable test framework used by upstream selftests, hosted at the `mptcp_net-next` GitHub.

## What's changing in 2026

**April 2026 — CVE-2026-31669** lands: slab-use-after-free in `__inet_lookup_established` from the MPTCP subsystem. The CVE wave continues; treat MPTCP like any active kernel subsystem with weekly stable backports.

**March 2026 — Multipath QUIC `draft-ietf-quic-multipath-21`** is published, intended Standards Track, expires September 2026. The author lineage is direct continuity with MPTCP — Bonaventure, De Coninck, Huitema, plus Yanmei Liu (Alibaba), Yunfei Ma (Uber), and Mirja Kühlewind (Ericsson). The draft explicitly imports MPTCP's lessons: per-path congestion state, per-path packet number spaces, per-path PTO, and notes that LIA from RFC 6356 can be adapted directly. We cover the broader story in the chapter on the QUIC redesign.

**November 2025 — RHSA-2026:2282** clusters several MPTCP CVE patches including CVE-2025-40133, the dst_dev_rcu fix in `mptcp_active_enable()`.

**July 2025 — `draft-baerts-tcpm-mptcpdss`** proposes DSS mappings longer than 64 KB to support modern high-bandwidth flows. Same month, **`draft-baerts-tcpm-mptcpext`** proposes "external keys" — authenticate MP_JOIN with TLS or SSH session keys instead of the cleartext MPTCP keys, the long-overdue answer to RFC 7430's on-path-handshake threat.

**Linux 6.15 (2025)** deprecated `pm_type` in favour of `net.mptcp.path_manager` and added an eBPF scheduler hook so policies can be written as small BPF programs rather than baked-in algorithms.

**The IETF MPTCP working group closed** in 2021 as having completed its mission — a relatively rare clean exit. Maintenance moved to TCPM, the TCP Maintenance and Minor Extensions group, where the active drafts above now live. Multipath QUIC moved to the QUIC working group, not TCPM.

**Tessares is now operationally integrated with Proximus.** Sébastien Barré moved from Tessares to Proximus in an operational role. This is not a recent acquisition — Proximus has been a shareholder since 2015 — but the brand consolidation finished in 2025–2026.

## Fun facts (host material)

The Apple-Siri reveal is the founding myth. September 2013, days after RFC 6824 published, Olivier Bonaventure was packet-sniffing his own iPad in his Belgian lab and saw MP_CAPABLE flying out to Apple servers. He blogged it. Within 24 hours every networking outlet had the story. Apple never announced — they just shipped. The first half-billion-device deployment of an experimental Internet standard, in stealth.

In Korean, MPTCP is pronounced "GiGA Path." That's literally what KT named the consumer feature at launch in June 2015.

Apple's MPTCP stack deliberately disables ADD_ADDR. Their iPhones only ever initiate subflows themselves, refusing to send or process server-advertised addresses — a security choice they made early and have never reversed. It surfaced in a Tessares decode of an iPhone iOS 11 trace.

The IETF MPTCP working group is one of the few IETF working groups that closed cleanly because it had finished its job. Most just fade. MPTCP's chair declared mission accomplished and moved the residual work into TCPM.

The reason MPTCP hides inside TCP options instead of being a new IP protocol number is that the IETF watched SCTP fail to traverse middleboxes for a decade and refused to repeat the mistake. RFC 6182 calls this out explicitly. SCTP, with IP protocol number 132, gets dropped by most NATs and corporate firewalls within milliseconds; MPTCP, hidden in the TCP option budget, traverses essentially every middlebox. The chapter on SCTP tells that whole story.

Sébastien Barré's PhD thesis from UCLouvain in November 2011 — "Implementation and Assessment of Modern Host-Based Multipath Solutions" — is the basis of every Linux MPTCP implementation, in-tree and out-of-tree. The word "subflow" was coined in early UCLouvain drafts to deliberately avoid the loaded word "connection."

## Where this connects in the book

- The chapter "The Layer Model" (Foundations) — where MPTCP fits between IP and the application, and why "transport layer" is a bigger tent than just TCP and UDP.
- The chapter "The QUIC Redesign" (Story of the Internet) — the broader story of why TCP ossified, why QUIC tunnels inside UDP, and why Multipath QUIC is the architectural heir to MPTCP using the same algorithmic ideas inside a more deployable carrier.
- The chapter "SCTP" (Transport) — the cautionary tale of the multi-streamed, multi-homed transport that lost the deployment war because middleboxes drop IP protocol 132. Knowing why SCTP failed makes MPTCP's design choices obvious.
- The chapter "MPTCP" (Transport) — the narrative companion to this episode: the Apple iOS 7 deployment, the Korea Telecom GiGA Path service, the Linux mainline saga, and the Multipath QUIC succession.
- The chapter "QUIC" (Transport) — connection IDs, user-space transport, multipath QUIC drafts, in-kernel QUIC. The protocol that absorbed most of MPTCP's design lessons.
- The chapter "HTTP/3" (Web / API) — the 21% Cloudflare plateau, the in-kernel QUIC patch series, and where Multipath QUIC fits in the HTTP/3 frontier.
- The chapter "Failure Modes" (How Networks Actually Behave) — bufferbloat, ossification, head-of-line blocking, and the broader pattern of why "MPTCP gets stripped to plain TCP by many middleboxes" is one entry in a longer bestiary every operator learns by being burned.

## See also (other protocol episodes)

If you've heard the TCP episode, MPTCP is the next chapter. Standard TCP locks a connection to a single (src IP, src port, dst IP, dst port) tuple — change any element and the connection dies. MPTCP keeps that same TCP envelope on the wire (every subflow looks like ordinary TCP to a middlebox) but adds a connection-wide DSN above the per-subflow sequence numbers, so the connection survives losing any one path. The trade-offs in the comparison card are the ones you'd expect: MPTCP wins on handover and aggregation; TCP wins on simplicity, debuggability, and middlebox compatibility everywhere on Earth.

If you've heard the TLS episode, here's the relationship that matters. TLS sits on top of MPTCP and sees one byte stream — applications don't need to know about subflows, and the encrypted session transparently spans all of them. The catch is the cleartext MP_CAPABLE handshake that runs *before* TLS is up, which is what RFC 7430 warns about and what `draft-baerts-tcpm-mptcpext` is trying to fix. Separately, KTLS and MPTCP do not coexist on the same socket as of 2026 — pick one.

If you've heard the Wi-Fi episode, MPTCP is one of the most concrete reasons your Wi-Fi-to-cellular handover doesn't kill your call any more. Apple's Siri deployment is the textbook case: half a second of dead air, fixed in firmware, with the whole mechanism invisible to the apps that benefit from it.

The QUIC and HTTP/3 episodes cover where this is all heading. Multipath QUIC inherits MPTCP's algorithmic ideas — subflows, coupled congestion control, packet scheduling across paths — but lives inside QUIC's much more deployable UDP envelope. Where MPTCP had to fight TCP-aware middleboxes for ten years, Multipath QUIC encrypts almost everything inside UDP and is invisible to inspection. The SCTP episode is the cautionary tale that shaped both designs.

## Visual cues for image generation

- A phone leaving a coffee shop with two coloured streams flowing back to one server: a blue Wi-Fi stream fading from the router, an orange cellular stream brightening from a tower. Both streams labelled "subflow" and joining inside the phone before the application.
- The MPTCP option layout inside a TCP segment header. Highlight Kind=30 in the option list, then expand to show subtype 0x0 MP_CAPABLE with the 64-bit sender key, and subtype 0x2 DSS with its (DSN, SSN, length) mapping triple.
- Two parallel sequence-number axes side by side: a per-subflow TCP sequence number on the left, the connection-wide Data Sequence Number on the right. An arrow labelled "DSS mapping" connects ranges on the left to ranges on the right.
- The MP_JOIN three-way exchange as a sequence diagram between phone-cellular and server: SYN with token plus nonce-A, SYN-ACK with HMAC-B plus nonce-B, ACK with HMAC-A. The HMAC inputs called out as `HMAC-SHA256(Key-A || Key-B, Nonce-A || Nonce-B)`.
- A timeline of MPTCP's deployment milestones: September 2013 Apple iOS 7 ships Siri-over-MPTCP in stealth, June 2015 Korea Telecom launches GiGA LTE, March 2020 RFC 8684 plus Linux 5.6 mainline, 2024–2026 the kernel CVE wave.
- A scheduler decision diagram: incoming application bytes on the left, two subflows on the right (Wi-Fi at 5 ms RTT, cellular at 40 ms RTT). Boxes for Default-lowest-RTT, Round-robin, Redundant, BLEST, ECF, each with a one-line behaviour caption.

## Sources

### RFCs

- [RFC 8684 — MPTCP v1, the current canonical specification](https://www.rfc-editor.org/rfc/rfc8684)
- [RFC 6824 — MPTCP v0, the original 2013 wire format](https://datatracker.ietf.org/doc/rfc8684/)
- [RFC 6356 — LIA, the original coupled congestion control](https://www.rfc-editor.org/rfc/rfc6356.html)
- [RFC 6182 — MPTCP architectural goals](https://www.rfc-editor.org/rfc/rfc6182.html)
- [RFC 6897 — MPTCP application-interface considerations](https://www.rfc-editor.org/rfc/rfc6182.html)
- [RFC 7430 — Residual security threats analysis](https://www.rfc-editor.org/rfc/rfc7430.html)
- [RFC 8041 — Use cases and operational experience](https://datatracker.ietf.org/doc/rfc7430/)
- [RFC 8803 — 0-RTT TCP Convert Protocol (the ATSSS proxy mechanism)](https://www.rfc-editor.org/rfc/rfc8803.html)
- [RFC 9293 — Modern TCP roadmap](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 9000 — QUIC transport](https://www.rfc-editor.org/rfc/rfc9000)
- [RFC 9260 — SCTP](https://www.rfc-editor.org/rfc/rfc9260)
- [draft-ietf-quic-multipath-21 — Multipath QUIC](https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/)
- [draft-baerts-tcpm-mptcpdss — Long DSS mappings](https://ipnetworkinglab.github.io/draft-mptcp-dss/draft-baerts-tcpm-mptcpdss.html)
- [draft-baerts-tcpm-mptcpext — External keys for MP_JOIN](https://datatracker.ietf.org/doc/draft-baerts-tcpm-mptcpext/)
- [IANA TCP Parameters registry — Kind 30 subtypes](https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xml)
- [IETF MPTCP working group charter (closed)](https://datatracker.ietf.org/wg/mptcp/about/)

### Papers

- [Raiciu et al. — How Hard Can It Be? Designing and Implementing a Deployable Multipath TCP, NSDI 2012](https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/raiciu)
- [Honda et al. — Is It Still Possible to Extend TCP?, IMC 2011](https://dl.acm.org/doi/10.1145/2068816.2068834)
- [Hesmans et al. — Are TCP Extensions Middlebox-proof?, HotMiddlebox 2013](https://dl.acm.org/doi/10.1145/2535828.2535830)
- [Detal et al. — Revealing Middlebox Interference with tracebox, IMC 2013](https://conferences.sigcomm.org/imc/2013/papers/imc032s-detalA.pdf)
- [Ferlin et al. — BLEST: Blocking Estimation-based MPTCP Scheduler, IFIP Networking 2016](https://dl.ifip.org/db/conf/networking/networking2016/1570234725.pdf)
- [Lim et al. — ECF: An MPTCP Path Scheduler to Manage Heterogeneous Paths, CoNEXT 2017](https://dl.acm.org/doi/10.1145/3143361.3143376)
- [De Coninck and Bonaventure — Multipath QUIC, CoNEXT 2017](https://dl.acm.org/doi/10.1145/3143361.3143370)
- [Bonaventure, Handley, Raiciu — An Overview of Multipath TCP, ACM Queue 2014](https://queue.acm.org/detail.cfm?id=2591369)
- [Pokhrel et al. — MPTCP implementation under FreeBSD-13, Computer Networks 2024](https://www.sciencedirect.com/science/article/pii/S1389128624005036)

### Vendor and engineering blogs

- [Linux kernel MPTCP documentation](https://docs.kernel.org/networking/mptcp.html)
- [Linux kernel MPTCP sysctl reference](https://docs.kernel.org/networking/mptcp-sysctl.html)
- [mptcp.dev — modern docs and FAQ](https://www.mptcp.dev/faq.html)
- [Apple WWDC 2020 — Boost performance and security with modern networking (Music numbers)](https://developer.apple.com/videos/play/wwdc2020/10111/)
- [Apple WWDC 2019 — Advances in Networking, Part 1 (Christoph Paasch)](https://developer.apple.com/videos/play/wwdc2019/712/)
- [Tessares — Apple's MPTCP Story So Far](https://www.tessares.net/apples-mptcp-story-so-far/)
- [Tessares — 5G and the 0-RTT TCP Convert Protocol (RFC 8803)](https://www.tessares.net/5g-and-the-0-rtt-tcp-convert-protocol-rfc8803/)
- [Red Hat — Using Multipath TCP to better survive outages and increase bandwidth](https://www.redhat.com/en/blog/using-multipath-tcp-better-survive-outages-and-increase-bandwidth)
- [Bonaventure's blog — the original Apple Siri reveal post](http://blog.multipath-tcp.org/blog/html/2018/12/15/apple_and_multipath_tcp.html)
- [iOS 11 MPTCP options decode](http://blog.multipath-tcp.org/blog/html/2017/07/10/ios11_options.html)
- [Korea Telecom GiGA LTE deployment writeup](http://blog.multipath-tcp.org/blog/html/2015/07/24/korea.html)
- [Netmanias — KT GiGA LTE technical brief](https://www.netmanias.com/en/post/blog/7742/kt-korea-ict-service-lte-mptcp-samsung-wi-fi/kt-world-s-first-commercial-wireless-1-gbps-giga-lte-3-band-ca-giga-wifi)
- [CableLabs — 5G Link Aggregation with MPTCP (ATSSS)](https://www.cablelabs.com/blog/5g-link-aggregation-mptcp)
- [Proximus / Tessares launch announcement](https://www.proximus.com/news/2016/proximus-and-tessares-launch-innovative-technology-making-combines-speeds-fixed-and-mobile.html)
- [APNIC — Analyzing MPTCP adoption in the Internet (2022)](https://blog.apnic.net/2022/08/23/analyzing-mptcp-adoption-in-the-internet/)
- [ipSpace — MPTCP resources index](https://blog.ipspace.net/2023/07/mptcp-resources/)
- [LWN — MPTCP upstreaming plan (2019)](https://lwn.net/Articles/800501/)
- [LWN — MPTCP v1 in Linux 5.6 (2020)](https://lwn.net/Articles/810296/)
- [CIQ — Linux kernel CVEs in 2025, what to expect in 2026](https://ciq.com/blog/linux-kernel-cves-2025-what-security-leaders-need-to-know-to-prepare-for-2026/)
- [SUSE security tracker — CVE-2024-40931](https://www.suse.com/security/cve/CVE-2024-40931.html)
- [CVE-2024-44974 details](https://www.cvedetails.com/cve/CVE-2024-44974/)
- [Red Hat advisory RHSA-2026:2282](https://access.redhat.com/errata/RHSA-2026:2282)
- [Akamai — Post-quantum cryptography implementation considerations for TLS](https://www.akamai.com/blog/security/post-quantum-cryptography-implementation-considerations-tls)

### News

- [Network World — Apple iOS 7 surprises as first with new multipath TCP connections (2013)](https://www.networkworld.com/article/2170068/apple-ios-7-surprises-as-first-with-new-multipath-tcp-connections.html)
- [iDownloadBlog — Apple using multi-path TCP](https://www.idownloadblog.com/2013/09/24/apple-using-multi-path-tcp/)
- [Internet Society — MPTCP and TLS 1.3 announcements from Apple at WWDC 2017](https://www.internetsociety.org/blog/2017/06/mptcp-and-tls-1-3-big-announcements-from-apple/)
- [SamMobile — Samsung and KT announce GiGA LTE for Galaxy S6 and S6 Edge](https://www.sammobile.com/2015/06/16/samsung-kt-announce-5g-giga-lte-available-for-s6-and-s6-edge-today/)
- [La Libre — Tessares signs with BT (2022)](https://www.lalibre.be/economie/entreprises-startup/2022/05/30/en-signant-avec-le-geant-des-telecoms-bt-la-spin-off-belge-tessares-entre-dans-la-cour-des-grands-KMXTIV4FDRC63JUZL3AY35AEVE/)
- [TelecomTV — Tessares + Proximus access bonding deployment](https://www.telecomtv.com/content/osp-exchange-csps/tessares-proximus-access-bonding-offering-faster-internet-in-large-sparsely-populated-rural-areas-now-successfully-qualified-to-move-to-a-countrywide-deployment-phase-27357/)
- [RIPE Labs — History of Networking, M-TCP with Olivier Bonaventure](https://labs.ripe.net/history-of-networking/m-tcp-olivier-bonaventure/)
- [Forward Networks — Olivier Bonaventure: MPTCP, the coolest protocol you're already using](https://www.forwardnetworks.com/blog/resource/episode-07-olivier-bonaventure-mptcp-the-coolest-protocol-youre-already-using-but-didnt-know/)

### Wikipedia

- [Multipath TCP — Wikipedia](https://en.wikipedia.org/wiki/Multipath_TCP)
