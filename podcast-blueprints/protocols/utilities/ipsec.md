---
id: ipsec
type: protocol
name: Internet Protocol Security
abbreviation: IPsec
etymology: "[I]nternet [P]rotocol [Sec]urity"
category: utilities
year: 1995
rfc: RFC 4301 / 7296
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - wireless/the-shared-medium
related_protocols: [ip, ipv6, udp, tcp, tls, bgp, ospf, quic, wireguard, ssh, wifi, icmp]
related_pioneers: [charlie-kaufman, tero-kivinen, randall-atkinson, phil-karn, andreas-steffen, paul-wouters, jason-donenfeld]
related_outages: []
related_frontier: []
related_rfcs: [4302, 4303, 7296, 4301, 8784, 9242, 9370, 4555, 9347, 4821]
related_journeys: [carrier-ipsec-backhaul]
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Ipsec-ah.svg/500px-Ipsec-ah.svg.png", caption: "IPsec's Authentication Header — the simpler, NAT-hostile half of the architecture. Authenticates the IP header and payload, encrypts nothing. Almost no production deployment uses AH alone in 2026; ESP, which encrypts and authenticates in one AEAD pass, has won.", credit: "Image: Wikimedia Commons / CC BY-SA" }
visual_cues:
  - "An ESP packet exploded into its parts: 32-bit SPI in dark blue, 32-bit sequence number in green, 8-byte GCM IV in amber, ciphertext in grey, 16-byte AEAD tag in red. Outer IPv4 header floating above with protocol=50 highlighted."
  - "IKEv2 site-to-site bring-up as a swimlane: HQ firewall on the left, Branch on the right. Five horizontal arrows top to bottom — IKE_SA_INIT, IKE_INTERMEDIATE (ML-KEM), IKE_AUTH, ESP, CREATE_CHILD_SA. UDP/500 turns into UDP/4500 after the NAT_DETECTION mismatch is shown."
  - "World map with every cellular base station as a tiny lit dot, each connected to its mobile core through a green encrypted tunnel labelled 'IPsec ESP, IKEv2 cert auth, 3GPP TS 33.501 §9'."
  - "Side-by-side LoC bar chart: WireGuard at ~4,000 lines (one short bar) versus the OpenVPN + Linux XFRM + strongSwan + SoftEther stack at 116,730 lines (a bar 30x taller). Caption from Donenfeld's NDSS 2017 deck."
  - "Anti-replay window as a sliding 32-cell bitmap labelled 'RFC 4303 §3.4.3 default'. Out-of-order packets at 10 Gbps slam into the left edge and bounce off as 'DROPPED'. A second window labelled '1024' below, with the same packets all landing inside."
  - "Karn v. State Department: a printed copy of Applied Cryptography labelled 'First Amendment-protected speech' next to a 3.5-inch floppy with the same code labelled 'Munition under ITAR'. 1996."
---

# IPsec — Internet Protocol Security

## In one breath

IPsec is the IETF's network-layer cryptographic envelope. Where TLS wraps a single TCP stream and SSH wraps a single remote session, IPsec encrypts entire IP packets — host-to-host, gateway-to-gateway, or both — and lives inside the network stack rather than above it. Every site-to-site VPN, every 3GPP LTE and 5G base station, every IKEv2 client tunnel on macOS, iOS, Windows, and Android runs it. As of May 2026 it is also the first mainstream VPN with a real, deployable post-quantum story.

## The pitch (cold-open)

In August 2016 a group called The Shadow Brokers dumped a cache of NSA hacking tools on the open internet. One of the binaries, BENIGNCERTAIN, fired malformed IKEv1 packets at Cisco PIX firewalls and read VPN private keys straight out of memory. That single leak ended the IKEv1 era, accelerated the move to IKEv2, and forced Cisco to find a related flaw in still-supported products — CVE-2016-6415. Eight years later, in December 2024, strongSwan 6.0 shipped native ML-KEM key exchange, making IPsec the first mainstream VPN with a deployable post-quantum handshake. This episode is about the protocol that sits between those two events: how it actually works on the wire, why every cellular carrier on Earth is forced to run it, and what is changing right now.

## How it actually works

