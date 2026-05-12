===== PROTOCOL · NFC · Near Field Communication =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, specs,
books, engineering blog posts, conference talks, and podcasts on this topic,
all distilled into one document. Surface-level "what is NFC" content already
exists everywhere — what I need is depth, story, current detail, and
connections that aren't obvious from a Wikipedia skim.

Specifically I'm interested in:

- The actual narrative — the 2002 Sony+NXP+Nokia collaboration; the ISO/IEC
  14443 RFID heritage; the NFC Forum founding in 2004; the long limbo
  decade where NFC was on every Android phone but consumers didn't know
  what to do with it; the September 2014 Apple Pay launch that changed
  the trajectory of the entire industry; the FeliCa parallel-universe
  story in Japan and Hong Kong; the slow death of peer-to-peer mode
  (Android Beam, 2011–2020); the iPhone-as-payment-terminal pivot in
  2022 (Tap to Pay on iPhone).
- Mechanics deep enough that someone could re-implement a minimal NFC
  reader or HCE-emulated card after reading: the 13.56 MHz inductive
  coupling layer, ISO/IEC 14443-3 anti-collision (Type A and Type B),
  ISO/IEC 18092 NFCIP-1 active vs passive modes, the NDEF record format,
  the four Tag Types (T1–T5), LLCP framing, SNEP, and the HCE host-side
  APDU routing model on Android.
- Real failures and famous incidents — the Mifare Classic Crypto1 break
  (Karsten Nohl + Henryk Plötz, CCC 24c3 2007–2008) and what it cost
  Oyster / OV-chipkaart deployments; HCE relay attacks (NFCGate,
  mole-in-the-middle attacks against contactless payments); the
  Nohl/Renaud "Bad USB"-style NFC weaknesses; the iPhone-doesn't-do-FeliCa
  saga until iPhone 7 Japan (2016); the 2017 Android Pay rebrand mess.
- Connections to adjacent protocols — how NFC bootstraps Bluetooth and
  Wi-Fi pairing (Connection Handover spec), how EMV Contactless runs
  ISO 7816 APDUs over NFC under TLS-like cryptographic protections,
  how Apple's CCC Digital Key 3.0 uses NFC for fast-tap unlock and UWB
  for ranged unlock, how Matter onboarding can use NFC for the QR-code
  alternative.
- 2024–2026 developments — NFC Forum Multi-purpose Tag (MPT) spec, the
  CCC Digital Key 3.0 rollout in 2024–2026 vehicles (BMW, Mercedes,
  Hyundai/Kia), Apple's Tap to Pay on iPhone expansion to new countries,
  the EU Digital Markets Act forcing Apple to open the NFC chip to
  third-party wallets (iOS 17.4, March 2024), NFC Wireless Charging
  (NFC-WLC) spec finalisation, Aliro home-access standard.
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older
sources as suspect and verify them against the current state. Define every
term you use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or
DOI. Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL,
USENIX), archive.org for older or dead links, and the relevant standards
body (NFC Forum, ISO, EMVCo, ICAO 9303 portal). Past passes have left 121
`[needs source]` markers across 46 reports — please try harder this round,
but never invent a source to avoid one.

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers protocols across 7 categories
including a Wireless category (Wi-Fi, Bluetooth, Cellular). Your report
should explain how NFC relates to these — what it depends on, what
depends on it, what it competes with, what it complements:

- **Network foundations** — Ethernet, Wi-Fi (802.11), ARP, IPv4, IPv6, BGP, ICMP, OSPF
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0, IPsec, NAT-traversal (STUN/TURN/ICE)
- **Wireless** — Wi-Fi, Bluetooth/BLE, Cellular (4G/5G)

Adjacent wireless protocols being added in the same pass (cross-reference,
do not duplicate): **Zigbee**, **UWB**, plus the already-shipped
**Matter + Thread** bundle.

# Topic

The topic of this research is **NFC (Near Field Communication)** — the
13.56 MHz short-range inductive-coupling protocol family that powers
contactless payments, transit cards, electronic passports, smart-home
device pairing, and corporate access cards. NFC is unusual in this
encyclopedia because it is not one protocol but a family layered on top
of decades of RFID heritage: ISO/IEC 14443 (Type A/B proximity cards,
the foundation for most credit-card EMV contactless), ISO/IEC 15693
(vicinity cards), ISO/IEC 18092 NFCIP-1 (the peer-to-peer extension),
and a stack of NFC Forum specs (Tag Types 1–5, NDEF, LLCP, SNEP, HCE).

NFC was originally a 2002 collaboration between Sony, NXP (then Philips
Semiconductors), and Nokia. The NFC Forum was founded in 2004. ISO/IEC
18092 was published in 2003. But NFC was a sleepy technology for nearly
a decade — present on Android since the Nexus S in 2010, but with no
real consumer use case at scale. **The inflection point was September
2014, when Apple launched Apple Pay on iPhone 6.** From that moment NFC
became the de facto contactless payment standard worldwide.

Please structure the report so the three NFC operating modes get their
own treatment:

  - **Reader/Writer mode** — phone reads a passive tag (transit poster,
    Mifare card, NFC business card)
  - **Card Emulation mode** — phone acts as a contactless card
    (Apple Pay, Google Wallet, transit-card emulation, building access)
  - **Peer-to-Peer mode** — two NFC-enabled devices exchange data
    (Android Beam, now largely dead; replaced by Bluetooth/Wi-Fi handover)

