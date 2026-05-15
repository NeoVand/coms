---
id: sctp
type: protocol
name: Stream Control Transmission Protocol
abbreviation: SCTP
etymology: "[S]tream [C]ontrol [T]ransmission [P]rotocol"
category: transport
year: 2000
rfc: RFC 9260
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/layer-model
  - story-of-the-internet/the-quic-redesign
  - transport/sctp
  - transport/mptcp
  - patterns-failures/patterns
  - patterns-failures/failure-modes
related_protocols: [tcp, udp, webrtc, quic, ip]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [9260, 9653, 8261, 8260, 8831, 8832, 8899, 6951, 6525, 6458, 5061, 4895, 4666, 3758, 3309, 2960]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/SCTP-Multihoming.png/500px-SCTP-Multihoming.png
    caption: SCTP multi-homing — a single SCTP association can span multiple IP addresses and network interfaces. If one path fails, traffic seamlessly shifts to another, which is why SCTP carries every 5G NG-AP signalling message between a base station and the mobile core.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "An illustrated SCTP common header — 12 bytes, three 32-bit rows. Source/destination ports on row one, the 32-bit Verification Tag on row two highlighted as 'the anti-blind-spoof field', the 32-bit CRC32c checksum on row three labelled 'Castagnoli polynomial, hardware-accelerated since Intel SSE 4.2'."
  - "The four-way cookie handshake as a sequence diagram. Client INIT, server INIT-ACK with a State Cookie, client COOKIE-ECHO, server COOKIE-ACK. A callout on the server side: 'Zero state allocated until COOKIE-ECHO returns — SYN flooding is impossible by construction.'"
  - "Two side-by-side diagrams labelled 'TCP head-of-line blocking' and 'SCTP multi-streaming'. On the left, three logical messages serialised on one byte stream; one packet drop stalls all three. On the right, three independent streams in one association; one drop stalls only its own stream."
  - "The WebRTC data channel stack drawn as nested envelopes from outside in: IP, then UDP, then DTLS, then SCTP, then the application message. Annotation: 'Every Chrome, Firefox, Safari, and Edge browser ships this stack — the largest production SCTP deployment by message count.'"
  - "A timeline from 1991 to 2026 with five labelled beats: 1991 Stewart watches a TCP socket take minutes to fail at Motorola; 1997 MDTP prototype; October 2000 RFC 2960; June 2022 RFC 9260; September 2024 RFC 9653 zero-checksum mode."
  - "A two-column ledger. Left column 'Where SCTP runs in 2026': 5G NG-AP, F1-AP, E1-AP, LTE S1-AP/X2-AP, Diameter, every WebRTC data channel, SS7-over-IP gateways. Right column 'Where SCTP lost': the public web, every Windows native socket, every consumer NAT path."
---

# SCTP — Stream Control Transmission Protocol

## In one breath

SCTP is the third reliable transport on IP, alongside TCP and UDP, with its own IANA protocol number 132. It gives you TCP-style reliability plus three things TCP cannot offer natively: multiple independent ordered streams in one association so a lost packet on stream three does not stall stream seven, multi-homing so a single association can span multiple IP addresses and fail over between them sub-second, and message boundaries so the application sends and receives discrete units instead of having to re-frame a byte stream. Despite being the better protocol on paper, it lost the deployment war on the public internet — and yet it carries every 5G NG-AP signalling message in the world and runs inside every WebRTC data channel in every browser.

## The pitch (cold-open)

In 1991, an engineer at Motorola named Randall Stewart watched a TCP socket take minutes to notice a dead network during a phone-call test. That moment killed TCP for telephony and eventually produced SCTP — a transport with its own IP protocol number, 132, assigned to Stewart by name in IANA's registry. SCTP shipped in October 2000. It was almost included in Windows Vista, never was, and today carries every 5G call setup on the planet and every WebRTC data channel in every browser, while remaining a protocol most software engineers have never knowingly used. This episode is about how it works, where it actually runs, and why the protocol that did everything right architecturally still lost the open-internet deployment war to TCP and UDP. The story of why SCTP failed the open internet — and what QUIC learned from that failure — belongs to the chapter episode "The QUIC Redesign"; we will defer the long version there.

## How it actually works

SCTP runs directly on IP as protocol number 132, or — more often on the public internet — wrapped in UDP per RFC 6951 to survive NATs and firewalls. A connection is called an *association*, identified by a 4-tuple of endpoints plus a 32-bit Verification Tag on each side. Inside an association, payload travels in *chunks*; a single packet can bundle DATA chunks from different streams plus control chunks, up to the path MTU. The wire model is "common header plus a sequence of typed chunks", which is what makes SCTP cleanly extensible — RFC 8260's I-DATA chunk and RFC 5061's ASCONF were both added without a flag-day.

Reliability uses two counters. The TSN, the Transmission Sequence Number, is 32 bits and association-wide; SACK chunks acknowledge it cumulatively and report gap blocks for selectively-missing TSNs. The SSN, the Stream Sequence Number, is 16 bits and per-stream; it controls in-stream ordering. A loss event blocks delivery on the affected stream until retransmission catches up, but other streams keep flowing. That is the head-of-line-blocking fix QUIC would later adopt, twenty-two years before QUIC shipped.