Two peers run a short IKEv2 handshake to set up a Security Association — a one-way, keyed cryptographic relationship identified by a 32-bit Security Parameters Index. Bidirectional traffic uses two SAs. Once the SAs are installed in the kernel, every outbound IP packet that matches the Security Policy Database is wrapped in an ESP header, AEAD-encrypted, and forwarded.

The simulator transcript walks the full bring-up between an HQ firewall and a Branch firewall.

**Step 1 — IKE_SA_INIT request.** HQ sends the first message on UDP/500. There are no keys yet, so the message is in the clear. It carries a proposal — for example AES-GCM-256 with PRF-HMAC-SHA-2-512 and ML-KEM-768 — a Diffie-Hellman or KEM public value, a 32-byte nonce, and two NAT_DETECTION notify payloads that hash the source and destination IP and port.

**Step 2 — IKE_SA_INIT response.** Branch picks one proposal, sends its own KE and nonce, requests a certificate. Both sides now derive SKEYSEED and the IKE SA key material. Every later exchange is encrypted with it.

**Step 3 — switch to UDP/4500 if NAT was detected.** The NAT_DETECTION hashes don't match if a NAT box rewrote the source IP, which is the common case for any branch behind a typical home or hotel router. Both sides flip to UDP/4500 and prefix every later packet with a four-byte non-IKE marker so the receiver can tell IKE messages apart from ESP packets on the same port.

**Step 4 — IKE_INTERMEDIATE for ML-KEM.** ML-KEM public keys and ciphertexts are over a kilobyte each, too large for IKE_SA_INIT, where IKE-layer fragmentation is not allowed. RFC 9242 added IKE_INTERMEDIATE, an authenticated exchange that runs after IKE_SA_INIT and before IKE_AUTH and is fragmentable. RFC 9370 then allows up to seven chained KE rounds, each potentially a different KEM. strongSwan 6.0 uses both to layer ML-KEM-768 on top of a classical X25519 or P-384.

**Step 5 — IKE_AUTH.** HQ sends an encrypted, authenticated payload containing its identity, its certificate, an AUTH payload that signs the prior IKE_SA_INIT messages, the proposal for the first Child SA, and the Traffic Selectors that say which inner IP ranges belong on the tunnel.

**Step 6 — IKE_AUTH response and Child SA installed.** Branch verifies the signature, returns its own identity and certificate, and the agreed Child SA. The Linux kernel now has SAD entries in both directions and the data plane can carry traffic.

**Step 7 — ESP data flow.** An inner packet — say a TCP/443 segment from 10.0.0.5 to 10.1.0.42 — is matched against the SPD, encapsulated in ESP tunnel mode with AES-GCM-256, and sent in a fresh outer IPv4 datagram to UDP/4500. Receiver looks up the SA by SPI, validates the 128-bit GCM tag, decrypts, and forwards the inner packet.

**Step 8 — CREATE_CHILD_SA rekey.** Eight hours later, before the soft lifetime fires, HQ initiates CREATE_CHILD_SA with a REKEY_SA notify and an optional fresh KE round for forward secrecy. The new SA is installed; the old SA is kept briefly so in-flight packets drain, then deleted. Users see nothing.

**Step 9 — DPD.** Either side can fire an empty INFORMATIONAL exchange as a Dead-Peer-Detection keepalive. Common policy is every 30 seconds, declare dead after four failures.

### Header at a glance

The ESP header is small and the same on every packet.

- 32-bit Security Parameters Index — the cookie the receiver uses to look up the SA.
- 32-bit Sequence Number — auto-incrementing, the input to the anti-replay check. The Extended Sequence Number variant keeps the low 32 bits on the wire and a 64-bit logical counter in memory for 10 Gbps and faster links so the counter does not wrap before rekey.
- Variable-length payload — for AES-GCM, an 8-byte explicit IV followed by the ciphertext.
- Up to 255 bytes of padding, then a one-byte Pad Length and a one-byte Next Header that names the inner protocol — value 4 for IPv4-in-IPv4, the tunnel-mode case.
- Variable-length Integrity Check Value — for AEAD ciphers, this is the 16-byte authentication tag.

The Authentication Header is the integrity-only sibling — IP protocol 51, with no encryption. Because it covers the immutable bits of the outer IP header, AH breaks any time a NAT box rewrites the source address. RFC 4303 explicitly notes that ESP with NULL encryption gives you the integrity-only service AH originally offered without breaking NAT, which is why almost no one runs AH alone in 2026.