Related protocols and standards likely connected to NFC that you should
verify and expand on:

  - **ISO/IEC 14443 Type A / Type B** — the underlying proximity-card spec
  - **ISO/IEC 15693** — vicinity (longer-range) RFID, sometimes lumped in
  - **ISO/IEC 18092 NFCIP-1 / 21481 NFCIP-2** — the core NFC standards
  - **ISO/IEC 7816** — the smart-card APDU layer that EMV runs over NFC
  - **EMV Contactless** — every Visa/Mastercard tap
  - **FeliCa (JIS X 6319-4)** — Sony's Asian transit-card alternative
  - **ICAO Doc 9303** — eMRTD electronic passport spec, runs over ISO 14443
  - **Bluetooth / BLE** — NFC bootstraps BLE pairing via Connection Handover
  - **Wi-Fi** — NFC bootstraps Wi-Fi Protected Setup via Connection Handover
  - **TLS** — analogy/contrast to the EMV cryptographic envelope over NFC
  - **UWB** — paired with NFC in CCC Digital Key 3.0 (NFC bootstrap, UWB ranging)
  - **Matter** — NFC commissioning as an alternative to QR codes
  - **MIFARE Classic / DESFire** — the dominant transit-card families
  - **HCE (Host Card Emulation)** — the Android software-side card emulation

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] Glossary entries for **every** new term introduced
  (e.g., inductive coupling, load modulation, 13.56 MHz, Type A vs Type B,
  anti-collision, UID, ATQA/ATQB, SAK, NDEF, NDEF record, NDEF message,
  Tag Type 1–5, LLCP, SNEP, HCE, APDU, RID, AID, SE (secure element),
  TSM (trusted service manager), tokenisation, EMV tap, FeliCa, Mifare,
  passive vs active mode, target vs initiator, ATR, ATS, ATQ)
- [ ] **≥4** dated entries on the history timeline
  (1983 Charles Walton patent → 2002 Sony+NXP+Nokia → 2003 ISO 18092
  → 2004 NFC Forum → 2010 Nexus S → 2014 Apple Pay → 2022 Tap to Pay
  on iPhone → 2024 EU DMA NFC opening → 2024–26 NFC-WLC, CCC 3.0)
- [ ] Full ISO 14443-3 anti-collision frame layout AND NDEF record header
  layout with bit widths
- [ ] State machine (mermaid `stateDiagram-v2`) for ISO 14443-3 Type A:
  IDLE → READY-A → ACTIVE → HALT → READY*-A → ACTIVE*
- [ ] A sequence diagram (mermaid `sequenceDiagram`) of an Apple Pay tap
  through the EMV Contactless flow (Card Emulation mode), AND a
  sequence diagram of a phone reading a Type 2 NDEF tag (R/W mode)
- [ ] **≥5** named real-world deployments with org names, scale numbers,
  and dates (Apple Pay launch and rollout, Google Wallet,
  Samsung Pay, EMV Contactless on every Visa/Mastercard,
  Transport for London Oyster + contactless EMV, Hong Kong Octopus,
  Japan IC cards (Suica/Pasmo), eMRTD passports, corporate
  access cards (HID iCLASS, Mifare DESFire), Tap to Pay on iPhone)
- [ ] **≥3** pioneer / key-contributor candidates with full bios
  (Franz Amtmann, Philippe Maugars, Henri Ardevol, Tetsuro Shimizu /
  FeliCa team, Charles Walton (RFID predecessor, 1983 patent for
  passive RFID))
- [ ] **≥3** key specifications with version, year, status, and
  notable-section pointers (ISO/IEC 18092 / ECMA-340; ISO/IEC 14443;
  NFC Forum Tag Type spec set; NDEF spec; EMV Contactless spec)
- [ ] **≥2** named failure incidents with year, org, root cause, and
  citation (Mifare Classic Crypto1 break 2007–2008 — Karsten Nohl,
  Henryk Plötz, Karsten Schaefer; OV-chipkaart compromise in
  Netherlands; HCE relay attacks; NFCGate research; Visa/Mastercard
  contactless tap-and-go bypasses; 2019 PIN-bypass attack on Visa
  contactless by Galloway/Yunusov)
- [ ] **≥3** fun facts / anecdotes with sources (the runic / Viking
  origins are absent here but: the Charles Walton "father of RFID"
  story; Apple's holdout against Android-style NFC sharing until 2024
  EU DMA; the FeliCa Octopus card preceding NFC by years; the iPhone
  not supporting FeliCa until iPhone 7 Japan; the Android Beam death;
  the WaveBubble jammer history)
- [ ] **≥3** practical pitfalls with concrete tuning advice (antenna
  tuning at 13.56 MHz, RF field collisions in card-on-card stacks,
  metal-backed phone cases blocking NFC, HCE AID routing
  conflicts in Android, the "switch off NFC" battery-drain myth,
  PCD vs PICC framing differences)
- [ ] **≥3** Wireshark / capture-tool filter examples
  (Proxmark3 commands, libnfc snoop, NFCGate captures, Android
  `dumpsys nfc` and `adb logcat -s NfcAdapter`, the Wireshark
  `nfc.llcp` dissector for LLCP)
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources
  (iOS 17.4 EU DMA NFC opening — March 2024; CCC Digital Key 3.0
  rollouts in BMW iX, Mercedes EQS, Hyundai/Kia 2024–25; NFC-WLC
  wireless charging spec ratified; Tap to Pay on iPhone country
  expansion 2024–25; Aliro home-access standard publication 2024;
  NFC Forum Multi-purpose Tag spec progress)