### Header at a glance

The SCTP common header is exactly 12 bytes — three 32-bit rows, no options. From the top:

- 16-bit source port and 16-bit destination port, identical in semantics to TCP and UDP ports.
- 32-bit Verification Tag. The peer fills this with the value the other side told it to use during INIT/INIT-ACK. Any packet that does not carry the right Verification Tag is dropped. This is what defeats blind off-path attackers who do not see the handshake.
- 32-bit Checksum, computed as CRC32c — the Castagnoli polynomial, replacing the original Adler-32 in RFC 3309 in September 2002 because Adler-32 had provably weak coverage on short packets. Intel later added an SSE 4.2 instruction for it, so on modern CPUs the checksum is essentially free.

After the common header come chunks, each prefixed with an 8-bit type, 8-bit flags, 16-bit length, and a TLV payload padded to a 4-byte boundary. Type 0 is DATA. Type 1 through 14 are the control chunks — INIT, INIT-ACK, SACK, HEARTBEAT, HEARTBEAT-ACK, ABORT, SHUTDOWN, SHUTDOWN-ACK, ERROR, COOKIE-ECHO, COOKIE-ACK, ECNE, CWR, SHUTDOWN-COMPLETE. Type 15 is AUTH from RFC 4895. The high types matter: 64 is I-DATA from RFC 8260 for sender-side message interleaving, 128 and 193 are ASCONF-ACK and ASCONF from RFC 5061 for adding and removing IP addresses mid-association, 130 is RE-CONFIG from RFC 6525 for adding more streams without tearing down, and 192 is FORWARD-TSN from RFC 3758 for partial reliability — the chunk WebRTC uses to offer "unreliable" data channels. The two high-order bits of the type byte tell a receiver how to handle a chunk type it does not recognise: skip silently, skip and report, stop processing, or abort. That is what gives SCTP cleaner forward-compatibility than TCP.

### State machine in three sentences

An SCTP endpoint moves CLOSED to COOKIE-WAIT on sending INIT, COOKIE-WAIT to COOKIE-ECHOED on receiving INIT-ACK and replying with COOKIE-ECHO, and COOKIE-ECHOED to ESTABLISHED on receiving COOKIE-ACK. Shutdown is symmetric and explicit — SHUTDOWN, SHUTDOWN-ACK, SHUTDOWN-COMPLETE, all three required, with no half-close analog of TCP's `shutdown(WR)`; both directions close together. ABORT exists for an immediate teardown without draining the send queue.

### Reliability, flow, security mechanics

The four-way cookie handshake is the headline mechanism. The client sends INIT with its proposed Verification Tag. The server responds with INIT-ACK containing a State Cookie — a signed bundle of both sides' parameters, HMAC'd with a secret only the server knows — and *allocates no state*. The client echoes the cookie back in COOKIE-ECHO. Only then does the server verify the HMAC, allocate the Transmission Control Block, and send COOKIE-ACK. Because the server holds zero state until the client proves it can receive packets at the address it claimed, SYN flooding is impossible against SCTP by construction. USENIX Security 2024 — Ginesin, von Hippel, Defloor, Nita-Rotaru, and Tüxen — formally model-checked this and confirmed the off-path attacks the model attempts are unreachable when the RFC 9260 patches are applied. TCP's SYN cookies, hacked into Linux a few years earlier, are an ad hoc retrofit of the same idea; SCTP did it right the first time.

Flow control is per-association: the receiver advertises an `a_rwnd` window in every SACK and the sender obeys it, exactly as in TCP. Congestion control is per-destination — important for multi-homing — with slow start, congestion avoidance, fast retransmit on four missing-report indications in SACK gap blocks, and fast recovery, all conceptually TCP-NewReno-like.

Multi-homing is the other signature feature. An endpoint can advertise multiple IP addresses in INIT and INIT-ACK. One destination address is the *primary path*; the rest are alternates. HEARTBEAT chunks probe the alternates on a timer; on a configurable number of consecutive HEARTBEAT failures, the path is marked inactive and DATA traffic moves to the next alternate. Base RFC 9260 uses extra paths only for failover and retransmission. The CMT-SCTP draft, `draft-tuexen-tsvwg-sctp-multipath-30` from September 2025, generalises this to true concurrent multipath load balancing.

Security has four pieces. The State Cookie defeats SYN flooding. The Verification Tag rejects blind off-path packets. CRC32c rejects corruption. SCTP-AUTH from RFC 4895 lets endpoints negotiate HMAC-SHA1 or HMAC-SHA256 keys and authenticate selected chunk types using AUTH chunks; ASCONF requires AUTH because an attacker who can spoof an address-add chunk can hijack your association. Confidentiality is *not* part of SCTP itself — for that you wrap SCTP in DTLS per RFC 8261, which is exactly what WebRTC does.

## Where it shows up in production