The IKEv2 message header carries two 64-bit SPIs that name the IKE SA, an 8-bit Exchange Type — 34 for IKE_SA_INIT, 35 for IKE_AUTH, 36 for CREATE_CHILD_SA, 37 for INFORMATIONAL, 43 for IKE_INTERMEDIATE — and a 32-bit Message ID for retransmission and ordering.

### State machine in three sentences

An IKEv2 SA goes from INITIAL to IKE_SA_INIT_SENT to IKE_AUTH_SENT to ESTABLISHED with two round trips, then stays in ESTABLISHED for hours, looping back to itself for every CREATE_CHILD_SA rekey, every INFORMATIONAL keepalive, and every MOBIKE address update. If the laptop roams from Wi-Fi to LTE and MOBIKE is on, the SA briefly enters MOBIKE_UPDATING and rejoins ESTABLISHED with a new outer address pair, no re-authentication. A DELETE INFORMATIONAL takes it through DELETING to CLOSED, the SPIs are returned to the free pool, and the next packet matching the SPD will trigger a fresh IKE_SA_INIT.

### Reliability, flow, security mechanics

Encryption and integrity are AEAD in one pass — AES-GCM-128 or 256, ChaCha20-Poly1305 on devices without AES-NI, AES-CCM where it is mandated. The negotiated cipher binds the SPI and sequence number as associated data, so any tampering with the header invalidates the tag.

Replay defence is a sliding bitmap of recently seen sequence numbers. RFC 4303 §3.4.3 sets the default to 32 entries, recommends 64, and warns that on high-throughput parallel links the default is "often too small." On a 10 Gbps tunnel with ECMP across multiple kernel queues, packets routinely arrive far enough out of order to fall outside a 32-entry window and get dropped. The fix is a one-line change — `replay-window 1024` on the Linux side — and it is the single most common reason a tuned site-to-site tunnel quietly loses 0.01% of packets.

Forward secrecy is optional but standard. Each Child SA can be rekeyed with a fresh ECDH or KEM round so a future key compromise does not unlock past traffic.

The post-quantum story is now in three layers. RFC 8784 — Fluhrer, Kampanakis, McGrew, and Smyslov, June 2020 — lets a static post-quantum pre-shared key be mixed into the IKEv2 key schedule after IKE_SA_INIT. Cisco IOS XE, Palo Alto PAN-OS, strongSwan, and Libreswan all ship it. RFC 9242 added the IKE_INTERMEDIATE exchange to carry large PQ payloads. RFC 9370 added the multi-KE framework. The current draft, draft-ietf-ipsecme-ikev2-mlkem-05 from Panos Kampanakis at AWS, was published 14 March 2026 and is the closest yet to RFC.

## Where it shows up in production

The single largest IPsec deployment on Earth is the cellular carrier network. 3GPP TS 33.401 §11–12 mandates IPsec ESP and IKEv2 certificate authentication on the LTE S1 and X2 interfaces. 3GPP TS 33.501 §9 makes ESP plus IKEv2 cert auth mandatory-to-implement on every 5G gNB and ng-eNB across the N2, N3, Xn, F1, and E1 interfaces — the latest revision is ETSI TS 133 501 v18.9.0, April 2025. Every cellular base station in the world is, in effect, an IPsec endpoint. The reason is mundane and decisive: IPsec is the only widely deployed VPN that natively carries BGP, OSPF, and multicast on a tunnel interface.

The cloud hyperscalers all sell IPsec as the universal "connect my on-prem to my VPC" SKU. AWS Site-to-Site VPN runs IKEv2 with AES-256-GCM and ECDH groups 19 through 24, at 1.25 Gbps per Standard tunnel and 5 Gbps per Large Bandwidth tunnel; ECMP across tunnels gets you higher aggregate. Azure VPN Gateway scales from 650 Mbps on the VpnGw1AZ SKU up to 10 Gbps aggregate on VpnGw5AZ; the legacy Standard and HighPerformance SKUs are deprecating 30 June 2026 with auto-migration through September. GCP Cloud VPN's HA variant offers 99.99% SLA with 3 Gbps per direction per tunnel.