- [ ] **≥1** 2025–2026 frontier development (Aliro, CCC Digital Key 3.0,
  NFC-WLC, the EU-opened NFC ecosystem for third-party wallets,
  passport-as-phone digital travel credentials per ICAO DTC spec)
- [ ] **Appendix A** — Encyclopedia-ready structured-data extracts
- [ ] **Appendix B** — Simulator step list (Apple Pay tap or NDEF
  tag-read flow)
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Every concept a reader needs to understand *before* NFC makes sense.
For each: a one- or two-sentence definition and a link to a clear
authoritative explainer. Cover: ISM band (13.56 MHz at NFC),
inductive coupling vs radiative coupling, near-field vs far-field RF,
load modulation (how a passive tag "talks back" by modulating the
reader's field), PCD (proximity coupling device) vs PICC (proximity
integrated circuit card), the ISO 14443-3 anti-collision tree,
Type A (Miller / Manchester) vs Type B (NRZ-L / BPSK), Type F
(FeliCa, Manchester-encoded), UID / NUID / RID, ATQA/SAK
handshake, NDEF (NFC Data Exchange Format), TLV encoding,
APDU (Application Protocol Data Unit, ISO 7816-4), AID
(Application Identifier), SE (Secure Element), eSE (embedded SE),
HCE (Host Card Emulation), TSM (Trusted Service Manager),
tokenisation (network token vs PAN), LLCP, SNEP, the four
operating modes (R/W, Card Emulation, P2P, plus the newer
Wireless Charging mode NFC-WLC).

## History and story

The origin of NFC sits at the intersection of three traditions:
**RFID** (Charles Walton's 1983 patent and the subsequent industrial
RFID market), **smart cards** (the ISO/IEC 7810/7816 family from the
1980s, including the iconic Bull CP8 chip), and **transit cards**
(Sony's FeliCa starting with the JR East Suica pilot in 1997 and
public launch in 2001; the Hong Kong Octopus card from 1997).

The 2002 Sony+NXP (then Philips)+Nokia partnership formalised NFC as a
distinct technology family. ISO/IEC 18092 (NFCIP-1) was published in
2003. The NFC Forum was founded in 2004 by Sony, Nokia, and Philips,
later joined by Microsoft, Samsung, MasterCard, Visa, Google, Apple,
and many others.

NFC then had a long limbo. It was on Nokia phones from 2006 (Nokia 6131).
Android shipped NFC support on the Nexus S in December 2010. Google
Wallet launched in 2011 — and was a commercial failure, blocked by
US carriers (the ISIS/Softcard rival) and stymied by SE-access
politics. NFC was a "solution in search of a problem" — until Apple.

**September 9, 2014, Apple Pay launches on iPhone 6.** Apple's HCE-free
secure-enclave architecture, combined with tokenisation negotiated
with Visa, Mastercard, and the major US banks, finally cracked the
contactless payment market open. EMV Contactless adoption surged. By
2019 contactless was the default in the UK, France, Australia, much of
Asia. COVID-19 accelerated it further in 2020–2021 by making "touch
nothing" desirable.

Other 2010s–2020s milestones to cover:

