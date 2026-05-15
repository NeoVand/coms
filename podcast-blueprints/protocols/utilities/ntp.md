---
id: ntp
type: protocol
name: Network Time Protocol
abbreviation: NTP
etymology: "[N]etwork [T]ime [P]rotocol"
category: utilities-security
year: 1985
rfc: RFC 5905
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - layer-2-3/icmp
  - transport/udp
  - utilities-security/ntp
related_protocols: [udp, tls]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [778, 958, 1059, 1119, 1305, 5905, 5906, 7822, 8573, 8915, 9109, 9523, 9748, 9769]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nist-f1.jpg/500px-Nist-f1.jpg
    caption: The NIST-F1 cesium fountain atomic clock, accurate to one second in 100 million years. Atomic clocks like this are the Stratum 0 reference that NTP distributes down through the hierarchy to every device on the internet.
    credit: Photo — NIST / Public Domain, via Wikimedia Commons
visual_cues:
  - "An illustrated NTP packet, 48 bytes, drawn as a vertical stack of 32-bit rows. Top row split into LI (2 bits), VN (3 bits), Mode (3 bits), Stratum (8 bits), Poll (8 bits), Precision (8 bits). Then Root Delay, Root Dispersion, a 4-character REFID box reading 'GPS', and four 64-bit timestamps labelled Reference, T1 Origin, T2 Receive, T3 Transmit. Caption underneath: 'The whole protocol fits in one UDP datagram.'"
  - "The four-timestamp diagram. Two vertical timelines, Client on the left and Server on the right. T1 fires from Client at 14:30:00.123456. The diagonal arrow lands at Server T2 = .123478. Server replies at T3 = .123502. Arrow lands back at Client T4. Two equations on the side: 'offset = ((T2 − T1) + (T3 − T4)) / 2' and 'delay = (T4 − T1) − (T3 − T2)'. A small note: 'assumes symmetric latency.'"
  - "A pyramid of stratums. At the apex, Stratum 0 — a cesium fountain icon, a GPS satellite, a DCF77 long-wave antenna. Below it, Stratum 1 servers labelled time.nist.gov, tick.usno.navy.mil, nts.netnod.se. Below that, Stratum 2 (pool.ntp.org cluster) feeding Stratum 3 (your laptop, a phone, a Raspberry Pi). At the bottom in red: 'Stratum 16 — unsynchronised.'"
  - "A bar chart of the 10 February 2014 amplification attack. Left bar: 234 bytes, labelled 'monlist query'. Right bar, dwarfingly larger: 48,000 bytes, labelled 'response'. Above them in red: '206× amplifier'. Beside, a victim icon labelled 'Cloudflare customer, Europe — 400 Gbps'. Source count: 4,529 misconfigured NTP servers across 1,298 networks."
  - "A timeline of the NTP family tree from 1981 to 2026. Nodes: RFC 778 (1981), RFC 958 (1985), RFC 1059 NTPv1 (1988), RFC 1119 NTPv2 (1989), RFC 1305 NTPv3 (1992), RFC 5905 NTPv4 (June 2010), RFC 8915 NTS (October 2020), RFC 9523 Khronos (Feb 2024), draft-ietf-ntp-ntpv5-08 (March 2026). A red marker on 17 January 2024 reads 'David L. Mills, 1938–2024.'"
  - "A clock face split in half. Left half, ticking forward steadily, labelled TAI. Right half labelled UTC, with the same ticks but a single red gap reading 'leap second 23:59:60'. Between them, a small icon of the CGPM Resolution 4 document dated 18 November 2022 with the text 'tolerance widened in or before 2035.'"
---

# NTP — Network Time Protocol

## In one breath

NTP keeps every device on Earth aligned to the same clock by sending 48-byte UDP packets over port 123 and doing some clever arithmetic on four timestamps. It is one of the oldest protocols still in active use, and almost everything you rely on — TLS certificate validity, log correlation, distributed-database transactions, MiFID II financial reporting, the timestamps on your photos — assumes it is working in the background. When it breaks, the failures are weird, expensive, and often blamed on something else.

## The pitch (cold-open)

Every digital photo, every TLS handshake, every blockchain block, every regulated stock trade is anchored to a number that has been ticking once a second since midnight on January 1st, 1900. The man who designed that number was visually impaired, worked from a giant monitor at the University of Delaware, and ran the early internet's first routers — a handful of PDP-11s — out of a closet. His name was Dave Mills, and he died on January 17th, 2024. The clock he built is still running, and on February 7th, 2036, it will roll over.

## How it actually works

NTP is a question-and-answer protocol on UDP port 123. The client sends one 48-byte datagram and the server sends one 48-byte datagram back. From the four timestamps in that exchange, the client computes how far its clock is off and how long the round trip took. Then it does that against three or more servers, throws out the liars, weighs the rest by quality, and steers its local clock toward the consensus.

The simulator transcript walks the simplest case. The client picks a transmit moment — call it T1, say 14:30:00.123456 UTC — writes it into the Transmit Timestamp field, marks the packet as Mode 3 (client), and fires it at port 123. The server stamps T2 when the packet arrives — .123478 — assembles a response with Stratum 1, REFID "GPS", T2, and T3 = .123502 (the moment it sends), and replies. The client records T4 when the response lands. Now it has four numbers and can compute everything it needs.