The two reference open-source implementations between them run almost every Linux IPsec deployment. strongSwan started as Andreas Steffen's project at HSR Rapperswil and is now under the OST team; secunet AG bought it in June 2022 and uses it as the core of the BSI SINA high-security solution. strongSwan 6.0.0, released 3 December 2024, is the first mainstream IKEv2 stack with native ML-KEM-512, 768, and 1024 — via Botan 3.6.0+, wolfSSL 5.7.4+, and AWS-LC 1.37.0+ — and full RFC 9370 multi-KE. Libreswan is the descendant of FreeS/WAN through Openswan, maintained by Paul Wouters at Aiven, shipped as the default IPsec stack in Red Hat Enterprise Linux, Fedora, AlmaLinux, and Rocky. Libreswan 5.2, released 26 February 2025, added RFC 9347 IP-TFS and PPK carriage in IKE_INTERMEDIATE.

Every modern operating system has a native IKEv2 client. Apple iOS and macOS have shipped one since iOS 9 and OS X 10.11 in 2015, configured via `.mobileconfig`. Microsoft Always-On VPN is the IKEv2 + EAP-TLS profile baseline on Windows 10 and 11 enterprise. Android has shipped native IKEv2 with PSK and EAP since Android 12. OpenBSD has shipped Reyk Floeter's clean-room `iked(8)` since OpenBSD 4.8 in 2010.

Every major firewall vendor — Cisco ASA, Firepower, IOS XE and IOS XR, Juniper SRX and Junos, Fortinet FortiGate, Palo Alto, OPNsense, pfSense — runs IKEv1 and IKEv2. Cisco shipped RFC 8784 PPK in IOS XE 17.x. Palo Alto PAN-OS and Juniper Junos ship it now too.

## Things that go wrong

The most consequential incident is the Shadow Brokers dump on 15 August 2016. The cache contained BENIGNCERTAIN, nicknamed PIXPocket by researcher Mustafa Al-Bassam, a three-binary toolchain that fired malformed IKEv1 packets at Cisco PIX firewalls and read configuration secrets — RSA private keys, IKE pre-shared keys, IKEv2 VPN keys — straight out of the device's RAM. PIX 5.2(9) through 6.3(4) were vulnerable. Cisco had declared the PIX line end-of-life in 2009, but tens of thousands of devices were still in service.

What followed is the part to remember. Cisco's PSIRT, triggered by the leak, found a related memory-disclosure flaw in the IKEv1 packet-processing code of currently supported IOS, IOS XE, and IOS XR. They published advisory cisco-sa-20160916-ikev1 on 16 September 2016 with CVE-2016-6415 — "insufficient condition checks in the part of the code that handles IKEv1 security negotiation requests" — confirmed in-the-wild exploitation, and shipped IPS signatures because there was no patch on disclosure. IKEv2 was not affected. The episode ended the IKEv1 era at any organisation paying attention.

The 2018 USENIX Security paper from Felsch, Grothe, Schwenk at Ruhr-University Bochum and Czubak and Szymanek at Opole — "The Dangers of Key Reuse: Practical Attacks on IPsec IKE" — turned IKEv1's complexity into a working exploit. Reusing an RSA key pair across IKEv1 PKE and RPKE modes and between IKEv1 and IKEv2 enabled a Bleichenbacher oracle that gave cross-protocol authentication bypass. The CVE list is CVE-2018-0131 against Cisco, CVE-2017-17305 against Huawei, CVE-2018-8753 against Clavister, and CVE-2018-9129 against ZyXEL. The same paper disclosed an offline dictionary attack on IKEv1 PSK aggressive mode.

Two strongSwan-specific incidents are worth knowing. CVE-2021-45079 was an EAP success/failure handling regression in strongSwan 5.9.4 that allowed authentication bypass with EAP-only auth. CVE-2023-26463, disclosed 2 March 2023, was nastier — `tls_find_public_key()` returned a non-NULL pointer for untrusted certificates after a 2022 optimisation, and a reference-count error then dereferenced an expired pointer. Both were fixed quickly.

The architectural critique that everyone misquotes is older. Bruce Schneier and Niels Ferguson's 1999 paper "A Cryptographic Evaluation of IPsec" called the design "too complex to be secure" — and in the same paragraph concluded that IPsec is "the best IP security protocol available at the moment." Engineers cite the first half. Regulators cite the second.