**5G NG-AP and the rest of the 3GPP control plane.** Every NGAP signalling message between a 5G base station and the AMF rides SCTP, with payload protocol identifier 60, per ETSI TS 138 412. The same is true for F1-AP and E1-AP between the gNB-CU and gNB-DU split components, per TS 138 472. As of TS 138 412 v15, 3GPP's reference is still RFC 4960 — RAN3 has historically lagged the IETF refresh to RFC 9260. Operators routinely saturate multi-gigabit signalling NICs with SCTP because NGAP messages are small and congestion control is rarely the bottleneck.

**LTE S1-AP and X2-AP.** eNB-to-MME and eNB-to-eNB signalling in every deployed 4G network on Earth runs over SCTP. This is the largest installed base of SCTP by node count; it is not going away.

**Diameter on port 3868.** RFC 6733 specifies Diameter — the AAA protocol for LTE and 5G EPC and IMS — over either TCP or SCTP. Carriers with strict failover requirements pick SCTP for the multi-homing.

**WebRTC data channels.** Every Chrome, Firefox, Safari, and Edge browser ships SCTP. The stack is SCTP over DTLS over UDP, specified by RFC 8261 for the encapsulation, RFC 8831 for the data channel, and RFC 8832 for the data-channel-establishment protocol. PR-SCTP from RFC 3758 is what lets browsers offer the `unordered` and `unreliable` data-channel options. Chrome migrated from the `usrsctp` userspace library to its own in-tree C++ implementation called `dcSCTP` around Chrome M92 in 2021, and a Rust port lives at github.com/webrtc/dcsctp under the same authors. Firefox still uses `usrsctp` as of recent commits. Measured by message count, WebRTC is the largest production SCTP deployment in the world, even though almost no application developer realises they are using SCTP.

**SS7-over-IP gateways.** M3UA from RFC 4666 carries SS7 MTP-3 user messages over SCTP and is the most widely deployed SS7-over-IP variant; M2UA, M2PA, and SUA are the siblings. If you make a phone call that crosses carrier boundaries anywhere in the world, SCTP is in the path.

**Oracle RAC interconnects.** Historically used SCTP for low-volume, latency-sensitive cluster reconfiguration messaging.

## Things that go wrong

**The CVE-2020-6514 Signal exploit.** In 2020, Natalie Silvanovich at Google Project Zero demonstrated that a crafted SCTP stream could trigger heap corruption in the `usrsctp` userspace library, exploitable through a Signal incoming call — the victim never had to answer. The same library shipped in Chrome, Firefox, Signal, and Facebook Messenger. The fix took months; ASCONF was eventually disabled in `usrsctp` to shrink the attack surface, and Chrome's WebRTC team rewrote the implementation from scratch in C++ as `dcSCTP` to escape the bug class entirely. Google later flagged Play Store apps still shipping vulnerable WebRTC versions with the old `usrsctp`. The lesson is uncomfortable: protocol elegance does not save you from implementation realities, especially in a decades-old C codebase that nobody fuzzes.

**CVE-2021-3772 — the off-path association killer.** A blind off-path attacker who knows a Linux SCTP association's 4-tuple could inject invalid chunks and tear it down, because the kernel's Verification-Tag validation was insufficient on certain chunk types. The 2024 USENIX Security paper from Ginesin et al. used formal model checking to re-derive this attack automatically and verified that the RFC 9260 mitigations close it. Patches landed across Linux distributions in 2021–2022.

**The kernel-bug latency problem.** A statistical study at pebblebed.com found that the Linux kernel's SCTP networking subsystem averages 4.0 years between a bug being introduced and being discovered — second only to CAN-bus drivers — because almost nobody fuzzes it. Yet every 5G call setup in 2026 traverses this code. Treat it as a code path that gets less testing per line than mainstream networking, and patch your kernels accordingly.

**The Chrome `usrsctp` extraction.** After the run of memory-safety CVEs in 2019–2020, Chrome's WebRTC team pulled `usrsctp` from the WebRTC build entirely, replacing it with `dcSCTP` and warning Play Store developers that any app still shipping vulnerable WebRTC versions would be flagged. This is the rare case of a protocol's implementation being abandoned at scale because of accumulated security debt rather than the protocol's design.

**Telecom outages explicitly attributed to SCTP itself, rather than the application above it, are rare and seldom publicly reported.** Carriers do not publish these. Treat the absence of named SCTP outages as informational, not reassuring.

## Common pitfalls (for the practitioner)

**NAT and firewall traversal.** Most consumer routers and corporate firewalls do not parse IP protocol 132 — they either drop it silently or fail to create state. Symptom: your "working" SCTP association from a lab vanishes the moment it crosses a real network boundary. Cure: wrap SCTP in UDP using RFC 6951's encapsulation, or run inside IPsec. WebRTC does the UDP wrap by default, which is why WebRTC's SCTP works on the open internet and raw SCTP does not.

**Single-homed despite advertised multi-homing.** If you bind only `INADDR_ANY` and let routing pick the source, your "multihomed" association quietly degrades to a single path because only one source address ever appears on the wire. Symptom: failover does nothing. Cure: call `sctp_bindx()` with explicit addresses for every interface you intend to use, and verify with `cat /proc/net/sctp/assocs` that multiple paths show up.