- 2013 — Android Beam debuts; will be killed in Android 10 (2019)
- 2015 — Android Pay launches (Google's HCE-based response)
- 2016 — iPhone 7 Japan adds FeliCa support; Apple Pay Suica launches
- 2017 — ICAO Doc 9303 8th edition codifies NFC eMRTD passport access
- 2018 — Google Pay rebrand
- 2020 — Android Beam removed; Google Pay becomes Google Pay Send
- 2022 — Google Wallet rebrand (third time); Tap to Pay on iPhone launches
- 2024 — EU Digital Markets Act forces Apple to open NFC chip to
  third-party wallets in EEA (iOS 17.4, March 2024)
- 2024 — Aliro home-access standard published by Connectivity Standards
  Alliance with Apple, Samsung, Google participation
- 2024–25 — CCC Digital Key 3.0 rolls out in BMW, Mercedes, Hyundai/Kia
  vehicles (NFC for fast-tap + UWB for distance ranging)

Version history table for the NFC Forum specs (Tag Types 1–5, NDEF,
LLCP, SNEP, CH, NFC-WLC) with publication dates.

## How it actually works

Cover the three modes — Reader/Writer, Card Emulation, Peer-to-Peer —
in parallel subsections because they share the physical layer
(13.56 MHz inductive coupling, ISO 14443-3 anti-collision) but diverge
above it.

For the physical layer: 13.56 MHz carrier (the same ISM band as RFID),
inductive coupling at <10 cm range, the reader generates a magnetic
field, the tag/peer either generates its own field (active mode) or
modulates the load on the reader's field (passive mode), Miller / NRZ /
Manchester encoding by mode and bitrate (106 / 212 / 424 kbit/s typical,
up to 6.78 Mbit/s in NFC-V).

For ISO 14443-3 (the layer beneath everything): the WUPA/REQA polling
loop, the cascade-level anti-collision tree (UID-CL1, UID-CL2 for
longer UIDs), the ATQA → SAK handshake, the RATS → ATS handshake for
ISO 14443-4 compliant cards.

For Reader/Writer mode: the four NFC Forum Tag Types (T1 = Topaz,
T2 = Mifare Ultralight, T3 = FeliCa Lite, T4 = ISO 14443-4 compliant
including DESFire, T5 = ISO 15693), the NDEF format on each, and the
typical "phone reads a poster URL" flow.

For Card Emulation mode: two sub-architectures
  - **Secure Element (SE) routing** — Apple Pay's architecture; the
    embedded SE/eSE in the device holds tokenised card data and
    handles ISO 7816 APDUs directly without involving the application
    processor. This is also the architecture for SIM-based SWP card
    emulation on older phones.
  - **Host Card Emulation (HCE)** — Android 4.4+ architecture (2013).
    APDUs route from the NFC controller up to a registered Android
    application by AID, allowing software-only card emulation. The
    tradeoffs vs SE: weaker security guarantees, but no carrier or
    TSM gatekeeping.

For Peer-to-Peer mode: ISO 18092 NFCIP-1 active vs passive mode,
the LLCP framing layer that runs on top, SNEP (Simple NDEF Exchange
Protocol) at layer 7, the practical use cases (Android Beam,
business-card swap apps), and the reasons it died (Bluetooth/Wi-Fi
direct were almost always better for the payloads people actually
wanted to share).

Provide **three** diagrams in mermaid-compatible text:
1. Sequence diagram of an Apple Pay EMV Contactless tap
   (phone → terminal: SELECT PPSE → SELECT AID → GET PROCESSING OPTIONS
   → READ RECORDS → GENERATE AC → cryptogram verification)
2. State diagram of ISO 14443-3 Type A anti-collision and activation
3. Tabular bit layouts for: ISO 14443-3 anti-collision frame,
   NDEF record header, and an ISO 7816-4 APDU (CLA INS P1 P2 Lc Data Le)

## Deep connections to other protocols

Cover each of the related protocols listed in the topic. Pay particular
attention to:

- **Bluetooth / BLE** — NFC Forum Connection Handover spec: the phone
  taps a Bluetooth speaker to trigger BLE pairing. Walk through the
  Handover Request / Select NDEF message exchange.
- **Wi-Fi** — same story for Wi-Fi Protected Setup. Newer story:
  Aliro and Matter onboarding both use NFC as one alternative to
  QR codes for commissioning.
- **TLS / EMV** — EMV Contactless is *not* just plaintext APDUs.
  Walk through the cryptographic envelope (DDA, fDDA, the cryptogram
  generated by the card's offline RSA/ECC keys), the equivalence
  with the TLS security model, and why "NFC is unencrypted" is a
  misleading shorthand.
- **UWB** — CCC Digital Key 3.0: NFC for fast-tap unlock when you
  physically touch the door handle, UWB for ranged unlock as you
  approach the car (15–30 cm precision). The NFC-bootstraps-UWB
  pattern.
- **Matter / Thread** — NFC commissioning as an alternative to the
  Matter QR code (Matter 1.3+).
- **ICAO eMRTD / passport** — every passport issued since ~2007 has
  an embedded ISO 14443 chip; the Basic Access Control and PACE
  protocols on top of NFC.
- **WebNFC** — the W3C Web NFC API (Chrome 89, 2021) lets web pages
  read/write NDEF tags on Android.

## Real-world deployment

Major implementations — named stacks (libnfc on Linux, Android's
NfcAdapter / HostApduService APIs, Apple's CoreNFC framework on iOS 11+,
the embedded NFC controllers from NXP (PN5xx series), STMicroelectronics
(ST21NFC), Broadcom (BCM20203/20791), and Samsung's NFC stack on
Galaxy). Named real-world deployments with scale:

- Apple Pay — launched on iPhone 6 (Sep 2014); by 2024 active in ~80
  countries; ~507 million users (as of 2022 Apple disclosure)
- Google Wallet / Pay — relaunched 2022; ~150 million users (2023)
- Samsung Pay — including the unique LoopPay MST hack for non-NFC
  terminals (2015–2020)
- EMV Contactless — every Visa / Mastercard / Amex contactless card;
  >75% of in-person card transactions in the UK by 2023
- Transport for London — contactless EMV launched 2014; Oyster cards
  use Mifare; combined system processes >2 billion taps/year
- Hong Kong Octopus — launched 1997 (pre-NFC, on FeliCa); the
  highest-density transit-card deployment globally
- Japan IC cards (Suica, Pasmo, ICOCA, etc.) — ~150 million cards
  in circulation; Apple Pay Suica launched October 2016
- ICAO eMRTD passports — every modern passport (~1 billion in
  circulation); ICAO Doc 9303 mandates NFC ISO 14443
- Mifare Classic / DESFire access cards — corporate buildings,
  hotels, universities worldwide; Mifare claims >10 billion chips shipped
- Tap to Pay on iPhone — launched US Feb 2022; expanded to ~20 countries
  by 2025; turns any iPhone XS+ into an EMV acceptance terminal

## Failure modes and famous incidents

The famous incidents to cover (each as setup → mistake → consequence →
resolution):

- **Mifare Classic Crypto1 break (2007–2008)** — Karsten Nohl, Henryk
  Plötz, Karsten Schaefer. 24c3 talk at CCC. Cost the OV-chipkaart in
  the Netherlands an emergency hardware migration; affected Oyster
  cards in London, Charlie cards in Boston, the Octopus cards' Mifare
  pilot pre-FeliCa. The proprietary Crypto1 cipher was reverse-engineered
  by die-photograph + cryptanalysis. **CVE references where applicable.**
- **HCE relay attacks / NFCGate** — Renaud Lifchitz, the NFCGate
  research project (TU Darmstadt). The pattern: an attacker bridges
  NFC traffic over IP, replaying APDUs from a victim's phone to a
  distant payment terminal.
- **2019 Visa contactless PIN bypass** — Galloway & Yunusov (Positive
  Technologies, Black Hat Europe 2019). Manipulated the Card
  Transaction Qualifiers field to skip the cardholder-verification
  PIN step on transactions above the contactless limit.
- **Mifare DESFire EV1 side-channel attacks** — David Oswald and
  Christof Paar (2011) at Ruhr-University Bochum; later DESFire
  EV2/EV3 closed the holes.
- **Tesla phone-as-key NFC card relay** — NCC Group / Martin Herfurt
  related research (2022).
- **The 2014 Apple Pay "rollout fraud" wave** — banks' provisioning
  flows (the "yellow path" verification) were exploited to provision
  stolen card data to attacker iPhones; lessons in why issuer-side
  identity verification matters as much as the NFC protocol itself.

## Fun facts and anecdotes

- **Charles Walton's 1983 RFID patent** and the long chain to NFC.
  Walton received $3 million in royalties over the patent's life and
  died in 2011, the same year Google Wallet launched.
- **The FeliCa Octopus story** — the Octopus card pre-dates the NFC
  Forum by 7 years and still uses FeliCa under iOS / Android NFC, not
  ISO 14443. Most Westerners assume "NFC = ISO 14443" because Type F
  is rarely seen outside Asia.
- **The Apple-doesn't-support-FeliCa-until-2016 story** — the iPhone 7
  Japan-only model added FeliCa specifically for Suica. The 2014
  iPhone 6 lacked it. Travelers who wanted to use Apple Pay on Tokyo
  trains had to wait two years.
- **Android Beam's quiet funeral** — quietly removed from Android 10
  in 2019, replaced by Nearby Share. The peer-to-peer NFC mode
  effectively died.
- **The EU DMA NFC ruling** (March 2024) — Apple's iOS 17.4 in the
  EEA opened the NFC chip to third-party wallet apps for the first
  time, ending a decade-long monopoly. Norway, Iceland, Liechtenstein
  also got the change.
- **The WaveBubble** — Limor Fried's MIT thesis project from 2007,
  a portable RF jammer that could block NFC fields; influenced later
  security research.
- **The runic logo absence** — unlike Bluetooth's Harald Bluetooth
  runes, NFC's logo is the unassuming "N" with three signal arcs.

## Practical wisdom

What an engineer actually needs to know:

- **Antenna tuning at 13.56 MHz** — coupling efficiency falls off
  fast with antenna mismatch; the metal-backed phone case problem;
  the "active load modulation" technique used in modern smartphones
  to overcome small-antenna disadvantages
- **HCE AID routing on Android** — `apduservice.xml` declarations,
  the AID conflict resolution dialog, preferred-service registration
- **Apple's NFC opening (iOS 17.4 EEA)** — `CoreNFC` for tag reading
  has been available since iOS 11 (2017); the 17.4 change is about
  **Host Card Emulation** via the new APIs for wallet providers
- **`adb logcat -s NfcAdapter`** and `dumpsys nfc` for Android NFC
  debugging
- **Proxmark3** — the Swiss-army-knife of NFC debugging; legal in
  most jurisdictions for research; essential for understanding
  Type A vs Type B vs FeliCa frames
- **The "switch off NFC saves battery" myth** — NFC sleep current
  is in single-digit microamps; the controller wakes only when a
  field is detected
- **Multi-AID applications** — how to design a wallet that handles
  multiple card brands without AID conflicts
- **EMV Contactless flow tuning** — the difference between
  fast-tap (no online connection, cryptogram only) vs full
  online auth (issuer responds with ARPC); failure to design for
  fast-tap is a common cause of transit-system delays

## Pioneers and key contributors

- **Franz Amtmann** (Austria, NXP / formerly Philips Semiconductors)
  — co-recipient of the 2015 European Inventor Award for NFC chip
  development at Philips/NXP. Shared the award with Philippe Maugars.
- **Philippe Maugars** (France, NXP / STMicroelectronics) —
  co-recipient of the 2015 European Inventor Award; led NFC
  development on the silicon side.
- **Tetsuro Shimizu** (Japan, Sony) — FeliCa lead; the Asian
  transit-card alternative that pre-dates NFC and is still bundled
  inside it as Type F. Suica, Pasmo, ICOCA, Octopus all run FeliCa.
- **Henri Ardevol** (NFC Forum chair, 2010s; Vivotech / Cisco
  background) — drove NFC Forum standardisation through the
  pre-Apple-Pay desert years.
- **Charles Walton** (1921–2011) — "father of RFID"; 1983 US patent
  #4,384,288 for portable radio frequency emitting identifier; the
  technological grandparent of NFC.
- A 2020s candidate — someone driving Tap to Pay on iPhone /
  Aliro / CCC Digital Key 3.0 at Apple or NXP or the CSA.

## Learning resources (current as of 2026)

For each resource: a URL, a one-sentence description, a level
(intro / intermediate / advanced), and the year it was last updated
or published. Highlight any resource that is current as of 2024–2026.
Cover:

- **Authoritative specifications** — ISO/IEC 18092:2013 (NFCIP-1),
  ISO/IEC 21481:2012 (NFCIP-2), ISO/IEC 14443 parts 1–4 (proximity
  cards), ISO/IEC 15693, ECMA-340, NFC Forum Tag Type specs T1–T5,
  NDEF spec, LLCP spec, SNEP spec, Connection Handover spec,
  NFC-WLC Wireless Charging spec, EMV Contactless Specifications
  (Books 1–4, latest 2023+).
- **Books** — *NFC Application Development for Android* (Vedat Coskun
  et al., 2013), *Near Field Communication with Android Cookbook*
  (Vitor Subtil, 2014), the NXP "NTAG" application notes (recently
  updated), Klaus Finkenzeller's *RFID Handbook* (3rd ed. 2010,
  ostensibly being updated).
- **Academic papers** — Nohl/Plötz Mifare Classic break, NFCGate
  papers, ICAO PACE / BAC protocol analyses (Buchanan et al.),
  the Visa PIN bypass paper (Galloway/Yunusov 2019).
- **Long-form engineering blog posts** — Apple Developer's CoreNFC
  documentation and Tap to Pay on iPhone guides, Google's Android
  HCE developer guide, NXP application notes, Stripe's Tap to Pay
  engineering blog, Block (Square) engineering blog on Tap to Pay
  for Android.
- **YouTube videos** — Karsten Nohl's CCC talks (24c3 2007 et seq.),
  Apple Pay technical deep-dives at WWDC, the NXP NFC YouTube channel.
- **Podcasts** — *Smart Cards Weekly* (Avisian), *Embedded.fm* episodes
  on NFC, the *NFC Forum Podcast* if it exists.
- **Free courses** — the NXP NFC training portal, the Android
  CodeLabs HCE tutorial.
- **Hands-on tools** — Proxmark3 (and its open-source firmware fork
  Iceman), libnfc, NFC Tools (Android app), NFC TagInfo by NXP,
  TagWriter, NFCGate, WebNFC playground in Chrome on Android.

## Where things are heading (2025–2026 frontier)

The major NFC frontiers right now:

- **EU Digital Markets Act NFC opening** (March 2024, iOS 17.4) —
  third-party wallet apps in the EEA can now do HCE on iPhone. Track
  the rollout: how many third-party wallets actually shipped? What
  did the API charges look like? Does it extend beyond EEA?
- **Aliro** — Connectivity Standards Alliance home-access standard
  published 2024. Combines NFC (fast tap), BLE, UWB. Apple Home Key
  spec is the proprietary precursor; Aliro is the multi-vendor open
  standard.
- **CCC Digital Key 3.0** — BMW, Mercedes, Hyundai/Kia, Volkswagen
  rollouts in 2024–26 vehicles. NFC fast-tap + UWB ranging + BLE
  bootstrap.
- **NFC-WLC (NFC Wireless Charging)** — NFC Forum spec ratified 2020,
  industrial rollout in 2024–26. Up to 1W charging over the NFC
  field for tiny IoT devices.
- **NFC Forum Multi-purpose Tag (MPT)** — a unified Tag Type that
  can act as different Tag Types depending on the reader.
- **ICAO Digital Travel Credentials (DTC-1, DTC-2)** — the
  phone-as-passport rollouts being piloted at airports in 2024–26.
- **The slow death of the carrier-SIM SE** — the move to embedded
  SE (eSE) and HCE has marginalised carrier-controlled secure
  elements.

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook (suggested: "September 9, 2014. Tim Cook
  on stage holds up an iPhone 6 and taps it against a card reader.
  The contactless-payment industry, sleepy for a decade, wakes up.")
- A striking statistic that captures importance (suggested:
  "There are more NFC-enabled devices in the world than there are
  Wi-Fi routers — every modern smartphone, every contactless credit
  card, every transit card, every electronic passport.")
- A "pause and think" moment (suggested: "Your passport is an NFC
  device. The same protocol that lets you tap-to-pay is the protocol
  that border agents use to verify your identity.")
- A failure-story arc — the Mifare Classic Crypto1 break works
  beautifully as a clean dramatic sequence: setup (proprietary cipher,
  millions of deployed cards), mistake (security through obscurity),
  consequence (full key recovery in seconds, OV-chipkaart compromise),
  resolution (Mifare Plus, DESFire EV1+, eventual migration to AES).

---

# Appendix A — Encyclopedia-ready structured-data extracts

Provide the following bullets in exactly these shapes — they will be
transcribed into TypeScript records for the encyclopedia. Keep prose
tight: a few sentences per item, not paragraphs.

### A.1 Protocol record candidate

```
id: nfc
name: Near Field Communication
abbreviation: NFC
categoryId: wireless
port: none
year: 2003
rfc: ISO/IEC 18092:2013 (NFCIP-1); ISO/IEC 14443; NFC Forum specs
standardsBody: industry-consortium  (NFC Forum / ISO / ECMA)
oneLiner: <single sentence — the elevator pitch>
overview: <2–3 paragraphs of polished prose covering all three modes>
howItWorks: 4–6 steps as { title, description }
useCases: 5–7 bullet items
performance: { latency, throughput, overhead }
connections: <existing protocol IDs: bluetooth, wifi, tls, uwb, matter-thread>
links: { wikipedia, official (nfc-forum.org), spec }
image: <Wikimedia URL of NFC logo or 13.56 MHz coupling diagram>
```

### A.2 Header / wire-format layout

Provide:
- ISO 14443-3 Type A anti-collision frame (WUPA, ATQA, UID-CL,
  SAK fields)
- NDEF record header (MB, ME, CF, SR, IL, TNF, TYPE LENGTH,
  PAYLOAD LENGTH, ID LENGTH, TYPE, ID, PAYLOAD)
- ISO 7816-4 APDU (CLA, INS, P1, P2, Lc, Data, Le, SW1, SW2)

### A.3 State machine

ISO 14443-3 Type A activation state machine in mermaid
`stateDiagram-v2`: POWER_OFF → IDLE → READY-A (after WUPA/REQA) →
ACTIVE (after SELECT) → HALT (after HLTA) → READY*-A (after WUPA
when halted) → ACTIVE*.

### A.4 Code example

- `python` — using `nfcpy` to read a Type 2 NDEF tag and parse the
  records
- `javascript` — Web NFC API on Chrome Android: NDEFReader scan
  and NDEFRecord parsing
- `cli` — `nfc-poll`, `nfc-list`, `nfc-mfultralight` from libnfc;
  Proxmark3 commands (`hf 14a info`, `hf mf rdsc`)
- `wire` — sectioned dump: ISO 14443-3 anti-collision; NDEF record
  bytes; EMV PPSE → AID → GET PROCESSING OPTIONS APDU exchange

### A.5 Recent changes (dated, 2024–2026)

≥5 dated entries with sources. iOS 17.4 EU DMA NFC opening
(March 2024), CCC Digital Key 3.0 rollouts in BMW/Mercedes/Hyundai
(2024–25), Aliro publication (2024), Tap to Pay on iPhone country
expansion (2024–25), NFC-WLC industrial rollout (2024–26), NFC Forum
MPT spec progress, ICAO DTC airport pilots.

### A.6 Real-world deployments

≥5 named with org names, scale numbers, dates: Apple Pay (507M users
2022), Google Wallet (150M users 2023), EMV Contactless (>75% UK
in-person card transactions 2023), TfL contactless (>2B taps/year),
Hong Kong Octopus (1997 launch, FeliCa), Japan Suica/Pasmo (~150M
cards), ICAO eMRTD passports (~1B in circulation), Mifare access
cards (>10B chips shipped), Tap to Pay on iPhone (Feb 2022 US launch).

### A.7 Fun facts ≥3

Charles Walton "father of RFID", FeliCa Octopus pre-dating NFC Forum
by 7 years, iPhone-doesn't-do-FeliCa-until-iPhone-7-Japan story,
Android Beam's quiet funeral, the WaveBubble jammer history.

### A.8 Practical wisdom (sysctls/pitfalls/tools)

```
practicalWisdom:
  sysctls:
    - { key: "Android nfc.preferredService", description: "..." }
  pitfalls:
    - { title: "Metal-backed phone cases block NFC", text: "..." }
    - { title: "HCE AID routing conflicts", text: "..." }
    - { title: "EMV fast-tap vs online auth confusion", text: "..." }
  tools:
    - { name: "Proxmark3", url: ..., description: ... }
    - { name: "NFC TagInfo (NXP)", url: ..., description: ... }
    - { name: "nfcpy", url: ..., description: ... }
  notes:
    - { title: "Switch-off-NFC-saves-battery myth", text: "..." }
```

### A.9 Wireshark hints ≥3

- `nfc.llcp` Wireshark dissector for LLCP captures from NFCGate
- `adb logcat -s NfcAdapter NfcService NfcA NfcDispatcher` on Android
- Proxmark3 `hf 14a sniff` then `hf 14a list` for trace replay
- Apple NFC sysdiagnose log analysis

### A.10 Learn-more lists

See "Learning resources" section above. Provide structured records.

### A.11 Pioneer candidates ≥3

Including Franz Amtmann + Philippe Maugars with full bios, plus
Charles Walton (RFID predecessor) and Tetsuro Shimizu (FeliCa).

### A.12 Spec records ≥3

ISO/IEC 18092 (2003 original, 2013 revision), ISO/IEC 14443 parts 1–4,
NFC Forum NDEF spec, NFC Forum Tag Type T1–T5 specs, EMV Contactless
Book C-2, ICAO Doc 9303 Part 11 (PACE), Aliro v1.0 (2024).

### A.13 New glossary concepts

≥10 — inductive coupling, load modulation, ISO 14443 Type A/B,
NDEF, NDEF record, Tag Types T1–T5, LLCP, SNEP, HCE, APDU, AID,
SE, eSE, TSM, tokenisation, FeliCa, ATQA/SAK, PCD, PICC, anti-collision.

### A.14 Frontier entry

CCC Digital Key 3.0 and/or Aliro and/or Tap to Pay on iPhone as
separate frontier entries with metrics and sources. EU DMA opening
is also a frontier-worthy entry on its own.

### A.15 Journey suggestion

"Tap and pay" — a 4–5 step journey covering: phone wakes NFC →
field detection → EMV PPSE/AID selection → cryptogram exchange →
issuer auth. OR: "Your passport is an NFC chip" walking through
BAC/PACE.

### A.16 Comparison pair

"NFC vs Bluetooth pairing" and "NFC vs QR code commissioning"
(both relevant for Matter / Aliro onboarding). Also "ISO 14443
vs FeliCa" (the Type A/B vs Type F divide).

### A.17 History arc — long-form story sections

3–6 mixed `StorySection` entries. Strong candidates:
- Narrative: "September 9, 2014" (Apple Pay launch)
- Timeline: 1983 (Walton patent) → 1997 (Octopus / Suica pilots) →
  2002 (Sony+NXP+Nokia) → 2004 (NFC Forum) → 2010 (Nexus S) →
  2014 (Apple Pay) → 2024 (EU DMA opening)
- Callout: "The Mifare Crypto1 break that crashed Dutch transit"
- Image: Wikimedia of Charles Walton's 1983 patent, or the Octopus
  card, or the Suica penguin
- Pioneers section: Amtmann + Maugars + Shimizu mini-bios

### A.18 Famous-incident references + new outage proposals

References to existing outage IDs (likely none in registry) + new
proposals. Strong candidates:
- Mifare Classic Crypto1 break (2008) — security category
- 2019 Visa contactless PIN bypass (Galloway/Yunusov) — security
- 2014 Apple Pay rollout fraud wave — security / human-error
- DESFire EV1 side-channel attacks (Oswald/Paar 2011)

### A.19 Embedded media

Highest-signal: a Karsten Nohl CCC talk on Mifare; a Tap to Pay on
iPhone WWDC session; the NXP NFC YouTube channel; Computerphile or
similar NFC explainer; a WebNFC playground demo.

### A.20 Prerequisites

```
concepts: [packet, frame, mac-address, modulation, ism-band, encryption, handshake]
protocols: [bluetooth, wifi, tls]
```

### A.21 Name highlight

```
"[N]ear [F]ield [C]ommunication"  (NFC)
```

### A.22 Diagram-definitions entry

Annotated sequence diagram for an Apple Pay EMV Contactless tap. 10–14
step annotations covering: field detection, ATQA/SAK anti-collision,
PPSE select, AID select, GET PROCESSING OPTIONS, READ RECORD x N,
GENERATE AC, cryptogram return, terminal verification. Each step
explains *why* the reader is seeing it, not just *what*.

### A.23 Category placement

**Place in the existing `wireless` category** (already used for
Wi-Fi, Bluetooth, Cellular). The category covers all over-the-air
short/medium/long-range protocols. NFC is the shortest-range member
of the family (<10 cm).

```
id: wireless  (existing)
```

If a deeper subcategorisation is wanted, propose `wireless-pan`
(personal-area / proximity, would also house Bluetooth, UWB) versus
`wireless-lan` (Wi-Fi) versus `wireless-wan` (Cellular). But the
flat `wireless` is fine for now.

---

# Appendix B — Simulator step list

Author **two** simulations:

1. **NFC tag read (R/W mode)** — phone reads a Type 2 NDEF tag at a
   transit poster URL.
2. **NFC card emulation (Apple Pay / EMV Contactless)** — phone taps
   a payment terminal and completes a tokenised EMV transaction.

For each, provide 6–10 steps in the shape:

```
title: "NFC Tap: EMV Contactless Payment"
description: "Watch a phone act as a tokenised EMV card and complete a contactless payment."
actors:
  - { id: "phone", label: "Phone (Card)", icon: "phone", position: "left" }
  - { id: "terminal", label: "Payment Terminal (Reader)", icon: "terminal", position: "right" }
userInputs:
  - { id: "amount", label: "Transaction amount", type: "number", defaultValue: "25.00" }
  - { id: "ctlLimit", label: "Contactless limit", type: "number", defaultValue: "100.00" }
steps:
  - id: field
    label: "RF Field On"
    description: "Terminal energises the 13.56 MHz field; phone NFC controller wakes."
    fromActor: terminal
    toActor: phone
    duration: 800
    highlight: [carrier]
    layers:
      - PHY: { frequency: "13.56 MHz", coupling: "inductive" }
  - id: anticoll
    label: "Anti-Collision (Type A)"
    description: "WUPA → ATQA → SELECT cascade → SAK."
    fromActor: terminal
    toActor: phone
    duration: 1000
    highlight: [ATQA, UID, SAK]
    layers:
      - PHY: { channel: "13.56 MHz" }
      - "ISO 14443-3": { WUPA: "0x52", ATQA: "0x0004", UID: "04 11 22 33", SAK: "0x20" }
  - id: rats
    label: "RATS / ATS"
    description: "ISO 14443-4 activation: max frame size, FWI."
    ...
  - id: ppse
    label: "SELECT PPSE"
    description: "EMV: SELECT 2PAY.SYS.DDF01 to discover supported AIDs."
    ...
  - id: aid
    label: "SELECT AID"
    description: "Terminal selects the chosen Visa/Mastercard/etc AID."
    ...
  - id: gpo
    label: "GET PROCESSING OPTIONS"
    description: "Card returns AIP + AFL describing which records to read."
    ...
  - id: rr
    label: "READ RECORD"
    description: "Terminal reads the records identified by AFL."
    ...
  - id: gac
    label: "GENERATE AC"
    description: "Terminal asks for a cryptogram (TC for offline, ARQC for online)."
    ...
  - id: cryptogram
    label: "Cryptogram returned"
    description: "Card returns the cryptogram; terminal forwards online (ARQC) or accepts (TC)."
    ...
  - id: done
    label: "Transaction approved"
    description: "Terminal beeps; phone shows confirmation."
    ...
```

The layers should reflect the real protocol stack — PHY → ISO 14443-3
→ ISO 14443-4 → ISO 7816-4 APDU → EMV.

For the Tag Read sim, the stack is PHY → ISO 14443-3 → ISO 14443-4
(or NFC-A short frame) → NDEF.

---

# Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations. Mark any
unresolved claim `[needs source]` only after trying at least three search
variations.

==========
