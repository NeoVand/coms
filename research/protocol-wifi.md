---
prompt_source: deep-research-prompts.txt:1216-1394 (PROTOCOL · 802.11 · Wi-Fi)
run_date: 2026-05-05
claude_chat: (manual export from user)
research_mode: claude.ai Research
---

# Wi-Fi (IEEE 802.11): A Citation-Backed Engineering Reference

*Compiled May 5, 2026. Verified against primary sources from 2024–2026 wherever possible. Older sources are flagged where the situation has materially changed.*

---

## Prerequisites and glossary

This section defines every term used later. Read this once; the rest of the report assumes it.

**OSI / TCP-IP stack.** Wi-Fi lives at Layers 1 (PHY) and 2 (MAC). It carries Layer 3 (IP) packets transparently. Standard reference: the IETF "Brief History of the Internet" and IEEE 802 architecture document `IEEE 802-2014` (https://standards.ieee.org/ieee/802/4097/). 802.11's MAC is a sub-layer of the IEEE 802 LLC stack defined in `IEEE 802.1D` (bridging) and `802.2` (LLC).

**Frame, packet, datagram, segment.** A *frame* is an L2 unit (e.g., an 802.11 MPDU). A *packet* is an L3 unit (IP). A *datagram* is the L4 UDP unit. A *segment* is the L4 TCP unit. (RFC 1122 — https://datatracker.ietf.org/doc/html/rfc1122.)

**Header, payload, FCS, checksum.** A frame is `[header | payload | FCS]`. The Frame Check Sequence is a 32-bit CRC at the end of every 802.11 frame; an L4 *checksum* is a separate, weaker integrity field in TCP/UDP/IP headers.

**MAC address.** A 48-bit Layer 2 identifier, defined by IEEE 802. Locally administered bit (U/L) and group bit live in the first octet. Modern OSes randomize the locally administered MAC per-SSID for privacy (see "MAC randomization" below).

**Socket, handshake, stream.** Sockets are the OS abstraction for an L4 endpoint (RFC 147 lineage; Berkeley sockets). A *handshake* is a multi-message protocol exchange that establishes shared state (e.g., TCP three-way, TLS, 802.11 four-way, SAE Commit/Confirm). A *stream* is an ordered byte sequence (TCP) or modulation-domain spatial stream (PHY).

**SSID / BSSID / ESSID.** SSID is the human-readable network name (≤32 octets). BSSID is the 48-bit MAC of an AP's radio (one BSSID per BSS). ESSID is the broader extended service set spanning multiple BSSIDs sharing the same SSID. Cisco "WLAN Fundamentals" — https://www.cisco.com/c/en/us/td/docs/wireless/controller/technical-reference/.

**Beacon, probe req/resp.** Beacons are management frames an AP broadcasts (default every 102.4 ms = 100 TUs of 1024 µs each — IEEE Std 802.11-2020 §9.4). Probe requests/responses let stations actively discover networks.

**Association / authentication.** Authentication is the L2 step where a station proves identity (Open System, Shared Key, SAE). Association binds the station to one BSSID for traffic. State machine: *Unauthenticated/Unassociated → Authenticated/Unassociated → Authenticated/Associated* (IEEE Std 802.11-2024 §11.3 — https://standards.ieee.org/ieee/802.11/10548/).

**MSDU / MPDU / A-MSDU / A-MPDU.** MSDU = MAC Service Data Unit (the L3 payload handed to MAC). MPDU = MAC Protocol Data Unit (a transmittable frame). A-MSDU aggregates multiple MSDUs into one MPDU. A-MPDU aggregates multiple MPDUs into a single PHY transmission (introduced in 802.11n; central to throughput in n/ac/ax/be).

**RSSI.** Received Signal Strength Indicator, in dBm; vendor-specific scale, but commonly −30 dBm (excellent) to −90 dBm (unusable). −67 dBm is the typical voice target.

**MCS / spatial stream.** Modulation and Coding Scheme indexes a row of (modulation, code rate, GI). A spatial stream is one independent MIMO data stream across antennas. Wi-Fi 7 supports MCS 0–13 with 4096-QAM (up from 1024-QAM in Wi-Fi 6) and up to 8 spatial streams (https://en.wikipedia.org/wiki/Wi-Fi_7).

**OFDM / OFDMA / QAM / BPSK.** OFDM divides a channel into orthogonal subcarriers (312.5 kHz spacing pre-ax, 78.125 kHz in ax/be). OFDMA assigns subcarriers (Resource Units) to different users in the same TXOP — introduced in Wi-Fi 6. QAM amplitude-and-phase-modulates each subcarrier; BPSK is the simplest, 4096-QAM packs 12 bits/symbol (Tektronix — https://www.tek.com/en/documents/primer/wi-fi-overview-80211-physical-layer-and-transmitter-measurements).

**MU-MIMO.** Multi-User MIMO: an AP uses beamforming to steer separate spatial streams to multiple clients simultaneously. Downlink in 11ac Wave 2; uplink added in 11ax.

**TWT.** Target Wake Time: AP and station negotiate scheduled wake intervals (microseconds to hours) so the radio stays asleep otherwise. Originated in 802.11ah (HaLow), promoted in 802.11ax (https://www.renesas.com/en/blogs/low-power-advantage-wi-fi-66e-twt-explained).

**BSS Coloring.** A 6-bit field in the HE PHY header (Wi-Fi 6+) that lets a STA detect that a frame is from a non-co-located BSS and apply more aggressive Spatial Reuse thresholds.

**Cryptographic primitives.**
- **AES-CCMP** (CCM mode of AES, 128-bit): mandatory data-confidentiality cipher in WPA2 (RFC 3610; IEEE 802.11i).
- **AES-GCMP** (Galois/Counter Mode, 128 or 256 bit): higher-throughput AEAD used in WPA3 and required for 11ac/ax 256-QAM-class throughput.
- **SAE / Dragonfly**: Simultaneous Authentication of Equals — a PAKE (password-authenticated key exchange) used by WPA3-Personal in place of PSK (https://www.wi-fi.org/discover-wi-fi/security).
- **PMK / PTK / GTK / IGTK**: Pairwise Master Key, Pairwise Transient Key (per-association unicast keys derived during the 4-way handshake), Group Temporal Key (broadcast/multicast key), Integrity GTK (for protected management frames). PTK = PRF(PMK, ANonce ‖ SNonce ‖ APMAC ‖ STAMAC) (https://www.wifi-professionals.com/2019/01/4-way-handshake).
- **PMF / 802.11w**: Protected Management Frames using BIP-CMAC. Mandatory in 6 GHz, WPA3 and Wi-Fi 7.

**802.1X / EAPOL / RADIUS.** 802.1X is port-based access control. EAPOL is "EAP over LAN," carrying EAP messages between supplicant and authenticator. RADIUS (RFC 2865) is the back-end AAA protocol that the authenticator (AP/WLC) speaks to the auth server.

---

## History and story

**The regulatory big bang (1985).** FCC Docket 81-413, championed by Michael Marcus, opened the 902 MHz, 2.4 GHz and 5.8 GHz ISM bands for unlicensed spread-spectrum use on May 9, 1985 (FCC 02-328 retrospective — https://docs.fcc.gov/public/attachments/FCC-02-328A1.pdf; IEEE Milestones — https://ieeemilestones.ethw.org/Milestone-Proposal_talk:The_birth_of_WiFi). Without this, none of what follows happens.

**NCR / AT&T WaveLAN (1988–1991).** NCR Corp. (Dayton, with engineering in Utrecht/Nieuwegein, Netherlands) — engineers including Vic Hayes, Bruce Tuch and Cees Links — built WaveLAN to wirelessly connect cash registers, launching it in 1990 (https://evanmccann.net/blog/wifi-101/origins-and-history; IEEE Computer Society — https://www.computer.org/profiles/victor-hayes).

**IEEE 802.11 Working Group (1990).** Vic Hayes assumed the chair of what became 802.11 in 1990 and held it until 2000, earning the "Father of Wi-Fi" sobriquet (https://en.wikipedia.org/wiki/Vic_Hayes).

**802.11-1997.** Ratified June 1997. 1–2 Mbit/s in 2.4 GHz using FHSS or DSSS, plus a (never-deployed) infrared PHY (https://en.wikipedia.org/wiki/IEEE_802.11).

**802.11b (Sept 1999) and the Apple AirPort moment.** 11 Mbit/s DSSS in 2.4 GHz. Steve Jobs' July 1999 AirPort demo with Phil Schiller jumping through a hula-hoop on stage made consumer Wi-Fi inevitable.

**WECA → Wi-Fi Alliance (1999); naming.** The Wireless Ethernet Compatibility Alliance hired Interbrand to brand the technology. Per Phil Belanger's 2005 confession on Boing Boing, "Wi-Fi" was chosen from 10 candidate names; it does **not** stand for "Wireless Fidelity," which was a tagline retrofitted briefly by board nervousness and dropped (https://boingboing.net/2005/11/08/wifi-isnt-short-for.html; Snopes 2024 confirmation — https://www.snopes.com/news/2024/07/23/wi-fi-definition-origin/). The yin-yang–style logo was also Interbrand's work (https://en.wikipedia.org/wiki/Wi-Fi).

**802.11a (Sept 1999).** First OFDM PHY; 5 GHz; up to 54 Mbit/s — but expensive radios, slow uptake.

**802.11g (June 2003).** OFDM in 2.4 GHz, backward-compatible with b. Drove the SoHo router boom.

**802.11n / Wi-Fi 4 (Oct 2009).** MIMO (up to 4 spatial streams), 40 MHz channel bonding, A-MPDU/A-MSDU aggregation, 64-QAM. 600 Mbit/s peak. Retroactively renamed Wi-Fi 4 in 2018.

**802.11ac / Wi-Fi 5 (Dec 2013).** 5 GHz only, up to 80/160 MHz channels, 256-QAM, 8 spatial streams, downlink MU-MIMO.

**802.11ax / Wi-Fi 6 (2019) and Wi-Fi 6E (2020).** OFDMA, 1024-QAM, BSS Coloring, TWT, uplink MU-MIMO. Wi-Fi 6E extended Wi-Fi 6 into the 6 GHz band the FCC freed in April 2020 (1200 MHz of spectrum across U-NII-5 through U-NII-8) (FCC 6 GHz Report and Order, 35 FCC Rcd 3852 (2020)).

**Generation numbering (Oct 2018).** Wi-Fi Alliance introduced Wi-Fi 4/5/6 marketing labels for 802.11n/ac/ax to make consumer comparison sane.

**802.11be / Wi-Fi 7.** Wi-Fi Alliance launched Wi-Fi CERTIFIED 7 on **January 8, 2024** (https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7). The IEEE 802.11be amendment was approved September 26, 2024 and **published July 22, 2025** (https://standards.ieee.org/ieee/802.11be/7516/; https://techblog.comsoc.org/2025/01/10/wifi-7-backgrounder-and-ces-2025-announcements/). Headline features: 320 MHz channels, 4096-QAM, Multi-Link Operation (MLO), preamble puncturing, Multi-RU. Theoretical peak ~46 Gb/s; ~30 Gb/s required by the PAR (https://en.wikipedia.org/wiki/Wi-Fi_7).

**IEEE 802.11-2024 rollup.** Published April 28, 2025 (5,956 pages), incorporating amendments 1–7 from 2021–2024 (https://standards.ieee.org/ieee/802.11/10548/; https://www.ieee802.org/11/). 802.11bh-2024 (randomized-MAC operation, June 2025), 802.11bk-2025 (320 MHz FTM, Sept 2025), and 802.11bf-2025 (Wi-Fi sensing, Sept 2025) followed.

**Wi-Fi 8 / 802.11bn — Ultra High Reliability.** Task Group formed May 2021. As of the **March 2026 plenary**, TGbn was at Draft 1.3, ~1800 LB291 comments resolved, with Draft 2.0 ballot targeted for **May 2026 in Antwerp**, and final ratification still on schedule for **September 2028** (https://www.ieee802.org/11/Reports/tgbn_update.htm; Ofinno standards readout — https://ofinno.com/the-standards-readout-2/wi-fi-8-advances-mmwave-hits-a-split-wi-fi-9-begins/). Same bands and 320 MHz max as Wi-Fi 7 — explicitly **not** a peak-speed upgrade. PAR objectives: +25% throughput at given SINR, −25% 95th-percentile latency, −25% MPDU loss across BSS transitions (https://en.wikipedia.org/wiki/IEEE_802.11bn). Broadcom announced a Wi-Fi 8 chipset in October 2025 and ASUS demoed a draft router at CES 2026; consumer launches expected mid-to-late 2026 (https://www.networkworld.com/article/4112600/wi-fi-8-in-2026-next-gen-wireless-standard-prioritizes-reliability-over-speed-gains.html). A "Wi-Fi 9" successor study group started January 2026 (Ofinno).

**The 6 GHz political fight.** US: FCC freed 1,200 MHz on April 23, 2020 for unlicensed Wi-Fi (LPI indoor; AFC-coordinated Standard Power for indoor and outdoor). On **February 23, 2024** the FCC Office of Engineering and Technology approved seven AFC system operators (Qualcomm, Federated Wireless, Sony, Comsearch, Wi-Fi Alliance Services, Wireless Broadband Alliance, Broadcom) for commercial AFC operation (https://docs.fcc.gov/public/attachments/DA-24-166A1.pdf). The first AFC-certified Wi-Fi 7 AP, RUCKUS R770, was certified April 16, 2024 (https://www.ruckusnetworks.com/blog/2024/fcc-6-ghz-afc-device-certification-opens-new-possibilities-for-the-ruckus-r770-wi-fi-7-ap/). AXON Networks became the eighth AFC operator in **June 2025** (https://docs.fcc.gov/public/attachments/DA-25-559A1_Rcd.pdf). EU: Decision 2021/1067 made only the lower 480 MHz (5945–6425 MHz) available. After a long consultation, the **Radio Spectrum Policy Group on November 12, 2025 recommended assigning the upper band (specifically 6585–7125 MHz) to mobile/5G, holding 160 MHz pending WRC-27**; the Wi-Fi Alliance publicly disagreed (https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-strongly-disagrees-rspg-recommendation-blocking-wi-fi-access; https://www.lightreading.com/wifi/mobile-operators-beat-wi-fi-for-upper-6ghz-in-europe). This is the single biggest regulatory delta of the last 24 months.

**Security history (the cliff-notes).**
- **WEP (1997)**: 40/104-bit RC4 with a 24-bit IV. Catastrophically broken by Fluhrer–Mantin–Shamir in 2001 ("Weaknesses in the Key Scheduling Algorithm of RC4"). AirSnort (Aug 2001) automated the attack.
- **WPA (2003)**: TKIP with RC4 — a transitional firmware-upgradeable patch.
- **WPA2 / 802.11i (2004)**: AES-CCMP. The reigning standard for 13 years.
- **KRACK (Oct 16, 2017)**: Mathy Vanhoef and Frank Piessens, "Key Reinstallation Attacks: Forcing Nonce Reuse in WPA2," ACM CCS 2017 (https://papers.mathyvanhoef.com/ccs2017.pdf). CVE-2017-13077 through CVE-2017-13088 covered the family.
- **WPA3 (June 2018)**: SAE replacing PSK; 192-bit Suite B option for Enterprise; mandatory PMF.
- **Dragonblood (Apr 10, 2019)**: Vanhoef & Ronen, "Dragonblood: Analyzing the Dragonfly Handshake of WPA3 and EAP-pwd," IEEE S&P 2020 (https://papers.mathyvanhoef.com/dragonblood.pdf). CVE-2019-9494 through CVE-2019-9499.
- **FragAttacks (May 2021)**: Vanhoef, USENIX Security 2021. 12 CVEs CVE-2020-24586/24587/24588 (design) and CVE-2020-26139…26147 (implementation) (https://www.fragattacks.com/).
- **Framing Frames (Mar 2023)**: Schepers, Ranganathan, Vanhoef — CVE-2022-47522, USENIX Security 2023 (https://www.usenix.org/conference/usenixsecurity23/presentation/schepers).
- **SSID Confusion (May 2024)**: Gollier & Vanhoef, WiSec 2024. **CVE-2023-52424** — the SSID is not part of the 4-way-handshake key derivation in many configurations, allowing downgrade-style trickery against any client OS (https://www.top10vpn.com/research/wifi-vulnerability-ssid/; https://www.wiz.io/vulnerability-database/cve/cve-2023-52424). This is the most important new Wi-Fi flaw since FragAttacks.

**802.11p / DSRC vs C-V2X.** FCC's First Report and Order (Nov 2020) reallocated 45 MHz of the 5.9 GHz band (5.850–5.895 GHz) to unlicensed Wi-Fi and reserved 30 MHz (5.895–5.925 GHz) for ITS, ending the 1999 DSRC monopoly (https://docs.fcc.gov/public/attachments/DOC-367827A1.pdf). The **Second Report and Order (Nov 2024, FCC 24-106)** finalized the rules and required all ITS to be C-V2X by **December 14, 2026**, retiring DSRC (https://www.federalregister.gov/documents/2024/12/13/2024-28980/use-of-the-5850-5925-ghz-band).

---

## How it actually works

### Frame format

The basic 802.11 MAC frame (per IEEE Std 802.11-2024 §9):

```
[ Frame Control (2B) | Duration/ID (2B) | Address 1 (6B) | Address 2 (6B) |
  Address 3 (6B) | Sequence Control (2B) | Address 4 (6B, optional) |
  QoS Control (2B, optional) | HT Control (4B, optional) |
  Frame Body (0–7951B) | FCS (4B) ]
```

- **Frame Control** subfields: Protocol Version (2 bits), Type (2), Subtype (4), ToDS (1), FromDS (1), MoreFrag (1), Retry (1), PwrMgt (1), MoreData (1), Protected (1), +HTC/Order (1).
- **Duration/ID** sets the NAV on neighbors.
- **Sequence Control**: 4-bit Fragment Number + 12-bit Sequence Number.
- **QoS Control** appears in QoS data frames (ever since 11e). **HT Control** is present for 11n+, and HE/EHT variants in 11ax/be carry trigger info.
- The maximum MSDU is 2,304 bytes; an A-MSDU can reach 11,454 bytes (HT) and an A-MPDU up to ~4 MB in EHT.

### Frame types

- **Management** (Type 00): Beacon (subtype 1000), Probe Request (0100), Probe Response (0101), Authentication (1011), Deauthentication (1100), Association Req/Resp, Reassociation Req/Resp, Disassociation, Action.
- **Control** (Type 01): RTS, CTS, ACK, BlockAck, BlockAckReq, PS-Poll, Trigger (HE/EHT).
- **Data** (Type 10): Data, Null, QoS Data, QoS Null.

### Why four addresses

Because Wi-Fi frames can traverse a Distribution System (DS), the addressing scheme distinguishes Receiver, Transmitter, original Source, and final Destination. ToDS and FromDS bits select the meaning:

| ToDS | FromDS | A1 (RA) | A2 (TA) | A3 | A4 |
|---|---|---|---|---|---|
| 0 | 0 | DA | SA | BSSID | – |
| 0 | 1 | DA | BSSID | SA | – |
| 1 | 0 | BSSID | SA | DA | – |
| 1 | 1 | RA | TA | DA | SA |

The A4 (4-address) form is used for **WDS** bridges and **mesh** (11s).

### Discovery

- **Passive scan**: STA listens on each channel for a beacon (default 102.4 ms interval, since TU=1024 µs and beacon interval=100 TUs).
- **Active scan**: STA broadcasts a Probe Request; APs respond with Probe Response (privacy-impacting because PRs leak SSID lists; 802.11aq/MAC randomization aim to mitigate).

### Association state machine

State 1 (Unauthenticated/Unassociated) → State 2 (Authenticated/Unassociated) → State 3 (Authenticated/Associated) → State 4 (RSN-associated). Deauth or Disassoc transitions back to State 1/2.

### The 4-way handshake (WPA2/WPA3 unicast)

Both sides start with the PMK (derived from PSK via PBKDF2 in Personal mode, or from EAP MSK in Enterprise mode). Then:

1. **M1 (AP→STA)**: ANonce, in plaintext, with replay counter.
2. STA generates SNonce, computes `PTK = PRF-512(PMK, "Pairwise key expansion", min(MAC_AP,MAC_STA) ‖ max(...) ‖ min(ANonce,SNonce) ‖ max(...))`. PTK splits into KCK (16B), KEK (16B), TK (16B).
3. **M2 (STA→AP)**: SNonce + RSN IE + MIC computed under KCK.
4. AP derives PTK, verifies MIC.
5. **M3 (AP→STA)**: ANonce (replay), GTK (encrypted with KEK), MIC, Install bit.
6. **M4 (STA→AP)**: ACK + MIC. Both sides install PTK; encrypted data flow begins (https://www.wifi-professionals.com/2019/01/4-way-handshake; https://kernelblog.com/posts/4-way-handshake-in-802.11-wi-fi/). KRACK abused step 3 retransmission to force nonce reuse.

### WPA3 SAE (Dragonfly)

Two-phase Commit/Confirm in which both peers prove possession of a low-entropy password without revealing it, using a PAKE based on a hash-to-curve "PWE" (Password Element). The Hash-to-Curve in current WPA3 is the IETF `hash-to-curve` mapping (RFC 9380); the original "hunt-and-peck" was replaced precisely because of Dragonblood timing leaks (CVE-2019-9494). After Confirm, both peers hold the same PMK and run the standard 4-way handshake.

### CSMA/CA

Stations sense the medium (CCA: Clear Channel Assessment, energy + preamble detection). If idle for **DIFS** (34 µs in OFDM), they pick a random backoff slot in [0, CW] and decrement during idle slots. **SIFS** (16 µs OFDM) precedes ACK/CTS. The **NAV** is a virtual carrier-sense reservation set by Duration/ID. RTS/CTS optionally clears the floor for a long TXOP (mitigates the *hidden-node* problem).

### PHY essentials

- Pre-11n: 64-FFT OFDM, 312.5 kHz subcarrier spacing.
- 11ax/be: 4× longer symbol (12.8 µs) with 78.125 kHz spacing, enabling OFDMA Resource Units (26-tone, 52-tone, 106-tone, 242-tone, 484-tone, 996-tone, 2×996-tone, and Wi-Fi 7 4×996-tone for 320 MHz).
- Channel widths: 20 MHz (b/g/n/ax), 40 (n/ac/ax), 80 (ac/ax), 80+80 / 160 (ac/ax), **320 MHz (Wi-Fi 7, 6 GHz only)**.
- Guard intervals: 0.8 µs / 1.6 µs / 3.2 µs (HE/EHT).
- MIMO: up to 8×8:8 in 11ax/be; spatial streams multiply throughput when SNR allows.

### Wi-Fi 7 specifics

- **4096-QAM** (12 bits/symbol) — needs ~+5 dB SNR vs 1024-QAM, so usable mainly close to AP.
- **MLO modes**:
  - **STR (Simultaneous Transmit and Receive)** = MLMR Async: two independent radios, two bands at once. True throughput aggregation; almost all current STA devices do **not** support this. APs and Ubiquiti's AirWire client are the early STR examples (https://ifeeltech.com/blog/wifi-7-multi-link-operation-mlo-explained; https://documentation.meraki.com/Wireless/Design_and_Configure/Architecture_and_Best_Practices/Wi-Fi_7_(802.11be)_Technical_Guide).
  - **NSTR (Non-STR MLMR)** = synchronous; both links transmit or both receive together. Less common in shipping silicon.
  - **EMLSR (Enhanced Multi-Link Single Radio)**: one radio that listens on multiple bands and switches sub-millisecond to whichever band wins channel access. Throughput does **not** add across bands; latency consistency improves. iPhone 16 Pro, Galaxy S25, Intel BE200, MacBook M4/M5 use eMLSR.
  - **EMLMR**: enhanced multi-link multi-radio variant — defined but not in widespread Release 1 deployment.
- **Preamble puncturing**: drop noisy 20 MHz subblocks while keeping the rest of an 80/160/320 MHz channel alive (mandatory for Wi-Fi 7 cert).
- **320 MHz channels**: only available where 6 GHz is open and contiguous.

### Power save

- **Legacy PS / PS-Poll** (since 1997): STA tells AP "I'm sleeping"; AP buffers and sets TIM bit in beacon; STA wakes at DTIM intervals, polls, drains buffer.
- **U-APSD / WMM-PS** (11e): trigger-based delivery for VoIP latency.
- **TWT** (11ax, originally 11ah): the AP and STA negotiate explicit wake schedules — individual or broadcast. IoT can sleep for **seconds to hours** vs the millisecond legacy floor (https://www.renesas.com/en/blogs/low-power-advantage-wi-fi-66e-twt-explained).

### Roaming

- **802.11k**: Radio Resource Management — neighbor reports so the STA knows where to look next.
- **802.11v**: BSS Transition Management — AP can request a STA to roam.
- **802.11r**: Fast BSS Transition — pre-computed PMK-R0/R1 hierarchy lets a roam complete in one frame exchange instead of a full re-auth + 4-way handshake. Best deployed with PMF; "over-the-DS" mode is famously brittle in mixed-vendor settings.

### Sequence diagram (probe → auth → assoc → 4-way → data)

```mermaid
sequenceDiagram
  participant STA as Station
  participant AP as Access Point
  STA->>AP: Probe Request (SSID, supported rates)
  AP-->>STA: Probe Response (BSSID, capabilities, RSN IE)
  STA->>AP: Authentication Request (Open/SAE Commit)
  AP-->>STA: Authentication Response (Open/SAE Confirm)
  STA->>AP: Association Request (RSN IE, ciphers)
  AP-->>STA: Association Response (AID, status=success)
  Note over STA,AP: PMK established (PSK or EAP MSK or SAE)
  AP-->>STA: EAPOL-Key M1 (ANonce)
  STA->>AP: EAPOL-Key M2 (SNonce, MIC)
  AP-->>STA: EAPOL-Key M3 (GTK, MIC, Install)
  STA->>AP: EAPOL-Key M4 (ACK, MIC)
  Note over STA,AP: PTK + GTK installed; encrypted data follows
  STA->>AP: Encrypted QoS Data (CCMP/GCMP)
  AP-->>STA: Block ACK
```

---

## Deep connections to other protocols

**Ethernet (802.3).** 802.11 was deliberately built to integrate with Ethernet bridges per IEEE 802.1D. An AP sits as an L2 bridge: it strips the 802.11 header, takes the MSDU (which carries an LLC/SNAP header with the EtherType from RFC 1042), and rebuilds an 802.3 frame to forward up. Differences: 4 addresses vs Ethernet's 2; collision *avoidance* not detection (CSMA/CA vs CSMA/CD); per-frame L2 ACKs; same EtherType space (0x0800 IPv4, 0x86DD IPv6, 0x888E EAPOL, 0x0806 ARP).

**ARP.** Works identically in semantics, but ARP requests are broadcast and broadcast on Wi-Fi is sent at the lowest mandatory rate (often 6 Mbit/s on 5/6 GHz, 1–6 Mbit/s on 2.4 GHz) and consumes airtime. Enterprise APs implement *ARP proxy* / "ARP optimization": the AP answers ARP for known clients from its bridging table, killing 90%+ of broadcast amplification.

**IPv4.** DHCP runs unchanged, but DHCP DISCOVER is broadcast and pays the same airtime penalty as ARP. Default IP MTU on Wi-Fi is 1500 (matched to Ethernet), but the 802.11 link can fragment internally. IP fragmentation is best avoided; use Path MTU Discovery (RFC 1191).

**IPv6.** Router Advertisements (RA), Neighbor Solicitation/Advertisement (NS/NA) and SLAAC all use multicast. Without **MLD snooping**, RAs flood every BSSID — RA-storm incidents are a frequent Wi-Fi-induced battery-drain pathology. Modern APs do *multicast-to-unicast* conversion for known IPv6 multicast groups.

**802.1X / EAPOL.** The framework around the 4-way handshake when in Enterprise mode. The supplicant (STA) and authenticator (AP/WLC) talk EAPOL frames (EtherType 0x888E); the authenticator relays inner EAP messages to a RADIUS server. Crucially, EAPOL frames themselves were the vector for KRACK and parts of FragAttacks.

**EAP variants.** **EAP-TLS** (RFC 5216): mutual cert-based; the gold standard. **PEAP** and **EAP-TTLS**: tunnel inner methods (commonly MSCHAPv2 or PAP) inside server-authenticated TLS. **EAP-AKA / EAP-AKA'** (RFC 5448): SIM-based, used by carriers for Wi-Fi calling and Hotspot 2.0 EAP-SIM/AKA' offload.

**RADIUS.** RFC 2865/2866. UDP/1812 (auth) and UDP/1813 (accounting). Carries EAP messages, MAC randomization breaks accounting (every "device" looks like a new MAC) — see Practical Wisdom.

**802.11i.** The 2004 amendment that introduced AES-CCMP, RSN, and the 4-way handshake; folded into 802.11-2007 and onward.

**802.11r/k/v.** Roaming triumvirate; deploy together for voice-grade Wi-Fi.

**Hotspot 2.0 / Passpoint.** ANQP-based pre-association discovery, EAP-SIM/AKA/TLS auto-auth, OSU sign-up. Underpins **OpenRoaming** (WBA). Survives MAC randomization because identity is profile-based.

**WPS.** Wi-Fi Protected Setup PIN method is broken-by-design. **Pixie Dust** (Dominique Bongard, Hack.lu 2014) recovers the PIN offline in seconds on routers that use weak PRNGs for the registrar nonces (Realtek, Ralink, MediaTek, Broadcom variants). 2025 NetRise research reportedly still found >80% of consumer/SMB devices vulnerable. **Action: disable WPS, period** (https://copyprogramming.com/howto/what-is-pixie-dust-attack-on-router).

**Bluetooth (2.4 GHz).** Coexistence is handled by Adaptive Frequency Hopping (AFH) on the BT side and by AP coex algorithms (PTA — Packet Traffic Arbitration) on multi-radio chipsets.

**Zigbee / Thread / Matter.** Also 2.4 GHz; Zigbee channels 11, 15, 20, 25 fall in the gaps between Wi-Fi channels 1, 6, 11. Matter (over Thread or Wi-Fi) inherits these collision realities.

**mDNS / DNS-SD (RFC 6762/6763).** Bonjour/AirPlay/Chromecast all rely on link-local multicast at 224.0.0.251 / FF02::FB. In dense Wi-Fi, this floods. Enterprise APs use *mDNS gateway* features to scope and forward selectively.

**CAPWAP / LWAPP.** RFC 5415. Tunneling protocol from "thin" APs to a Wireless LAN Controller. Two channels: control (UDP/5246, DTLS-protected) and data (UDP/5247, optional DTLS). Cisco Catalyst 9800, Aruba Mobility Conductor and similar still use CAPWAP as the AP-controller transport.

**5G / cellular convergence.** **3GPP ATSSS** (Access Traffic Steering, Switching, Splitting) was introduced in Rel-16 with the **MA-PDU session**: a single PDU session with simultaneous user-plane resources on 3GPP and non-3GPP access. Lower-layer steering uses ATSSS-LL; higher-layer uses MPTCP, with MPQUIC and MPDCCP added in Rel-17/18 (https://medium.com/@jessica.chchuang/5g-wi-fi-convergence-atsss-access-traffic-steering-switching-splitting-307ff72b5da7). **Wi-Fi calling** typically encapsulates voice in IPsec to an ePDG/N3IWF; the user's IMS sees a normal voice call.

**TLS / QUIC over Wi-Fi.** Wi-Fi exposes a normal IP link. TLS 1.3 (RFC 8446) is end-to-end and largely shields the user from L2 weaknesses (KRACK's practical impact was sharply blunted by the HTTPS deployment of 2017). QUIC's 0-RTT and connection migration play surprisingly well over Wi-Fi roams because the connection ID survives an IP/path change.

---

## Real-world deployment

**Linux stack.** `cfg80211` (kernel config API) over `nl80211` (netlink), feeding `mac80211` (softMAC); per-vendor drivers `iwlwifi` (Intel), `ath10k/ath11k/ath12k` (Qualcomm Atheros — `ath12k` is the Wi-Fi 7 driver), `brcmfmac` (Broadcom FullMAC), `mt76` (MediaTek), `rtw89` (Realtek). User-space: `hostapd`/`wpa_supplicant` (the de-facto reference; **v2.11 in July 2024** added preliminary EHT/Wi-Fi 7 support; https://www.phoronix.com/news/WPA_Supplicant-2.11) and Intel's `iwd` as a leaner alternative (https://wiki.archlinux.org/title/Iwd). Linux 6.5+ has Intel-contributed Wi-Fi 7 MLO support; Linux 6.4+ has Wi-Fi 7 mesh.

**Windows.** WLAN AutoConfig Service + WCM (Windows Connection Manager). Windows 11 24H2 (build 26063+) added MLO support for Wi-Fi 7 BE200 and FastConnect 7800 cards.

**Apple.** Closed-source CoreWLAN/`airportd`. macOS Sequoia and iOS 18 added Wi-Fi 7 support on supported silicon (iPhone 16 Pro, M4 Macs).

**OpenWrt.** Continues to be the reference open AP firmware; `mac80211` plus per-driver firmware blobs.

**Enterprise vendors.** Cisco Catalyst 9800 / IOS-XE Wireless; Aruba ArubaOS 10 with Aruba Central; Ruckus (now CommScope) Cloud / SmartZone; Cisco Meraki cloud; **Juniper Mist** with its Marvis AI; Ubiquiti UniFi for SMB; Extreme/Aerohive. SOHO/consumer: ASUS, TP-Link, Netgear, eero (Amazon), Google Nest Wifi.

**Test gear.** Octoscope (now Spirent Octobox), Spirent TestCenter, Keysight IxChariot/IxNetwork, Rohde & Schwarz CMW/CMP; LANforge from Candela; ns-3's mature Wi-Fi module for simulation.

**Wi-Fi 7 chipsets shipping by mid-2026.**
- Qualcomm **FastConnect 7800** (client) and **Networking Pro 1620** (AP): 320 MHz, 4096-QAM, HBS multi-link.
- Intel **BE200** / **BE201** (M.2 client modules; Intel platforms only, plus the **BE202** 160 MHz variant) (https://dongknows.com/qualcomm-ncm865-vs-intel-be200-wi-fi-7-upgrade/).
- Broadcom **BCM4398** (client), **BCM6726/BCM6756** (AP).
- MediaTek **Filogic 880** (AP) and **Filogic 380** (client, MT7925/MT7927).

**Public deployment data.** Wi-Fi Alliance reports **3.9 billion Wi-Fi devices forecast to ship in 2025** for a cumulative 48.8 billion lifetime, with **23.3 billion devices in active use** and a global economic value of $4.9 trillion (https://www.wi-fi.org/beacon/the-beacon/powering-connected-world-wi-fi-momentum-2025). Wi-Fi 7 reached **583 million device shipments in 2025**, with enterprise APs jumping from 26.3 million (2024) to a forecast 66.5 million (2025) and ABI's projection of 117.9 million in 2026 (https://www.networkworld.com/article/4112600/wi-fi-8-in-2026-next-gen-wireless-standard-prioritizes-reliability-over-speed-gains.html). Mobile users spend **77–88% of screen-on time on Wi-Fi** (Wi-Fi Alliance citing 2024 data). One often-cited statistic — "~40% of home internet traffic over Wi-Fi" — appears on industry blogs but lacks a primary source `[needs source]`; Wi-Fi Alliance's own "primary medium for global internet traffic" claim is similarly aggregate.

**Real-world throughput** (mid-2026 numbers): close-range single-client over a 320 MHz 6 GHz channel with a 2×2 client (BE200/NCM865) typically delivers **2.5–4 Gbit/s sustained** at iperf3 (community reports such as Asuswrt-Merlin / SNBForums; https://www.snbforums.com/threads/wifi-7-performance-is-more-than-just-marketing.94057/). Wi-Fi 7 latency with TWT and low utilization can drop **sub-5 ms**; field MLO eMLSR tests by Wireless Broadband Alliance show latency consistency, not throughput aggregation, as the real win.

**Marquee "Wi-Fi at scale" deployments.** Apple Park, Allegiant/SoFi/Hard Rock stadiums (Cisco/Extreme/CommScope deployments, often 2,000+ APs); university dense deployments (UCLA, Wake Forest, etc.); Hannover Messe (CommScope/Ruckus); Singapore Changi.

---

## Failure modes and famous incidents

- **WEP collapse (2001).** Fluhrer–Mantin–Shamir at SAC 2001 — RC4 KSA bias plus the 24-bit IV. Adam Stubblefield's implementation, then AirSnort, killed WEP within months for any motivated attacker.
- **TJX breach (disclosed Jan 17, 2007).** Attackers war-drove a poorly-secured WEP-protected Wi-Fi network at a Marshalls store in Miami starting July 2005, pivoted into the corporate network, and exfiltrated approximately **94 million** customer credit/debit records over ~18 months (https://www.huntress.com/threat-library/data-breach/tjmaxx-data-breach; https://www.proquest.com/docview/212316959). TJX settled with 41 state AGs for $9.75M and was forced to upgrade all WEP to WPA (https://www.atg.wa.gov/news/news-releases/attorney-general-mckenna-calls-tjx-s-data-breach-costly-lesson). The cleanest "weak crypto kills your business" case study in the canon.
- **Pixie Dust (Hack.lu, Oct 2014).** Dominique Bongard's offline brute-force of WPS PINs via weak chipset PRNGs. Implemented in `pixiewps` and `reaver`. Many SOHO routers in 2026 are still vulnerable.
- **KRACK (Oct 16, 2017).** CVEs 13077 (PTK reinstallation), 13078/13079 (GTK/IGTK reinstall), 13080–13088 (group, FT, WNM-Sleep, TPK variants). Forced patches across Microsoft (Oct 2017), Apple, Linux/wpa_supplicant, Cisco, Aruba within weeks. HTTPS prevalence by 2017 limited end-user exposure.
- **Dragonblood (Apr 10, 2019).** CVE-2019-9494 (timing side-channel), 9495 (cache side-channel against EAP-pwd), 9496 (denial-of-service), 9497 (EAP-pwd bypass), 9498/9499 (further EAP-pwd issues). Mitigated by hash-to-curve replacing hunt-and-peck.
- **FragAttacks (May 2021).** 12 CVEs. Three are *standard* flaws (CVE-2020-24586/24587/24588) present since 1997; nine are implementation flaws. Cisco/Aruba/Ruckus/Microsoft patched throughout 2021.
- **Framing Frames (Mar 2023).** CVE-2022-47522 — abuse of the unprotected power-save bit to redirect queued frames; bypasses client isolation; tied to the **MacStealer** PoC.
- **SSID Confusion (May 2024) — CVE-2023-52424.** The 802.11 standard does not require the SSID to enter PMK or session-key derivation in many config paths, so a beacon/spoof attack can downgrade or sidestep client expectations. Affects WEP, WPA3, 802.11X/EAP, AMPE; impacts every OS. Wi-Fi 7's mandatory beacon protection is a step toward mitigation but, as the original paper notes, current implementations still allow a brief vulnerability window before the beacon integrity key is verified (https://www.top10vpn.com/research/wifi-vulnerability-ssid/).
- **Vendor firmware CVEs (2023–2025).** Realtek, Broadcom and TP-Link have shipped notable advisories in this period; specific CVE inventories `[needs source]` for a one-paragraph summary, but the FragAttacks pattern of "vulnerable kernel drivers in millions of cheap devices" repeats.
- **Mt. Gox / Sony PSN 2011 / Operation Aurora.** I have **no primary-source evidence** that Wi-Fi was the entry vector in any of these. Mt. Gox (2014) was a custodial-key/database compromise; PSN April 2011 was a SQL/services compromise; Aurora (2010) was a spear-phished IE 0-day. `[needs source]` to claim any Wi-Fi role.
- **Captive-portal failures as a class.** RFC 8908/8910 (CAPPORT API and DHCP/RA option) standardize the discovery; OS implementations (iOS, Android, Windows) probe known URLs to detect interception. The classic failure is HSTS-pinned or DoH-resolving clients that refuse to accept the spoofed redirect. The IETF CAPPORT WG continues to address this.

---

## Fun facts and anecdotes

- **"Wi-Fi" is not an acronym.** Phil Belanger, founding Wi-Fi Alliance member, wrote in 2005: "Wi-Fi doesn't stand for anything. It is not an acronym. There is no meaning… Interbrand created 'Prozac', 'Compaq'… they came up with the name and logo." The "Wireless Fidelity" tagline was a nervous compromise added briefly and then dropped (https://boingboing.net/2005/11/08/wifi-isnt-short-for.html).
- **The 1985 FCC ruling that started everything.** Michael Marcus's Docket 81-413 led to the May 9, 1985 FCC decision to allow unlicensed spread-spectrum in the 902/2400/5800 MHz ISM bands. Marcus received the IEEE ComSoc 2013 Public Service award for it.
- **CSIRO patent fight.** Australia's CSIRO held US Patent 5,487,069 (granted Jan 23, 1996), based on John O'Sullivan's group's radio-astronomy-derived OFDM/multipath work. After Buffalo (2005), CSIRO brought 14 majors to a 2009 settlement reportedly **~US$205 million** (HP, Dell, Microsoft, Intel, Netgear, Nintendo, Belkin, D-Link, 3Com, Toshiba, Asus, Buffalo, Accton, SMC) (https://blog.patentology.com.au/2012/04/story-behind-csiros-wi-fi-patent.html). A 2012 settlement with AT&T, Verizon, T-Mobile and others reportedly added **~US$220 million**, taking total revenue past **US$430 million** before patents expired Nov 30, 2013 (https://theconversation.com/patently-australian-csiro-settles-suits-over-wi-fi-6184; https://www.itnews.com.au/news/end-of-an-era-csiro-wifi-patent-nears-expiry-351848). Some industry estimates put lifetime royalties near US$1 billion. Worth noting: the CSIRO patent was *not* invented inside 802.11; the agency commercialized through Radiata, which Cisco bought in 2001 (https://hackaday.com/2024/08/20/australia-didnt-invent-wifi-despite-what-youve-heard/).
- **Channels 1, 6, 11 — the math.** 802.11b/g/n in 2.4 GHz uses a ~22 MHz emission mask on 5 MHz-spaced channel centers from 2412 MHz. To get fully non-overlapping 22 MHz emissions you need ≥25 MHz separation, i.e., five channel numbers apart. 1, 6 and 11 (2412, 2437, 2462 MHz) are the three standard centers in the US; 1, 5, 9, 13 is sometimes claimed for Europe but doesn't fully meet the 22 MHz spec — it relies on OFDM's tighter ~16.25 MHz roll-off (https://www.networkworld.com/article/891090/network-security-why-do-only-three-channels-not-overlap.html).
- **The yin-yang Wi-Fi logo** was Interbrand's design alongside the name (https://en.wikipedia.org/wiki/Wi-Fi).
- **Vic Hayes honors.** IEEE Standards Association Medallion (1998); Computer Pioneers induction at the American Computer & Robotics Museum (2012); Senior Research Fellow at TU Delft.
- **No 802.11 RFCs.** 802.11 is an *IEEE* standard; the IETF only ever produced ancillary RFCs (e.g., RFC 1042 LLC/SNAP, RFC 5415 CAPWAP, RFC 7170 EAP-TEAP).
- **Wi-Fi 6E "naked launch."** When the FCC opened 6 GHz on April 23, 2020, no client devices yet existed; the first chipsets (Broadcom BCM4389 etc.) shipped late 2020 / early 2021.
- **Beacons every 102.4 ms.** Because TU = 1024 µs and beacon interval default = 100 TU.
- **Microwave ovens at 2.4 GHz** is a coincidence of the water-vapor absorption peak (~22 GHz, not 2.45) and the FCC-allocated ISM band; magnetrons leak around 2.45 GHz, making microwave ovens a textbook source of channel-1 interference.
- **Skipped/reused 802.11 letter suffixes.** The TG progresses through letters; some are skipped or roll up. 802.11m is reserved for maintenance revisions (802.11ma…me through 2024). 802.11l, n, o etc. were chosen carefully to avoid confusion with numerals (802.11**O** would look like 802.110).

---

## Practical wisdom

- **Channel planning.** 2.4 GHz: only 1, 6, 11 in 20 MHz; never use 40 MHz here. 5 GHz: 80 MHz is a common sweet spot; 160 MHz only in low-density. 6 GHz: 80–160 MHz indoors, 320 MHz only where AFC and contiguous spectrum allow (US standard-power, post-Feb 2024).
- **−67 dBm is the voice target.** RSSI better than −67 dBm with SNR ≥ 25 dB is the canonical voice-grade benchmark (Cisco WiFi Voice design guides). Target ≤ 30% airtime utilization for any service-class deployment.
- **"More dB is better" is wrong.** Cranking AP TX power up creates one-way coverage and sticky-client roaming; the AP hears the client at the link budget defined by the *client's* TX power (often 14–20 dBm). Match AP power to client power.
- **Disable lower data rates (1/2/5.5/6 Mbit/s).** They kill airtime via beacons and broadcasts. In 2026, set 12–24 Mbit/s as basic in 5/6 GHz. Set 24 Mbit/s minimum in 2.4 GHz, or just disable 2.4 GHz for non-IoT SSIDs.
- **Disable 802.11b in 2026.** It's the ultimate airtime tax. There is no business reason to support b in 2026.
- **DTIM intervals.** DTIM=1 (every beacon) maximizes responsiveness for AirPlay / Chromecast multicast. DTIM=3 saves battery on classic STAs. With TWT, DTIM matters less for IoT.
- **RTS/CTS thresholds.** Default 2347 (off). Lower (e.g., 512 bytes) only when hidden-node is empirically demonstrated.
- **Roaming aggressiveness.** Sticky clients are almost always client-OS bugs, not AP failings; deploying 802.11k/v/r with PMF helps, but the only sure fix is getting clients to roam earlier (most modern OSes hand off below ~−72 dBm).
- **WPA3 transition mode pitfalls.** "WPA2/WPA3" mixed mode broadcasts both AKMs in the RSN IE; some clients parse this incorrectly. Older Android (<10) and IoT often refuse to associate. Test thoroughly; consider separate SSIDs.
- **6 GHz client compatibility realities.** Per FCC rules and Wi-Fi Alliance: 6 GHz is **WPA3-only with PMF mandatory**, and only OFDMA-capable (802.11ax+) clients. Don't expect a Wi-Fi 5 device to ever see your 6 GHz radio.
- **What to look for in pcap.** Retry-rate >10% on management frames = sick BSS. Lots of BlockAckReq with no BlockAck = receiver problem. Beacon loss > 1% = roaming will be ugly. Trigger frames with no responses = OFDMA misalignment.
- **Common debugging moves.** Check airtime utilization (vs channel utilization, which includes neighbors); watch retry %; bin the MCS distribution; pull 802.11k neighbor reports from clients.
- **Tools.** Wireshark (with a Mac in monitor mode or AirPcap on Windows; modern Linux mac80211 cards work natively); Kismet; Wi-Fi Explorer (macOS); Ekahau Sidekick 2 + Ekahau AI Pro for surveys; NetSpot; AirMagnet (now NETSCOUT).
- **Common misconfigs.** PMF mismatches between Cisco/Apple/Android (set "Required" vs "Optional" carefully); 802.11r over-the-DS not implemented or buggy on cross-vendor controllers; 5 GHz **DFS channels** mid-event radar hits causing 60-second blackouts (verify radar logs); IPv6 RA storms from poorly configured upstreams.
- **TWT tuning for IoT.** Use individual TWT for sensors with predictable cadence; broadcast TWT for sensor swarms (smart-bulb networks). Watch clock drift — long sleeps mean less-precise wake alignment (https://arxiv.org/pdf/2008.02697).
- **iperf3 multi-stream realities.** Single-stream iperf3 over Wi-Fi rarely saturates the link; use 4–8 parallel streams (`-P 8`) with a 10–30 s window to see real PHY-layer throughput. Don't trust browser speed tests.

---

## Learning resources (current as of 2026)

**Standards.**
- IEEE Std 802.11-2024 (current consolidated revision; published 28 Apr 2025). https://standards.ieee.org/ieee/802.11/10548/ — *advanced; the actual law.*
- IEEE Std 802.11be-2024 (Wi-Fi 7, EHT). https://standards.ieee.org/ieee/802.11be/7516/ — *advanced; published 22 Jul 2025.*
- IEEE 802.11bn task group page. https://www.ieee802.org/11/Reports/tgbn_update.htm — *current draft status; updated continuously.*
- IEEE 802.11 working group home. https://www.ieee802.org/11/ — *the calendar, agendas, and document tree.*
- IEEE GET program (free PDFs of approved 802 standards 6 months after publication). https://ieeexplore.ieee.org/browse/standards/get-program/page/series?id=68

**Wi-Fi Alliance.**
- Discover Wi-Fi technical pages. https://www.wi-fi.org/discover-wi-fi — *intro–intermediate.*
- WPA3 Specification v3.x. https://www.wi-fi.org/discover-wi-fi/security
- Wi-Fi 7 product certification. https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7

**FCC.**
- 6 GHz Report and Order, ET Docket 18-295 (Apr 2020). https://docs.fcc.gov/public/attachments/FCC-20-51A1.pdf
- AFC approvals (Feb 23, 2024 and Jun 27, 2025). https://docs.fcc.gov/public/attachments/DA-24-166A1.pdf and https://docs.fcc.gov/public/attachments/DA-25-559A1_Rcd.pdf
- 5.9 GHz C-V2X Second R&O (FCC 24-106; Federal Register, Dec 13 2024). https://www.federalregister.gov/documents/2024/12/13/2024-28980/use-of-the-5850-5925-ghz-band

**Books.**
- Matthew Gast, *802.11 Wireless Networks: The Definitive Guide*, 2nd ed., O'Reilly 2005. **Stale on PHY and security but still useful for the MAC frame format and the bridging story.** Treat with caution.
- Matthew Gast, *802.11ac: A Survival Guide*, O'Reilly 2013. Good for ac-era foundations; superseded by Wi-Fi 6/7 books.
- Coleman & Westcott, *CWNA Certified Wireless Network Administrator Study Guide*, latest edition for **CWNA-109** (Sybex; CWNP-published official study guide is the in-print reference; https://www.cwnp.com/cwna109sg/) — *intermediate; current.*
- *CWAP-404* (Analysis Professional) and *CWSP* (Security) study guides — *advanced.*
- Henry/Hart/Gupta/Smith, *Wi-Fi 7: A Practical Guide* (the IEEE-blessed deep dive on 802.11be by Cisco and Broadcom engineers). Referenced from https://www.ieee802.org/11/.

**Academic papers (DOI-anchored).**
- Vanhoef & Piessens, "Key Reinstallation Attacks: Forcing Nonce Reuse in WPA2," ACM CCS 2017 — DOI 10.1145/3133956.3134027. https://papers.mathyvanhoef.com/ccs2017.pdf
- Vanhoef & Ronen, "Dragonblood: Analyzing the Dragonfly Handshake of WPA3 and EAP-pwd," IEEE S&P 2020 — DOI 10.1109/SP40000.2020.00031. https://papers.mathyvanhoef.com/dragonblood.pdf
- Vanhoef, "Fragment and Forge: Breaking Wi-Fi Through Frame Aggregation and Fragmentation," USENIX Security 2021. https://www.fragattacks.com/
- Schepers, Ranganathan, Vanhoef, "Framing Frames: Bypassing Wi-Fi Encryption by Manipulating Transmit Queues," USENIX Security 2023. https://www.usenix.org/conference/usenixsecurity23/presentation/schepers
- Gollier & Vanhoef, "SSID Confusion: Making Wi-Fi Clients Connect to the Wrong Network" (CVE-2023-52424), WiSec 2024. https://www.top10vpn.com/research/wifi-vulnerability-ssid/
- Bianchi, "Performance analysis of the IEEE 802.11 distributed coordination function," IEEE J. Sel. Areas Commun. 18(3), 2000 — DOI 10.1109/49.840210. The foundational CSMA/CA throughput model.
- Fluhrer, Mantin, Shamir, "Weaknesses in the Key Scheduling Algorithm of RC4," SAC 2001 — DOI 10.1007/3-540-45537-X_1.

**Engineering blogs (current).**
- Cisco Meraki Documentation — https://documentation.meraki.com/Wireless (regularly updated; the Wi-Fi 7 Technical Guide is excellent).
- Cisco Wireless white papers — https://www.cisco.com/c/en/us/products/collateral/wireless/.
- Aruba Airheads / HPE Networking — https://community.arubanetworks.com.
- Juniper Mist — https://www.juniper.net/us/en/products/cloud-services/mist-ai.html.
- Devin Akin's *Divergent Dynamics* (CWNE #1).
- Keith Parsons' Wireless LAN Professionals — https://wlanpros.com.
- Mojo / Arista *Cognitive Wi-Fi* docs (formerly Mojo Networks).

**Podcasts.**
- *Clear To Send* (Rowell Dionicio, François Vergès) — https://www.cleartosend.net.
- *WLAN Pros Podcast* (Keith Parsons).
- *Heavy Wireless* on Packet Pushers — https://packetpushers.net.

**Video / YouTube.**
- Cisco Live "BRKEWN" sessions — https://www.ciscolive.com.
- IEEE 802 plenary talks (selectively recorded).
- WLAN Pros and Devin Akin instructional series.

**University courses.**
- Stanford CS244 (Advanced Topics in Networking) — periodically covers Wi-Fi PHY/MAC.
- MIT 6.829 / 6.5840 — networking grad classes.
- Berkeley CS268 — graduate networking.

**Hands-on tools.**
- Wireshark (https://www.wireshark.org); Kismet (https://www.kismetwireless.net); aircrack-ng suite (https://www.aircrack-ng.org); `eaphammer`; Scapy `scapy.layers.dot11`; Cisco DevNet sandboxes; ns-3 Wi-Fi module.
- Wireshark sample captures: https://wiki.wireshark.org/SampleCaptures.

**Vendor 2024–2025 Wi-Fi 7 deep dives.**
- Cisco Meraki — https://documentation.meraki.com/Wireless/Design_and_Configure/Architecture_and_Best_Practices/Wi-Fi_7_(802.11be)_Technical_Guide
- Juniper Mist Wi-Fi 7 white papers — https://www.juniper.net.
- Aruba/HPE Wi-Fi 7 — https://www.hpe.com/us/en/what-is/wi-fi-8.html.

---

## Where things are heading (2025–2026 frontier)

- **Wi-Fi 7 mainstream rollout (2024–2026).** 583 million Wi-Fi 7 devices shipped in 2025; ABI projects 117.9 million Wi-Fi 7 enterprise APs in 2026. Wi-Fi Alliance launched a **Wi-Fi 7 at 20 MHz** track in early 2026 to bring Wi-Fi 7 features (4096-QAM, MLO, Multi-RU) to IoT devices that lack wide-channel radios (https://www.rcrwireless.com/20260107/network-infrastructure/wi-fi-7-20-mhz-devices).
- **Wi-Fi 8 (802.11bn).** Draft 1.3 approved Jan 2026 plenary; Draft 2.0 LB targeted May 2026 (Antwerp); ratification still on schedule for **September 2028**. WFA certification test plan finalization targeted June 2027, certification launch Dec 2027. Headline non-features: same bands as Wi-Fi 7, same 320 MHz max, same ~46 Gb/s PHY peak. Headline features: **Multi-AP Coordination** (Co-BF, Co-SR, Co-TDMA), **Seamless Roaming Domain (SMD)** with key-context transfer between AP MLDs, **Enhanced Long Range (ELR)** PPDU with 3 dB power boosting and ELR-MARK preamble, **Distributed Resource Units (DRU)**, **Dynamic Subband Operation (DSO)** and **Non-Primary Channel Access (NPCA)**, four new MCS values for finer link adaptation, and explicit **In-Device Coexistence** with BT/Zigbee/UWB (https://en.wikipedia.org/wiki/IEEE_802.11bn; https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8).
- **AFC standard-power (US, live since 2024).** Eight approved AFC operators by mid-2025; first certified Wi-Fi 7 AP (Ruckus R770) in April 2024. Standard-power lets a 6 GHz AP transmit at up to **36 dBm EIRP** — about 63× LPI — both indoors and outdoors, with daily AFC re-query. Outdoor stadium and WISP use cases now reachable without spectrum licensing.
- **EU 6 GHz upper band (the big regulatory delta).** RSPG's **Nov 12, 2025** opinion recommended **5G/IMT priority for 6585–7125 MHz**, holding 6425–6585 MHz pending WRC-27 — effectively closing the upper band to Wi-Fi in the EU for the medium term (https://www.lightreading.com/wifi/mobile-operators-beat-wi-fi-for-upper-6ghz-in-europe; https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-strongly-disagrees-rspg-recommendation-blocking-wi-fi-access; https://www.cullen-international.com/news/2026/02/Upper-6-GHz-band--EU-member-states-wait-for-EU-level-decisions.html). The EU therefore remains stuck with the 5945–6425 MHz allocation from Decision 2021/1067 — five 160 MHz channels, only one 320 MHz channel.
- **AI/ML in Wi-Fi.** Mist/Juniper Marvis (LLM-based assistant in 2024–2025), Cisco AI Network Analytics, Aruba Networks Central AI ops; CableLabs Wi-Fi performance management. The IEEE 802.11 WG approved an **AI Offload Study Group** at the March 2026 plenary to standardize using Wi-Fi APs as edge AI inference offload nodes (https://www.ieee802.org/11/).
- **Wi-Fi sensing — 802.11bf-2025.** Approved 2024, **published Sept 26, 2025**. Standardizes CSI-based sensing for presence/motion/breathing detection. Operates 1–7.125 GHz and >45 GHz (https://standards.ieee.org/ieee/802.11bf/11574/; https://github.com/yuanhao-cui/Awesome-Integrated-Sensing-and-Communications/blob/main/paper/standardization.md).
- **802.11az — Next Generation Positioning.** Released 2023 as an amendment, then folded into 802.11-2024. Achieves sub-meter positioning (≤0.1 m / ~4 inches in good conditions), with **Secure HE-LTF** AES-256-based pseudo-random sequences preventing distance-spoofing/MITM. **802.11bk-2025** (published Sept 2025) extended FTM to 320 MHz channels (https://standards.ieee.org/beyond-standards/newly-released-ieee-802-11az-standard-improving-wi-fi-location-accuracy-is-set-to-unleash-a-new-wave-of-innovation/).
- **Passpoint Release 3 / OpenRoaming.** WBA's OpenRoaming federation continues to expand; 81% of surveyed operators plan to deploy in 2025–2026.
- **Wi-Fi/5G convergence.** 3GPP Rel-16 ATSSS shipping; Rel-18 added MPQUIC/MPDCCP. MediaTek demonstrated PoC at MWC 2023; production deployments started 2024.
- **DARPA WAND / disaster-resilient mesh.** Continues; specific 2024–2026 milestones `[needs source]`.
- **IETF WGs touching Wi-Fi.** **CAPPORT** (RFC 8908/8910 for captive-portal API; ongoing for HTTPS-only worlds); **MADINAS** (MAC randomization & device identification — ongoing); **SCONE** (Secure Communication of Network properties – session-aware throughput hints).
- **MAC randomization status (2026).** iOS 14+ (2020), Android 10+ (2019, with per-SSID randomization), Windows 10/11 (random hardware addresses, configurable per-network) — all **on by default for new SSIDs** (https://www.guidingtech.com/what-is-mac-randomization-and-how-to-use-it-on-your-devices/; https://learn.microsoft.com/en-us/answers/questions/1631566/mac-address-randomization-wi-fi-profile-issue). Operational pain: RADIUS accounting sees a "new device" each visit, captive-portal session tables churn, MAC-allow-listing ACLs break. **802.11bh-2024** (published June 2025) is the IEEE's response: it adds Device ID and IRM (Identifiable Random MAC) mechanisms so that with explicit user/network agreement, an AP can recognize a returning device without seeing its real MAC.
- **Per-network vs per-SSID randomization.** iOS 14+ does per-SSID; Android 12+ defaults to "non-persistent" per-SSID with periodic re-randomization; Windows 11 supports "Daily" rotation (https://www.guidingtech.com/what-is-mac-randomization-and-how-to-use-it-on-your-devices/). For enterprise, Intune profiles can opt out — at the cost of privacy posture.

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook.**
> "In 1985, an FCC engineer named Mike Marcus convinced his agency to let anyone — anyone — use the same slice of radio spectrum that microwave ovens lived in, as long as they didn't transmit too loudly. Forty years later, nearly four billion devices a year ride that ruling. We call it Wi-Fi. It moves more of humanity's data than any other technology on Earth. And it's still being rewritten, right now, in conference rooms in Vancouver and Antwerp, by 802.11 working-group volunteers who are about to publish the next version. This is how it works, where it came from, and where it breaks."

**Striking statistics (with sources).**
- **3.9 billion** Wi-Fi devices forecast to ship in 2025; **48.8 billion** lifetime cumulative; **23.3 billion** in active use; **$4.9 trillion** annual global economic value (Wi-Fi Alliance / IDC 2025 — https://www.wi-fi.org/beacon/the-beacon/powering-connected-world-wi-fi-momentum-2025).
- **583 million** Wi-Fi 7 devices shipped in 2025 alone (IDC via Wi-Fi Alliance).
- **94 million** payment cards stolen in the TJX breach traced to a single Marshalls store with WEP enabled.
- **77–88%** of smartphone screen-on time spent connected to Wi-Fi (Wi-Fi Alliance 2025).
- **63×**: the EIRP increase Standard-Power 6 GHz delivers vs LPI 6 GHz under AFC (Broadcom/Wi-Fi NOW, Feb 2024).

**"Pause and think" moment.** The 4-way handshake was *formally proven correct* in 2005 — and yet KRACK existed. The proofs assumed handshake messages were never replayed; they didn't model *key installation*, the operation that actually puts a key into the radio. For 13 years, every WPA2 implementation reset the encryption nonce when it reinstalled the same key, which was provably safe under the model and catastrophically insecure in reality. The lesson: a mathematical proof is only as useful as the system it abstracts over.

**Failure-story arc — "The Belgian Cryptographer Who Broke Wi-Fi Twice."** In October 2017, Mathy Vanhoef walked onto a CCS stage and announced that every WPA2 implementation on Earth — every Windows laptop, every Android phone, every macOS, every iOS, every router — could be tricked into reusing an encryption nonce, decrypting the user's HTTP traffic and forging packets onto the network. Vendors had been quietly notified months earlier under embargo; Microsoft had already shipped a patch in the October 2017 Patch Tuesday before the public talk. Eighteen months later, in April 2019, Vanhoef did it again — to *WPA3*, the protocol that was supposed to fix WPA2. The Dragonfly handshake's new password-encoding step took variable time, and that timing leaked the password to anyone within radio range. Two years after that — in May 2021 — Vanhoef released **FragAttacks**, twelve more bugs, three of them *in the IEEE standard itself going back to 1997*. And in May 2024, again with KU Leuven, he disclosed **SSID Confusion** (CVE-2023-52424): the standard never required the SSID itself to be authenticated. One person, in eight years, has done more to harden Wi-Fi than the IEEE working group has in the same period — by breaking it on stage, in the open, every two years.

---

## Caveats

- The IEEE 802.11 Working Group is fast-moving. Dates for in-progress task groups (especially TGbn / Wi-Fi 8 and TGbq / Integrated mmWave) can shift; check https://www.ieee802.org/11/Reports/802.11_Timelines.htm before publication.
- A few claims in the brief are not verifiable to a primary source within this report's research budget and are flagged `[needs source]` or omitted: specific TP-Link/Realtek 2023–2025 firmware CVE inventory; whether Mt. Gox, PSN 2011 or Operation Aurora had a Wi-Fi component (no evidence found that they did); the precise "% of internet traffic over Wi-Fi" figure (Wi-Fi Alliance phrasing is qualitative; the often-cited "~40% of home traffic" figure is from secondary aggregators).
- CSIRO settlement amounts vary in news coverage between AU$ and US$, and between rounds (2009 ~US$205M, 2012 ~US$220M, plus a separate Cisco/Linksys judgment of ~US$16M in 2014). Lifetime royalty totals are widely cited at "over US$430 million," with some commentators projecting higher; figures here are taken from contemporaneous CSIRO and Australian government statements.
- EU 6 GHz upper-band situation is fluid: the RSPG **opinion** (Nov 12, 2025) is advisory; the European Commission has not yet issued an Implementing Decision codifying 5G priority as of May 2026. The Wi-Fi industry continues to lobby; outcomes could shift toward sharing.
- "Wi-Fi 9" as a name is used colloquially by IEEE participants for the post-802.11bn generation under the WNG study group, but no IEEE PAR or Wi-Fi Alliance branding is in place yet — treat any Wi-Fi 9 specifics as unconfirmed.
- Wi-Fi 7 retail performance numbers vary widely by client, AP firmware, channel width and regulatory domain. Treat throughput numbers in this report as orders-of-magnitude indicators, not benchmarks.
- KRACK's *practical* impact in 2017 was much less than its publicity: the bulk of consumer traffic was HTTPS, and major-OS patches landed within weeks. The lesson is more cultural than operational.