**MTU mismatches with UDP encapsulation.** Per RFC 6951, when you turn on UDP encapsulation mid-association the path MTU drops by 8 bytes for the UDP header. If your stack forgets to update PMTU, you get fragmentation, ICMP storms, or — worse — silent drops. RFC 8261 recommends staying under a 1200-byte safe path MTU for DTLS-encapsulated SCTP when the DF bit cannot be controlled.

**Heartbeat tuning.** Default `HB.interval` is around 30 seconds — too long for 5G control plane, where operators routinely shrink it to 1–3 seconds for sub-second failover. Too short and you generate noise; too long and your "redundant" multi-homing takes half a minute to notice a dead path.

**RTO defaults.** RFC 9260 §15 sets RTO_MIN to 1 second and RTO_MAX to 60 seconds. For LAN-only telco signalling these are too conservative; RTO_MIN of 100–200 ms is common in production deployments.

**Stream count is set at INIT.** If you negotiate 10 streams and later need 50, do *not* tear down and reopen — use RE-CONFIG from RFC 6525 to add streams in place.

**Two SCTP implementations on one host.** Running the kernel SCTP stack and `usrsctp` on the same machine, both bound to IP protocol 132, has produced weirdly interleaved aborts in production. Pick one.

**Don't enable SCTP-AUTH naively.** RFC 5061 ASCONF *requires* AUTH to prevent an off-path attacker from rerouting your association. If you enable ASCONF without AUTH you have just handed an attacker the ability to add their own IP to your endpoint list.

## Debugging it

**Wireshark.** The dissector is excellent. Filter `sctp` shows all SCTP, `sctp.chunk_type == 1` isolates INITs, `sctp.verification_tag == 0xABCD1234` isolates one association. The wiki page at wiki.wireshark.org/SCTP is the canonical reference.