## Common pitfalls (for the practitioner)

**Anti-replay window 32 drops legitimate packets at 10 Gbps.** RFC 4303 §3.4.3's default of 32 entries is too small for a high-throughput tunnel with ECMP across multiple parallel queues. Symptom: the tunnel is up, throughput looks fine, you lose 0.01% of packets and cannot find them in any log. Cure: `ip xfrm state ... replay-window 1024` on every Linux gateway carrying more than a gigabit, or enable Extended Sequence Number.

**PMTU black holes silently kill long flows.** Tunnel-mode ESP adds 36 to 80 bytes of overhead — 20 for the outer IPv4 header, 8 for UDP if NAT-T, 4 for SPI, 4 for sequence number, 2 for pad and next-header, 16 for the AES-GCM tag. If an upstream firewall drops the ICMP "fragmentation needed" message — a very common security policy — the connection completes its handshake and then hangs after the first few kilobytes. Cure: clamp the inner TCP MSS at the gateway with `iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu`, or enable PLPMTUD per RFC 4821.

**Roadwarriors die on Wi-Fi to LTE handoff without MOBIKE.** A laptop session that came up on hotel Wi-Fi will tear down the moment it switches to LTE — the IKE SA is bound to the original source IP and port. Cure: enable MOBIKE per RFC 4555 on both ends — `mobike=yes` in strongSwan. Built into Apple's native client; opt-in everywhere else.

**Tunnel up, no traffic flows.** Almost always an SPD-versus-SAD mismatch. The outbound packet matches a "protect" SPD entry that points at an SA that does not yet exist, or the peer's traffic selectors are narrower than yours. `ip -s xfrm policy` and `ip -s xfrm state` show the counters — the side that should be encrypting will have non-zero "missing SA" counts.

**IKE_AUTH succeeds, no Child SA installed.** Identity or PKI mismatch. One side has `leftid=@hq.example.com`, the other has `leftid="C=US, O=Acme"`, and the AUTH payload signature does not bind what the peer is checking.

**NAT-T detection works on UDP/500 but the tunnel cannot move to UDP/4500.** A NAT mangled the IKE source port but a firewall blocks 4500 outright. Force NAT-T encapsulation with `forceencaps=yes` for client-side roadwarriors so even unNATted traffic uses 4500 from the start.

## Debugging it

On Linux, the kernel data plane is XFRM and the userspace daemon is charon (strongSwan) or pluto (Libreswan).

```
swanctl --load-all                 # strongSwan: reload config
swanctl --initiate --child name    # bring a Child SA up
swanctl --list-sas                 # show active IKE and Child SAs
ipsec status                       # Libreswan equivalent
ip xfrm state                      # kernel SAD
ip xfrm policy                     # kernel SPD
ip -s xfrm state                   # with packet/byte counters
```

For packet capture, three filters cover essentially everything:

```
tcpdump -ni eth0 'udp port 500 or udp port 4500 or proto 50 or proto 51'
```

In Wireshark, `isakmp` matches all IKEv1 and IKEv2 frames, `esp` matches all ESP, `udp.port == 500 || udp.port == 4500` covers IKE and NAT-T-encapsulated ESP, `isakmp.exchangetype == 34` filters down to IKE_SA_INIT and `35` to IKE_AUTH, `tcp.port == 4500` is RFC 8229 IKE-over-TCP.

Decrypting ESP in Wireshark is two clicks. Edit → Preferences → Protocols → ESP → "ESP SAs" → Edit, then for each direction add: protocol family, source IP, destination IP, SPI as `0x...`, encryption algorithm, encryption key as hex, authentication algorithm, authentication key. Keys come from `ip xfrm state` on Linux or `vppctl show ipsec sa` on VPP. To decrypt the IKEv2 control plane itself, set the IKEv2 Decryption Table with the SK_ei, SK_er, SK_ai, and SK_ar values from the charon log at log-level 4.

The Linux sysctls that matter for an IPsec gateway:

```
net.ipv4.ip_forward = 1
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.rp_filter = 2     # loose RPF for asymmetric tunnels
net.core.xfrm_aevent_etime = 10
net.core.xfrm_aevent_rseqth = 2
```

## What's changing in 2026

