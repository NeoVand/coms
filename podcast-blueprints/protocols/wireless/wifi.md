---
id: wifi
type: protocol
name: Wi-Fi
abbreviation: 802.11
etymology: "[W]i-[F]i — chosen by Interbrand from ten candidate names; not an acronym"
category: wireless
year: 1997
rfc: null
standards_body: ieee
podcast_target_minutes: 25
related_book_chapters:
  - foundations/layer-model
  - foundations/addressing
  - foundations/packets
  - foundations/ports-sockets
  - foundations/reliability-speed
  - foundations/encryption-basics
  - story-of-the-internet/mobile-and-bufferbloat
  - layer-2-3/wifi
  - layer-2-3/arp-and-ndp
  - transport/mptcp
  - transport/quic
  - wireless/the-shared-medium
  - wireless/wifi
  - web-api/http3
  - famous-outages/att-mobility-2024
  - frontier/wifi-7-and-8
related_protocols: [ethernet, arp, ip, ipv6, bluetooth, cellular, nfc, zigbee, uwb, tcp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/802.11_MAC_Frame.svg/500px-802.11_MAC_Frame.svg.png
    caption: The 802.11 MAC frame — Frame Control, Duration, up to four MAC addresses, Sequence Control, an optional QoS Control field, the body, and a 4-byte FCS. Up to four addresses, because a frame may have to name a Receiver, a Transmitter, an original Source, and a final Destination as it crosses an access point into a wired network.
    credit: Image — Wikimedia Commons / CC BY-SA 4.0
visual_cues:
  - "An exploded 802.11 data frame diagram with each field annotated by byte count and example hex value: Frame Control 0x0842 (Type=Data, Subtype=QoS Data, ToDS, Protected), Duration 48 µs, Address 1 (RA) 00:1A:2B:3C:4D:5E, Address 2 (TA) AA:BB:CC:DD:EE:FF, Address 3 (DA) 11:22:33:44:55:66, Sequence Control, QoS Control TID=0, encrypted CCMP body with PN and MIC, FCS."
  - "A four-panel sequence: beacon every 102.4 ms, SAE Commit/Confirm, Association Request/Response with AID=1, four EAPOL-Key messages M1–M4 deriving the PTK, then encrypted data — with a callout under M3 reading 'KRACK lived here for 13 years.'"
  - "A side-by-side: left, Ethernet's CSMA/CD listening for collisions on a coax; right, Wi-Fi's CSMA/CA with DIFS=34 µs, random backoff slots, SIFS=16 µs, ACK — annotation: 'a radio cannot listen and transmit at once.'"
  - "A 6 GHz channel chart for the US: 1,200 MHz of spectrum, seven 160 MHz channels, three 320 MHz channels, with U-NII-5 through U-NII-8 labeled and an AFC tower icon over the standard-power region."
  - "A Multi-Link Operation diagram: a phone with one radio and an AP with three radios; the phone's eMLSR ear listens to 2.4, 5, and 6 GHz, switches to whichever is free per packet, with a tail-latency histogram below showing the p99 spike collapsing on the right."
  - "A timeline ribbon from 1997 to 2026 marking 802.11 (2 Mbps), 802.11b (11), g (54), n / Wi-Fi 4 (600), ac / Wi-Fi 5 (~1.3 Gbps), ax / Wi-Fi 6 (9.6), ax / Wi-Fi 6E (6 GHz), be / Wi-Fi 7 (46), bn / Wi-Fi 8 (reliability, not speed), with Vanhoef paper icons annotated at 2017, 2019, 2021, 2023, and 2024."
---

# Wi-Fi — IEEE 802.11

## In one breath

Wi-Fi is the 802.11 family of standards that puts an Ethernet-equivalent link on radio waves at 2.4, 5, and now 6 GHz. It uses CSMA/CA instead of Ethernet's CSMA/CD because a radio cannot listen and transmit at once, it carries up to four MAC addresses per frame instead of two because an access point sits in the middle, and it mandates encryption with WPA2 or WPA3 because everyone within range can hear every transmission. The Wi-Fi Alliance forecasts 3.9 billion devices shipping in 2025, 23.3 billion in active use, 4.9 trillion dollars of annual global economic value — and the IEEE working group is still rewriting the spec right now in conference rooms in Vancouver and Antwerp.

## The pitch (cold-open)

In May 1985, an FCC engineer named Mike Marcus convinced his agency to let anyone — anyone — transmit in the same slice of radio spectrum that microwave ovens lived in, as long as they didn't transmit too loudly. Forty years later, nearly four billion devices a year ride that ruling and we call it Wi-Fi. This episode is about how an 802.11 frame actually moves on the wire, where it runs at scale in 2026, what breaks in the field, and why one Belgian cryptographer named Mathy Vanhoef has broken Wi-Fi on stage every two years for nearly a decade — KRACK in 2017, Dragonblood in 2019, FragAttacks in 2021, Framing Frames in 2023, SSID Confusion in 2024 — to the point that the field plans security audits around his summer talks.

## How it actually works

The simulator on the encyclopedia page walks you through one full Wi-Fi lifecycle: a laptop joins an access point named "MyNetwork", authenticates with WPA3, derives encryption keys, and sends an encrypted frame that the AP bridges to a wired LAN server. There are seven steps and they are the spine of every Wi-Fi association on Earth in 2026.

First, the access point broadcasts a beacon frame roughly every 102.4 milliseconds — a default that is actually 100 TUs of 1024 microseconds each. The beacon advertises the SSID, the supported data rates, the security suite, and the channel. Any station within range can passively scan for these beacons to discover networks; alternatively the station can actively probe by broadcasting a Probe Request and waiting for Probe Responses. Active probing leaks the SSIDs your phone has previously joined, which is why MAC randomization and 802.11aq exist.

Second, the laptop sends an Authentication frame using WPA3's Simultaneous Authentication of Equals, SAE. This is a Commit/Confirm two-phase password-authenticated key exchange — both sides prove they know the passphrase without revealing it, defeating the offline dictionary attack that haunted WPA2-Personal. Third, the laptop sends an Association Request advertising its capabilities; fourth, the AP returns an Association Response carrying status Success and an Association ID, AID=1, which is what the AP will use later to flag buffered frames in the beacon's Traffic Indication Map when the laptop sleeps.

Fifth comes the four-way EAPOL handshake. The AP sends message M1 with a random ANonce. The laptop generates its own SNonce, combines ANonce, SNonce, both MAC addresses, and the Pairwise Master Key from SAE through a PRF to derive the Pairwise Transient Key. The PTK splits into a 16-byte Key Confirmation Key, a 16-byte Key Encryption Key, and a 16-byte Temporal Key. The laptop returns M2 with its SNonce and a MIC computed under the KCK. The AP returns M3 carrying the Group Temporal Key encrypted under the KEK plus an Install bit. The laptop returns M4 as an acknowledgement, and from that moment both sides hold the same per-session keys without ever having transmitted them.

Sixth, the laptop sends an encrypted data frame. The Frame Control's Protected bit is set, the body is encrypted with AES-CCMP — or AES-GCMP under WPA3 — and the frame carries three MAC addresses: Address 1 the receiver (the AP), Address 2 the transmitter (the laptop), Address 3 the destination (the LAN server beyond the AP). Seventh, the AP decrypts, strips the 802.11 header, and re-encapsulates the IP packet inside a standard Ethernet frame whose source MAC is the AP and whose destination MAC is the LAN server. The server has no idea the traffic originated wirelessly. That bridge is what 802.11 was built to do — make wireless invisible to everything above Layer 2.

Underneath all of that sits CSMA/CA. Before a station transmits anything, it does Clear Channel Assessment — energy detection plus preamble detection — and if the channel has been idle for DIFS, 34 microseconds in OFDM, it picks a random backoff slot in the contention window and decrements one slot per idle slot time. Receivers send ACKs after SIFS, 16 microseconds. The Duration/ID field sets a Network Allocation Vector on every neighbor that hears the frame, virtually reserving the medium. RTS/CTS optionally clears the floor for a long transmission to mitigate the hidden-node problem. Half-duplex shared medium plus mandatory per-frame ACKs is why real-world Wi-Fi throughput tops out around 60 percent of the headline number.

### Header at a glance

Read the 802.11 MAC frame left to right:

- **Frame Control, 2 bytes.** Subfields: Protocol Version (2 bits), Type (2), Subtype (4), ToDS (1), FromDS (1), MoreFrag (1), Retry (1), PwrMgt (1), MoreData (1), Protected (1), and either +HTC or Order (1). The Type/Subtype combination tells you whether you're looking at a beacon, a probe, an authentication, an EAPOL-Key, an ACK, or a data frame.
- **Duration/ID, 2 bytes.** Sets the NAV on neighbors so they back off during your transmission opportunity.
- **Address 1 — Receiver Address, 6 bytes.** The immediate next-hop on the air.
- **Address 2 — Transmitter Address, 6 bytes.** The radio that is putting this frame on the air right now.
- **Address 3, 6 bytes.** The original Source or final Destination, depending on ToDS/FromDS.
- **Sequence Control, 2 bytes.** A 4-bit Fragment Number plus a 12-bit Sequence Number for reassembly and duplicate detection.
- **Address 4, 6 bytes (optional).** Present only when both ToDS and FromDS are set — wireless distribution system bridges and mesh.
- **QoS Control, 2 bytes (optional).** Present in QoS data frames since 802.11e.
- **HT Control, 4 bytes (optional).** Present in 802.11n and later; HE and EHT variants in ax and be carry trigger info for OFDMA.
- **Frame Body, 0 to 7951 bytes.** The MSDU is capped at 2304 bytes; an A-MSDU can reach 11,454 bytes in HT and an A-MPDU can reach roughly 4 megabytes in EHT.
- **FCS, 4 bytes.** A 32-bit CRC over everything from Frame Control onward.

The four-address combinations are worth memorising. ToDS=0, FromDS=0 is an ad-hoc IBSS frame: A1 is the destination, A2 is the source, A3 is the BSSID. ToDS=0, FromDS=1 is from the AP to a station: A1 is the destination, A2 is the BSSID, A3 is the original source. ToDS=1, FromDS=0 is from a station to the AP: A1 is the BSSID, A2 is the source, A3 is the destination. ToDS=1, FromDS=1 is the four-address WDS or mesh case where you need to name everything.

### State machine in three sentences

A Wi-Fi station moves through three or four explicit states with the AP: Unauthenticated/Unassociated, Authenticated/Unassociated, Authenticated/Associated, and finally RSN-associated after the four-way handshake completes. Deauthentication or Disassociation drops the station back to State 1 or 2. Once associated and keyed, individual data frames are independent — Wi-Fi has no connection beyond the association itself, only ACKs, Block ACKs, and aggregation windows — but the existence of an association is the longest-lived piece of state in the protocol.

### Reliability, security, and airtime

Wi-Fi keeps the link honest with three mechanisms. Every unicast frame must be acknowledged within microseconds; missed ACK means retransmit. The FCS catches transmission errors. And the security suite has evolved through three generations: WEP (1997, RC4 with a 24-bit IV — catastrophically broken by Fluhrer, Mantin, and Shamir at SAC 2001 and weaponised by AirSnort weeks later), WPA (2003, TKIP with RC4, a transitional firmware-patch), WPA2 (2004, AES-CCMP, the reigning standard for thirteen years), and WPA3 (2018, SAE replacing PSK, optional 192-bit Suite B for Enterprise, mandatory Protected Management Frames). On 6 GHz, Wi-Fi Alliance and FCC rules require WPA3-only with PMF mandatory and OFDMA — no Wi-Fi 5 device will ever associate to your 6 GHz radio.

The PHY side is where the headline numbers come from. Pre-11n used 64-FFT OFDM with 312.5 kHz subcarrier spacing. 802.11ax and be use a 4× longer symbol of 12.8 microseconds with 78.125 kHz spacing, which is what enables OFDMA Resource Units — 26-tone, 52-tone, 106-tone, and so on up to Wi-Fi 7's 4×996-tone RU on a 320 MHz channel. Channel widths are 20, 40, 80, 80+80 or 160, and Wi-Fi 7's 320 MHz, 6 GHz only and only where contiguous spectrum is available. MIMO has reached 8×8:8 in 11ax and be. Wi-Fi 7's 4096-QAM packs 12 bits per symbol and needs roughly 5 dB more SNR than 1024-QAM — usable mainly close to the AP.

## Where it shows up in production

**The Linux stack** is `cfg80211` over `nl80211` netlink, feeding `mac80211` softMAC, with per-vendor drivers — Intel's `iwlwifi`, Qualcomm Atheros's `ath10k`, `ath11k`, and `ath12k` (the Wi-Fi 7 driver), Broadcom's `brcmfmac`, MediaTek's `mt76`, Realtek's `rtw89`. Userspace is `hostapd` and `wpa_supplicant` — version 2.11 in July 2024 added preliminary EHT support — with Intel's `iwd` as a leaner alternative. Linux 6.5 and later carry Intel-contributed Wi-Fi 7 MLO support; 6.4 added Wi-Fi 7 mesh.

**Windows** drives Wi-Fi through WLAN AutoConfig and the Windows Connection Manager. Windows 11 24H2 build 26063 and later added MLO support for the Intel BE200 and Qualcomm FastConnect 7800 cards. **Apple's** stack is closed-source CoreWLAN and `airportd`; macOS Sequoia and iOS 18 added Wi-Fi 7 on the iPhone 16 Pro and the M4 Macs. **OpenWrt** remains the reference open AP firmware, riding the same `mac80211` plus per-driver firmware blobs.

**Enterprise vendors** are Cisco Catalyst 9800 on IOS-XE Wireless, Aruba ArubaOS 10 with Aruba Central, Ruckus (now CommScope) Cloud and SmartZone, Cisco Meraki cloud-managed, Juniper Mist with its Marvis AI assistant, Ubiquiti UniFi for SMB, and Extreme. The SOHO/consumer market is ASUS, TP-Link, Netgear, eero (Amazon), and Google Nest Wifi.

**Wi-Fi 7 chipsets shipping by mid-2026:** Qualcomm FastConnect 7800 on the client side and Networking Pro 1620 on the AP side, both with 320 MHz, 4096-QAM, and HBS multi-link. Intel BE200 and BE201 M.2 client modules — Intel platforms only — plus the BE202 160 MHz variant. Broadcom BCM4398 client and BCM6726 / BCM6756 AP. MediaTek Filogic 880 AP and Filogic 380 client (MT7925 / MT7927).

**Public deployment numbers, mid-2026.** Wi-Fi Alliance reports 3.9 billion Wi-Fi devices forecast to ship in 2025 for a cumulative 48.8 billion lifetime, 23.3 billion devices in active use, and 4.9 trillion dollars of annual global economic value. Wi-Fi 7 alone reached 583 million device shipments in 2025; ABI projects 117.9 million Wi-Fi 7 enterprise APs in 2026, up from 26.3 million in 2024. Mobile users spend somewhere between 77 and 88 percent of screen-on time on Wi-Fi.

**Real-world throughput.** Close-range single-client over a 320 MHz 6 GHz channel with a 2×2 client like the BE200 or NCM865 typically sustains 2.5 to 4 Gbit/s on iperf3. Wi-Fi 7 latency with TWT and low utilization can drop sub-5 ms. The Wireless Broadband Alliance's eMLSR field tests show that latency consistency, not raw aggregate throughput, is the actual MLO win.

**Marquee at-scale deployments.** Apple Park; Allegiant, SoFi, and Hard Rock stadiums (Cisco, Extreme, and CommScope, often 2,000+ APs each); UCLA and Wake Forest dense campus; Hannover Messe (CommScope/Ruckus); Singapore Changi.

**6 GHz Standard Power went live in 2024.** The FCC freed 1,200 MHz on April 23, 2020. On February 23, 2024 the FCC's Office of Engineering and Technology approved seven Automated Frequency Coordination operators — Qualcomm, Federated Wireless, Sony, Comsearch, Wi-Fi Alliance Services, the Wireless Broadband Alliance, and Broadcom — for commercial AFC operation; AXON Networks became the eighth in June 2025. The first AFC-certified Wi-Fi 7 AP, the RUCKUS R770, was certified April 16, 2024. Standard-power lets a 6 GHz AP transmit at up to 36 dBm EIRP — about 63× the indoor low-power-indoor limit — both indoors and outdoors, with a daily AFC re-query.

## Things that go wrong

**TJX, disclosed January 17, 2007.** Attackers war-drove a poorly-secured WEP-protected Wi-Fi network at a Marshalls store in Miami starting July 2005, pivoted into the corporate network from there, and exfiltrated approximately 94 million customer credit and debit card records over roughly eighteen months. TJX settled with 41 state Attorneys General for $9.75 million and was forced to upgrade all WEP to WPA. It is the cleanest "weak crypto kills your business" case study in the canon — and the reason WEP was effectively dead in retail by the end of the decade.

**KRACK, October 16, 2017.** Mathy Vanhoef and Frank Piessens at KU Leuven walked onto an ACM CCS stage and announced that every WPA2 implementation on Earth — every Windows laptop, every Android phone, every macOS, every iOS, every router — could be tricked into reusing an encryption nonce by replaying message 3 of the four-way handshake. CVEs 2017-13077 through 13088 covered the family. Vendors had been quietly patched under embargo months before; Microsoft shipped a fix in the October 2017 Patch Tuesday before Vanhoef even spoke. The practical impact was muted because most user traffic was already HTTPS by 2017 — but the cultural impact was enormous.

**Dragonblood, April 10, 2019.** Vanhoef came back, this time with Eyal Ronen, and broke WPA3 — the protocol that was supposed to fix WPA2. The original Dragonfly handshake's "hunt-and-peck" Password Element derivation took variable time; that timing leaked the password to anyone within radio range. CVEs 2019-9494 through 9499. Mitigation was to replace hunt-and-peck with the IETF's hash-to-curve mapping (RFC 9380).

**FragAttacks, May 2021.** Twelve more CVEs. Three of them — CVE-2020-24586, 24587, and 24588 — are flaws in the IEEE 802.11 standard itself, present since 1997. Nine are implementation flaws across vendors. Cisco, Aruba, Ruckus, and Microsoft all patched throughout 2021.

**Framing Frames, March 2023.** CVE-2022-47522. Domien Schepers, Aanjhan Ranganathan, and Vanhoef showed how to abuse the unprotected power-save bit to redirect queued frames and bypass client isolation. Tied to the MacStealer proof-of-concept.

**SSID Confusion, May 2024 — CVE-2023-52424.** Héloïse Gollier and Vanhoef at WiSec 2024. The 802.11 standard does not require the SSID to enter the PMK or session-key derivation in many configuration paths, so a beacon spoof can downgrade or sidestep client expectations. Affects WEP, WPA3, 802.1X/EAP, and AMPE; impacts every operating system. Wi-Fi 7's mandatory beacon protection helps but the original paper notes a brief vulnerability window before the beacon integrity key is verified. The Wi-Fi chapter episode covers Vanhoef's two-year cadence in detail.

**Pixie Dust (Hack.lu, October 2014).** Dominique Bongard's offline brute-force of WPS PINs via weak chipset PRNGs on Realtek, Ralink, MediaTek, and Broadcom variants. Implemented in `pixiewps` and `reaver`. 2025 NetRise research reportedly still found over 80 percent of consumer/SMB devices vulnerable. The action is unambiguous: disable WPS, period.

**AT&T Mobility, February 22, 2024.** A planned wireless-core change pushed simultaneously across the production fleet took down approximately 125 million devices for up to twelve hours. About 25,000 emergency 911 calls failed during the outage. Several state agencies advised customers to use Wi-Fi calling — which routes through the home internet rather than the cellular network — as a fallback. The full story belongs to the AT&T Mobility 2024 chapter episode, but it is worth naming here as the moment when "use your Wi-Fi" became official emergency advice in the United States.

## Common pitfalls (for the practitioner)

- **2.4 GHz channel planning.** Only channels 1, 6, and 11 are usable in 20 MHz. Never use 40 MHz here. The math: 802.11b/g/n in 2.4 GHz uses a roughly 22 MHz emission mask on 5 MHz-spaced centers, so you need at least 25 MHz separation — five channel numbers — to be non-overlapping. 1, 6, 11 (centers 2412, 2437, 2462 MHz) are the three non-overlapping choices in the US.
- **5 GHz channel planning.** 80 MHz is the common sweet spot. 160 MHz is only practical in low-density deployments. DFS channels can disappear for 60 seconds on a radar hit — verify your radar logs before blaming the AP.
- **6 GHz channel planning.** 80–160 MHz indoors is the rule. 320 MHz only where AFC and contiguous spectrum allow — that means US standard-power post-February 2024.
- **−67 dBm is the canonical voice target.** RSSI better than −67 dBm with SNR ≥ 25 dB, plus airtime utilization at 30 percent or below, is the design benchmark for any service-class deployment.
- **More dB is not better.** Cranking AP TX power up creates one-way coverage and sticky-client roaming. The AP hears the client at the link budget defined by the *client's* TX power, often 14–20 dBm. Match AP power to client power.
- **Disable lower data rates.** 1, 2, 5.5, and 6 Mbit/s broadcasts and beacons are the airtime tax. In 2026, set 12–24 Mbit/s as basic in 5/6 GHz. Disable 802.11b. There is no business reason to support b in 2026.
- **DTIM intervals.** DTIM=1 (every beacon) maximises responsiveness for AirPlay and Chromecast multicast. DTIM=3 saves battery for classic stations. With TWT, DTIM matters less for IoT.
- **RTS/CTS thresholds.** Default is 2347 — effectively off. Lower it (say to 512 bytes) only when hidden-node is empirically demonstrated.
- **WPA3 transition mode.** "WPA2/WPA3" mixed mode broadcasts both AKMs in the RSN IE; older Android and IoT clients parse this incorrectly and refuse to associate. Test thoroughly; consider separate SSIDs.
- **Sticky clients are almost always client-OS bugs.** 802.11k, v, and r with PMF help, but the ultimate fix is getting clients to roam earlier — modern OSes hand off below about −72 dBm.
- **MAC randomization breaks RADIUS accounting and MAC ACLs.** iOS 14+, Android 10+, and Windows 10/11 randomize per SSID by default. Captive-portal session tables churn; allow-list ACLs break. 802.11bh-2024, published June 2025, is the IEEE's response — Device ID and Identifiable Random MAC mechanisms that let an AP recognise a returning device with explicit user agreement without seeing its real MAC.
- **iperf3 over Wi-Fi.** Single-stream rarely saturates the link. Use 4–8 parallel streams (`-P 8`) with a 10–30 second window. Don't trust browser speed tests.

## Debugging it

**Wireshark and tshark filters worth memorising.** `wlan.fc.type_subtype == 0x08` for beacons, `eapol` for the four-way handshake, `wlan.fc.protected == 1` for encrypted frames, `wlan.addr == aa:bb:cc:dd:ee:ff` to follow one station. On Mac monitor mode is built in; on Windows you need AirPcap or USB capture; on Linux mac80211 cards work natively.

**What to look for in pcap.** Retry rate above 10 percent on management frames is a sick BSS. Lots of BlockAckReq with no BlockAck is a receiver problem. Beacon loss above 1 percent means roaming will be ugly. Trigger frames with no responses means OFDMA misalignment.

**CLI on Linux.** `iw dev wlan0 scan` lists nearby SSIDs and signal levels. `iw dev wlan0 link` shows the current association. `iw dev wlan0 station dump` gives per-station counters and rates. `tcpdump -i wlan0mon -e -s 256 type mgt subtype beacon` captures beacons in monitor mode. On macOS the underused gem is `/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s` for an instant scan.

**Common debugging moves.** Check airtime utilization (which is your BSS) versus channel utilization (which includes neighbors). Watch retry percent. Bin the MCS distribution. Pull 802.11k neighbor reports from clients to see what the client thinks its options are.

**Tooling.** Wireshark, Kismet, the aircrack-ng suite, `eaphammer`, Scapy's `scapy.layers.dot11`. For surveys: Ekahau Sidekick 2 with Ekahau AI Pro, NetSpot, AirMagnet (now NETSCOUT), Wi-Fi Explorer on macOS. For lab simulation, ns-3's Wi-Fi module is mature. For at-scale test gear: Octoscope (now Spirent Octobox), Spirent TestCenter, Keysight IxChariot/IxNetwork, Rohde & Schwarz CMW/CMP, LANforge from Candela.

## What's changing in 2026

- **March 2026 plenary — Wi-Fi 8 (802.11bn) Draft 1.3.** Roughly 1,800 LB291 comments resolved. Draft 2.0 ballot is targeted for May 2026 in Antwerp. Final ratification is still on schedule for September 2028. Same bands as Wi-Fi 7, same 320 MHz max, same ~46 Gbps PHY peak — explicitly *not* a peak-speed upgrade. PAR objectives: +25% throughput at given SINR, −25% 95th-percentile latency, −25% MPDU loss across BSS transitions. Headline features: Multi-AP Coordination (Co-BF, Co-SR, Co-TDMA), Seamless Roaming Domain with key-context transfer between AP MLDs, Enhanced Long Range PPDU with 3 dB power boosting, Distributed Resource Units, Dynamic Subband Operation, Non-Primary Channel Access, four new MCS values for finer link adaptation, and explicit In-Device Coexistence with Bluetooth, Zigbee, and UWB. Broadcom announced a Wi-Fi 8 chipset in October 2025; ASUS demoed a draft router at CES 2026. The full story belongs to the Wi-Fi 7 and 8 chapter episode.
- **March 2026 — IEEE 802.11 AI Offload Study Group.** Approved at the March plenary to standardise using Wi-Fi APs as edge AI inference offload nodes.
- **January 2026 — Wi-Fi 9 study group started.** The post-Wi-Fi-8 generation. Colloquial naming only — no IEEE PAR or Wi-Fi Alliance branding yet.
- **January 2026 — Wi-Fi 7 at 20 MHz track.** Wi-Fi Alliance launched a programme to bring Wi-Fi 7 features (4096-QAM, MLO, Multi-RU) to IoT devices that lack wide-channel radios.
- **November 12, 2025 — EU 6 GHz upper-band setback.** The EU Radio Spectrum Policy Group recommended assigning 6585–7125 MHz to mobile/5G, holding 6425–6585 MHz pending WRC-27 — effectively closing the upper 6 GHz band to Wi-Fi in the EU for the medium term. The Wi-Fi Alliance "strongly disagrees." This is the single biggest regulatory delta of the last 24 months.
- **September 2025 — 802.11bf published.** Wi-Fi sensing standardised. CSI-based presence, motion, and breathing detection, operating 1–7.125 GHz and above 45 GHz. Approved 2024, published September 26, 2025.
- **September 2025 — 802.11bk published.** Extends FTM (Fine Timing Measurement) ranging to 320 MHz channels.
- **July 22, 2025 — IEEE 802.11be (Wi-Fi 7) amendment published.** The amendment was approved September 26, 2024; the published spec landed July 22, 2025. 320 MHz channels, 4096-QAM, MLO, preamble puncturing, Multi-RU. Theoretical peak ~46 Gb/s, ~30 Gb/s required by the PAR. Wi-Fi Alliance launched Wi-Fi CERTIFIED 7 on January 8, 2024.
- **June 2025 — 802.11bh-2024 published.** Device ID and Identifiable Random MAC mechanisms, the IEEE's response to MAC randomization breaking RADIUS accounting and captive portals.
- **April 28, 2025 — IEEE 802.11-2024 rollup published.** 5,956 pages, incorporating amendments 1–7 from 2021–2024.
- **June 2025 — eighth AFC operator approved.** AXON Networks joined the seven approved in February 2024.
- **November 2024 — FCC 24-106 (Second Report and Order).** Finalised C-V2X for ITS in 5.9 GHz and mandated retirement of DSRC (the 802.11p basis) by December 14, 2026 — ending the 1999 DSRC monopoly.

## Fun facts (host material)

**"Wi-Fi" is not an acronym.** Phil Belanger, founding Wi-Fi Alliance member, wrote in 2005: "Wi-Fi doesn't stand for anything. It is not an acronym. There is no meaning… Interbrand created 'Prozac', 'Compaq'… they came up with the name and logo." Interbrand picked the name from ten candidates. The "Wireless Fidelity" tagline was a nervous compromise added briefly by the WECA board and dropped. Snopes confirmed the story again in July 2024. The yin-yang Wi-Fi logo is also Interbrand's work.

**The 1985 FCC ruling that started everything.** Mike Marcus's Docket 81-413 led to the May 9, 1985 FCC decision allowing unlicensed spread-spectrum in the 902, 2400, and 5800 MHz ISM bands. Marcus received the IEEE ComSoc 2013 Public Service award for it. Without that one regulatory move, no consumer wireless networking happens.

**The CSIRO patent windfall.** Australia's CSIRO held US Patent 5,487,069, granted January 23, 1996, on John O'Sullivan's group's radio-astronomy-derived OFDM/multipath technique. After Buffalo lost in 2005, CSIRO settled with fourteen majors in 2009 — HP, Dell, Microsoft, Intel, Netgear, Nintendo, Belkin, D-Link, 3Com, Toshiba, Asus, Buffalo, Accton, SMC — for roughly US$205 million. A 2012 settlement with AT&T, Verizon, T-Mobile and others added approximately US$220 million. Lifetime royalties are widely cited at over US$430 million; some industry estimates put the total near US$1 billion. Patents expired November 30, 2013. Worth noting: the CSIRO patent was *not* invented inside the IEEE 802.11 working group — CSIRO commercialised through Radiata, which Cisco bought in 2001.

**The four-way handshake was formally proven correct in 2005 — and yet KRACK existed.** The proofs assumed handshake messages were never replayed; they didn't model *key installation*, the operation that actually puts a key into the radio. For thirteen years, every WPA2 implementation reset the encryption nonce when it reinstalled the same key, which was provably safe under the model and catastrophically insecure in reality. A mathematical proof is only as useful as the system it abstracts over.

**Beacons every 102.4 ms.** Because the Time Unit (TU) is 1024 microseconds and the default beacon interval is 100 TUs. Almost every "100 ms beacon interval" you read in a vendor doc is actually 102.4.

**Microwave ovens at 2.4 GHz.** A coincidence. Water absorption peaks near 22 GHz, not 2.45. The 2.45 GHz magnetron is what the FCC happened to allocate to ISM, and microwave-oven leakage at 2.45 GHz is a textbook source of channel-1 interference.

**No 802.11 RFCs.** 802.11 is an IEEE standard; the IETF only ever produced ancillary RFCs — RFC 1042 for LLC/SNAP, RFC 5415 for CAPWAP, RFC 7170 for EAP-TEAP. There is no "RFC for Wi-Fi" the way there is one for TCP.

## Where this connects in the book

- **Part Foundations, "The Layer Model"** — seven layers, the standards war that decided their fate, and where the layers blur. Wi-Fi sits at Layers 1 and 2 and is the canonical case where Layer 1 mechanism (radio) drives Layer 2 design (CSMA/CA, mandatory ACKs, four addresses).
- **Part Foundations, "Addressing & Identity"** — how a packet finds your laptop. Wi-Fi's three-or-four-MAC addressing is one of the cases the chapter unpacks.
- **Part Foundations, "Packets & Encapsulation"** — frames inside packets inside segments. The AP bridge from 802.11 to 802.3 is one of the chapter's worked examples.
- **Part Foundations, "Ports & Sockets"** — Ethernet, Wi-Fi, and IP all live below the port abstraction; this chapter draws the line.
- **Part Foundations, "Reliability vs Speed"** — TCP versus UDP, and why QUIC tries to have both. Wi-Fi sits beneath all of them and explains why mobile transport has to assume the link is lossy.
- **Part Foundations, "Encryption Basics"** — what HTTPS actually protects. The KRACK story is the cleanest demonstration that L2 encryption is not a substitute for L7 encryption.
- **Part Story of the Internet, "The Mobile and Bufferbloat Decade"** — 3G, 4G, the iPhone, and why your home internet is laggy under load. Wi-Fi's variable-bandwidth, big-buffer reality is a major driver of the bufferbloat story.
- **Part Layer 2–3, "Wi-Fi"** — the deep history chapter. From FCC Docket 81-413 to Wi-Fi 8, with Vanhoef's two-year cadence as the security spine.
- **Part Layer 2–3, "ARP and NDP"** — how a packet finds the next physical hop. ARP broadcasts on Wi-Fi pay an airtime tax; enterprise APs implement ARP proxy. The chapter also covers iOS 18's "Rotate Wi-Fi Address" mode.
- **Part Transport, "MPTCP"** — Wi-Fi plus cellular at the same time, transparently. Apple shipped MPTCP in iOS 7 in 2013 specifically because the half-second handoff between Wi-Fi and cellular was visibly degrading Siri.
- **Part Transport, "QUIC"** — reliable transport in user space, on UDP, with TLS folded in. QUIC's connection ID survives a Wi-Fi-to-cellular roam where TCP's 4-tuple cannot.
- **Part Wireless, "The shared medium"** — why wireless networking is a different problem from wired networking. The medium is shared, signals fade, and physics actively conspires against you. The framing chapter for everything Wi-Fi does differently from Ethernet.
- **Part Wireless, "Wi-Fi"** — 802.11 from 1997 to Wi-Fi 8, CSMA/CA, the move to 5 and 6 GHz, OFDMA, MLO, and the KRACK story that put WPA2 on every CTO's radar.
- **Part Web/API, "HTTP/3"** — HTTP semantics on QUIC. The plateau is real but so is the agenda. QUIC connection migration matters most on Wi-Fi-to-cellular transitions.
- **Part Famous Outages, "AT&T Mobility 2024"** — 125 million devices, 25,000 failed 911 calls. Wi-Fi calling was the official emergency fallback during the outage.
- **Part The Modern Frontier, "Wi-Fi 7 and 8"** — 320 MHz, then a 25 percent better tail-latency target — and the politics of 6 GHz. The chapter goes deep on MLO modes (STR vs eMLSR vs EMLMR), the EU 6 GHz upper-band fight, and the Vanhoef cadence.

## See also (other protocol episodes)

**Ethernet.** The contrast is everything. Ethernet uses dedicated copper or fiber per link; Wi-Fi uses shared radio. Ethernet runs full-duplex on switched links with no collisions; Wi-Fi runs half-duplex CSMA/CA with explicit per-frame ACKs. Ethernet frames carry two MAC addresses; Wi-Fi frames carry three or four. Ethernet inherits security from physical access; Wi-Fi mandates encryption (WPA2/WPA3). Ethernet caps at 100 GbE on a single link in commodity gear and pushes 1.6 TbE in AI fabrics; Wi-Fi 7 maxes around 5 Gbps real-world. If you've heard the Ethernet episode, this is the wireless-cousin episode where the medium is shared, every frame must be acknowledged, and the laws of physics actively conspire against you.

**ARP.** ARP works identically over Wi-Fi in semantics — but ARP requests are broadcast, and broadcast on Wi-Fi is sent at the lowest mandatory rate (often 6 Mbit/s on 5/6 GHz, 1–6 Mbit/s on 2.4 GHz), consuming airtime. Enterprise APs implement ARP proxy: the AP answers ARP for known clients from its bridging table, killing 90+ percent of broadcast amplification. The ARP episode also covers Firesheep on coffee-shop Wi-Fi in 2010, the proximate cause of the industry-wide HTTPS-everywhere push.

**IPv4.** IPv4 packets ride inside 802.11 frames just as they do over Ethernet — same EtherType inside the LLC/SNAP wrapper, same encapsulation model. DHCP runs unchanged but DHCP DISCOVER pays the same airtime penalty as ARP. Default IP MTU on Wi-Fi is 1500 to match Ethernet, but the 802.11 link can fragment internally — usually best avoided in favour of PMTUD.

**IPv6.** Same encapsulation as IPv4, different EtherType. NDP replaces ARP for address resolution. Router Advertisements, Neighbor Solicitation/Advertisement, and SLAAC all use multicast, and without MLD snooping RAs flood every BSSID — RA-storm incidents are a frequent Wi-Fi-induced battery-drain pathology. Modern APs do multicast-to-unicast conversion for known IPv6 multicast groups. The IPv6-mostly story (DHCP option 108 plus PREF64 plus 464XLAT) is increasingly the way single-SSID deployments handle dual-stack laptops alongside IPv6-only-capable phones.

**Bluetooth.** Wi-Fi's 2.4 GHz coexistence pairing. Modern combo chips — Apple H-series, Broadcom, Qualcomm — do time-division arbitration via Packet Traffic Arbitration at the silicon level so Wi-Fi and Bluetooth don't starve each other. Wi-Fi's escape to 5 GHz and 6 GHz has eased the crowding; Bluetooth stays at 2.4 GHz where every battery-powered consumer device already lives. The Bluetooth episode walks the BR/EDR-vs-LE split in detail.

**4G/5G cellular.** Wi-Fi is the LAN; cellular is the WAN. 3GPP's ATSSS (Access Traffic Steering, Switching, Splitting), introduced in Release 16 with the MA-PDU session, lets a single user-plane session run on both 3GPP and non-3GPP access; lower-layer steering uses ATSSS-LL and higher-layer uses MPTCP, with MPQUIC and MPDCCP added in Rel-17/18. Wi-Fi calling typically encapsulates voice in IPsec to an ePDG/N3IWF; the user's IMS sees a normal voice call.

**NFC.** The 13.56 MHz NFC tap pairs Wi-Fi credentials onto printers and IoT devices via NDEF handover — one of the cleanest examples of "use a 4 cm radio to bootstrap a 30 m radio."

**Zigbee.** Also 2.4 GHz, on IEEE 802.15.4 radios. Zigbee channels 11, 15, 20, 25 fall in the gaps between Wi-Fi channels 1, 6, 11. Through the Matter bridge, Zigbee and Thread meshes appear to your home network as ordinary IP-addressable devices over the same Wi-Fi.

**UWB.** The 6–9 GHz Ultra-Wideband radio sits well above the Wi-Fi bands and never contends with it. Used for fine-grained ranging — sub-meter, with secure HE-LTF AES-256 sequences — and increasingly for digital car keys.

**TCP.** TCP doesn't know it's running over Wi-Fi, but Wi-Fi's variable bandwidth, lossy retransmits, and Wi-Fi-to-cellular roams are exactly the conditions TCP was *least* designed for. The TCP episode covers congestion control's evolution; the QUIC episode covers what happens when you abandon TCP for the same workload.

## Visual cues for image generation

- An exploded 802.11 data frame diagram with each field annotated by byte count and example hex value: Frame Control 0x0842 (Type=Data, Subtype=QoS Data, ToDS, Protected), Duration 48 µs, Address 1 (RA) 00:1A:2B:3C:4D:5E, Address 2 (TA) AA:BB:CC:DD:EE:FF, Address 3 (DA) 11:22:33:44:55:66, Sequence Control, QoS Control TID=0, encrypted CCMP body with PN and MIC, FCS.
- A four-panel sequence: beacon every 102.4 ms, SAE Commit/Confirm, Association Request/Response with AID=1, four EAPOL-Key messages M1–M4 deriving the PTK, then encrypted data — with a callout under M3 reading "KRACK lived here for 13 years."
- A side-by-side: left, Ethernet's CSMA/CD listening for collisions on a coax; right, Wi-Fi's CSMA/CA with DIFS=34 µs, random backoff slots, SIFS=16 µs, ACK — annotation: "a radio cannot listen and transmit at once."
- A 6 GHz channel chart for the US: 1,200 MHz of spectrum, seven 160 MHz channels, three 320 MHz channels, with U-NII-5 through U-NII-8 labeled and an AFC tower icon over the standard-power region.
- A Multi-Link Operation diagram: a phone with one radio and an AP with three radios; the phone's eMLSR ear listens to 2.4, 5, and 6 GHz, switches to whichever is free per packet, with a tail-latency histogram below showing the p99 spike collapsing on the right.
- A timeline ribbon from 1997 to 2026 marking 802.11 (2 Mbps), 802.11b (11), g (54), n / Wi-Fi 4 (600), ac / Wi-Fi 5 (~1.3 Gbps), ax / Wi-Fi 6 (9.6), ax / Wi-Fi 6E (6 GHz), be / Wi-Fi 7 (46), bn / Wi-Fi 8 (reliability, not speed), with Vanhoef paper icons annotated at 2017, 2019, 2021, 2023, and 2024.

## Sources

### IEEE standards

- [IEEE 802.11-2024 (consolidated revision)](https://standards.ieee.org/ieee/802.11/10548/)
- [IEEE 802.11be-2024 (Wi-Fi 7, EHT)](https://standards.ieee.org/ieee/802.11be/7516/)
- [IEEE 802.11bf-2025 (Wi-Fi sensing)](https://standards.ieee.org/ieee/802.11bf/11574/)
- [IEEE 802.11 working group](https://www.ieee802.org/11/)
- [IEEE 802.11bn / Wi-Fi 8 task group update](https://www.ieee802.org/11/Reports/tgbn_update.htm)
- [IEEE 802.11 timelines](https://www.ieee802.org/11/Reports/802.11_Timelines.htm)
- [IEEE 802 architecture](https://standards.ieee.org/ieee/802/4097/)
- [IEEE GET program — free 802 PDFs after 6 months](https://ieeexplore.ieee.org/browse/standards/get-program/page/series?id=68)
- [IEEE 802.11az — Next Generation Positioning](https://standards.ieee.org/beyond-standards/newly-released-ieee-802-11az-standard-improving-wi-fi-location-accuracy-is-set-to-unleash-a-new-wave-of-innovation/)

### Papers

- [Vanhoef & Piessens — KRACK (CCS 2017)](https://papers.mathyvanhoef.com/ccs2017.pdf)
- [Vanhoef & Ronen — Dragonblood (S&P 2020)](https://papers.mathyvanhoef.com/dragonblood.pdf)
- [Vanhoef — FragAttacks (USENIX Security 2021)](https://www.fragattacks.com/)
- [Schepers, Ranganathan, Vanhoef — Framing Frames (USENIX Security 2023)](https://www.usenix.org/conference/usenixsecurity23/presentation/schepers)
- [Gollier & Vanhoef — SSID Confusion / CVE-2023-52424](https://www.top10vpn.com/research/wifi-vulnerability-ssid/)
- [CVE-2023-52424 — wiz vulnerability database](https://www.wiz.io/vulnerability-database/cve/cve-2023-52424)
- [TWT for IoT — research overview (arXiv 2008.02697)](https://arxiv.org/pdf/2008.02697)

### FCC and regulators

- [FCC 6 GHz Report and Order (April 2020)](https://docs.fcc.gov/public/attachments/FCC-20-51A1.pdf)
- [FCC AFC operator approval (Feb 23, 2024)](https://docs.fcc.gov/public/attachments/DA-24-166A1.pdf)
- [FCC AFC eighth operator approval (June 2025)](https://docs.fcc.gov/public/attachments/DA-25-559A1_Rcd.pdf)
- [FCC 5.9 GHz First Report and Order (Nov 2020)](https://docs.fcc.gov/public/attachments/DOC-367827A1.pdf)
- [FCC 24-106 — 5.9 GHz Second Report and Order (Federal Register)](https://www.federalregister.gov/documents/2024/12/13/2024-28980/use-of-the-5850-5925-ghz-band)
- [FCC retrospective on 1985 ISM ruling](https://docs.fcc.gov/public/attachments/FCC-02-328A1.pdf)
- [Cullen International — EU upper 6 GHz waiting on EU-level decisions](https://www.cullen-international.com/news/2026/02/Upper-6-GHz-band--EU-member-states-wait-for-EU-level-decisions.html)

### Wi-Fi Alliance

- [Wi-Fi Alliance — Wi-Fi CERTIFIED 7 launch](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-introduces-wi-fi-certified-7)
- [Wi-Fi Alliance — strongly disagrees with RSPG recommendation](https://www.wi-fi.org/news-events/newsroom/wi-fi-alliance-strongly-disagrees-rspg-recommendation-blocking-wi-fi-access)
- [Wi-Fi Alliance — Powering a Connected World 2025](https://www.wi-fi.org/beacon/the-beacon/powering-connected-world-wi-fi-momentum-2025)
- [Wi-Fi Alliance — Discover Wi-Fi](https://www.wi-fi.org/discover-wi-fi)
- [Wi-Fi Alliance — security](https://www.wi-fi.org/discover-wi-fi/security)
- [Wi-Fi Alliance home](https://www.wi-fi.org/)

### Vendor and engineering blogs

- [Cisco Meraki — Wi-Fi 7 Technical Guide](https://documentation.meraki.com/Wireless/Design_and_Configure/Architecture_and_Best_Practices/Wi-Fi_7_(802.11be)_Technical_Guide)
- [Cisco Meraki Documentation — Wireless](https://documentation.meraki.com/Wireless)
- [Cisco — Wireless white papers](https://www.cisco.com/c/en/us/products/collateral/wireless/)
- [Cisco — WLAN fundamentals (technical reference)](https://www.cisco.com/c/en/us/td/docs/wireless/controller/technical-reference/)
- [Aruba Airheads / HPE Networking](https://community.arubanetworks.com)
- [Juniper Mist AI](https://www.juniper.net/us/en/products/cloud-services/mist-ai.html)
- [Juniper](https://www.juniper.net)
- [HPE — what is Wi-Fi 8](https://www.hpe.com/us/en/what-is/wi-fi-8.html)
- [RUCKUS — first AFC-certified Wi-Fi 7 AP (R770)](https://www.ruckusnetworks.com/blog/2024/fcc-6-ghz-afc-device-certification-opens-new-possibilities-for-the-ruckus-r770-wi-fi-7-ap/)
- [iFeelTech — MLO explained](https://ifeeltech.com/blog/wifi-7-multi-link-operation-mlo-explained)
- [Renesas — TWT explained](https://www.renesas.com/en/blogs/low-power-advantage-wi-fi-66e-twt-explained)
- [Tektronix — 802.11 PHY primer](https://www.tek.com/en/documents/primer/wi-fi-overview-80211-physical-layer-and-transmitter-measurements)
- [Phoronix — wpa_supplicant 2.11 ships EHT support](https://www.phoronix.com/news/WPA_Supplicant-2.11)
- [Arch Linux — iwd wiki](https://wiki.archlinux.org/title/Iwd)
- [Wi-Fi Professionals — 4-way handshake walkthrough](https://www.wifi-professionals.com/2019/01/4-way-handshake)
- [Kernel Blog — 4-way handshake in 802.11 Wi-Fi](https://kernelblog.com/posts/4-way-handshake-in-802.11-wi-fi/)
- [Pixie Dust attack on routers — explainer](https://copyprogramming.com/howto/what-is-pixie-dust-attack-on-router)
- [Samsung Research — IEEE 802.11bn UHR Wi-Fi 8](https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8)
- [Ofinno — Standards readout: Wi-Fi 8 advances, Wi-Fi 9 begins](https://ofinno.com/the-standards-readout-2/wi-fi-8-advances-mmwave-hits-a-split-wi-fi-9-begins/)
- [DongKnows — Qualcomm NCM865 vs Intel BE200](https://dongknows.com/qualcomm-ncm865-vs-intel-be200-wi-fi-7-upgrade/)
- [SNB Forums — Wi-Fi 7 performance reports](https://www.snbforums.com/threads/wifi-7-performance-is-more-than-just-marketing.94057/)
- [Medium / Jessica Chuang — 5G/Wi-Fi convergence ATSSS](https://medium.com/@jessica.chchuang/5g-wi-fi-convergence-atsss-access-traffic-steering-switching-splitting-307ff72b5da7)
- [Awesome Integrated Sensing and Communications — standardization tracker](https://github.com/yuanhao-cui/Awesome-Integrated-Sensing-and-Communications/blob/main/paper/standardization.md)

### News

- [Boing Boing — Wi-Fi isn't short for Wireless Fidelity (Phil Belanger, 2005)](https://boingboing.net/2005/11/08/wifi-isnt-short-for.html)
- [Snopes — Wi-Fi definition origin (July 2024)](https://www.snopes.com/news/2024/07/23/wi-fi-definition-origin/)
- [Light Reading — mobile operators beat Wi-Fi for upper 6 GHz in Europe](https://www.lightreading.com/wifi/mobile-operators-beat-wi-fi-for-upper-6ghz-in-europe)
- [Network World — Wi-Fi 8 in 2026, reliability over speed](https://www.networkworld.com/article/4112600/wi-fi-8-in-2026-next-gen-wireless-standard-prioritizes-reliability-over-speed-gains.html)
- [Network World — why only 1, 6, 11 don't overlap](https://www.networkworld.com/article/891090/network-security-why-do-only-three-channels-not-overlap.html)
- [RCR Wireless — Wi-Fi 7 at 20 MHz (Jan 2026)](https://www.rcrwireless.com/20260107/network-infrastructure/wi-fi-7-20-mhz-devices)
- [TechBlog (ComSoc) — Wi-Fi 7 backgrounder and CES 2025](https://techblog.comsoc.org/2025/01/10/wifi-7-backgrounder-and-ces-2025-announcements/)
- [Huntress — TJX/T.J. Maxx data breach](https://www.huntress.com/threat-library/data-breach/tjmaxx-data-breach)
- [Washington AG — TJX data breach settlement](https://www.atg.wa.gov/news/news-releases/attorney-general-mckenna-calls-tjx-s-data-breach-costly-lesson)
- [ProQuest — TJX archival coverage](https://www.proquest.com/docview/212316959)
- [GuidingTech — MAC randomization on your devices](https://www.guidingtech.com/what-is-mac-randomization-and-how-to-use-it-on-your-devices/)
- [Microsoft Learn — MAC address randomization Wi-Fi profile issue](https://learn.microsoft.com/en-us/answers/questions/1631566/mac-address-randomization-wi-fi-profile-issue)
- [Patentology — story behind CSIRO's Wi-Fi patent](https://blog.patentology.com.au/2012/04/story-behind-csiros-wi-fi-patent.html)
- [The Conversation — CSIRO settles suits over Wi-Fi](https://theconversation.com/patently-australian-csiro-settles-suits-over-wi-fi-6184)
- [iTnews — end of an era, CSIRO Wi-Fi patent expiry](https://www.itnews.com.au/news/end-of-an-era-csiro-wifi-patent-nears-expiry-351848)
- [Hackaday — Australia didn't invent Wi-Fi, despite what you've heard](https://hackaday.com/2024/08/20/australia-didnt-invent-wifi-despite-what-youve-heard/)
- [Evan McCann — Wi-Fi 101: origins and history](https://evanmccann.net/blog/wifi-101/origins-and-history)
- [IEEE Milestones — birth of WiFi](https://ieeemilestones.ethw.org/Milestone-Proposal_talk:The_birth_of_WiFi)
- [IEEE Computer Society — Vic Hayes profile](https://www.computer.org/profiles/victor-hayes)
- [Cleartosend (Rowell Dionicio, François Vergès)](https://www.cleartosend.net)
- [Packet Pushers — Heavy Wireless](https://packetpushers.net)
- [WLAN Pros](https://wlanpros.com)
- [Cisco Live](https://www.ciscolive.com)
- [CWNP — CWNA-109 study guide](https://www.cwnp.com/cwna109sg/)

### Tooling

- [Wireshark](https://www.wireshark.org)
- [Wireshark sample captures](https://wiki.wireshark.org/SampleCaptures)
- [Kismet](https://www.kismetwireless.net)
- [aircrack-ng](https://www.aircrack-ng.org)

### Wikipedia

- [Wi-Fi](https://en.wikipedia.org/wiki/Wi-Fi)
- [IEEE 802.11](https://en.wikipedia.org/wiki/IEEE_802.11)
- [IEEE 802.11bn](https://en.wikipedia.org/wiki/IEEE_802.11bn)
- [Wi-Fi 7](https://en.wikipedia.org/wiki/Wi-Fi_7)
- [Vic Hayes](https://en.wikipedia.org/wiki/Vic_Hayes)

### IETF

- [RFC 1122 — Internet host requirements](https://datatracker.ietf.org/doc/html/rfc1122)