**tcpdump.** `tcpdump 'proto 132'` or BPF `ip proto 132` captures raw SCTP. For the UDP-encapsulated form, you want UDP port 9899 (RFC 6951's default).

**`/proc/net/sctp/`.** On Linux: `assocs` lists every active association with TSN, window, and path state. `endpoints` lists listeners. `snmp` gives counters that match RFC 3873's MIB. `remaddr` shows per-destination state including HEARTBEAT timers — use this to confirm multi-homing actually has multiple paths in use.

**`ss -pneomSa`.** Shows SCTP sockets when the `sctp_diag` module is loaded. Pair with `cat /proc/net/sctp/snmp` to find chunk-level counters.

**lksctp-tools.** The `sctp_test`, `sctp_darn`, `checksctp`, and `withsctp` utilities live at github.com/sctp/lksctp-tools and are the standard way to smoke-test a Linux SCTP stack. `usrsctp` ships its own `tsctp`, `discard_server`, and `client` example programs.

**Module loading on RHEL.** The SCTP module is *blacklisted by default* on Red Hat. You have to comment out `/etc/modprobe.d/sctp-blacklist.conf` and run `modprobe sctp` before anything will work. New operators hit this on day one.

**Buffer-size sysctls.** `net.sctp.sctp_rmem` and `net.sctp.sctp_wmem` control SCTP-specific socket buffer defaults. Note: the kernel doubles whatever value you pass to `setsockopt(SO_RCVBUF)`, and the SCTP-specific tunables override `net.core.rmem_default` and `wmem_default` only if they are set explicitly after the module loads.

**SACK delay.** Defaults around 200 ms. For chatty signalling, lower it via `SCTP_DELAYED_SACK` or use SACK-IMMEDIATELY — RFC 7053's I-bit — to flush a SACK at the next opportunity.

## What's changing in 2026

**SNAP — SCTP Negotiation Acceleration Protocol — `draft-hancke-tsvwg-snap-00`, 29 December 2025.** Authored by Hancke at Meta, Uberti at OpenAI, and Boivie at Google. SNAP embeds INIT parameters in SDP so a WebRTC peer can skip a round-trip of the SCTP handshake. The fact that Meta, OpenAI, and Google co-authored this tells you exactly who still cares about WebRTC data-channel latency.

**`draft-dreibholz-tsvwg-sctp-nextgen-ideas-22`, 23 September 2025.** An informational draft from Thomas Dreibholz cataloguing two decades of lessons learned and what a hypothetical SCTP-2 might do. Read it as the protocol's retrospective from inside.

**`draft-tuexen-tsvwg-sctp-multipath-30`, 14 September 2025.** CMT-SCTP — concurrent multipath transfer — by Becke, Dreibholz, Ekiz, Iyengar, Natarajan, Stewart, and Tüxen. Generalises base SCTP's failover-only multi-homing into true load balancing across paths. Conceptually the SCTP analog of MPTCP and multipath QUIC.

**`draft-westerlund-tsvwg-sctp-dtls-handshake-05`, 7 July 2025.** A new DTLS chunk type that carries DTLS 1.3 key-management traffic *inside* SCTP itself, including support for multi-homed associations. Westerlund, Preuß Mattsson, and Porfiri at Ericsson — Ericsson's continued investment is a tell.

**RFC 9653, September 2024 — Zero Checksum.** Lets SCTP wrapped in DTLS skip the CRC32c calculation, since DTLS already covers integrity. Saves CPU on busy WebRTC servers.

**`draft-tuexen-tsvwg-sctp-init-fwd-04`, September 2024.** INIT forwarding for anycast clusters — lets a cluster of SCTP servers behind one anycast address hand off an incoming INIT to the right backend without losing the association.

**`draft-ietf-tsvwg-rfc4895-bis-04`, October 2024.** A refresh of SCTP-AUTH; bring this in alongside the multipath and DTLS-chunk drafts when planning a 2026 SCTP stack rebuild.

**dcSCTP migration.** Chrome's WebRTC has fully migrated from `usrsctp` to in-tree `dcSCTP` (C++); the Rust port at github.com/webrtc/dcsctp is the longer-term direction. Firefox has not migrated as of recent commits.

**The 6G question.** Nokia's 2025 blog post and the O-RAN nGRG "Cloud-Friendly Future 6G RAN" report from 2024 both explicitly argue that 6G should replace SCTP with QUIC in the 3GPP control plane, citing SCTP's "poor NAT support, kernel-based stacks, small community, slow evolution." 3GPP has not committed to this as of May 2026 — treat "QUIC for 6G" as a vendor advocacy position, not a decision. The story of why QUIC dodged the deployment problems SCTP could not is the chapter episode "The QUIC Redesign."

## Fun facts (host material)

**Original name was MDTP — Multi-network Datagram Transmission Protocol — at Motorola in 1997.** Stewart's third reliability-over-UDP prototype, before the IETF SIGTRAN working group accepted it as the basis for what would become SCTP and heavily refactored it.

**It was briefly called the *Simple* Control Transmission Protocol** in `draft-ietf-sigtran-sctp-00`, dated 23 September 1999, before being renamed Stream Control Transmission Protocol by `draft-13` in July 2000. Same acronym, different first word, with a kind of self-deprecating accuracy in version zero.

**IP protocol number 132 was assigned to Randall R. Stewart by name in IANA's registry** — a personal credit that is unusual for an Internet standard. You can still see his name attached to the entry in the IANA protocol-numbers file.

**SCTP nearly made it into Windows.** Vista's Platform SDK actually defined `IPPROTO_SCTP`, and a Microsoft engineer publicly told developers "I believe this feature will be included in the future versions of Vista." It never shipped. The folklore explanation is some combination of NAT vendor inertia, lack of demand, and the time required to do a Winsock-level transport correctly. The Windows answer for SCTP, twenty years later, is still third-party drivers like SctpDrv or running `usrsctp` in userspace.

**CRC32c instead of Adler-32, on Mark Adler's recommendation.** Jonathan Stone showed that Adler-32's two 16-bit accumulators give very poor coverage on short packets — RFC 3309 itself records his quoted comment to "ask Mark Adler". Castagnoli polynomial CRC32c was chosen and, conveniently, hardware-accelerated by Intel SSE 4.2's `CRC32` instruction a few years later. The protocol picked the future-proof checksum and got hardware acceleration thrown in for free.

**Stewart and Xie wrote *the* SCTP book** — *Stream Control Transmission Protocol (SCTP): A Reference Guide*, Addison-Wesley 2001, ISBN 978-0201721867. It is now a quarter-century old and predates RFC 4960, RFC 9260, RFC 3309's CRC32c, RFC 6951's UDP encapsulation, and RFC 8261's DTLS encapsulation. Treat it as historical for rationale and design philosophy, not for current chunk types.

**The single most prolific SCTP implementer-author for two decades is Michael Tüxen at FH Münster** — Münster University of Applied Sciences. The reference implementation in the FreeBSD kernel and the userland `usrsctp` port both come from his line of work. His dblp page lists dozens of related RFCs and drafts; if you read any SCTP RFC after 2007 there is a good chance his name is on it.

## Where this connects in the book

- Part Foundations chapter "The Layer Model" — the seven-layer model and where SCTP sits at layer 4 alongside TCP and UDP, plus the standards-war context that explains why the public internet has only two practical transports instead of three.
- Part Story-of-the-Internet chapter "The QUIC Redesign" — the long version of why SCTP could not traverse the deployed internet despite being the technically superior transport, and how that lesson directly produced QUIC's choice to tunnel inside UDP. SCTP appears in this chapter explicitly as the cautionary tale QUIC's designers studied.
- Part Transport chapter "SCTP" — the dedicated chapter episode on SCTP's history, design rationale, and what survived in QUIC's descendants. The story of Stewart at Cisco and the SIGTRAN working group lives here.
- Part Transport chapter "MPTCP" — multipath TCP as the deployment-conscious answer to SCTP's multi-homing, including the iOS 7 Siri deployment in September 2013 and Korea Telecom's GIGA Path service. The chapter ties SCTP, MPTCP, and multipath QUIC into one architectural arc.
- Part Patterns-Failures chapter "Recurring Patterns" — the SCTP four-way cookie handshake as a canonical handshake pattern, alongside TCP, TLS, MQTT, and SSH. Once you see the shape, every protocol's setup reads in minutes instead of days.
- Part Patterns-Failures chapter "Failure Modes" — protocol ossification as the structural force that confined SCTP to controlled networks, head-of-line blocking as the problem SCTP solved twenty-two years before QUIC re-solved it, and middlebox hostility as the operating environment every new transport has to survive.

## See also (other protocol episodes)

**TCP.** If you have heard the TCP episode, SCTP reads as TCP-redesigned-with-the-benefit-of-hindsight. SCTP is message-oriented where TCP is byte-stream, uses a 4-way cookie handshake that is DoS-resistant by construction where TCP retrofitted SYN cookies as a workaround, supports multi-homing natively where TCP needs MPTCP as an extension, and avoids head-of-line blocking across streams where TCP suffers it on every loss. Both share the same congestion-control lineage. The architectural delta is everything.

**UDP.** SCTP frequently runs *over* UDP rather than directly on IP — the entire reason RFC 6951 exists. The UDP wrap costs 8 bytes and earns NAT traversal. WebRTC always uses this path, with DTLS in between. If you have heard the UDP episode, the SCTP-over-UDP-over-DTLS-over-IP stack is the logical conclusion of "wrap your transport in UDP so middleboxes will forward it."

**WebRTC.** The mandatory data-channel stack is `SCTP / DTLS / UDP / IP` with ICE for NAT traversal, specified by RFC 8261, RFC 8831, and RFC 8832. SCTP is what carries arbitrary application messages on data channels; DCEP from RFC 8832 negotiates per-channel reliability and ordering; PR-SCTP from RFC 3758 makes "unreliable" data channels possible. This is the only browser-shipped use of SCTP today, and it is the largest SCTP deployment by message count in the world. The WebRTC episode covers the rest of the stack.

**QUIC.** Built on UDP, encrypted by default, multiplexes streams without head-of-line blocking, fast 0-RTT and 1-RTT handshakes. QUIC has effectively supplanted SCTP for new general-purpose transport work — the same multistream and multipath ideas, but the IETF deliberately built it on UDP from day one to escape SCTP's NAT and middlebox tax. Even within WebRTC there are proposals to replace SCTP data channels with QUIC datagrams. The QUIC episode is the natural sequel to this one.

**MPTCP.** RFC 8684 multipath TCP. Conceptually close to SCTP's multi-homing — and to the CMT-SCTP draft's load sharing — but at the TCP layer using TCP option negotiation, mostly to use Wi-Fi and cellular interfaces simultaneously. Apple shipped MPTCP in iOS 7 in 2013 for Siri because the Wi-Fi-to-cellular handoff was visibly degrading voice recognition. The MPTCP episode is the deployment-friendly cousin of this one.

## Visual cues for image generation

- An illustrated SCTP common header — 12 bytes, three 32-bit rows. Row one source and destination ports, row two the 32-bit Verification Tag highlighted as "the anti-blind-spoof field", row three the 32-bit CRC32c checksum labelled "Castagnoli polynomial, hardware-accelerated since Intel SSE 4.2." Below the common header, a separate illustration of a single chunk: 8-bit type, 8-bit flags, 16-bit length, then the TLV payload, padded to a 4-byte boundary.
- The four-way cookie handshake as a sequence diagram with two vertical actor lines for Client and Server. INIT down the right, INIT-ACK back with a callout "State Cookie = HMAC(server_secret, both sides' params); server allocates ZERO state", COOKIE-ECHO down the right, COOKIE-ACK back with the callout "Now and only now: server validates HMAC and creates the TCB." A red box at the bottom labelled "SYN flooding is unreachable in the threat model. Formally verified, USENIX Security 2024."
- Two side-by-side diagrams labelled "TCP — head-of-line blocking" and "SCTP — multi-streaming". On the left, three logical messages (red, green, blue) serialised on one TCP byte stream; one packet drop with an X on it stalls all three colours behind it. On the right, three SCTP streams in one association; the same drop on the green stream stalls only green while red and blue keep delivering.
- The WebRTC data channel stack as nested coloured envelopes, outside in: IP (grey), UDP (blue), DTLS (green), SCTP (orange), then the application message (white). Annotation: "Every Chrome, Firefox, Safari, and Edge browser ships this stack — the largest production SCTP deployment by message count, even though almost nobody knows it."
- A timeline from 1991 to 2026 with six labelled beats: 1991 Stewart watches a TCP socket take minutes to fail at Motorola; 1997 MDTP prototype; September 1999 draft-ietf-sigtran-sctp-00 as "Simple Control Transmission Protocol"; October 2000 RFC 2960; June 2022 RFC 9260; September 2024 RFC 9653 zero-checksum mode.
- A two-column ledger titled "SCTP in 2026". Left column "Where it runs", listing 5G NG-AP, F1-AP, E1-AP, LTE S1-AP and X2-AP, Diameter on port 3868, every WebRTC data channel in every browser, M3UA-based SS7 gateways. Right column "Where it lost", listing the public web, every native Windows socket, every consumer NAT path, every CDN edge.
- A diagram of SCTP multi-homing failover. One association labelled with a Verification Tag, two endpoints each with two IP addresses. HEARTBEAT chunks travelling on both paths. The primary path drawn with a red X; an arrow showing DATA chunks redirecting to the alternate path with a label "sub-second failover when HB.interval is tuned to 1–3 seconds."

## Sources

### RFCs

- [RFC 9260 — Stream Control Transmission Protocol (June 2022)](https://datatracker.ietf.org/doc/html/rfc9260)
- [RFC 9653 — Zero Checksum for SCTP (September 2024)](https://datatracker.ietf.org/doc/rfc9653/)
- [RFC 8261 — DTLS Encapsulation of SCTP Packets (November 2017)](https://www.rfc-editor.org/rfc/rfc8261.html)
- [RFC 8260 — Stream Schedulers and User Message Interleaving (November 2017)](https://www.rfc-editor.org/rfc/rfc8260.html)
- [RFC 8831 — WebRTC Data Channels (January 2021)](https://www.rfc-editor.org/rfc/rfc8831.html)
- [RFC 8899 — Packetization Layer PMTUD for Datagram Transports (September 2020)](https://www.rfc-editor.org/rfc/rfc8899)
- [RFC 6951 — UDP Encapsulation of SCTP Packets (May 2013)](https://datatracker.ietf.org/doc/html/rfc6951)
- [RFC 6733 — Diameter Base Protocol (October 2012)](https://datatracker.ietf.org/doc/html/rfc6733)
- [RFC 6525 — SCTP Stream Reconfiguration (February 2012)](https://www.rfc-editor.org/rfc/rfc6525.html)
- [RFC 6458 — SCTP Sockets API (December 2011)](https://www.rfc-editor.org/rfc/rfc6458)
- [RFC 5061 — Dynamic Address Reconfiguration (September 2007)](https://datatracker.ietf.org/doc/html/rfc5061)
- [RFC 4895 — SCTP-AUTH (August 2007)](https://datatracker.ietf.org/doc/html/rfc4895)
- [RFC 4666 — M3UA, SS7 MTP-3 over SCTP (September 2006)](https://datatracker.ietf.org/doc/rfc4666/)
- [RFC 4340 — Datagram Congestion Control Protocol (DCCP)](https://www.rfc-editor.org/rfc/rfc4340.html)
- [RFC 3873 — SCTP Management Information Base (September 2004)](https://www.rfc-editor.org/rfc/rfc3873)
- [RFC 3758 — Partial Reliability Extension (PR-SCTP, May 2004)](https://www.rfc-editor.org/rfc/rfc3758.html)
- [RFC 3309 — SCTP Checksum Change to CRC32c (September 2002)](https://datatracker.ietf.org/doc/html/rfc3309)
- [RFC 2960 — Stream Control Transmission Protocol (October 2000)](https://www.ietf.org/rfc/rfc2960.txt)
- [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122)
- [RFC 8200 — IPv6 Specification](https://www.rfc-editor.org/rfc/rfc8200)
- [RFC 9147 — DTLS 1.3](https://www.rfc-editor.org/rfc/rfc9147)
- [draft-ietf-sigtran-sctp-00 — original 1999 draft as "Simple Control Transmission Protocol"](https://datatracker.ietf.org/doc/html/draft-ietf-sigtran-sctp-00)
- [draft-tuexen-tsvwg-sctp-multipath — CMT-SCTP load sharing](https://datatracker.ietf.org/doc/draft-tuexen-tsvwg-sctp-multipath/)
- [draft-westerlund-tsvwg-sctp-dtls-handshake — DTLS 1.3 chunk-based key management](https://datatracker.ietf.org/doc/draft-westerlund-tsvwg-sctp-dtls-handshake/)
- [draft-tuexen-tsvwg-sctp-init-fwd — INIT forwarding for anycast](https://datatracker.ietf.org/doc/draft-tuexen-tsvwg-sctp-init-fwd/)
- [draft-ietf-tsvwg-rfc4895-bis — SCTP-AUTH refresh](https://datatracker.ietf.org/doc/draft-ietf-tsvwg-rfc4895-bis/)
- [draft-dreibholz-tsvwg-sctp-nextgen-ideas — next-generation SCTP](https://datatracker.ietf.org/doc/draft-dreibholz-tsvwg-sctp-nextgen-ideas/)
- [draft-hancke-tsvwg-snap — SCTP Negotiation Acceleration Protocol](https://datatracker.ietf.org/doc/draft-hancke-tsvwg-snap/)

### Papers

- [Ginesin, von Hippel, Defloor, Nita-Rotaru, Tüxen — *A Formal Analysis of SCTP*, USENIX Security 2024](https://www.usenix.org/conference/usenixsecurity24/presentation/ginesin)
- [Ginesin et al. — full PDF](https://www.usenix.org/system/files/usenixsecurity24-ginesin.pdf)
- [Saini & Fehnker — *Evaluating SCTP Using Uppaal* (arXiv 1703.06568)](https://arxiv.org/pdf/1703.06568)
- [Tüxen & Rüngeler — *Portable and Performant Userspace SCTP Stack*, ICCCN 2012](https://research.google/pubs/portable-and-performant-userspace-sctp-stack/)
- [Stewart, Xie, et al. — SCTP design history at SIGCOMM CCR](http://ccr.sigcomm.org/online/files/p24-v39n1g-but.pdf)

### Vendor and engineering blogs

- [Lennart Grahl — Demystifying WebRTC's Data Channel Message Size Limitations](https://lgrahl.de/articles/demystifying-webrtc-dc-size-limit.html)
- [Tsahi Levy-Nahum — Why was SCTP Selected for WebRTC's Data Channel?](https://bloggeek.me/sctp-data-channel/)
- [Tsahi Levy-Nahum — Who needs QUIC in WebRTC anyway?](https://bloggeek.me/who-needs-quic-in-webrtc/)
- [Google Project Zero — Exploiting Android Messengers with WebRTC: Part 2](https://googleprojectzero.blogspot.com/2020/08/exploiting-android-messengers-part-2.html)
- [Nokia — Using modern transport protocols in 6G](https://www.nokia.com/blog/using-modern-transport-protocols-in-6g/)
- [O-RAN nGRG — Cloud-Friendly Future 6G RAN report](https://mediastorage.o-ran.org/ngrg-rr/nGRG-RR-2024-01-O-RAN%20Cloud%20Friendly%20Future%206G%20RAN-v1.2.1.pdf)
- [InformIT — interview with Randall Stewart on SCTP origins](https://www.informit.com/articles/article.aspx?p=24386&seqNum=5)
- [InformIT — SCTP and the move from UDP to its own IP protocol number](https://www.informit.com/articles/article.aspx?p=24386&seqNum=6)
- [Pebblebed — Linux kernel bug latency by subsystem](https://pebblebed.com/blog/kernel-bugs)
- [Red Hat — SCTP tuning solution](https://access.redhat.com/solutions/6625041)
- [SUSE security advisory — CVE-2021-3772](https://www.suse.com/security/cve/CVE-2021-3772.html)
- [Ubuntu security tracker — CVE-2021-3772](https://ubuntu.com/security/CVE-2021-3772)
- [Amazon Linux — CVE-2024-0639](https://alas.aws.amazon.com/cve/html/CVE-2024-0639.html)
- [CVE Details — CVE-2020-6514 in usrsctp](https://www.cvedetails.com/cve/CVE-2020-6514/)
- [Google support — vulnerable WebRTC versions notice](https://support.google.com/faqs/answer/12577537)
- [walterfan — WebRTC SCTP notes](https://walterfan.github.io/webrtc_note/4.code/webrtc_sctp.html)
- [Microsoft narkive thread — Windows support for SCTP](https://microsoft.public.win32.programmer.networks.narkive.com/Ul1Xs3T8/windows-support-for-sctp)
- [Microsoft Q&A — SCTP driver question](https://learn.microsoft.com/en-us/answers/questions/778329/sctp-driver)

### Standards documents and registries

- [IANA Protocol Numbers registry — SCTP is 132, assigned to Randall_R_Stewart](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xml)
- [ETSI TS 138 412 — 5G NG-AP signalling transport](https://www.etsi.org/deliver/etsi_ts/138400_138499/138412/15.00.00_60/ts_138412v150000p.pdf)
- [ETSI TS 138 472 — 5G F1-AP signalling transport](https://www.etsi.org/deliver/etsi_ts/138400_138499/138472/15.02.00_60/ts_138472v150200p.pdf)

### Implementations and tools

- [Linux lksctp-tools](https://github.com/sctp/lksctp-tools)
- [usrsctp — userspace SCTP, FreeBSD-derived](https://github.com/sctplab/usrsctp)
- [dcSCTP — Chrome WebRTC's in-tree SCTP, Rust port](https://github.com/webrtc/dcsctp)
- [sctp.de — Tüxen's SCTP reference page](https://www.sctp.de/sctp.html)
- [Wireshark SCTP wiki](https://wiki.wireshark.org/SCTP)
- [Tüxen at FH Münster on dblp](https://dblp.org/pid/43/6209.html)

### News and reference

- [Wikipedia — Stream Control Transmission Protocol](https://en.wikipedia.org/wiki/Stream_Control_Transmission_Protocol)
- [Wikipedia — SIGTRAN](https://en.wikipedia.org/wiki/SIGTRAN)
- [Wikipedia — Diameter protocol](https://en.wikipedia.org/wiki/Diameter_(protocol))
- [The Register forum — SCTP and the QUIC vs TCP discussion](https://forums.theregister.com/forum/all/2022/10/07/quic_tcp_replacement/)
- [Stewart & Xie — *Stream Control Transmission Protocol: A Reference Guide* (Addison-Wesley, 2001)](https://www.amazon.com/Stream-Control-Transmission-Protocol-SCTP/dp/0201721864)