**14 March 2026 — draft-ietf-ipsecme-ikev2-mlkem-05.** The fifth revision of the IPsec working group draft that registers ML-KEM-512, 768, and 1024 in IKEv2 either standalone or as a hybrid `keX_` round after a classical (EC)DH. Authored by Panos Kampanakis at AWS. The IANA code points for the new group numbers are still pending; vendor implementations may shift before the RFC is published.

**18 January 2026 — FrodoKEM hybrid adoption call closes.** The IPsec working group adopted draft-wang-ipsecme-hybrid-kem-ikev2-frodo, the conservative-lattice alternative for sites that do not want to bet only on module-lattices. IPsec will likely ship multiple PQ KEMs side by side.

**16 October 2025 — draft-ietf-ipsecme-ikev2-pqc-auth-05.** Reddy, Smyslov, and Fluhrer's draft to register ML-DSA and SLH-DSA as IKEv2 AUTH method values — post-quantum signatures, not just post-quantum key exchange.

**26 February 2025 — Libreswan 5.2.** RFC 5723 IKE Session Resumption, RFC 9347 IP-TFS for traffic-flow security, and PPK carriage in the IKE_INTERMEDIATE exchange via draft-ietf-ipsecme-ikev2-qr-alt.

**3 December 2024 — strongSwan 6.0.0.** Native ML-KEM-512, 768, and 1024 via Botan, wolfSSL, and AWS-LC, plus full RFC 9370 multi-KE. The first production-quality hybrid post-quantum VPN.

**13 August 2024 — NIST FIPS 203.** ML-KEM, the standardised form of CRYSTALS-Kyber, finalised. This is the post-quantum KEM the IPsec drafts wire into IKEv2.

**August 2023 — RFC 9347 IP-TFS.** Defines fixed-size aggregated packets inside ESP tunnels to defeat traffic-analysis attacks that infer activity from packet sizes — the architectural answer to "your VPN hides what you say but not how much you say." Now shipped in Libreswan.

The longer arc: PPK first, because it is purely additive and changes nothing on the wire; then IKE_INTERMEDIATE plus multi-KE in shipped code; then ML-KEM as a registered KE method as soon as the draft becomes an RFC. Major vendors are expected to ship full ML-KEM hybrid in production by late 2026.

## Fun facts (host material)

**Phil Karn sued the State Department over Bruce Schneier's book.** In 1995 Karn tried to export *Applied Cryptography*. The State Department classified the printed book as First-Amendment-protected speech but the floppy disk containing the same code as a regulated munition under ITAR. *Karn v. U.S. State Department*, 1994 to 1996, became one of the founding "code is speech" cases. Karn would shortly thereafter be acknowledged in RFC 1827, the original ESP specification.

**Ferguson and Schneier's "I told you so" paper actually endorsed IPsec.** The 2003 Ferguson–Schneier critique is the most-cited "I told you so" in network security — practitioners love quoting its complexity warnings. But the full text concludes IPsec is "the best IP security protocol available at the moment." Engineers cite the first half. Regulators cite the second.

**The NSA exploit and the working group meet in the same building.** The Shadow Brokers leak in August 2016 revealed BENIGNCERTAIN, an NSA exploit that pulled Cisco PIX VPN private keys from IKEv1. The IPSECME working group routinely seats Cisco, Microsoft, AWS, and NSA Cybersecurity Directorate engineers at the same table. RFC 8784 — the post-quantum PPK spec — is co-authored by Scott Fluhrer and David McGrew at Cisco, Panos Kampanakis (now at AWS), and Valery Smyslov at ELVIS-PLUS, formerly Russian crypto research. IPsec has always been multi-government.

**WireGuard is about 4,000 lines; the IPsec stack is six digits.** Jason Donenfeld's 2017 NDSS paper counted 116,730 lines of code across OpenVPN, the Linux XFRM stack, strongSwan, and SoftEther. The comparison is biased — XFRM does more — but the order of magnitude is right. WireGuard's minimalism is a direct response to IPsec's architectural sprawl, and IPsec's sprawl is a direct response to thirty years of interop requirements no clean-slate design has yet had to face.