### Header at a glance

The 48-byte header is dense. Every field earns its bits.

- **LI**, the Leap Indicator, two bits — warns the client that the next minute will have 61 or 59 seconds, or that the server is unsynchronised (LI = 11, the alarm value).
- **VN**, the Version Number, three bits — currently 100 (4). NTPv5 keeps the field at the same offset for compatibility.
- **Mode**, three bits — 3 = client, 4 = server. The legacy modes (1 symmetric active, 2 symmetric passive, 5 broadcast, 6 control / `ntpq`, 7 private / `ntpdc`) are the ones NTPv5 is removing because they are the ones that got abused.
- **Stratum**, eight bits — distance from a reference clock. 0 means unspecified or a Kiss-of-Death packet; 1 is a server directly attached to an atomic clock or GPS receiver; 2 syncs from 1, and so on; 16 means unsynchronised. Maximum usable stratum is 15.
- **Poll**, eight bits — signed log₂ seconds, the maximum polling interval. 6 means 64 seconds, 10 means 1024 seconds, 17 means 36 hours.
- **Precision**, eight bits — signed log₂ seconds, the local clock's resolution. -20 is about a microsecond; -24 is about 60 nanoseconds.
- **Root Delay** and **Root Dispersion**, 32 bits each — total round-trip delay and total maximum error back to the Stratum 1 root, in Q16.16 fixed-point seconds.
- **Reference ID**, 32 bits — for Stratum 1 servers, a 4-character ASCII source code: GPS, PPS, ATOM, DCFa, WWVB, LOCL. For Stratum 2 and below, the IPv4 address of the upstream peer (or the first 32 bits of an MD5 hash for IPv6). For a Kiss-of-Death packet, a 4-character reason code: DENY, RATE, RSTR, INIT.
- **Reference Timestamp** (64 bits) — when the local clock was last set.
- **Origin (T1), Receive (T2), Transmit (T3)**, 64 bits each — the three timestamps that go on the wire. T4 is the client's local arrival time and never appears in the packet.

The 64-bit timestamp itself splits into 32 bits of unsigned seconds since the prime epoch — January 1st, 1900, 00:00:00 UTC — and 32 bits of fraction (resolution about 232 picoseconds). 2³² seconds is roughly 136.19 years, so era 0 ends and era 1 begins on Friday, February 7th, 2036, at 06:28:16 UTC. NTPv4 implementations infer the era by assuming the local clock is within plus or minus 68 years of the truth; NTPv5 fixes this for good with an explicit 16-bit era field.

### State machine in three sentences

NTP is essentially stateless on the wire — every UDP exchange is self-contained, which is why the protocol could be designed on UDP in the first place. The state lives in the client's per-peer mitigation pipeline: a clock filter (an 8-deep shift register of recent samples), a clock select (Marzullo's interval-intersection algorithm rejecting "falsetickers"), a clock cluster (Byzantine clustering by jitter), a clock combine (weighted average of survivors), and a clock discipline (a hybrid PLL/FLL that slews the local clock via `adjtime()` or steps it via `settimeofday()` if the offset exceeds the 128 ms panic threshold). Across multiple peers, the consensus algorithm needs at least three for Marzullo to detect a single liar and at least four for Byzantine tolerance against one falseticker — which is why the operational rule is "configure four servers minimum."

### Reliability, security, and the math

The core math assumes symmetric latency: the upstream and downstream paths take roughly equal time. That is also why NTP runs on UDP and not TCP. TCP retransmissions, slow start, and congestion control would inject unbounded asymmetric variation and make the math meaningless. The cost is that nothing on the wire is authenticated by default — every NTPv4 packet is plaintext UDP, trivially spoofable, which is the security debt that took twelve years to repay.

Network Time Security, RFC 8915 from October 2020, is that repayment. It runs in two halves. NTS-KE (Key Exchange) opens a TLS 1.3 connection on TCP port 4460. Client and server negotiate an AEAD algorithm — AES-SIV-CMAC-256 by default — derive C2S and S2C keys via the TLS exporter, and the server hands the client eight encrypted cookies. Then the actual NTP traffic on UDP port 123 carries extension fields: a Unique Identifier, one Cookie, possibly several Cookie Placeholders, and an Authenticator-and-Encrypted field at the end. The server returns a fresh encrypted cookie in every response so the client always has eight on hand. Cookies are sealed by the server's master key, rotated every 24 hours with ten generations kept, so servers stay completely stateless.

There is a chicken-and-egg in there. NTS-KE needs a valid TLS certificate, certificate validation needs correct time, correct time needs DNS resolution, and DNS-over-TLS would need correct time too. In practice clients use whatever bad time they have to bootstrap NTS, then re-validate.

## Where it shows up in production

The reference daemon is **ntpd** from Mills's original codebase, maintained by Harlan Stenn and the Network Time Foundation, currently on the 4.2.8p18 line and active but resource-starved. Most modern Linux distributions have moved past it.

