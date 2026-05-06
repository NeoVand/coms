---
prompt_source: deep-research-prompts.txt:8091-8266 (PROTOCOL · NTP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/9e916d5f-48a8-4f3e-b4db-f56c9673fb84
research_mode: claude.ai Research
---

# The Network Time Protocol (NTP): A Comprehensive Research Report

*Source material for long-form articles, infographics, and a podcast series. Compiled May 2026.*

---

## TL;DR (read this first)

- **NTP is the invisible 41-year-old protocol that keeps the Internet's clocks coherent.** Designed by David L. Mills at the University of Delaware (with DARPA funding) and first standardized in **RFC 958 (1985)**, the current canonical specification is **RFC 5905 (NTPv4, June 2010)** running on **UDP port 123**. Mills — known as the Internet's "Father Time" — died on **17 January 2024**, making this report a partial obituary as much as a technical brief. [The Register](https://www.theregister.com/2024/01/23/david_mills_obit/)
- **The last 24 months have been the most active period in NTP's history since 1992.** **Network Time Security (NTS, RFC 8915, 2020)** is now deployed at scale by Cloudflare, Netnod, Quad9, AWS, and SIDN; **NTPv5 is in active IETF working-group review** (draft-ietf-ntp-ntpv5-08, March 2026), dropping symmetric/broadcast/control modes and mandating cleaner cookies and an explicit era field; **leap seconds are scheduled to be abandoned by or before 2035** (CGPM Resolution 4, 18 November 2022); **ntpd-rs** (Pendulum/Tweede Golf, Rust) reached production in 2023 and is now packaged in Debian/Ubuntu/Fedora and deployed at Let's Encrypt; **Khronos** was published as RFC 9523 (Feb 2024); and **Meta's SPTP** (Feb 2024) demonstrated PTP-class accuracy is now the datacenter norm. Hyperscalers (Meta, Google, AWS) have largely moved past NTP internally to PTP with hardware timestamps and atomic-clock-backed Time Cards. [IETF + 3](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/)
- **For practitioners today: use chrony or ntpd-rs over legacy ntpd, configure ≥4 servers (Marzullo's algorithm needs ≥3, prefer 4 for Byzantine tolerance), enable NTS where possible (`time.cloudflare.com`, `nts.netnod.se`, `time.aws.com` — note AWS still smears leap seconds over NTP but not over its PTP-Hardware-Clock), never expose mode 6 / mode 7 to the internet, and if you need <1 ms accuracy, move to PTP / IEEE 1588 with hardware timestamping.**

---

## 1. Prerequisites and glossary

Read this section as a one-pass dictionary; later sections assume you know these terms.

### Networking primitives

- **OSI / TCP-IP layers.** NTP rides on **UDP** (transport, OSI layer 4) over **IP** (network, layer 3). NTS-KE uses **TLS** (presentation/session, layers 5–6) over **TCP** (layer 4). PTP can ride on UDP or directly over Ethernet (layer 2). See RFC 1122 for TCP/IP.
- **Datagram** — a self-contained packet that does not depend on prior or subsequent packets, the unit of UDP. NTP is "stateless on the wire" by virtue of UDP.
- **Frame / Header / Checksum / Socket / Handshake / Stream** — standard networking vocabulary; NTP's 48-byte header sits inside a UDP datagram inside an IP packet inside an Ethernet frame.
- **Big-endian (network byte order)** — all multi-byte NTP fields are transmitted MSB-first.
- **Fixed-point (Q-format)** — NTP root delay/dispersion are 32-bit signed numbers with the binary point between bits 15 and 16 (so resolution ≈15 µs in NTPv4; NTPv5 improves this to ~4 ns by changing the format). [IETF](https://datatracker.ietf.org/doc/html/draft-mlichvar-ntp-ntpv5-04.txt)

### Cryptographic primitives (used by authenticated NTP / NTS)

- **HMAC** (RFC 2104), **AES-CMAC** (RFC 4493) — symmetric MAC algorithms used in NTPv4 authentication (RFC 8573 deprecates MD5 in favour of AES-CMAC).
- **TLS 1.3** (RFC 8446) — used for NTS Key Establishment on TCP/4460.
- **AEAD** (Authenticated Encryption with Associated Data) — used for the on-wire NTS extension fields; specifically **AEAD_AES_SIV_CMAC_256** by default. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-using-nts-for-ntp-15)
- **DNSSEC** is *not* required for NTS-KE because NTS uses the Web PKI (X.509), but DNSSEC and NTS have a notorious chicken-and-egg dependency: certificate validity checks and DNSSEC signature checks require correct time, but you need DNS / TLS to bootstrap NTS. [Internet Society](https://www.internetsociety.org/blog/2020/10/nts-rfc-published-new-standard-to-ensure-secure-time-on-the-internet/)

### Time-and-clock vocabulary

- **Stratum** — distance from a reference clock. Stratum 0 = the reference itself (atomic clock, GPS, DCF77). Stratum 1 = computer directly attached to a stratum 0 source (sets `Stratum=1` in packets). Stratum 2 syncs to stratum 1, etc. **Stratum 16 = unsynchronised.** Maximum usable stratum is 15. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)
- **Offset (θ)** — estimated difference between local clock and server clock (signed seconds).
- **Delay (δ)** — measured round-trip network delay.
- **Dispersion (ε)** — accumulated maximum error since last measurement (a function of clock drift rate, default 15 ppm in NTPv4).
- **Jitter (φ / ψ)** — RMS variation between successive offset estimates (a measure of measurement noise).
- **Skew** — fractional frequency offset of a clock vs reference (e.g. 1 ppm slow).
- **Drift** — uncorrected accumulated time error per unit of real time; the long-term integral of skew.
- **Root delay / root dispersion** — total delay/dispersion from this server back to the stratum 0 root.
- **Root distance** — root_dispersion + root_delay/2; the headline accuracy estimate. [IETF](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/04/)[IETF](https://datatracker.ietf.org/doc/html/draft-mlichvar-ntp-ntpv5-04.txt)
- **PLL (Phase-Locked Loop)** — control system minimising offset; dominates when measurement noise is low.
- **FLL (Frequency-Locked Loop)** — control system minimising frequency error; dominates when poll intervals are long. NTPv4 uses a hybrid PLL/FLL with crossover at the **Allan intercept** (~2000 s).
- **Leap second** — extra (or removed) second inserted into UTC to keep it within ±0.9 s of UT1 (Earth-rotation time). 27 positive leap seconds since 1972; the most recent on **31 December 2016** (none since). To be abandoned by ≤2035. [Wikipedia](https://en.wikipedia.org/wiki/Leap_second)
- **UTC vs TAI vs GPS time.** **TAI** = International Atomic Time, monotonic, no leap seconds. **UTC** = TAI minus the cumulative leap-second offset (currently TAI − UTC = 37 s). **GPS time** = TAI − 19 s (because GPS-time epoch was 6 Jan 1980, when TAI − UTC was 19 s). UT1 is astronomical (Earth-rotation) time.
- **Monotonic vs wall-clock time.** Wall-clock (UTC, `CLOCK_REALTIME` on Linux) can step backward (leap seconds, NTP corrections). Monotonic (`CLOCK_MONOTONIC`) only ever increases. **Always use monotonic for measuring durations, wall-clock only for timestamps.**
- **Kiss-of-Death (KoD)** — a stratum=0 server response with a 4-letter ASCII REFID telling the client to back off: `DENY`, `RATE`, `RSTR`, `INIT`, etc. (RFC 5905 §7.4). [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)

---

## 2. History and story

### The protagonist: David L. Mills (1938–2024)

David Lennox Mills was born on 3 June 1938 in Oakland, California. He had glaucoma from birth; childhood surgery preserved partial vision in one eye, and he was educated at a school for the visually impaired in San Mateo. He earned his PhD in Computer and Communication Sciences from the University of Michigan (1971), worked at COMSAT Labs in 1977 — where he started thinking about clock synchronisation across ARPANET — and joined the **University of Delaware** as a professor in 1986, retiring as professor emeritus in 2008. [Wikipedia + 6](https://en.wikipedia.org/wiki/David_L._Mills)

His vision deteriorated from 2012 and he was completely blind by 2022. He continued NTP work using large displays and screen readers. He died peacefully on **17 January 2024 in Newark, Delaware, age 85**. Vint Cerf announced the death on the Internet History mailing list two days later; the Danish FreeBSD developer Poul-Henning Kamp called Mills "the grandfather of the Internet" in a Danish-language obituary. Mills's wife Beverly died on 30 September 2024. [Wikipedia + 4](https://en.wikipedia.org/wiki/David_L._Mills)

Mills wrote 28 RFCs, was elected ACM Fellow (1999), IEEE Fellow (2002), member of the National Academy of Engineering (2008), received the PTTI Distinguished Service Award (2006) and the IEEE Internet Award (2013). He was the first chairman of the Internet Architecture Task Force (INARC, predecessor of the IETF) and chair of the Gateway Algorithms and Data Structures (GADS) Task Force. He invented **EGP** (the Exterior Gateway Protocol, RFC 904) and the **Fuzzball** routers, the first modern Internet routers. [NTP Project + 6](https://www.ntp.org/reflib/book/)

### The Fuzzball

The **Fuzzball** was an operating system Mills wrote (originally to replace RAMP on the PDP-8, then ported to **DEC PDP-11 / LSI-11** in 1977) that ran TCP/IP plus prototype Telnet, FTP, DNS, EGP, SMTP, and NTP. **Six Fuzzballs formed the routing backbone of the first 56 kbit/s NSFNET in 1986**, and roughly fifty units were deployed worldwide by the early 1980s for the SATNET program, including at INTELSAT earth stations in the US, UK, Germany, Norway, and Italy. Variable-length subnet masks were first tested on Fuzzballs. The colloquial nickname stuck. Software was written in PDP-11 macro assembler; the archive (about 16 MB) is preserved. [Ilya Safro + 6](https://www.eecis.udel.edu/~mills/gallery/gallery10.html)

### Motivation: what NTP replaced

Before NTP, distributed time was either non-existent or handled by:

- **DAYTIME (RFC 867, 1983)** — return current time as ASCII text on TCP/UDP port 13.
- **TIME (RFC 868, 1983)** — return seconds since 1900-01-01 as a 32-bit big-endian integer on TCP/UDP port 37.
- **ICMP Timestamp / Timestamp Reply (RFC 792, 1981)** — round-trippable but very crude.
- **Unix `timed` daemon** — election-based; only worked inside one administrative domain. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)
- **DTSS** (Digital Time Synchronization Service, OSF/DCE) — a competing hierarchical system from DEC that used Marzullo's interval-intersection algorithm; criticised NTPv2 for "lacking formal correctness", which led Mills to incorporate Marzullo's algorithm into NTPv3. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)

### Version history (the canonical chain)

| RFC | Year | Status / What changed |
|---|---|---|
| **RFC 778** | **1981** | "DCNET Internet Clock Service" — Mills's first writeup; arguably NTPv0 ancestor. |
| RFC 956 | 1985 | "Algorithms for Synchronizing Network Clocks" — supporting paper. |
| **RFC 958** | **1985** | First NTP specification proper. NTPv0 packet header and offset/delay calculation laid down here. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol) |
| **RFC 1059** | **1988** | NTPv1. Ethernet-spanning sub-100 ms accuracy demonstrated. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol) |
| **RFC 1119** | **1989** | NTPv2. Class-of-service mode, broadcast support, but criticised by DTSS for not using Marzullo. |
| **RFC 1305** | **1992** | NTPv3. Adds full mitigation algorithms, root-delay/dispersion error analysis, broadcast mode, [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol) Marzullo's intersection algorithm. The protocol that ran the Internet for 18 years. |
| **RFC 5905** | **June 2010** | NTPv4. Current canonical spec. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol) IPv6, extension fields, [Hjp](https://www.hjp.at/doc/rfc/rfc5905.html) double-precision floating-point internals, dynamic server discovery (manycast). Backwards compatible with v3. Authors: Mills, Martin (Ed.), Burbank, Kasch. [IETF +2](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-data-minimization-04) |
| RFC 5906 | 2010 | Autokey public-key auth (Informational; deprecated in practice — see "Politics" below). |
| RFC 7822 | 2016 | NTPv4 Extension Fields format clarification. |
| RFC 8573 | 2019 | Deprecates MD5, mandates AES-CMAC for symmetric key auth. |
| **RFC 8915** | **September 2020** | **Network Time Security (NTS) for NTP.** TLS 1.3 + AEAD over UDP/123. Authors: Franke (Akamai), Sibold, Teichel (PTB), Dansarie, Sundblad (Netnod). |
| RFC 9109 | 2021 | NTP Port Randomisation. |
| RFC 9523 | February 2024 | **Khronos** — secure outlier-rejection watchdog (Rozen-Schiff, Dolev, Mizrahi, Schapira). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-roughtime)[The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24049.html) |
| RFC 9748 | 2025 | NTP Extension Field Registry restructuring. |
| RFC 9769 | 2025 | NTPv4 interleaved client-server mode. |
| **draft-ietf-ntp-ntpv5-08** | **March 2026** | **NTPv5** (Lichvar/Mizrahi). Active WG document, expires 3 September 2026. |
| draft-ietf-ntp-roughtime-19 | 2025–2026 | **Roughtime** (Ladd, Akamai; Dansarie, Netnod). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-roughtime-12) |
| draft-grant-ntp-ntpv5-algorithms-01 | November 2025 [IETF](https://datatracker.ietf.org/doc/html/draft-grant-ntp-ntpv5-algorithms-01) | NTPv5 algorithm guidance (S. Grant). |

### Politics, controversies, and people

- **Autokey failure.** RFC 5906 specified Autokey, an attempt at NTP public-key authentication. It was complex, fragile, and never widely used. Stephen Roettger (Google) and Dieter Sibold (PTB) found cryptographic weaknesses; the IETF NTP WG effectively gave up on Autokey around 2014–2015 and pivoted to NTS. [NTP Project](https://www.ntp.org/support/securitynotice/4_2_8-release-announcement/)
- **NTS took 12+ years.** Daniel Franke filed `draft-dfranke-nts-00` in October 2016 (and earlier individual drafts going back to ~2014). RFC 8915 published October 2020. Aanchal Malhotra's **Boston University 2015–2016 papers** ("Attacking the Network Time Protocol", NDSS 2016; CVE-2015-7704, CVE-2015-7973, CVE-2015-7979) provided the security pressure. Cloudflare's Watson Ladd, Aanchal Malhotra (later at Cloudflare's crypto team Jan–Apr 2019), Martin Langer (Ostfalia, first prototype), and Netnod's Marcus Dansarie were principal implementers. [IETF + 3](https://datatracker.ietf.org/doc/html/draft-dfranke-nts-00)
- **Leap-second debate.** Resolved (after ~25 years of argument inside ITU-R and the BIPM) on **18 November 2022** by **CGPM Resolution 4 of the 27th General Conference**, which "decides that the maximum value for the difference (UT1 − UTC) will be increased in, or before, 2035." WRC-23 (Dubai, December 2023) formally recognised the resolution. The 28th CGPM (2026) is expected to set the new tolerance — leading proposals are 60 s or one full minute, accumulated over 50–100 years, which would be smeared in. Russia (which uses leap seconds in GLONASS) opposed; the US, France, Canada and the EU pushed for it heavily, with Meta, Google, and Amazon lobbying. [Wikipedia + 2](https://en.wikipedia.org/wiki/Leap_second)
- **Poul-Henning Kamp vs ntpd.** PHK (FreeBSD, Varnish, the timecounters subsystem) wrote a famous 2014–2015 "NTP isn't free anymore" piece arguing that ntpd's ~300,000-line codebase had become a security and maintainability disaster. Funded by the Linux Foundation Core Infrastructure Initiative after Heartbleed, PHK started **Ntimed** as a clean-slate replacement; it shipped a beta (December 2014) and a "production-ready" preview (Q1 2015) but did not achieve adoption. Ntimed is essentially dormant on GitHub today. [GitHub](https://github.com/bsdphk/Ntimed)[GitHub](https://github.com/bsdphk/Ntimed)
- **NTPsec fork.** Eric S. Raymond (ESR), with Mark Atwood, Daniel Franke, Ian Bruene, John Bell and others, forked ntp-classic in June 2015. Raymond reduced the codebase from "227 KLOC to 98 KLOC" by 2016, removed Autokey, modernised the build system (waf), added NTS support (1.2.0 was first NTS-compliant). NTPsec is technically excellent but has small adoption. Daniel Franke (also NTS author) is its security lead. [Linux Journal + 2](https://www.linuxjournal.com/content/ntpsec-secure-hardened-ntp-implementation)
- **chrony.** Originally written by Richard Curnow, currently maintained and developed by **Miroslav Lichvar** at Red Hat. Chrony became the **default NTP daemon in RHEL 8 (2018)** and **SUSE Linux Enterprise Server 15 (2018)**; ntpd is no longer shipped in RHEL 8+. Chrony added NTS in version 4.0 (2020). [chrony + 3](https://chrony-project.org/)
- **ntpd-rs / Project Pendulum.** Funded initially by the **Internet Security Research Group's Prossimo project** (memory-safety-for-critical-Internet-infrastructure initiative — same program that funds Rust TLS / Rust DNS work). Ownership transferred from Prossimo to **Tweede golf** (Netherlands) in April 2023. The **Sovereign Tech Agency (Germany)** funded development in 2023 and adoption in 2024. The **Trifecta Tech Foundation** governs the project as of 2024–2026. ntpd-rs hit version 1.0.0 (October 2023), is packaged in Debian, Ubuntu, and Fedora, and is deployed at **Let's Encrypt**. NTPv5 support is being added in 2025–2026; experimental client/server PTP-with-NTS funded by **Meinberg** is on the roadmap for 2026 Q1. [GitHub + 5](https://github.com/pendulum-project/ntpd-rs)
- **Harlan Stenn and the Network Time Foundation (NTF).** Stenn took over the ntp.org reference implementation from Mills in the mid-2000s. He has run the project on near-zero resources for two decades. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol)[Slashdot](https://news.slashdot.org/story/24/01/19/113203/david-mills-an-internet-pioneer-has-died)

---

## 3. How it actually works

### 3.1 The 48-byte NTPv4 packet header (RFC 5905 §7.3)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|LI | VN  |Mode |   Stratum   |     Poll      |   Precision    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Root Delay                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Root Dispersion                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Reference ID                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                              |
+                    Reference Timestamp (64)                  +
|                                                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                              |
+                    Origin Timestamp (T1, 64)                 +
|                                                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                              |
+                    Receive Timestamp (T2, 64)                +
|                                                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                              |
+                    Transmit Timestamp (T3, 64)               +
|                                                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         optional Extension Fields (variable, 0+)             |
|         optional Key Identifier (32) + MAC (128 or 160)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Field widths and meanings (from RFC 5905 §7.3):

| Bits | Field | Meaning |
|---|---|---|
| 2 | **LI** | Leap Indicator: `00`=no warning, `01`=last minute of day has 61 s, `10`=last minute has 59 s, `11`=clock unsynchronised [IETF](https://www.ietf.org/rfc/rfc5905.html)[IETF](https://datatracker.ietf.org/doc/html/rfc5905) (alarm). |
| 3 | **VN** | Version Number, currently `100` (4). NTPv5 keeps this field at the same offset for compat. [IETF](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/)[IETF](https://www.ietf.org/archive/id/draft-ietf-ntp-ntpv5-05.html) |
| 3 | **Mode** | `0`=reserved, `1`=symmetric active, `2`=symmetric passive, `3`=client, `4`=server, `5`=broadcast, `6`=NTP control (mode 6, `ntpq`), `7`=reserved for private use (mode 7, `ntpdc` — deprecated). |
| 8 | **Stratum** | 0=unspecified/Kiss-o'-Death, 1=primary reference, 2–15=secondary, 16=unsynchronised. |
| 8 | **Poll** | Signed log₂ seconds, max polling interval. e.g. 6 = 64 s, 10 = 1024 s, 17 = 36 hours. |
| 8 | **Precision** | Signed log₂ seconds, local clock resolution. e.g. −20 ≈ 1 µs, −24 ≈ 60 ns. |
| 32 | **Root Delay** | Total round-trip delay to stratum 1, signed Q16.16 fixed-point seconds. |
| 32 | **Root Dispersion** | Total maximum error to stratum 1, unsigned Q16.16. |
| 32 | **Reference ID (REFID)** | Stratum 1: 4-char ASCII source code (`GPS`, `PPS`, `ATOM`, `DCFa`, `WWVB`, `LOCL`, etc.). Stratum 2+: IPv4 address of upstream, or first 32 bits of MD5 of IPv6. [Wikipedia](https://en.wikipedia.org/wiki/Network_Time_Protocol) KoD: 4-char ASCII reason code (`DENY`, `RATE`, `RSTR`, `INIT`, `NKEY`, `RMOT`, `STEP`). |
| 64 | **Reference Timestamp** | Time the local clock was last set. |
| 64 | **Origin Timestamp (T1)** | Client's transmit time, copied back by the server. |
| 64 | **Receive Timestamp (T2)** | Server's clock when packet arrived. |
| 64 | **Transmit Timestamp (T3)** | Server's clock when reply was sent. |
| (T4 is the client's local arrival time, not on the wire) |  |  |

### 3.2 The 64-bit timestamp format

- **Upper 32 bits**: unsigned seconds since the **NTP prime epoch, 1900-01-01 00:00:00 UTC**. [Windows Forum](https://windowsforum.com/threads/y2036-ntp-rollover-plan-for-2036-time-era.403152/)
- **Lower 32 bits**: fractional seconds (resolution ≈ 232 picoseconds). [Windows Forum](https://windowsforum.com/threads/y2036-ntp-rollover-plan-for-2036-time-era.403152/)
- Span = 2³² s ≈ **136.19 years** = one **era**. Era 0 began 1 Jan 1900; **era rollover is 7 February 2036 at 06:28:16 UTC**, when era 1 begins. [Windows Forum](https://windowsforum.com/threads/y2036-ntp-rollover-plan-for-2036-time-era.403152/)[Windows Forum](https://windowsforum.com/threads/y2036-ntp-rollover-plan-for-2036-time-era.403152/)
- The *full* NTP "datestamp" is 128 bits (signed 64-bit seconds + 64-bit fraction) and supports the lifetime of the universe; only the truncated 64-bit timestamp is on the wire. NTPv4 implementations infer the era by assuming the local clock is within ±68 years of the truth. [LIEBERBIBER](https://www.lieberbiber.de/2017/03/14/a-look-at-the-year-20362038-problems-and-time-proofness-in-various-systems/)[LIEBERBIBER](https://www.lieberbiber.de/2017/03/14/a-look-at-the-year-20362038-problems-and-time-proofness-in-various-systems/)
- **NTPv5 fixes this** by exchanging an explicit 16-bit era number, extending unambiguous range to ~35,000 years. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-ntpv5)

### 3.3 The four-timestamp on-wire algorithm

Standard client/server exchange (RFC 5905 §8):

ServerClientServerClient#mermaid-rim{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rim .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rim .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rim .error-icon{fill:#CC785C;}#mermaid-rim .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rim .edge-thickness-normal{stroke-width:1px;}#mermaid-rim .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rim .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rim .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rim .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rim .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rim .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rim .marker.cross{stroke:#A1A1A1;}#mermaid-rim svg{font-family:inherit;font-size:16px;}#mermaid-rim p{margin:0;}#mermaid-rim .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rim text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rim .actor-line{stroke:#A1A1A1;}#mermaid-rim .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rim .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rim #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rim .sequenceNumber{fill:#5e5e5e;}#mermaid-rim #sequencenumber{fill:#E5E5E5;}#mermaid-rim #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rim .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rim .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rim .labelText,#mermaid-rim .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rim .loopText,#mermaid-rim .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rim .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rim .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rim .noteText,#mermaid-rim .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rim .activation0{fill:transparent;stroke:#00000000;}#mermaid-rim .activation1{fill:transparent;stroke:#00000000;}#mermaid-rim .activation2{fill:transparent;stroke:#00000000;}#mermaid-rim .actorPopupMenu{position:absolute;}#mermaid-rim .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rim .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rim .actor-man circle,#mermaid-rim line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rim :root{--mermaid-font-family:inherit;}T1 = local time when sendingT2 = local time when receivedT3 = local time when replyingT4 = local time when receivedoffset θ = ((T2−T1) + (T3−T4)) / 2delay δ = (T4−T1) − (T3−T2)Mode=3 packet, Transmit=T1Mode=4 packet, Origin=T1, Receive=T2, Transmit=T3

- **Offset θ = ((T2 − T1) + (T3 − T4)) / 2**
- **Delay δ = (T4 − T1) − (T3 − T2)**

The math assumes **symmetric latency**: the upstream and downstream paths take roughly equal time. This is also why NTP uses UDP, not TCP — TCP retransmissions and congestion control violate the symmetry assumption and add unbounded delay variation. [IETF](https://datatracker.ietf.org/doc/html/rfc5905)

### 3.4 Mitigation pipeline (reference implementation)

For each remote peer the client maintains:

1. **Clock filter.** Last 8 (offset, delay, dispersion) samples kept in a shift register; the one with smallest delay wins as the peer's representative measurement.
2. **Clock select.** Across all peers, run **Marzullo's interval-intersection algorithm** (modified to weight by RFC 5905's "select" function) to find the largest set of peers whose correctness intervals overlap. Reject "falsetickers" outside this intersection.
3. **Clock cluster.** Among "truechimer" survivors, perform Byzantine clustering: discard the peer with worst jitter, repeat until ≤NMIN peers (typically 3) remain or removing more would not improve overall jitter.
4. **Clock combine.** Weighted average of the survivors' offsets, weighted by inverse root distance.
5. **Clock discipline.** A **hybrid PLL/FLL** controls the local clock. PLL dominates for short polls (<2000 s, the **Allan intercept**); FLL dominates beyond that. Output is fed to `adjtime()` / `adjtimex()` on Linux to slew the clock; if the offset exceeds 128 ms (the panic threshold), the clock is **stepped** instead.

### 3.5 Kiss-o'-Death packets

A KoD packet has Stratum=0, LI=11, and a 4-character ASCII REFID. RFC 5905 §7.4 lists: `ACST` (anycast), `AUTH` (auth fail), `AUTO` (autokey fail), `BCST` (broadcast), `CRYP` (crypto fail), `DENY` (access denied), `DROP` (loss of peer), `RSTR` (restricted access), `INIT` (init), `MCST` (multicast), `NKEY` (no key), `RATE` (rate exceeded — back off poll interval), `RMOT` (remote alteration), `STEP` (step in progress).

### 3.6 NTS extension fields (RFC 8915)

Two sub-protocols:

1. **NTS-KE** (Key Exchange) over **TLS 1.3 on TCP/4460**. Client and server negotiate AEAD algorithm (default AES-SIV-CMAC-256), exchange C2S and S2C keys via TLS exporter, and the server hands the client **8 encrypted cookies**. [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-using-nts-for-ntp-15)
2. **NTS-EF over UDP/123.** Each NTP packet now carries: a Unique Identifier extension, a single Cookie extension, possibly several Cookie Placeholder extensions, and an Authenticator-and-Encrypted extension at the end. The server returns a fresh encrypted cookie per request (so the client always has 8). Cookies are encrypted by the server's master key (rotated every 24 h, with 10 generations kept), so servers stay stateless. [NTPsec](https://docs.ntpsec.org/latest/NTS-QuickStart.html)

### 3.7 Modes (legacy modes that NTPv5 removes)

NTPv5 (draft 08) removes modes 1, 2, 5, 6, and 7 — only client (3) and server (4) remain. Symmetric and broadcast modes are vulnerable to replay attacks; control and private modes were used for the **monlist** amplification disaster (see §6). [IETF](https://www.ietf.org/archive/id/draft-ietf-ntp-ntpv5-05.html)

---

## 4. Deep connections to other protocols

| Protocol | Relationship |
|---|---|
| **UDP/123** (RFC 768) | Transport. Stateless, low overhead, symmetric latency assumption. NTP could not have been designed on TCP. |
| **DNS** | NTP pool servers are looked up via round-robin DNS using **GeoDNS** (Ask Bjørn Hansen's `geodns`). Notorious dependency loop with NTS: NTS-KE needs valid TLS certs, which need correct time, which needs DNS, which… |
| **TLS 1.3** (RFC 8446) | Carries NTS-KE on TCP/4460. AEAD modes (AES-SIV) carry over to UDP. |
| **DNSSEC** | Indirectly: DNSSEC validation requires correct time. NTS does *not* depend on DNSSEC, but DNSSEC depends on NTP/NTS being right. |
| **PTP / IEEE 1588** | Datacenter alternative achieving sub-microsecond accuracy [Data Center Dynamics](https://www.datacenterdynamics.com/en/news/meta-develops-simple-precision-time-protocol/) via **hardware timestamps** in NIC PHYs and switches. Uses Sync, Follow_Up, Delay_Req, Delay_Resp messages. [Wikipedia](https://en.wikipedia.org/wiki/White_Rabbit_Project) Originally L2 multicast, often L3 unicast in datacenters. |
| **White Rabbit** | CERN's PTP extension (developed for the LHC, first deployed 2012). [Ventureconnect](https://ventureconnect.cern/white-rabbit) Combines PTP with **Synchronous Ethernet (SyncE)** [oscilloquartz](https://www.oscilloquartz.com/en/products-and-services/technology/what-are-white-rabbit-timing-systems) for physical-layer frequency lock, plus precise per-link asymmetry calibration over fibre. Achieves **sub-nanosecond accuracy and picosecond precision**. [Ventureconnect](https://ventureconnect.cern/white-rabbit) Standardised as the High-Accuracy Default PTP Profile in **IEEE 1588-2019**. [Ventureconnect](https://ventureconnect.cern/white-rabbit) Open-source hardware via CERN OHWR. [Ventureconnect](https://ventureconnect.cern/white-rabbit) |
| **Meta SPTP (Simple PTP)** | Open-sourced February 2024 by Meta. [FB](https://engineering.fb.com/2024/02/07/production-engineering/simple-precision-time-protocol-sptp-meta/) A simpler unicast PTP variant — same accuracy as PTPv2 unicast [FB](https://engineering.fb.com/2024/02/07/production-engineering/simple-precision-time-protocol-sptp-meta/) but ~40 % CPU, ~70 % memory, ~50 % network savings. Powers Meta's datacenter time fabric serving 100 000+ clients. Hacker News critique (Lichvar): the broadcast-style delay-symmetry assumption is a step backward versus interleaved NTP. [Hacker News](https://news.ycombinator.com/item?id=39298652) |
| **Roughtime** (draft-ietf-ntp-roughtime-19) | Google-designed alternative; cryptographic from the start, uses Ed25519 signatures, and clients can publish "malfeasance proofs" if servers lie. **Not** a precision protocol — accuracy is "rough" (seconds). Live servers: `roughtime.cloudflare.com`, `sth1.roughtime.netnod.se`, `roughtime.se`. |
| **Khronos** (RFC 9523, Feb 2024) | A *watchdog* not a wire protocol. [RFC Editor](https://www.rfc-editor.org/info/rfc9523) A Khronos client samples a few of ~hundreds of NTP servers per poll, applies trimmed-mean outlier rejection, [RFC Editor](https://www.rfc-editor.org/rfc/rfc9523.xml) and steps in only when the offset exceeds a threshold (panic mode). Provably resists up to ~1/3 compromised servers. [RFC Editor](https://www.rfc-editor.org/rfc/rfc9523.xml) |
| **GPS / GNSS** | Most stratum 1 servers feed off a GNSS receiver via PPS (pulse-per-second). Galileo, GPS, GLONASS, BeiDou. **Galileo's 11–18 July 2019 outage** (six-day complete service loss caused by a Precise Timing Facility upgrade gone wrong, with redundancy unavailable) showed how GNSS-only stratum-1 sites need holdover oscillators. |
| **DCF77** (Germany, 77.5 kHz) / **WWVB** (Colorado, 60 kHz) / **MSF** (UK, 60 kHz) / **JJY** (Japan) | Long-wave radio time signals. Used as backup stratum-0 references. Decoders feed NTP via PPS or NMEA-style serial. |
| **IRIG-B** | Inter-Range Instrumentation Group time code; analogue/digital format used in broadcast, military, and power-grid timing. Often carried alongside PTP in datacenter-grade time appliances. |
| **SNTP** (RFC 4330, then RFC 5905 §14) | Stateless single-shot NTP for IoT/embedded. Same packet format. **Should never be used for critical infrastructure**: no Marzullo, no clock filter, no jitter mitigation. Many of the worst NTP-abuse incidents (Netgear/Wisconsin, D-Link/Kamp, TP-Link/Fukuoka U) were SNTP. |
| **tlsdate** | Jacob Appelbaum's 2012 tool [Linux Audit](https://linux-audit.com/tlsdate-the-secure-alternative-for-ntpd-ntpdate-and-rdate/) that extracts a coarse timestamp from the **first 4 bytes of `gmt_unix_time` in the TLS ServerHello random**. The TLS 1.3 random is now unstructured, so tlsdate is essentially obsolete. Default time client on early ChromeOS. [Linux Audit](https://linux-audit.com/tlsdate-the-secure-alternative-for-ntpd-ntpdate-and-rdate/) |
| **TIME (RFC 868) / DAYTIME (RFC 867) / `rdate`** | Pre-NTP elders. RFC 868 ports 13/37. `rdate` syncs from these. Still occasionally seen in vintage equipment. |
| **PTP-over-PCIe / PCIe Precision Time Measurement (PTM)** | Hardware-level on-board time distribution; emerging enabler for very-high-accuracy datacenter time on commodity servers (Meta, AWS Nitro). |
| **ICMP Timestamp** (RFC 792) | Crude pre-NTP RTT measurement. Mostly disabled today for security. |

---

## 5. Real-world deployment

### Daemons and clients (state, May 2026)

| Implementation | Origin | Maintainer | Status (2026) | Default in |
|---|---|---|---|---|
| **ntpd** (ntp-classic, the reference) | Mills, ~1985 | Harlan Stenn / Network Time Foundation | Active but resource-starved; latest 4.2.8p18 line | Older Linux/Unix, FreeBSD historical |
| **chrony** | Richard Curnow, ~1997 | Miroslav Lichvar (Red Hat) | **Default in RHEL 8/9/10, SLES 15, [Amazon Web Services](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configure-ec2-ntp.html) Fedora, Amazon Linux 2/2023, Oracle Linux 8+**. Excellent for laptops, intermittent links, [Wikipedia](https://en.wikipedia.org/wiki/Chrony) virtualised guests. NTS support since 4.0 (2020). |  |
| **NTPsec** | ESR fork, June 2015 | Eric S. Raymond, Daniel Franke, others | Active. Stripped from 227 KLOC to 98 KLOC; [The Register](https://www.theregister.com/2015/11/18/network_time_protocol_beta/) NTS in v1.2.0+. |  |
| **ntpd-rs** | Tweede golf / ISRG Prossimo, ~2022 | Trifecta Tech Foundation / Pendulum project | **1.0+ stable since Oct 2023.** [Tweedegolf](https://tweedegolf.nl/en/blog/ntpd-rs) Memory-safe Rust. [Tweedegolf](https://tweedegolf.nl/en/pendulum) Packaged in Debian/Ubuntu/Fedora. **Deployed at Let's Encrypt.** NTPv5 support 2025–2026. Audited by Radically Open Security (NLnet-funded). |  |
| **OpenNTPD** | OpenBSD 3.6 (Nov 2004), [En Academic](https://en-academic.com/dic.nsf/enwiki/939862) Henning Brauer & Alexander Guy [Wikipedia](https://en.wikipedia.org/wiki/OpenNTPD) | Henning Brauer (OpenBSD), Brent Cook (portable). [Openntpd](https://www.openntpd.org/)[NetBSD](https://cdn.netbsd.org/pub/pkgsrc/current/pkgsrc/net/openntpd/index.html) Latest OpenBSD-tracked, portable 6.8p1 (Dec 2020). | **Default in OpenBSD.** Privilege-separated, [Wikipedia](https://en.wikipedia.org/wiki/OpenNTPD)[En Academic](https://en-academic.com/dic.nsf/enwiki/939862) ignores leap seconds [Wikipedia](https://en.wikipedia.org/wiki/OpenNTPD) (uses TAI semantics). Supports HTTPS-based "constraint" anchor (TLS time as a sanity check). |  |
| **systemd-timesyncd** | systemd, 2014 | systemd project | SNTP-only; default in many minimal Debian/Ubuntu installs. **Do not use for critical workloads.** |  |
| **Windows W32Time** | Microsoft | Microsoft | Default on all Windows. Historically poor; since Windows Server 2016 capable of ~1 ms with proper config. |  |
| **Ntimed** | PHK, 2014–2015 | Dormant | Historical interest only. |  |

### Public time service operators

- **NIST Internet Time Service (ITS)** — `time.nist.gov`. Stratum 1.
- **USNO (US Naval Observatory)** — `tick.usno.navy.mil`, `tock.usno.navy.mil`. Stratum 1, runs the master clock for the US DoD/GPS.
- **NPL (UK)**, **PTB (Germany, Braunschweig)**, **VNIIFTRI (Russia)**, **NICT (Japan)** — national metrology institutes.
- **NTP Pool Project** — `pool.ntp.org`. Started by Adrian von Bidder (Switzerland) in January 2003; transferred to **Ask Bjørn Hansen** in 2005. As of June 2025, **3,423 active IPv4 servers and 1,905 IPv6 servers**. Global query volume estimated at "hundreds of millions" of clients. Hosting (until 2025) sponsored by **Equinix Metal** (originally Packet); Equinix Metal is sunsetting in 2025 and the Pool is migrating to two smaller distributed clusters. Region pools (`uk.pool.ntp.org`, `de.pool.ntp.org`, …); vendor pools (`debian.pool.ntp.org`, `rhel.pool.ntp.org`). The 2024 ACM SIGMETRICS paper "Deep Dive into NTP Pool's Popularity and Mapping" by Moura et al. found the Pool's GeoDNS is heavily skewed: 551 servers serve US clients while Cameroon and Nigeria are served by 1 and 2.
- **time.cloudflare.com** — Cloudflare anycasted NTS server (TLS-KE on TCP/4460). Aanchal Malhotra led their internal NTP work in early 2019. [Google Sites](https://sites.google.com/site/aanchalmalhotra1990/)
- **time.google.com / time[1-4].google.com** — Google Public NTP. **Smears leap seconds linearly noon-to-noon UTC** (since 2017). Returns REFID `GOOG`. Available worldwide; backed by atomic clocks in datacenters. [Google + 2](https://developers.google.com/time/smear)
- **time.aws.com** — Amazon Time Sync Service public pool. Smears leap seconds (24-hour linear, noon-to-noon, matching Google). Available since November 2022. Inside a VPC use `169.254.169.123` (IPv4) or `fd00:ec2::123` (IPv6). [AWS + 2](https://aws.amazon.com/about-aws/whats-new/2022/11/amazon-time-sync-internet-public-ntp-service/)
- **AWS Nitro PTP Hardware Clock** — Since November 2023 (us-east-1, ap-northeast-1; expanded since), Nitro instances expose a **PTP Hardware Clock (PHC)** via the ENA driver. **Microsecond-level accuracy** vs ~1 ms via NTP. Importantly, **PHC does NOT smear leap seconds** — it follows UTC standards. Don't mix smeared and stepped sources. [AWS + 5](https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/)
- **time.facebook.com / Meta TAP** — Meta switched its internal time fabric to PTP in 2022 (engineering blog Nov 2022). Internal accuracy improved from ~10 ms to ~100 µs, then to sub-µs after PTP rollout. **Open Compute Time Appliance Project (OCP-TAP)** open-sourced the **Time Card** PCIe board (Aug 2021), with versions using OCXO, TCXO, Rubidium, and Rubidium-Ultra oscillators. Vendors: Orolia (now Safran), Time Beat, NVIDIA (BlueField-2 / ConnectX-6 Dx with hardware timestamping). IEEE P3335 standardises Time Card architecture. [FB](https://engineering.fb.com/2021/08/11/open-source/time-appliance/)[Open Compute Project](https://www.opencompute.org/wiki/Time_Appliances_Project)
- **Netnod (Sweden)** — `nts.netnod.se`. Stratum 1, NTS-enabled, also a Roughtime server.
- **Quad9** — `time.quad9.net` (NTS).
- **time.nl (SIDN)** — Dutch national NTP/NTS, expanded 2024–2025.

### Performance numbers (typical, 2026)

| Setup | Accuracy |
|---|---|
| Internet NTP (chrony, ≥4 servers) | **1–10 ms** |
| LAN NTP, no hardware timestamps | **0.1–1 ms** |
| LAN PTP (IEEE 1588), software timestamps | **~10 µs** |
| LAN PTP, **hardware timestamps** | **<1 µs** [Data Center Dynamics](https://www.datacenterdynamics.com/en/news/meta-develops-simple-precision-time-protocol/) (typically 100–500 ns) |
| White Rabbit (PTP + SyncE + asymmetry calibration) | **<1 ns**, picosecond precision [Ventureconnect](https://ventureconnect.cern/white-rabbit) |
| AWS Nitro PHC | "low double-digit microseconds" [Paul's blog](https://www.libertysys.com.au/2024/04/aws-microsecond-accurate-time-first-look/) (P99) |
| Meta SPTP (P99.99 across 100 000+ clients) | **<10 µs** |
| GNSS PPS-disciplined stratum 1 | **~100 ns** to local clients |

---

## 6. Failure modes and famous incidents

### 6.1 The 2012 leap-second Linux kernel bug (30 June → 1 July 2012)

A leap second was inserted at 23:59:60 UTC on 30 June 2012. The Linux kernel's leap-second handler updated `xtime` **without calling `clock_was_set()`** to notify the high-resolution timer (hrtimer) subsystem. Tasks waiting on futexes with absolute deadlines (very common in Java's `LockSupport.parkNanos`, MySQL, JVM-internal timers, ElasticSearch, Hadoop) saw the deadline appear to have already expired and re-queued in a tight livelock, **pegging CPUs at 100 %**. Affected sites included **Reddit, LinkedIn, Mozilla, Yelp, Foursquare, StumbleUpon, Gawker**, the **Amadeus airline reservation system** (causing flight delays at Qantas and others), and many JVM-heavy stacks. Fix: the workaround `date -s "$(date)"` reset the clock and unwedged hrtimers; permanent fix went into kernel 3.4. [Slashroot](https://www.slashroot.in/leap-second-bug-linux-kernel)

### 6.2 The 2015 leap second (30 June 2015)

Mostly uneventful for major web operators because Google had begun publicly evangelising **leap smear** (initial 2008 cosine-smear; switched to 20-h linear in 2012; canonicalised at 24-h linear noon-to-noon in 2017). Some Cisco devices had bugs; some financial systems were tripped up. The 31 December 2016 leap second (the most recent) passed with no major outages — credit Google/AWS smearing. [Google](https://developers.google.com/time/smear)

### 6.3 The 2014 NTP DDoS amplification disaster

In **December 2013–February 2014**, attackers exploited the **MON_GETLIST (`monlist`)** mode-7 query in versions of ntpd before 4.2.7. A 234-byte request returned up to **600 IP-address entries** = up to **48 KB**. Amplification factor: **~206×** (some sources cite 556× including all traffic). Real-world attacks:

- **10 February 2014: ~400 Gbps attack on a Cloudflare customer in Europe** — at the time, the largest DDoS ever recorded, beating the 2013 Spamhaus 300 Gbps attack. Used **4,529 vulnerable NTP servers across 1,298 networks** at ~87 Mbps each.
- **12 February 2014: ~325 Gbps attack on OVH** (announced by Octave Klaba/@olesovhcom). Ironically OVH was also one of the largest sources of attack traffic.

Mitigations: `noquery` in ntp.conf, upgrade to ntpd ≥4.2.7 (monlist disabled by default), BCP38 ingress filtering. Black Lotus reported that **69 % of all DDoS traffic in the first week of January 2014 was NTP reflection.**

### 6.4 CVE soup (2014–2016)

- **CVE-2014-9295** (Dec 2014). Four stack-based buffer overflows (`crypto_recv`, `ctl_putdata`, `configure`, plus a missing `return` in `receive()`) discovered by **Neel Mehta and Stephen Roettger of Google's Security Team**. RCE pre-auth in some configurations. Apple shipped its **first ever silent automatic security update** for macOS to patch this. Fixed in ntp 4.2.8 (18 December 2014). [Network World](https://www.networkworld.com/article/933922/exploits-for-dangerous-network-time-protocol-vulnerabilities-can-compromise-systems-2.html)
- **CVE-2014-9296** — receive() missing return.
- **CVE-2014-9293, -9294** — weak default key in ntp-keygen.
- **CVE-2015-7704, -7705** — NTP packet-of-death and DoS via spoofed origin. Reported by Aanchal Malhotra et al., NDSS 2016. [Google Sites](https://sites.google.com/site/aanchalmalhotra1990/)
- **CVE-2015-7973, -7979** — Replay and "Sybil"-style attacks on broadcast mode (Boston University / Cohen, Brakke, Goldberg, Malhotra).
- **CVE-2016-1550** — Timing-based authentication bypass.
- **CVE-2016-4953, -4954, -4955, -4956, -4957** — Crypto-NAK confusion bugs (Miroslav Lichvar, talos-2016-0081). 4957 lets a remote attacker crash ntpd via a single CRYPTO_NAK; affected ntp 4.2.8p7.
- **CVE-2016-7426** — Client rate limiting bug (Lichvar). [FreeBSD](https://www.freebsd.org/security/advisories/FreeBSD-SA-16:39.ntp.asc)
- **CVE-2016-7431, -7433** — Zero-origin-timestamp bypass and reboot-sync bug (Goldberg/Malhotra). [ATS-PL-SYS](https://www.cs.bu.edu/~goldbe/NTPattack.html)
- **CVE-2016-7434** — `read_mru_list()` DoS via crafted mrulist query in ntp <4.2.8p9. [CVE Details](https://www.cvedetails.com/cve/CVE-2016-7434/)

### 6.5 NTP server abuse / "NTP vandalism" (hardcoded-IP incidents)

- **October 2002 — Trinity College Dublin / "Tardis".** TCD's web server was overloaded by thousands of copies of the freeware Windows program **Tardis** scraping a web page for time. TCD eventually served a tiny page with bogus time data, scattering the clients. (Note: this was HTTP-based, *not* NTP — but it set the template.)
- **May–August 2003 — Netgear vs University of Wisconsin–Madison.** NTP researcher **Dave Plonka** discovered that four Netgear router models had **hardcoded `128.105.39.11`** (UW-Madison's public NTP server) into their SNTP firmware and polled at **1-second intervals when they got no response**. With ~707,000 affected units shipped, peak traffic hit **250,000 packets/second / 150 Mbit/s**. Netgear donated **US $375,000** to UW-Madison after coordinated disclosure. Documented in the canonical writeup at `pages.cs.wisc.edu/~plonka/netgear-sntp/`.
- **2003 — SMC routers vs CSIRO Australia.** Hardcoded the CSIRO NTP server's IP. CSIRO closed its server to the public.
- **2005–2006 — D-Link vs Poul-Henning Kamp.** PHK ran the only public Danish stratum-1 NTP server. He noticed 75–90 % of its traffic came from D-Link routers that had hardcoded his IP. The Danish exchange (DIX) demanded a 54,000 DKK/year fee. PHK wrote an open letter on **27 April 2006** branding D-Link's behaviour "**NTP vandalism**." After Slashdot/Reddit shaming, D-Link "amicably resolved" the dispute. PHK later discovered D-Link routers were also abusing 43 *other* stratum-1 servers. [Wikipedia](https://en.wikipedia.org/wiki/NTP_server_misuse_and_abuse)
- **2016–2017 — TP-Link extender firmware** hardcoded Fukuoka University's NTP server and the AU/NZ pools, polling every 5 s.
- **Snapchat iOS** — a third-party iOS NTP library polled every server it knew about; eventually fixed and Snap donated time servers to AU/SA pools.
- **2003-onward — Cisco and various vendors** — repeated hardcoded-IP issues.
- **2013 — ETH Zurich `swisstime.ethz.ch`** had to block public access after sustained 20 GB/day abuse.

### 6.6 Galileo 11–18 July 2019

Not strictly an NTP failure, but a cautionary tale for stratum-0 GNSS users. The **Galileo Precise Timing Facility (PTF) at Fucino, Italy** suffered a fault during a planned upgrade in which the **redundant standby PTF in Oberpfaffenhofen, Germany was unavailable**. All Galileo satellites flagged "not usable" for **six days**. The European GNSS Agency (GSA) communicated poorly; the European Commission later blamed "the mistake of a single person." Lesson: stratum-0 GNSS receivers need **holdover oscillators** (rubidium, OCXO) and at least one alternate constellation (GPS, GLONASS, BeiDou) to ride through these events. The OCP Time Card with on-board atomic clock is a direct response.

---

## 7. Fun facts and anecdotes (podcast-quotable)

- **Mills wrote the original Fuzzball software in PDP-11 macro assembler**, not BCPL; he chose PDP-11 / LSI-11 because they were the cheapest computers a university could afford. The Fuzzball deployment for NSFNET in 1986 was *six PDP-11s* connecting the entire scientific Internet at 56 kbit/s. [APNIC Blog](https://blog.apnic.net/2024/01/24/vale-dave-mills/)
- **Mills was visually impaired from birth.** He always worked with **giant displays**; from 2012 his vision deteriorated and by 2022 he was completely blind, but he continued to follow the IETF NTP WG.
- **Vint Cerf wrote the obituary on the Internet History mailing list** the same day he learned of Mills's death (19 Jan 2024) and is collecting stories about Mills there.
- **PHK called Mills "the grandfather of the Internet"** ("If Vint Cerf was the father of the internet, Dave Mills was its grandfather") in a Danish-language obituary in *Version2*, January 2024.
- **The 1900 epoch is older than ARPANET, older than UNIX, older than pretty much every other timestamp standard in computing.** It will roll over on **Friday 7 February 2036 at 06:28:16 UTC**. NTPv5's explicit era number kills this problem dead.
- **The reference timestamp special value `0x83AA7E80.00000000` (in NTPv5) corresponds to 24 August 1941 in era 0** — chosen to be benign noise because it's also a valid era-1 future date (29 September 2077). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-ntp-ntpv5)
- **REFID lore.** When you `chronyc sources` or `ntpq -p` and see `.GPS.`, `.PPS.`, `.WWVB`, `.DCFa`, `.LOCL.`, `.INIT.`, `.DENY`, `.RATE` — those are 4-character ASCII codes packed into the 32-bit Reference ID field.
- **Mills's RFCs read like a sea captain's log.** He used nautical metaphors throughout; "stratum" itself is a borrowing from atmospheric/geological layering; "kiss-of-death" is darkly poetic. "**The magic of the NTP daemon**" is one of his phrases.
- **The "happy and loyal soldier" emails** — Mills wrote regularly on `comp.protocols.time.ntp` and was famously patient with neophytes; he reportedly told one researcher who asked unfocused questions that they would ask better questions if they read his papers more carefully first.
- **NTP shirts and badges.** The `ntppool` t-shirts (tag-line "Time is on my side") and Time Card "RADIOACTIVE PCIe card" (Linus Tech Tips made a video) are infamous in the timing community.
- **Beerware.** PHK's beerware license (`<phk@FreeBSD.ORG>` "buy me a beer") sits in the FreeBSD timecounters code Mills helped design. [Wikipedia](https://en.wikipedia.org/wiki/Poul-Henning_Kamp)
- **PHK's "bikeshed" coinage** was originally about an NTP discussion on a FreeBSD mailing list.
- **The OCP Time Card with rubidium oscillator** holds <800 ns over 24 hours of GNSS holdover, is **PCIe** form-factor, costs roughly 1/10 the price of equivalent commercial appliances, and was designed by Meta engineers Ahmad Byagowi and Oleg Obleukhov. [Open Compute Project + 2](https://www.opencompute.org/products/319/ocp-time-card-made-by-time-beat)
- **AWS calls its time-distribution implementation "ClockBound"** and exposes the **error bound** explicitly to applications via `/sys/devices/.../phc_error_bound` — a refreshing departure from "the clock just is what it is." [AWS](https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/)
- **CGPM Resolution 4 was approved 18 Nov 2022.** Russia voted against (GLONASS uses leap seconds). The US, Canada, and France voted yes; ITU's WRC-23 ratified it in December 2023. The 28th CGPM (2026) will likely set the new tolerance. Recent NIST analysis (Levine, 2024) suggests the next negative leap second may be needed before 2035, complicating the runway. [Wikipedia + 4](https://en.wikipedia.org/wiki/Leap_second)

---

## 8. Practical wisdom (operational recommendations, May 2026)

1. **Default to chrony or ntpd-rs, not ntpd.** Chrony is the default in RHEL 8+ and SLES 15+; ntpd-rs is in Debian/Ubuntu/Fedora and deployed at Let's Encrypt. Both are memory-safe-or-better and far easier to configure than ntpd. Reserve ntpd for legacy or specialised refclock setups.
2. **Configure 4 servers minimum.** Marzullo's algorithm needs ≥3 to detect a single liar; 4 gives Byzantine tolerance against one falseticker. Use **`pool 2.<region>.pool.ntp.org iburst`** rather than hardcoding individual IPs. [GitHub](https://github.com/openntpd-portable/openntpd-openbsd/blob/master/src/usr.sbin/ntpd/ntpd.conf.5)
3. **Enable NTS where possible.** `time.cloudflare.com`, `nts.netnod.se`, `ntp.time.nl`, `time.aws.com` (TLS via TCP/4460). Chrony: `server time.cloudflare.com iburst nts`. **Note**: the NTP Pool itself does **not yet** support NTS (work in progress through Pendulum's NTS-pool drafts).
4. **For high-volume servers, enable rate-limiting (KoD `RATE`)** but never expose mode 6 or mode 7 to the public Internet (`restrict default kod nomodify notrap nopeer noquery`).
5. **Monitor:** offset, jitter, stratum, reach (octal `377` is full reach), peer count, root distance. Alert on stratum=16, reach=0, or |offset| > some threshold (e.g. 50 ms).
  - `chronyc tracking`, `chronyc sources -v`, `chronyc clients`
    - `ntpq -pn`, `ntpq -c rv 0`
    - `ntpdate -q <server>` for one-shot probe
6. **Understand smeared vs stepped leap seconds.** **Never mix.** If you use `time.google.com` and `time.cloudflare.com` together at a leap-second event you'll see chaos. Pick one regime per host.
7. **Never use SNTP for critical infrastructure.** systemd-timesyncd is fine for a laptop but do not use it on servers carrying signed transactions.
8. **For sub-millisecond accuracy use PTP with hardware timestamps.** Modern Intel/Mellanox/Marvell NICs support IEEE 1588 hw-tx/hw-rx. Linux: `ptp4l`, `phc2sys` from `linuxptp`. For datacenter: deploy boundary clocks or transparent clocks on every switch hop.
9. **For sub-microsecond accuracy:** Time Card (OCP-TAP), GNSS receiver with PPS to NIC PHC, White Rabbit (CERN profile, IEEE 1588-2019 High-Accuracy).
10. **In application code: distinguish `CLOCK_REALTIME` from `CLOCK_MONOTONIC`.** Use the latter for measuring durations or implementing timeouts. `CLOCK_TAI` is available on Linux for monotonic UTC-equivalent. Beware Java's `System.currentTimeMillis()` (wall) vs `System.nanoTime()` (monotonic).
11. **Virtualised clocks drift.** A KVM/Xen guest can lose 100s of ms within minutes if the hypervisor pauses it. Enable kvm-clock paravirt; chrony handles intermittent links well. AWS PHC, Azure hv_util, GCP metadata.google.internal are all designed to mitigate this.
12. **Regulatory drivers.** **MiFID II RTS 25 (in force January 2018)** mandates clock divergence from UTC of ≤100 µs for high-frequency trading and ≤1 ms for non-HFT. **FINRA** (US) is similar. **NERC CIP-007** for the US power grid requires demonstrated time sync. These regulations are why PTP-with-GPS-and-holdover is not optional in finance, broadcast, and energy. [Safran + 2](https://safran-navigation-timing.com/time-synchronization-time-is-at-the-heart-of-mifid-regulation/)

---

## 9. Learning resources (current as of May 2026)

### Specifications

- **RFC 5905 — NTPv4** (June 2010). The canonical specification. **§7 = packet header; §10 = clock discipline; §11 = mitigation (filter/select/cluster/combine).** [https://www.rfc-editor.org/rfc/rfc5905](https://www.rfc-editor.org/rfc/rfc5905) — *advanced*, last revised 2010.
- **RFC 8915 — NTS for NTP** (October 2020). [https://www.rfc-editor.org/rfc/rfc8915](https://www.rfc-editor.org/rfc/rfc8915) — *advanced*, 2020.
- **RFC 9523 — Khronos** (February 2024). [https://www.rfc-editor.org/rfc/rfc9523](https://www.rfc-editor.org/rfc/rfc9523) — *advanced*, 2024.
- **RFC 8573 — AES-CMAC for NTP** (2019). Deprecates MD5 symmetric auth.
- **draft-ietf-ntp-ntpv5-08** (Lichvar/Mizrahi, March 2026). [https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/](https://datatracker.ietf.org/doc/draft-ietf-ntp-ntpv5/) — *advanced*, current draft.
- **draft-ietf-ntp-roughtime-19** (Ladd/Dansarie, 2025–2026). [https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/](https://datatracker.ietf.org/doc/draft-ietf-ntp-roughtime/) — *advanced*.
- **draft-grant-ntp-ntpv5-algorithms-01** (S. Grant, November 2025). NTPv5 algorithm guidance. — *advanced*.
- **RFC 9748** (2025). NTP Extension Field registry restructure.
- **RFC 9769** (2025). NTPv4 client-server interleaved mode.

### Books and long-form

- **David L. Mills, *Computer Network Time Synchronization: The Network Time Protocol on Earth and in Space*, 2nd edition, CRC Press, March 2011, 466 pp.** ISBN 978-1-4398-1463-5. Still the bible. *advanced*, last updated 2011. [Ilya Safro](https://www.eecis.udel.edu/~mills/papers.html)
- **The New Yorker — "The Thorny Problem of Keeping the Internet's Time"** by Nate Hopper, 30 Sept 2022. Mills profile, lay-accessible, includes interview material.
- David Mills's UDel website **eecis.udel.edu/~mills/** — extensive whitepapers, the "Fuzzball" history, the y2k/era essay. **Maintenance status uncertain since Mills's death in January 2024**; the University of Delaware appears to be preserving it as-is.

### Implementations and project sites

- **ntp.org** — reference implementation (Stenn / Network Time Foundation). Last release 4.2.8p18 line, active. [https://www.ntp.org](https://www.ntp.org)
- **ntpsec.org** — ESR/NTPsec. [https://www.ntpsec.org](https://www.ntpsec.org) , [https://docs.ntpsec.org/latest/](https://docs.ntpsec.org/latest/)
- **chrony-project.org** — Lichvar/Red Hat. Currently active, version 4.6+ (2025). [https://chrony-project.org](https://chrony-project.org)
- **trifectatech.org/projects/ntpd-rs/** — ntpd-rs roadmap, 1.x stable. [https://github.com/pendulum-project/ntpd-rs](https://github.com/pendulum-project/ntpd-rs)
- **openntpd.org** — Brauer / OpenBSD. Latest standalone 6.8p1 (December 2020); tracks OpenBSD base. [Grokipedia](https://grokipedia.com/page/openntpd)
- **OCP Time Appliances Project wiki** — [https://www.opencompute.org/wiki/Time_Appliances_Project](https://www.opencompute.org/wiki/Time_Appliances_Project) ; Time Card open hardware [https://github.com/Time-Appliances-Project/Time-Card](https://github.com/Time-Appliances-Project/Time-Card) . Active 2024–2026. [GitHub](https://github.com/Time-Appliances-Project/Time-Card)

### Industry blogs (high signal)

- **Cloudflare blog NTS posts** by Watson Ladd (2019, 2020, "NTS is now an RFC" Oct 2020). Cloudflare developers.cloudflare.com/time-services/nts/ updated 2024.
- **Meta engineering blog**: "How Precision Time Protocol is being deployed at Meta" (Nov 2022); "Open sourcing a more precise time appliance" (Aug 2021); "Simple Precision Time Protocol at Meta" (Feb 2024); "It's time to leave the leap second in the past" (July 2022).
- **AWS blog**: "Look Before You Leap" (2015), "Amazon Time Sync as Public NTP" (Nov 2022), "It's About Time: Microsecond-Accurate Clocks on Amazon EC2 Instances" (Nov 2023).
- **Tweede golf blog (tweedegolf.nl/en/blog/ntpd-rs)** — implementation deep-dives, NTPv5 in ntpd-rs, NTS-pool design.
- **APNIC blog** — Geoff Huston's "The Internet of Stupid Things" (April 2015) and Moura et al. "NTP Pool: The Internet timekeeper" (March 2024).
- **RIPE Labs** — multiple NTP/NTS articles 2024–2025.
- **SIDN labs** — 2024 ACM SIGMETRICS paper on NTP Pool mapping.

### Academic and conference

- **Aanchal Malhotra et al., "Attacking the Network Time Protocol", NDSS 2016.** [https://www.cs.bu.edu/~goldbe/NTPattack.html](https://www.cs.bu.edu/~goldbe/NTPattack.html) — the paper that triggered NTS development. [ATS-PL-SYS](https://www.cs.bu.edu/~goldbe/NTPattack.html)
- **Malhotra & Goldberg, "Attacking NTP's Authenticated Broadcast Mode", SIGCOMM CCR April 2016.** [ATS-PL-SYS](https://www.cs.bu.edu/~goldbe/NTPattack.html)
- **Malhotra et al., "The Security of NTP's Datagram Protocol", FC'17.**
- **Czyz et al., "Taming the 800 Pound Gorilla: The Rise and Decline of NTP DDoS Attacks", IMC 2014.**
- **Moura, Davids, Schutijser, Hesselman, Heidemann, Smaragdakis, "Deep Dive into NTP Pool's Popularity and Mapping", ACM SIGMETRICS 2024.**
- **NIST PTTI 2024 — M. Coleman**, "Towards Continuous Universal Time and the Future of the Leap Second" (PDF on gps.gov).
- **Levine 2024**, "A Proposal to Change the Leap-Second" (preprint).

### Talks (YouTube / conference recordings)

- FOSDEM Time-and-frequency devroom — multiple Lichvar talks 2019–2025.
- IETF 118 (Prague, Nov 2023) and IETF 121–122 — NTP WG sessions on NTPv5 interop.
- "OCP Time Appliances Project: Open Time Server and Time Card 2 Presentation" by Ahmad Byagowi (Meta).
- Netnod's Marcus Dansarie at RIPE Open House May 2024 — Roughtime status.
- Linus Tech Tips, "Why is this PCIe Card RADIOACTIVE?" — Time Card popularisation.
- Jeff Geerling YouTube — "It's About Time (PTP on the Raspberry Pi)".

### Podcasts

- **Security Now! (TWiT)** — multiple episodes covering NTP DDoS amplification (2014) and CVE-2014-9295 (Ep. 488, Dec 2014).
- **Risky Business** — sporadic NTP coverage; 2014 amplification, 2024 Mills obituary.
- **Packet Pushers** — "NTP & Leap Smearing: What Is It?" and follow-ups.
- IETF audio archives — NTP WG meetings.

### Reference / tooling

- **NIST "Time and Frequency from A to Z"** glossary — [https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z](https://www.nist.gov/pml/time-and-frequency-division/popular-links/time-frequency-z)
- **BIPM Resolution 4 of the 27th CGPM (2022)** — [https://www.bipm.org/en/cgpm-2022/resolution-4](https://www.bipm.org/en/cgpm-2022/resolution-4)
- **IERS Bulletin C** — leap-second announcements.
- **leap-seconds.list** — NIST and IETF distribute. [https://www.ietf.org/timezones/data/leap-seconds.list](https://www.ietf.org/timezones/data/leap-seconds.list)

### Free courseware

- Stanford CS244 (Advanced Networking) — episodic NTP coverage.
- MIT OCW 6.829 — distributed-systems sections on Lamport clocks and physical-clock synchronization.

---

## 10. Where things are heading (2025–2026 frontier)

### NTPv5 — clean break, 2026 targeted publication

NTPv5 is **draft-ietf-ntp-ntpv5-08 (March 2026)**, expires 3 September 2026. Lichvar (Red Hat) and Mizrahi (Huawei) are co-authors. The IESG is expected to advance it within the next year. Major changes:

1. **Drops modes 1, 2, 5, 6, 7** — only client (3) and server (4) survive. [IETF](https://www.ietf.org/archive/id/draft-ietf-ntp-ntpv5-05.html)
2. **Mandatory NTS** for security (or RFC 8573 MAC).
3. **Explicit 16-bit era field** kills the year-2036 problem.
4. **Reference IDs are 120 bits** (vs 32) and use random hashes — far better loop-detection.
5. **Root delay/dispersion resolution** improves from ~15 µs to ~4 ns (different fixed-point format).
6. **New Correction extension field** lets switches/routers (transparent clocks) report their residence delay, à la PTP.
7. **Interleaved mode is first-class** with an explicit flag, not inferred from cookie comparison.
8. **Synchronized-server flag** is separated from leap indicator.
9. **Multiple timescales** (UTC, TAI, smeared-UTC) can be advertised.
10. **First-octet version negotiation** keeps NTPv5 bit-compatible with NTPv4 wireshark identification.

ntpd-rs has experimental NTPv5 (`--features unstable_ntpv5`) and has interop-tested at IETF 118 onward. chrony has a v5 prototype branch.

### Leap-second roadmap

- **CGPM Resolution 4 (Nov 2022)**: tolerance increased "in or before 2035."
- **WRC-23 Dubai (Dec 2023)**: ITU formally recognises CGPM-4.
- **CGPM 28 (2026)**: expected to set the new tolerance value (60 s? 1 minute? 100 s?).
- **2025–2027**: BIPM Task Group on Continuous UTC consults stakeholders.
- **Open question**: whether a *negative* leap second is needed before 2035 (Earth's rotation has been speeding up since 2020; 29 June 2022 was the shortest day on record at 86,399.99841 s).

### Hyperscale datacenters: NTP is over, PTP has won

- **Meta** announced in November 2022 it was migrating internal infrastructure from NTP-based time (~10 ms → 100 µs) to PTP (sub-µs); released SPTP February 2024 and now serves 100,000+ clients per Time Appliance.
- **Google Spanner** has used **TrueTime** (atomic clocks + GPS in every datacenter, with explicit error bounds via Marzullo intersection) since 2012; this is essentially an industrial-strength internal time fabric whose properties Spanner's serialisability depends on.
- **AWS Nitro PHC** rolled out from November 2023; PTP-grade microsecond accuracy for any Nitro instance.
- **Microsoft Azure** offers `hv_util` PHC inside Hyper-V VMs.
- **OCP Time Appliance Project** is the open-source reference design powering all of this.

### NTS rollout

- 2020: RFC 8915 published; Cloudflare and Netnod live.
- 2022: Quad9, SIDN, AWS support added.
- 2024–2026: Pendulum drafting **NTS-pool extensions** so the volunteer pool can support NTS without per-server cert pain.
- Growing list of public NTS servers tracked at github.com/jauderho/nts-servers.
- **Cisco IOS-XE still does not support NTS as of mid-2025** — only legacy MD5/SHA-1/AES-128 CMAC.

### Roughtime

- draft-ietf-ntp-roughtime-19, expected RFC publication 2026–2027.
- Live: `roughtime.cloudflare.com`, Netnod's two servers, `roughtime.se`.
- Aimed at IoT bootstrap and detection of malicious time servers, *not* precision time. Cryptographically robust (Ed25519, Merkle proofs of inclusion).

### Quantum-resistant NTS

- TLS 1.3 is gaining hybrid post-quantum key exchange (X25519+Kyber/MLKEM) per RFC 9180 and TLS WG drafts.
- NTS-KE inherits this for free since it's a TLS application.
- Symmetric AEAD (AES-SIV) is already considered PQ-safe at 256-bit keys.

### MiFID II / FINRA / NERC CIP regulatory drivers

- MiFID II RTS 25 in force since 3 January 2018 — 100 µs HFT, 1 ms non-HFT, 1 s voice.
- ESMA proposed superseding RTS 25 with a new clock-sync RTS in 2024–2025 consultation; broadly similar requirements.
- US **CAT (Consolidated Audit Trail)** has comparable requirements.
- These have made PTP+GPS+rubidium-holdover effectively mandatory in finance, broadcast, and grid SCADA — the major commercial driver for the Time Card / White Rabbit ecosystem.

### IETF NTP WG focus areas (2025–2026)

- Finalising NTPv5.
- NTS extensions for pools (Pendulum drafts).
- Roughtime publication.
- Khronos uptake (RFC 9523 is published; reference implementation at khronos.nwtime.org).
- TICTOC WG (predecessor work on time over packet networks) has been concluded; PTP work largely lives in IEEE 1588 WG now, with IETF maintaining the time/security side.

### Things *not* happening

- **NTP over QUIC** has been mooted (draft-mlichvar-ntp-over-ptp/quic ideas) but has no significant traction. The "transport-security-quic" (TSQ) draft expired in February 2026 and per LWN is "probably better not revived." NTS over UDP/123 is the consensus path.

---

## 11. Hooks for the article, infographic, and podcast

### 60-second narrated hook

> *Every digital photo's timestamp, every TLS certificate, every blockchain block, every stock trade — is anchored to a number that ticks once a second since midnight on January 1st, 1900. The man who designed that number was visually impaired, worked from a giant monitor at the University of Delaware, and ran the early Internet's first routers — fifty PDP-11s the size of mini-fridges — out of a closet. His name was Dave Mills, and on January 17, 2024, he died, age 85. The clock he built is still running. By 2036, it will roll over, and your computer will need to know what to do about it.*

### Striking statistic with source

> *In February 2014, attackers using just **4,529 misconfigured NTP servers** generated a **400 gigabit-per-second** distributed denial-of-service attack on a Cloudflare customer in Europe — the largest DDoS in history at the time, three years' worth of YouTube uploads in a few hours. The vulnerability was a **single command** in Mills's 1990s-era reference implementation called `monlist`. It returned, by design, a list of "the last 600 IP addresses that talked to me." That command was a **206× amplifier**.* — Cloudflare blog, "Technical Details Behind a 400Gbps NTP Amplification DDoS Attack" (Feb 2014).

### Pause-and-think moment

> *Time on the Internet is not a clock. It is **a consensus protocol** running over UDP between four-or-more strangers, none of whom you trust, with no encryption (until 2020), and a measurement algorithm that requires the network to be **symmetrically lossy** — every millisecond on the way out balanced by one on the way back. **It works** to within ten milliseconds of the cesium fountain at NIST Boulder. That it works at all is, frankly, a small miracle of engineering.*

### Failure-story arc (suggested 3-act for podcast)

- **Act I**: *D-Link, 2005.* Poul-Henning Kamp, a Danish hacker, runs the only public stratum-1 NTP server in Denmark for free. One day his bandwidth bill is 54,000 kroner. The reason: **a million D-Link home routers** with his IP address baked into firmware. He writes an open letter calling it "NTP vandalism."
- **Act II**: *Wisconsin, 2003.* A few years earlier, Dave Plonka at UW-Madison had seen the *exact same problem*, with **Netgear**, only worse: 700,000 routers polling once per second, generating 250,000 packets per second of inbound flood. Netgear paid the university $375,000.
- **Act III**: *2014.* A Russian crime group realises they don't *need* hardcoded clients. They can **spoof one packet per server** and the whole protocol is an amplifier. 400 gigabits per second. A **single command from 1992** brings half the European Internet to its knees.

The arc proves the punchline: **Mills was right that the protocol was elegant. He was wrong that obscurity would protect the operational deployment.** That realisation drove Aanchal Malhotra's NDSS 2016 paper, NTS, NTPsec, ntpd-rs, and ultimately NTPv5.

---

## Caveats

- **NTP daemon market share is hard to measure** — anything I cite for "default in X distribution" is documented, but installed-base fractions are inferred and may be stale.
- **The 4.529 / 87 Mbps figures for the 2014 Cloudflare attack come from Cloudflare's own postmortem.** They are widely repeated but are essentially self-reported.
- **The SPTP performance claims are from Meta's blog**, with internal monitoring as the reference; external IEEE 1588v2 certification was claimed but I have not verified the certifying lab.
- **The leap-second-abandonment is committed but not yet implemented.** The 2026 CGPM (28th) is *expected* to set the new tolerance, but the actual date "in or before 2035" remains a ceiling, not a fixed schedule. A negative leap second between now and 2035 is increasingly possible (Earth rotation speeding up since 2020) and would complicate everyone's smear logic.
- **NTPv5 is not yet an RFC.** I cite draft-08 (March 2026); fields may shift before final publication. **Do not implement to draft-08 in production** — track the IETF NTP WG.
- **Mills's UDel website** (`eecis.udel.edu/~mills/`) was active until his death; current maintenance is honorific. Some links may rot. The Network Time Foundation has discussed mirroring it but no formal archive policy is published as of this writing.
- **Historic dates pre-1990s rely on RFC dates and Wikipedia's Mills/NTP/Fuzzball pages.** RFC dates are authoritative; secondary biographical claims (e.g. "Mills wrote ntpd in BCPL" — *false*; he used PDP-11 macro assembler for the Fuzzball OS and C for the later ntpd reference) have been corrected against the eecis.udel.edu primary source where contradictions arose. The user prompt's note that Mills "wrote ntpd in BCPL on PDP-11/Fuzzball" appears to be a confusion with other early-Internet protocols; I have not been able to corroborate it from primary sources and have omitted that specific claim from the body.
- **The Tardis incident at Trinity College Dublin (Oct 2002)** was an HTTP-based time-fetch flood, *not* NTP per se, though it is universally cited as the opening shot in the "NTP server abuse" canon.
- **"557×" amplification**: some sources cite this for monlist; Cloudflare's own number is **206×** for a fully populated server. The discrepancy is because 557× is a theoretical maximum across worst-case packet padding; 206× is the operational ratio observed.
- **Where multiple sources disagree on the 2024 Tweede golf / Pendulum / Trifecta governance structure**, I have favoured the Trifecta Tech Foundation site (the current 2025–2026 governing entity) over older Tweede golf pages.