**Tero Kivinen has been editing the IKEv2 specs for two decades.** He was at SSH Communications Security in Helsinki when IKEv1 was being designed, then AuthenTec, then INSIDE Secure. He is on RFC 4434 (2006), RFC 7296 (2014, the Internet Standard), RFC 7427, RFC 7670, RFC 6467, and RFC 7815. No single living engineer has written down what an IPsec implementation actually does, in normative IETF prose, more times.

**OpenBSD's IKEv2 daemon was written from scratch as a deliberate alternative.** Reyk Floeter wrote `iked(8)` clean-room and shipped it in OpenBSD 4.8 in 2010, specifically as a small, audit-friendly counterweight to isakmpd and strongSwan. It has been the default OpenBSD VPN stack ever since.

## Where this connects in the book

- Part Wireless, chapter "The shared medium" — wireless networks are where the real-world MTU problems, mobility events, and NAT pain that IPsec must survive all live. The chapter explains why the medium itself fights you; this episode explains how MOBIKE, NAT-T, and IKE-over-TCP let an IPsec tunnel survive a hotel Wi-Fi captive portal and a Wi-Fi-to-LTE handoff.

The historical arc — SP3 and swIPe in the early 1990s, Atkinson's first RFCs in 1995, the 1998 RFC 2401 family, the 2005 RFC 4301 rewrite, the 2014 STD 79 promotion of IKEv2, the 2016 Shadow Brokers thriller, and the post-quantum work since 2020 — is told in the BENIGNCERTAIN incident discussion above and in the chapter on the shared medium. The protocol page itself stays focused on mechanism and current production reality.

## See also (other protocol episodes)

**The IP and IPv6 episodes.** IPsec lives below TCP and above IP. AH is IP protocol 51, ESP is IP protocol 50. RFC 2460 originally mandated IPsec for IPv6; RFC 6434 in December 2011 relaxed that to a SHOULD. AH and ESP are extension headers in the IPv6 next-header chain.

**The TLS episode.** TLS wraps a single TCP bytestream; IPsec wraps every IP packet. That is the entire comparison. TLS-VPNs like OpenVPN, Cisco AnyConnect, and SSTP exist because TLS goes through any 443-permitting firewall and any captive portal, at the cost of head-of-line blocking when run over TCP and of having to re-implement IP fragmentation above the bytestream. RFC 8229 — IKE and ESP over TCP — is IPsec's answer.

**The WireGuard episode is the headline contrast.** WireGuard has eaten the single-user, self-hosted, modern-OS segment: Tailscale, every personal mesh, every cloud-VM-to-cloud-VM tunnel for developers. IPsec retains everywhere a contract is signed: telco backhaul, enterprise SD-WAN, regulated-industry site-to-site, every major firewall vendor, every government certification regime, and every place EAP, Kerberos, X.509, RADIUS, or SCEP are required. WireGuard's 4,000 lines of kernel code and fixed cipher suite are the entire reason it escapes the class of attacks that have hit IPsec since 1998. "No negotiation" is also exactly what makes WireGuard unusable where a regulator or a 3GPP TS says "use this cipher with these certs from this CA."

**The QUIC episode.** Drafts in IPSECME and MASQUE explore wrapping ESP inside QUIC streams to get multipath, connection migration, and a faster handshake. The motivation is identical to RFC 8229 but with QUIC's better congestion control.

**The BGP and OSPF episodes.** GRE-over-IPsec is the classic Cisco pattern — GRE encapsulates a multicast and routing-capable tunnel, IPsec encrypts it. It exists because IPsec tunnel mode is unicast and selector-bound, and routing protocols need multicast.

**The SSH episode.** SSH is the application-layer cousin: a secure shell over a single TCP stream, with port forwarding bolted on. IPsec is the network-layer alternative: secure every packet, no application changes.

## Visual cues for image generation

- Exploded ESP packet diagram with field widths and colours called out — SPI, sequence number, IV, ciphertext, AEAD tag, outer IP header with protocol=50.
- IKEv2 site-to-site bring-up swimlane: HQ on the left, Branch on the right, vertical time, IKE_SA_INIT then IKE_INTERMEDIATE then IKE_AUTH then ESP then CREATE_CHILD_SA, with the UDP/500-to-UDP/4500 switch shown after NAT_DETECTION mismatches.
- World map of every cellular base station as a tiny dot, each with a green ESP tunnel back to its mobile core, captioned with TS 33.501 §9.
- WireGuard versus IPsec line-of-code bar chart from Donenfeld's NDSS 2017 deck: 4,000 versus 116,730.
- Anti-replay window animation: a 32-cell sliding bitmap dropping out-of-order 10 Gbps packets, then a 1024-cell window catching the same packets.
- Karn v. State Department: a printed copy of *Applied Cryptography* labelled "speech" next to a 3.5-inch floppy with the same code labelled "munition."