**chrony**, written by Richard Curnow and now maintained by Miroslav Lichvar at Red Hat, has been the default NTP daemon in RHEL 8, 9, and 10, in SLES 15, in Fedora, in Amazon Linux 2 and 2023, and in Oracle Linux 8 and later, since 2018. ntpd is no longer shipped on RHEL 8+. Chrony added NTS in version 4.0 in 2020 and is excellent on laptops, intermittent links, and virtualised guests.

**ntpd-rs**, the Rust rewrite from Tweede golf and the Pendulum project (originally funded by ISRG's Prossimo programme, now governed by the Trifecta Tech Foundation), reached version 1.0 in October 2023. It is packaged in Debian, Ubuntu, and Fedora, is deployed at **Let's Encrypt**, has been audited by Radically Open Security on NLnet money, and has experimental NTPv5 support for IETF interop tests. Meinberg is funding experimental PTP-with-NTS work for 2026.

**NTPsec**, Eric S. Raymond's 2015 fork with Mark Atwood and Daniel Franke, stripped the codebase from 227 KLOC to 98 KLOC and added NTS in version 1.2.0. **OpenNTPD** is the default on OpenBSD — privilege-separated, ignores leap seconds, supports HTTPS-based "constraint" anchoring. **systemd-timesyncd** is SNTP-only and ships in many minimal Debian and Ubuntu installs; the rule is do not use it on servers carrying signed transactions.

On the public-server side: **NIST**'s `time.nist.gov`, **USNO**'s `tick.usno.navy.mil` and `tock.usno.navy.mil` (which run the master clock for the US Department of Defense and GPS), and the national metrology institutes — NPL in the UK, PTB in Germany, NICT in Japan, VNIIFTRI in Russia. The **NTP Pool**, started by Adrian von Bidder in January 2003 and run by Ask Bjørn Hansen since 2005, had 3,423 active IPv4 servers and 1,905 IPv6 servers as of June 2025, serving "hundreds of millions" of clients. Equinix Metal sponsored the hosting until it sunset in 2025; the Pool is now migrating to two smaller distributed clusters. The 2024 ACM SIGMETRICS paper "Deep Dive into NTP Pool's Popularity and Mapping" by Moura and colleagues found the GeoDNS distribution heavily skewed — 551 servers serve US clients while Cameroon and Nigeria are served by 1 and 2 respectively.

**Cloudflare**'s `time.cloudflare.com` is anycasted and NTS-enabled; Aanchal Malhotra led their internal NTP work in early 2019. **Google Public NTP** at `time.google.com` and `time1-4.google.com` smears leap seconds linearly noon-to-noon UTC and returns REFID `GOOG`. **Amazon Time Sync** at `time.aws.com` has been public since November 2022 and also smears 24-hour linear noon-to-noon, matching Google's regime. Inside an EC2 VPC the address is `169.254.169.123` (IPv4) or `fd00:ec2::123` (IPv6). **Netnod**'s `nts.netnod.se`, **Quad9**'s `time.quad9.net`, and **SIDN**'s `time.nl` round out the major NTS-enabled public servers.

The hyperscalers have largely moved past NTP for their internal time fabrics. **Meta** announced in November 2022 that it was migrating from NTP — about 10 ms accuracy — to PTP, getting first to 100 microseconds and then to sub-microsecond. They open-sourced **SPTP**, Simple PTP, in February 2024: same accuracy as PTPv2 unicast but roughly 40% CPU, 70% memory, and 50% network savings, powering a Time Appliance that serves over 100,000 clients. **AWS Nitro PTP Hardware Clock** rolled out from November 2023 and now exposes a PHC via the ENA driver on Nitro instances, giving "low double-digit microseconds" accuracy at the P99. PHC does not smear leap seconds, so do not mix it with smeared NTP sources on the same host. **Google Spanner**'s **TrueTime** has used atomic clocks and GPS in every datacenter, with explicit error bounds and a Marzullo-style intersection, since 2012.

Typical accuracy numbers, as of 2026: internet NTP with chrony and at least four servers, 1 to 10 ms; LAN NTP without hardware timestamps, 0.1 to 1 ms; LAN PTP with software timestamps, around 10 microseconds; LAN PTP with hardware timestamps, sub-microsecond, typically 100 to 500 nanoseconds; CERN's White Rabbit (PTP plus Synchronous Ethernet plus per-link asymmetry calibration over fibre, standardised as the High-Accuracy Default PTP Profile in IEEE 1588-2019), sub-nanosecond with picosecond precision.

## Things that go wrong

### The 2012 leap-second Linux kernel bug

A leap second was inserted at 23:59:60 UTC on June 30th, 2012. The Linux kernel's leap-second handler updated `xtime` without calling `clock_was_set()` to notify the high-resolution timer subsystem. Tasks waiting on futexes with absolute deadlines — extremely common in Java's `LockSupport.parkNanos`, in MySQL, in JVM-internal timers, in ElasticSearch and Hadoop — saw their deadline appear to have already expired and re-queued in a tight livelock, pegging CPUs at 100%.

The casualty list reads like a snapshot of the early-2010s web: Reddit, LinkedIn, Mozilla, Yelp, Foursquare, StumbleUpon, Gawker, the Amadeus airline reservation system (which delayed Qantas flights). The workaround was a one-liner — `date -s "$(date)"` reset the clock and unwedged the hrtimers. The permanent fix went into kernel 3.4. The lesson the industry took, very loudly, was that a one-second discontinuity in wall time is a category of bug nobody really tests for.

### The 2014 NTP DDoS amplification disaster

This is the famous one. Between December 2013 and February 2014, attackers exploited the **MON_GETLIST** command — `monlist`, a mode-7 query — in versions of ntpd before 4.2.7. A 234-byte request returned up to 600 IP-address entries, around 48 kilobytes. Amplification factor: roughly 206× in operational practice, with theoretical worst-case figures up to 557×.

On February 10th, 2014, an attack hit a Cloudflare customer in Europe at about **400 gigabits per second**, the largest DDoS ever recorded at the time, beating the 2013 Spamhaus attack. The attackers used 4,529 vulnerable NTP servers across 1,298 networks at about 87 megabits per second each. Two days later, on February 12th, OVH took roughly 325 Gbps; Octave Klaba announced it from his Twitter account. Black Lotus reported that 69% of all DDoS traffic in the first week of January 2014 was NTP reflection. The fix was `noquery` in `ntp.conf`, an upgrade to ntpd 4.2.7 or later (with monlist disabled by default), and BCP38 ingress filtering at network boundaries. The chapter on NTP in the book covers the through-line — Wisconsin in 2003, D-Link in 2005, the 400 Gbps wave in 2014 — as a single arc about how NTP's elegance was exposed by its deployment.

### CVE-2014-9295 and the first silent macOS patch

In December 2014, Neel Mehta and Stephen Roettger of Google's Security Team disclosed four stack-based buffer overflows in ntpd: in `crypto_recv`, in `ctl_putdata`, in `configure`, and a missing `return` in `receive()`. Pre-authentication remote code execution was possible in some configurations. Apple shipped its **first ever silent automatic security update** for macOS to patch this. The fix landed in ntp 4.2.8 on December 18th, 2014. The same release cycle picked up CVE-2014-9293, -9294 (weak default key in `ntp-keygen`) and -9296 (the missing `return`).

The 2015–2016 wave that followed — CVE-2015-7704 and -7705 (NTP packet-of-death and DoS via spoofed origin, Aanchal Malhotra and colleagues, NDSS 2016), -7973 and -7979 (broadcast-mode replay and Sybil attacks), CVE-2016-1550 (timing-based authentication bypass), the Crypto-NAK confusion bugs — provided the security pressure that made Network Time Security finally happen.

### The hardcoded-IP era: NTP vandalism

In 2003, NTP researcher Dave Plonka at the University of Wisconsin–Madison discovered that four Netgear router models had hardcoded `128.105.39.11` — the university's public NTP server — into their SNTP firmware and polled at one-second intervals when they got no response. With about 707,000 affected units shipped, peak traffic reached 250,000 packets per second and 150 Mbit/s. Netgear donated US $375,000 to the university after coordinated disclosure.

In 2005 and 2006, Poul-Henning Kamp ran the only public Danish stratum-1 NTP server. Between 75% and 90% of his traffic came from D-Link routers with his IP baked into firmware. The Danish exchange wanted 54,000 kroner per year. PHK wrote an open letter on April 27th, 2006 calling it "**NTP vandalism**." After the Slashdot and Reddit shaming, D-Link "amicably resolved" it. PHK later found D-Link routers were also abusing 43 other stratum-1 servers. The pattern repeated with SMC and CSIRO Australia in 2003, TP-Link extender firmware against Fukuoka University and the AU/NZ pools in 2016–2017, an iOS NTP library inside Snapchat, and various Cisco devices over the years. ETH Zurich's `swisstime.ethz.ch` had to block public access in 2013 after sustained 20 GB/day abuse.

### Galileo PTF, July 11–18, 2019

Not strictly an NTP failure but a cautionary tale for any stratum-0 GNSS user. The Galileo Precise Timing Facility at Fucino, Italy, suffered a fault during a planned upgrade. The redundant standby at Oberpfaffenhofen in Germany was unavailable. All Galileo satellites flagged "not usable" for six days. The European GNSS Agency communicated poorly; the European Commission later blamed "the mistake of a single person." Lesson: stratum-0 GNSS receivers need holdover oscillators — rubidium or OCXO — and at least one alternate constellation. The OCP Time Card with on-board atomic clock is a direct response.

## Common pitfalls (for the practitioner)

- **Three servers is not enough.** Marzullo's algorithm needs at least three to detect a single liar; configure four for Byzantine tolerance against one falseticker. Use `pool 2.<region>.pool.ntp.org iburst` rather than hardcoding individual IPs.
- **Mixing smeared and stepped sources at a leap second is chaos.** If you point a host at `time.google.com` and `time.cloudflare.com` together at a leap-second event, you'll see the smeared and the stepped clocks fighting each other. Pick one regime per host.
- **SNTP for critical workloads is malpractice.** systemd-timesyncd is fine for a laptop. It is not fine for a server signing transactions — there is no Marzullo, no clock filter, no jitter mitigation. Many of the worst NTP-abuse incidents (Netgear, D-Link, TP-Link) came from SNTP firmware.
- **Mode 6 and mode 7 must not be exposed to the internet.** That is what `monlist` was. The standard restrict line is `restrict default kod nomodify notrap nopeer noquery`.
- **Wall-clock vs monotonic time.** `CLOCK_REALTIME` can step backward (leap seconds, NTP corrections); `CLOCK_MONOTONIC` only ever increases. Use monotonic for measuring durations and implementing timeouts; use wall-clock only for timestamps. In Java that's `System.currentTimeMillis()` (wall) versus `System.nanoTime()` (monotonic).
- **Virtualised clocks drift hard.** A KVM or Xen guest can lose hundreds of milliseconds in minutes if the hypervisor pauses it. Enable `kvm-clock` paravirt; chrony handles intermittent links well. AWS PHC, Azure `hv_util`, GCP `metadata.google.internal` are all designed to mitigate this.
- **Sub-millisecond accuracy needs PTP, not NTP.** Modern Intel, Mellanox, and Marvell NICs support IEEE 1588 hardware tx/rx timestamps. Linux uses `ptp4l` and `phc2sys` from `linuxptp`. For datacenter accuracy, deploy boundary clocks or transparent clocks on every switch hop.

## Debugging it

- `chronyc tracking` shows the current synchronisation status — current offset, RMS offset, frequency, residual frequency, skew, root delay, root dispersion, last update, leap status.
- `chronyc sources -v` lists configured servers with reach (octal `377` is full reach), stratum, poll, last sample, offset, and quality.
- `chronyc clients` shows who is querying you.
- `ntpq -pn` is the equivalent for ntpd: peer table with stratum, type, when, poll, reach, delay, offset, jitter.
- `ntpq -c rv 0` dumps the system variables — leap, stratum, precision, root delay, root dispersion, refid.
- `ntpdate -q <server>` is a one-shot probe (no clock change) — useful for verifying a candidate server before adding it to the config.
- `timedatectl timesync-status` on systemd hosts shows the basics.
- Wireshark filter: `udp.port == 123` for NTP, `tcp.port == 4460` for NTS-KE.
- The numbers to alert on are stratum = 16 (unsynchronised), reach = 0 (server unreachable), and absolute offset above some threshold like 50 ms.

## What's changing in 2026

**NTPv5** is `draft-ietf-ntp-ntpv5-08`, dated March 2026, expires 3 September 2026, authored by Miroslav Lichvar (Red Hat) and Tal Mizrahi (Huawei). The IESG is expected to advance it within the next year. It drops modes 1, 2, 5, 6, and 7 — only client (3) and server (4) survive. Security is mandatory NTS or RFC 8573 MAC. The 16-bit explicit era field kills the 2036 problem dead, extending unambiguous range to about 35,000 years. Reference IDs grow from 32 bits to 120 bits and use random hashes for far better loop detection. Root-delay/dispersion resolution improves from about 15 microseconds to about 4 nanoseconds. A new Correction extension field lets switches and routers report residence delay, à la PTP. Interleaved mode is first-class with an explicit flag. ntpd-rs has experimental support behind `--features unstable_ntpv5` and has interop-tested at IETF 118 onward; chrony has a v5 prototype branch.

**RFC 9523 (Khronos)**, February 2024 — Neta Rozen-Schiff, Danny Dolev, Tal Mizrahi, and Michael Schapira. Khronos is a watchdog, not a wire protocol. A Khronos client samples a few of hundreds of NTP servers per poll, applies trimmed-mean outlier rejection, and steps only when offset exceeds a threshold. Provably resists up to about one third compromised servers.

**RFC 9748 (2025)** restructured the NTP Extension Field registry. **RFC 9769 (2025)** standardised NTPv4 client-server interleaved mode. **RFC 9109 (2021)** added NTP port randomisation.

**Leap-second roadmap.** **CGPM Resolution 4 of the 27th General Conference on November 18th, 2022** decided that the maximum value for the difference UT1 − UTC will be increased "in or before 2035." WRC-23 in Dubai in December 2023 formally recognised it. The 28th CGPM in 2026 is expected to set the new tolerance — proposals on the table include 60 seconds and one full minute, accumulated over 50 to 100 years and smeared in. Russia opposed (GLONASS uses leap seconds); the US, France, Canada, and the EU pushed hard, with Meta, Google, and Amazon lobbying. Open question: a negative leap second may be needed before 2035 because the Earth's rotation has been speeding up since 2020. June 29th, 2022 was the shortest day on record at 86,399.99841 seconds.

**Roughtime** (`draft-ietf-ntp-roughtime-19`, 2025–2026, expected as an RFC in 2026 or 2027). Watson Ladd at Akamai and Marcus Dansarie at Netnod. Cryptographic from the start, Ed25519 signatures, Merkle proofs of inclusion; clients can publish "malfeasance proofs" if servers lie. Not a precision protocol — accuracy is "rough," at the seconds level. Aimed at IoT bootstrap. Live: `roughtime.cloudflare.com`, two Netnod servers, `roughtime.se`.

**NTS-pool extensions** are being drafted by the Pendulum team so the volunteer NTP Pool can support NTS without per-server certificate pain. Cisco IOS-XE still does not support NTS as of mid-2025 — only legacy MD5, SHA-1, and AES-128 CMAC.

**Quantum-resistant NTS** comes for free as TLS 1.3 picks up hybrid post-quantum key exchange (X25519 + Kyber/MLKEM). NTS-KE inherits it. Symmetric AEAD (AES-SIV at 256 bits) is already considered post-quantum safe.

**MiFID II RTS 25** has been in force since January 3rd, 2018, mandating clock divergence from UTC of 100 microseconds for high-frequency trading and 1 millisecond for non-HFT. ESMA proposed superseding RTS 25 with a new clock-sync RTS in the 2024–2025 consultation. The US Consolidated Audit Trail has comparable requirements. NERC CIP-007 covers the US power grid. These regulations are why PTP-with-GPS-and-rubidium-holdover is effectively mandatory in finance, broadcast, and grid SCADA — and they are the major commercial driver for the Time Card and White Rabbit ecosystems.

**NTP over QUIC** has been mooted but has no significant traction. The transport-security-quic draft expired in February 2026 and per LWN is "probably better not revived." NTS over UDP/123 is the consensus path.

## Fun facts (host material)

Mills wrote the original Fuzzball software in PDP-11 macro assembler, not BCPL. He chose PDP-11 / LSI-11 because they were the cheapest computers a university could afford. The Fuzzball deployment for NSFNET in 1986 was six PDP-11s connecting the entire scientific internet at 56 kbit/s. Variable-length subnet masks were first tested on Fuzzballs.

The 1900 epoch is older than ARPANET, older than UNIX, older than pretty much every other timestamp standard in computing. It will roll over on Friday, February 7th, 2036, at 06:28:16 UTC. The reference timestamp special value `0x83AA7E80.00000000` in NTPv5 corresponds to August 24th, 1941 in era 0 — chosen to be benign noise because it's also a valid era-1 future date of September 29th, 2077.

REFID lore. When you run `chronyc sources` or `ntpq -p` and see `.GPS.`, `.PPS.`, `.WWVB`, `.DCFa`, `.LOCL.`, `.INIT.`, `.DENY`, `.RATE` — those are 4-character ASCII codes packed into the 32-bit Reference ID field. Mills's RFCs read like a sea captain's log, full of nautical metaphors; "stratum" is a borrowing from atmospheric and geological layering, and "Kiss-of-Death" is darkly poetic for what is essentially a back-off message.

The OCP Time Card with rubidium oscillator holds under 800 nanoseconds over 24 hours of GNSS holdover, fits in a PCIe slot, costs roughly a tenth the price of equivalent commercial appliances, and was designed by Meta engineers Ahmad Byagowi and Oleg Obleukhov. Linus Tech Tips made a video titled "Why is this PCIe Card RADIOACTIVE?" about it.

AWS calls its time-distribution implementation **ClockBound** and exposes the error bound explicitly to applications via `/sys/devices/.../phc_error_bound` — a refreshing departure from "the clock just is what it is."

Poul-Henning Kamp's **beerware license** (`<phk@FreeBSD.ORG>`, "buy me a beer") sits in the FreeBSD timecounters code that Mills helped design. PHK's "bikeshed" coinage was originally about an NTP discussion on a FreeBSD mailing list.

## Where this connects in the book

- Part Layer 2–3, Chapter "ICMP" — the diagnostic backplane chapter where Mike Muuss writes ping in a single night in December 1983 after hearing Dave Mills describe Fuzzball latency-timing experiments at BRL Aberdeen. The protocol that gave us round-trip time as a measurement, and the stage on which NTP's amplification-attack era unfolded.
- Part Transport, Chapter "UDP" — three pages of RFC, no guarantees, and the substrate NTP could not exist without. Why a connectionless datagram with symmetric latency is the only sane transport for time, and how UDP's minimalism made the 2014 amplification disaster possible at all.
- Part Utilities & Security, Chapter "NTP" — the historical arc the blueprint defers to: Mills as Father Time, the 2012 leap-second Linux bug, the 2014 amplification disaster, the end of leap seconds (CGPM Resolution 4), and the 2024 modernisation wave (Rust, SPTP, NTPv5).

## See also (other protocol episodes)

If you've heard the **UDP** episode, the relationship is foundational. NTP runs on UDP because UDP gives you exactly what NTP needs — a fixed-overhead, connectionless 8-byte transport that preserves the symmetric-latency assumption the math depends on. TCP's handshake and retransmissions would corrupt the timing measurements; UDP just sends 48 bytes and stays out of the way. Time correction has to be precise to the microsecond, and you cannot tolerate handshake delay or retransmission timing variance, so UDP delivers a packet in a few milliseconds and lets the protocol math figure out clock offset from RTT.

If you've heard the **TLS** episode, NTS is the bridge. NTS-KE runs TLS 1.3 over TCP port 4460 to bootstrap the AEAD keys, then NTP traffic carries on as normal over UDP port 123 with the keys derived via the TLS exporter. The chicken-and-egg is real: TLS certificate validation needs correct time, and correct time now needs TLS. In practice clients accept whatever bad time they have to bootstrap, and re-validate.

## Visual cues for image generation

(See the `visual_cues` block in the frontmatter — six prompts covering the 48-byte packet anatomy, the four-timestamp diagram, the stratum pyramid, the 2014 amplification bar chart, the family-tree timeline, and the leap-second / CGPM Resolution 4 split-clock illustration.)

## Sources

### RFCs

- [RFC 5905 — Network Time Protocol Version 4: Protocol and Algorithms Specification](https://www.rfc-editor.org/rfc/rfc5905)
- [RFC 8915 — Network Time Security for the Network Time Protocol](https://www.rfc-editor.org/rfc/rfc8915)
- [RFC 9523 — Khronos: A Secure Watchdog for NTP](https://www.rfc-editor.org/rfc/rfc9523)
- [RFC 5905 (alt mirror)](https://www.ietf.org/rfc/rfc5905.html)
- [RFC 5905 (datatracker)](https://datatracker.ietf.org/doc/html/rfc5905)
- [RFC 5905 (hjp mirror)](https://www.hjp.at/doc/rfc/rfc5905.html)
- [draft-ietf-ntp-ntpv5 (NTPv5)](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/)
- [draft-ietf-ntp-ntpv5-05 (HTML)](https://www.ietf.org/archive/id/draft-ietf-ntp-ntpv5-05.html)
- [draft-mlichvar-ntp-ntpv5-04 (text)](https://datatracker.ietf.org/doc/html/draft-mlichvar-ntp-ntpv5-04.txt)
- [draft-grant-ntp-ntpv5-algorithms-01](https://datatracker.ietf.org/doc/html/draft-grant-ntp-ntpv5-algorithms-01)
- [draft-ietf-ntp-roughtime](https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/)
- [draft-dfranke-nts-00](https://datatracker.ietf.org/doc/html/draft-dfranke-nts-00)
- [draft-ietf-ntp-using-nts-for-ntp-15](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-using-nts-for-ntp-15)
- [draft-ietf-ntp-data-minimization-04](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-data-minimization-04)
- [IETF announce — RFC 9523 publication](https://www.mail-archive.com/ietf-announce@ietf.org/msg24049.html)
- [leap-seconds.list (IETF)](https://www.ietf.org/timezones/data/leap-seconds.list)

### Papers and academic

- [Malhotra et al., "Attacking the Network Time Protocol" (NDSS 2016)](https://www.cs.bu.edu/~goldbe/NTPattack.html)
- [Aanchal Malhotra — researcher page](https://sites.google.com/site/aanchalmalhotra1990/)
- [Mills — papers and Fuzzball history (UDel)](https://www.eecis.udel.edu/~mills/papers.html)
- [Mills — Fuzzball gallery (UDel)](https://www.eecis.udel.edu/~mills/gallery/gallery10.html)
- [The NTP Reference Library](https://www.ntp.org/reflib/book/)

### Vendor and engineering blogs

- [chrony project](https://chrony-project.org/)
- [chrony project (alt)](https://chrony-project.org)
- [ntpd-rs (GitHub, Pendulum)](https://github.com/pendulum-project/ntpd-rs)
- [Tweede golf — ntpd-rs blog](https://tweedegolf.nl/en/blog/ntpd-rs)
- [Tweede golf — Pendulum overview](https://tweedegolf.nl/en/pendulum)
- [Ntimed (PHK, dormant)](https://github.com/bsdphk/Ntimed)
- [NTPsec docs](https://docs.ntpsec.org/latest/)
- [NTPsec — NTS QuickStart](https://docs.ntpsec.org/latest/NTS-QuickStart.html)
- [NTPsec project site](https://www.ntpsec.org)
- [ntp.org reference implementation](https://www.ntp.org)
- [ntp.org (alt)](https://www.ntp.org/)
- [ntp.org — 4.2.8 release / security notice](https://www.ntp.org/support/securitynotice/4_2_8-release-announcement/)
- [OpenNTPD project](https://www.openntpd.org/)
- [OpenNTPD config man page (GitHub)](https://github.com/openntpd-portable/openntpd-openbsd/blob/master/src/usr.sbin/ntpd/ntpd.conf.5)
- [OpenNTPD on pkgsrc / NetBSD](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/net/openntpd/index.html)
- [Google — Public NTP leap smear](https://developers.google.com/time/smear)
- [AWS — Amazon Time Sync as Public NTP (Nov 2022)](https://aws.amazon.com/about-aws/whats-new/2022/11/amazon-time-sync-internet-public-ntp-service/)
- [AWS — Microsecond-Accurate Clocks on EC2 (Nov 2023)](https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/)
- [AWS EC2 NTP configuration docs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configure-ec2-ntp.html)
- [AWS Nitro PHC — first look (libertysys)](https://www.libertysys.com.au/2024/04/aws-microsecond-accurate-time-first-look/)
- [Meta — Time Appliance open-source (Aug 2021)](https://engineering.fb.com/2021/08/11/open-source/time-appliance/)
- [Meta — Simple PTP at Meta (Feb 2024)](https://engineering.fb.com/2024/02/07/production-engineering/simple-precision-time-protocol-sptp-meta/)
- [OCP Time Card (Time Beat)](https://www.opencompute.org/products/319/ocp-time-card-made-by-time-beat)
- [OCP Time Appliances Project wiki](https://www.opencompute.org/wiki/Time_Appliances_Project)
- [OCP Time Card hardware (GitHub)](https://github.com/Time-Appliances-Project/Time-Card)
- [White Rabbit — CERN Venture Connect](https://ventureconnect.cern/white-rabbit)
- [White Rabbit — Oscilloquartz overview](https://www.oscilloquartz.com/en/products-and-services/technology/what-are-white-rabbit-timing-systems)
- [Meta SPTP — Data Center Dynamics coverage](https://www.datacenterdynamics.com/en/news/meta-develops-simple-precision-time-protocol/)
- [Hacker News — Lichvar critique of SPTP](https://news.ycombinator.com/item?id=39298652)
- [Internet Society — NTS RFC published (Oct 2020)](https://www.internetsociety.org/blog/2020/10/nts-rfc-published-new-standard-to-ensure-secure-time-on-the-internet/)
- [Linux Audit — tlsdate](https://linux-audit.com/tlsdate-the-secure-alternative-for-ntpd-ntpdate-and-rdate/)
- [Slashroot — 2012 Linux leap-second kernel bug](https://www.slashroot.in/leap-second-bug-linux-kernel)
- [Y2036 NTP rollover discussion (Windows Forum)](https://windowsforum.com/threads/y2036-ntp-rollover-plan-for-2036-time-era.403152/)
- [Time-proofness in various systems (Lieberbiber)](https://www.lieberbiber.de/2017/03/14/a-look-at-the-year-20362038-problems-and-time-proofness-in-various-systems/)
- [FreeBSD security advisory FreeBSD-SA-16:39.ntp](https://www.freebsd.org/security/advisories/FreeBSD-SA-16:39.ntp.asc)
- [CVE-2016-7434 details](https://www.cvedetails.com/cve/CVE-2016-7434/)
- [Safran — MiFID II time sync](https://safran-navigation-timing.com/time-synchronization-time-is-at-the-heart-of-mifid-regulation/)
- [BIPM — CGPM Resolution 4 (2022)](https://www.bipm.org/en/cgpm-2022/resolution-4)
- [NIST — Time and Frequency from A to Z](https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z)

### News and trade press

- [The Register — David Mills obituary (Jan 2024)](https://www.theregister.com/2024/01/23/david_mills_obit/)
- [The Register — NTP secure beta (Nov 2015)](https://www.theregister.com/2015/11/18/network_time_protocol_beta/)
- [Slashdot — David Mills, Internet pioneer, has died](https://news.slashdot.org/story/24/01/19/113203/david-mills-an-internet-pioneer-has-died)
- [APNIC — Vale Dave Mills (Jan 2024)](https://blog.apnic.net/2024/01/24/vale-dave-mills/)
- [NetworkWorld — NTP CVE-2014-9295 coverage](https://www.networkworld.com/article/933922/exploits-for-dangerous-network-time-protocol-vulnerabilities-can-compromise-systems-2.html)
- [Linux Journal — NTPsec coverage](https://www.linuxjournal.com/content/ntpsec-secure-hardened-ntp-implementation)

### Wikipedia and reference

- [Wikipedia — Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol)
- [Wikipedia — David L. Mills](https://en.wikipedia.org/wiki/David_L._Mills)
- [Wikipedia — Leap second](https://en.wikipedia.org/wiki/Leap_second)
- [Wikipedia — NTP server misuse and abuse](https://en.wikipedia.org/wiki/NTP_server_misuse_and_abuse)
- [Wikipedia — OpenNTPD](https://en.wikipedia.org/wiki/OpenNTPD)
- [Wikipedia — Chrony](https://en.wikipedia.org/wiki/Chrony)
- [Wikipedia — Poul-Henning Kamp](https://en.wikipedia.org/wiki/Poul-Henning_Kamp)
- [Wikipedia — White Rabbit Project](https://en.wikipedia.org/wiki/White_Rabbit_Project)
- [En Academic — OpenNTPD](https://en-academic.com/dic.nsf/enwiki/939862)
- [Grokipedia — OpenNTPD](https://grokipedia.com/page/openntpd)
- [RFC Editor — RFC 9523 info](https://www.rfc-editor.org/info/rfc9523)
- [RFC Editor — RFC 9523 (XML)](https://www.rfc-editor.org/rfc/rfc9523.xml)
- [draft-ietf-ntp-ntpv5/04 (datatracker)](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/04/)
- [draft-ietf-ntp-ntpv5 (HTML)](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-ntpv5)
- [draft-ietf-ntp-roughtime (HTML)](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-roughtime)
- [draft-ietf-ntp-roughtime-12 (HTML)](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-roughtime-12)