## Sources

**RFCs.**
- [RFC 4301 — Security Architecture for the Internet Protocol](https://www.rfc-editor.org/rfc/rfc4301)
- [RFC 4302 — IP Authentication Header (AH)](https://www.rfc-editor.org/rfc/rfc4302)
- [RFC 4303 — IP Encapsulating Security Payload (ESP)](https://www.rfc-editor.org/rfc/rfc4303.html)
- [RFC 7296 — Internet Key Exchange Protocol Version 2 (IKEv2)](https://www.rfc-editor.org/rfc/rfc7296)
- [RFC 8784 — Mixing Preshared Keys in the IKEv2 Internet Key Exchange](https://www.rfc-editor.org/rfc/rfc8784)
- [RFC 9242 — Intermediate Exchange in the IKEv2 Protocol](https://www.rfc-editor.org/rfc/rfc9242)
- [RFC 9347 — IP-TFS (Traffic Flow Security)](https://www.rfc-editor.org/rfc/rfc9347)
- [RFC 9370 — Multiple Key Exchanges in the IKEv2 Protocol](https://www.rfc-editor.org/rfc/rfc9370)
- [RFC 4821 — Packetization Layer Path MTU Discovery](https://www.rfc-editor.org/rfc/rfc4821)
- [RFC 1825 (historical, the original architecture)](https://datatracker.ietf.org/doc/rfc1825/)

**Papers.**
- [Felsch et al., "The Dangers of Key Reuse: Practical Attacks on IPsec IKE," USENIX Security 2018](https://www.usenix.org/conference/usenixsecurity18/presentation/felsch)
- [Ferguson & Schneier, "A Cryptographic Evaluation of IPsec"](https://www.schneier.com/wp-content/uploads/2016/02/paper-ipsec.pdf)
- [Donenfeld, "WireGuard: Next Generation Kernel Network Tunnel," NDSS 2017](https://www.ndss-symposium.org/ndss2017/ndss-2017-programme/wireguard-next-generation-kernel-network-tunnel/)

**Vendor and engineering blogs.**
- [strongSwan documentation](https://docs.strongswan.org)
- [strongSwan project home](https://strongswan.org)
- [Libreswan project home](https://libreswan.org)
- [Libreswan wiki](https://libreswan.org/wiki/)
- [OpenBSD `iked(8)` man page](https://man.openbsd.org/iked)
- [WireGuard project home](https://www.wireguard.com/)
- [Paul Wouters — nohats.ca](https://nohats.ca/wordpress/ietf/)
- [IETF IPSECME working group](https://datatracker.ietf.org/wg/ipsecme/)

**News and security advisories.**
- [Cisco advisory cisco-sa-20160916-ikev1 (CVE-2016-6415)](https://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20160916-ikev1.html)
- [strongSwan CVE-2023-26463 advisory](https://strongswan.org/blog/2023/03/02/strongswan-vulnerability-(cve-2023-26463).html)
- [CVE-2021-45079](https://www.cve.org/CVERecord?id=CVE-2021-45079)
- [FragAttacks (2021)](https://www.fragattacks.com/)

**Wikipedia and primary sources.**
- [Wikipedia — IPsec](https://en.wikipedia.org/wiki/IPsec)
- [Wikipedia — Phil Karn](https://en.wikipedia.org/wiki/Phil_Karn)
- [Wikipedia — Hugo Krawczyk](https://en.wikipedia.org/wiki/Hugo_Krawczyk)
- [Phil Karn, Geek of the Week interview (Carl Malamud, 1994)](http://opentranscripts.org/transcript/geek-of-the-week-phil-karn/)
- [Tero Kivinen — IETF datatracker](https://datatracker.ietf.org/person/kivinen@iki.fi)
- [Paul Wouters — IETF datatracker](https://datatracker.ietf.org/person/paul.wouters@aiven.io)
