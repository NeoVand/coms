---
id: nfc
type: protocol
name: Near Field Communication
abbreviation: NFC
etymology: "[N]ear [F]ield [C]ommunication — magnetic-near-field, ≤10 cm, communication; at 13.56 MHz λ/2π is about 3.5 m, and below that radius the magnetic component dominates"
category: wireless
year: 2003
rfc: ISO/IEC 18092 (ECMA-340)
standards_body: nfc-forum + iso/iec + emvco + icao + csa + ccc
podcast_target_minutes: 22
related_book_chapters:
  - wireless/nfc
related_protocols: [bluetooth, wifi, tls, cellular, uwb]
related_pioneers: [preeti-ohri-khemani, charles-walton, jim-kardach, karsten-nohl, henryk-plotz]
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NFC_logo.svg/330px-NFC_logo.svg.png
    caption: The NFC Forum "N-Mark" — a stylised lowercase n adopted around 2010 to replace the older "ContactLess" branding. Where Bluetooth's logo is a bind-rune of King Harald Bluetooth's initials in Younger Futhark, NFC simply turned the first letter of its name into a single character.
    credit: Image — Wikimedia Commons / NFC Forum trademark
visual_cues:
  - "A side-by-side range diagram. On the left, an NFC reader and card at 4 cm with a tight magnetic-field loop drawn in blue, labelled 1/r³ falloff. On the right, a Bluetooth phone and speaker at 10 m with radiative wavefronts in orange, labelled 1/r² falloff. Annotation: 13.56 MHz, λ/2π ≈ 3.5 m — anything closer is near-field."
  - "An ISO 14443-3 Type A activation ladder. Vertical timeline from terminal (PCD) on the left to phone (PICC) on the right. Eight rungs: REQA 0x26, ATQA 0x04 0x00, SEL 0x93 + NVB 0x20, UID-CL1 04 1A 2B 3C BCC 4D, SEL 0x93 + NVB 0x70, SAK 0x28 (bit 6 set), RATS E0 80, ATS 06 75 33 81 02 80. Total elapsed time labelled at right edge: about 50 ms."
  - "An EMV tap APDU sequence. Numbered arrows between POS terminal and iPhone eSE: SELECT PPSE 2PAY.SYS.DDF01, FCI lists Mastercard A0000000041010, SELECT AID, FCI Template plus PDOL, GET PROCESSING OPTIONS with PDOL data, AIP plus AFL, READ RECORD x3 returning DPAN and certificate chain, GENERATE AC with CDOL1, response carries CID 0x80 ARQC plus ATC plus 8-byte cryptogram. Label: 300–800 ms total."
  - "An NDEF record header dissected. Byte 0 split into bit-fields with arrows: bit 7 MB, bit 6 ME, bit 5 CF, bit 4 SR, bit 3 IL, bits 2-0 TNF. Below it the example URI record bytes: D1 01 0F 55 03 65 78 61 6D 70 6C 65 2E 63 6F 6D 2F 69 6E 66 6F. Annotation: TNF 1 is Well-Known, type byte 0x55 is U for URI, prefix 0x03 expands to https://."
  - "A four-mode flower diagram. Centre node: NFC at 13.56 MHz. Four petals: Reader/Writer (phone reads NTAG21x poster), Card Emulation (phone emulates Mastercard via eSE or HCE), Peer-to-Peer (greyed out, labelled deprecated 2019), Wireless Charging (1 W to a smart ring). Each petal annotated with a real product."
  - "A timeline of the 31-year arc. 1973 Walton's transponder patent. 1994 MIFARE Classic ships. 1997 Hong Kong Octopus on FeliCa. 2001 Suica launches. 2003 ISO/IEC 18092 published. 2004 NFC Forum founded. 2007 Nohl and Plötz dismantle Crypto1 at 24C3 in Berlin. 2014 Apple Pay launches. 2024 EU forces iOS HCE open. 2026 Aliro 1.0 finalised. Each tick a single vertical bar; the 2014 tick highlighted in red."
---

# NFC — Near Field Communication

## In one breath

NFC is the 13.56 MHz inductively-coupled short-range protocol family that runs every contactless tap on Earth — Apple Pay, Suica, the Oyster card, every EMV plastic card, a billion electronic passports, hotel-room keys, BMW phone-as-key. The wire format has not changed in twenty years; every iteration since ISO/IEC 18092 in December 2003 has been at the certification, security, and application layer. By 2026 Apple Pay alone runs an estimated $7.6 trillion in annualised transaction volume, all riding the final 10 centimetres on a magnetic field defined three years before the iPhone existed.

## The pitch

On 9 September 2014, at the same Cupertino auditorium where Steve Jobs unveiled the Macintosh in 1984, Tim Cook held up a leather wallet and said his vision was to replace it. He started with payments. Eleven years later that wallet holds driver's licences, hotel keys, transit cards, employee badges, car keys, and ECDSA-signed building credentials — and every one of them runs on a 13.56 MHz inductive link patented by an IBM disk-drive engineer named Charles Walton in 1983. The story of NFC is the story of how a piece of physics from the seventies, a Hong Kong subway card from 1997, and a Sony-Philips-Nokia handshake in 2002 collided with one Apple keynote and quietly became the most-tapped wireless protocol in human commerce.

## How it actually works

NFC is not one protocol. It is a tightly-defined family that all share the same 13.56 MHz carrier and the same near-field coupling, but diverge at the modulation layer, the framing layer, and everything above. The spine is the simulator transcript on this page — eleven beats from the moment a phone enters the field to the moment the issuer returns an authorisation cryptogram.

The reader (the Proximity Coupling Device, or PCD) energises a loop antenna at 13.56 MHz plus or minus 7 kHz — the unlicensed ISM allocation that ISO 14443 grandfathered in. The passive card (the Proximity Integrated Circuit Card, or PICC) harvests power from the magnetic field and signals back by switching a load on its own antenna at an 847.5 kHz subcarrier — exactly 13.56 MHz divided by 16. The reader perceives the load switching as small amplitude and phase changes in its own resonant loop. That is why the magnetic field falls off as 1 over r-cubed instead of 1 over r-squared like a far-field radio wave: it is purely near-field, and below the wavelength-over-2-pi radius of about 3.5 metres, the magnetic component dominates. The ten-centimetre range is a feature, not a bug. You cannot lift a contactless card off someone from across the room.

There are three core flavours on the wire. NFC-A, the ISO 14443-A variant, uses 100 percent ASK modified-Miller from reader to card and OOK Manchester on the 847.5 kHz subcarrier from card to reader, base rate 106 kbit/s. This is what MIFARE, Mastercard, and most access cards speak. NFC-B, ISO 14443-B, swaps to 10 percent ASK NRZ-L outbound and BPSK on the subcarrier inbound — used by some EMV cards and many ICAO e-passports. NFC-F is FeliCa, JIS X 6319-4 — 212 or 424 kbit/s Manchester-coded ASK with no subcarrier, dominant in Japan transit and Hong Kong Octopus, present on iPhones from the iPhone 7 in September 2016. There is a fourth, NFC-V, ISO/IEC 15693 — longer range, lower rate, used in industrial tagging, library books, and the NFC tag in the Apple Vision Pro Light Seal.

A modern phone in card-emulation mode does not use passive load modulation at all. It uses active load modulation, generating a small reflected carrier from its NFC controller — and that is the entire reason an iPhone with a metal back can be read across a case where a plain plastic card cannot.

### Header at a glance

The fields you see on every Type A tap, in order:

- REQA — a 7-bit short frame, value 0x26, asking any IDLE Type A card in the field to wake up. WUPA, 0x52, also wakes cards that have been put to HALT.
- ATQA — two bytes back from the card. Byte 1 carries the proprietary and anti-collision bits; byte 2 says how big the UID is — 4, 7, or 10 bytes — and reserves the rest.
- SEL plus NVB — the bit-frame anti-collision exchange. SEL is 0x93 for cascade level 1, 0x95 for level 2, 0x97 for level 3. NVB's upper nibble is the byte count of what the reader is sending; its lower nibble is the bit count modulo 8. The whole point is to converge on the UID one bit at a time even when two cards are in the field.
- BCC — a single byte, the XOR of the four UID bytes for that cascade level. The check.
- SAK — one byte from the card. Bit 6 set means the card supports ISO 14443-4, so the reader will follow up with RATS and ATS. Bit 3 set means the UID is incomplete and the reader needs to do another cascade level.
- RATS and ATS — Request for Answer to Select, and the card's reply. The card uses ATS to declare its maximum frame size (the FSCI field), its frame waiting time (FWI), and whether it supports CID and NAD options. After ATS the conversation moves up to ISO 14443-4 blocks and, on top of that, ISO 7816-4 APDUs.
- The APDU header itself is four bytes — CLA, INS, P1, P2 — plus an optional Lc length, optional data, and an optional Le expected response length. SELECT is INS 0xA4. READ BINARY is 0xB0. GENERATE AC is 0xAE. Every response APDU ends in two status-word bytes; 0x9000 is success, 0x6985 is conditions not satisfied, 0x6A82 is file not found.

For NDEF — the data container that lives in tags and posters — the first byte is a status byte split across MB (Message Begin), ME (Message End), CF (Chunk Flag), SR (Short Record — 1-byte length instead of 4), IL (ID Length present), and a 3-bit TNF (Type Name Format). TNF 1 is Well-Known, TNF 2 is MIME media. The URI Well-Known record has a one-byte prefix code that expands to a common URL stem — 0x03 means https://, which saves eight bytes on a tag that may only have 48 bytes total.

### State machine in three sentences

ISO 14443-3 Type A defines five states per card — IDLE, READY, ACTIVE, HALT, and the starred READY-STAR and ACTIVE-STAR reached only via WUPA after a HALT. A card in IDLE answers REQA or WUPA and moves to READY; once anti-collision completes and the SAK is sent, it moves to ACTIVE; HLTA (0x50 0x00) sends it to HALT, where it ignores REQA but answers WUPA. The starred states exist so a reader can park one card in HALT, scan for another, then come back — which is how multi-card wallets work in the same field.

### Reliability and security mechanics

NFC's transport layer is short and dumb on purpose: 16-bit CRC_A per ISO 14443-3 frame, ISO 14443-4 I-blocks adding a couple of bytes of PCB and CID for sequencing, and aggressive frame-waiting timers. The interesting security lives in the layer above.

For payment, the answer is EMVCo Payment Tokenisation. The cardholder's real Funding PAN never goes on the device. The bank issues a Device PAN — a DPAN — provisioned via a Token Service Provider (Visa Token Service, Mastercard Digital Enablement Service) into either the embedded Secure Element or the Host Card Emulation keystore. Every tap generates a per-transaction Application Cryptogram bound to the DPAN, the Application Transaction Counter, and the Unpredictable Number from the terminal. A stolen DPAN is worthless without the keys in the Secure Element; a captured cryptogram is worthless because the ATC has already moved on. This is why Apple Pay fraud rates have dropped to roughly card-not-present levels, despite the early 2015 enrolment disaster.

For passports, the answer is ICAO Doc 9303 Part 11 — BAC, the legacy 3DES-based key derivation from the printed Machine-Readable Zone, or PACE, the modern ECDH version derived from the MRZ or a 6-digit Card Access Number printed on the page. The reader cannot get a single byte of the chip without first running one of those, then verifying the country's signature on the EF.SOD data file via the ICAO Public Key Directory.

For access control, the new answer is ECDSA mutual authentication via Aliro 1.0, finalised by the Connectivity Standards Alliance on 26 February 2026.

## Where it shows up in production

Apple Pay launched in the US on 20 October 2014 with American Express, Bank of America, Capital One, Chase, Citi, and Wells Fargo. Three pillars: NFC, embedded Secure Element, and Touch ID, all built on EMV tokenisation. By 2025 Apple disclosed availability in 85-plus countries, generated about $9.4 billion in revenue (3.4 percent of all of Apple), held about 54 percent share of US in-store mobile wallet usage, and processed an estimated $7.6 trillion in annualised transaction volume. Every one of those transactions traverses 13.56 MHz in the final ten centimetres.

Tap to Pay on iPhone is the quieter, larger story. Apple acquired the Canadian startup Mobeewave in 2020, launched Tap to Pay in the US in February 2022 via Stripe, and by April 2026 had it live in more than 50 countries and regions — 18 European countries on 27 May 2025, five Nordic and Baltic countries plus Monaco on 23 September 2025, Singapore on 2 December 2025, Malaysia on 22 April 2026. Any iPhone XS or newer becomes a contactless terminal with no extra hardware. The protocol shift is that an iPhone is now usually on both ends of the tap.

JR East's Suica card launched on 18 November 2001 at 424 stations across metropolitan Tokyo, on Sony's FeliCa technology. By October 2023, 95.64 million Suica had been issued and the network handled 6.6 million daily taps. Hong Kong's Octopus card, also FeliCa, went live four years earlier — 1 September 1997 — and by 2026 there are over 35 million Octopus in circulation against a population of 7.5 million. Apple Pay Suica became available with the iPhone 7 in September 2016, Japan-only at first because the iPhone 7 was the first iPhone to ship with a FeliCa stack; from the iPhone 8 it is global on every iPhone.

Transport for London added EMV contactless on its buses in 2012 and on the Tube in 2014 — and the UK contactless economy lifted off behind it. By 2023 contactless accounted for over 80 percent of in-person Visa transactions in the UK. TfL alone now processes more than 2 billion taps per year — the largest contactless EMV deployment on Earth. In the US, contactless went from 1 percent of Visa face-to-face transactions in 2017 to roughly one-in-three by 2023; Apple Pay is widely credited as the demand driver.

ICAO eMRTD passports — the e-passports with the small chip-and-antenna icon on the cover — number around 1 billion in circulation worldwide. Belgium issued the first ICAO Doc 9303-compliant one in 2004. The chip is an ISO 14443 PICC running ISO 7816-4 with a small file system: DG1 holds the MRZ, DG2 holds the photo, EF.SOD holds the country's signature, EF.COM is the index. Active airport pilots for ICAO's Digital Travel Credential — passport on phone — are running in Finland, the Netherlands, and Singapore through 2024-2026.

NXP's MIFARE family is the silicon backbone of every door-badge market on Earth — over 10 billion ICs shipped cumulatively. MIFARE Classic shipped in 1994, DESFire EV1 in 2006, Plus in 2011, EV2 in 2016, EV3 in the early 2020s. DESFire EV3 is now standard for new transit and access deployments — full AES, Common Criteria EAL5+, side-channel hardened. The Dutch OV-chipkaart finally retired its last MIFARE Classic mainline cards in 2024 — seventeen years after the original break.

CCC Digital Key — the Car Connectivity Consortium's phone-as-key spec — certified 115 vehicle and module products in 2025 alone. BMW and NXP were first to certify in late 2024. By 2026 the certified roster includes Mercedes, Hyundai, Kia, Genesis, Audi (new for 2025), Volvo, Porsche, GM, Ford, plus the first wave of Chinese OEMs — NIO, XPENG, and the Geely brands (Volvo, Polestar, ZEEKR, Lynk and Co, smart, Lotus). Devices must support at least one of NFC, BLE, or UWB. NFC is the always-works fallback that survives a flat phone battery, holding for over five hours on iPhone reserve power.

## Things that go wrong

The chapter "NFC — 4 cm of wireless that runs the global payment rails" carries the long-form arc; the protocol blueprint compresses to four set pieces.

The first is the 2007 Crypto1 break. MIFARE Classic shipped in 1994 with a proprietary 48-bit Crypto1 stream cipher whose security depended on the algorithm being secret. By 2007 the world owned roughly 1 billion of them — Dutch OV-chipkaart, London Oyster, Boston Charlie Card, hotel keys, office badges, university canteens. On 28 December 2007, at the 24th Chaos Communications Congress in Berlin, Karsten Nohl, Henryk Plötz, and a researcher known as Starbug presented "MIFARE — little security despite obscurity." They had decapped the chip, photographed roughly 10,000 gates with an optical microscope, recognised that only about 70 unique gates were actually used, and isolated the 10 percent of gates dedicated to Crypto1. Independently, the Radboud Nijmegen group — Garcia, de Koning Gans, Verdult, Hoepman — published "A Practical Attack on the MIFARE Classic" in 2008 with the Proxmark III. By the end of 2008 the full Crypto1 algorithm was in the open and complete key recovery from a handful of partial authentications took seconds on a laptop.

The lesson — security by obscurity buys ten years of denial, not twenty — became the textbook citation for "open peer review is not optional." NXP migrated customers to MIFARE Plus and then DESFire EV1, EV2, EV3.

The second is the 2019 Visa contactless PIN-limit bypass. Visa's UK rules capped no-PIN contactless at 30 pounds, later raised. The card and terminal exchanged the Card Transaction Qualifiers and Terminal Transaction Qualifiers in the clear, not bound to a cryptogram. At Black Hat Europe 2019, Leigh-Anne Galloway and Tim Yunusov of Positive Technologies demonstrated a man-in-the-middle device that flipped CTQ bits to make the terminal believe the card had performed device-side biometric verification, lifting payments above 30 pounds with no PIN. Tested across five major UK banks and on every Visa card they tried. It also worked on Visa cards added to Google Pay, where amounts up to 30 pounds could be charged without unlocking the phone. Visa's public stance was that the threat was impractical for fraudsters in the real world. The cure inside modern wallets is to bind CTQ assertions into the cryptogram inputs, which Apple and Google now do.

The third is the 2022 Tesla NFC keycard 130-second attack. After unlocking with the NFC keycard, the driver had about 130 seconds to shift into gear without re-tapping. The convenience window also authorised enrolment of new keys, without re-authentication and without notifying the owner. In June 2022 Martin Herfurt of Trifinite demonstrated "Gone in under 130 seconds" on Tesla Model 3 and Model Y: within the legitimate driver's window, an attacker uses Herfurt's TeslaKee proof-of-concept over BLE to enrol an attacker-controlled phone key. The car is now driveable on demand. Herfurt subsequently demonstrated a PIN2Drive bypass. The architectural lesson — "unlocking authorises driving for a window" must not be confused with "unlocking authorises trust-bootstrap" — became a CCC Digital Key design principle and pushed the relay-resistance requirements in CCC v3.0 and v4.0.

The fourth is HCE relay via NFCGate. TU Darmstadt's NFCGate project, running since 2015, is open-source Android software that captures, replays, and relays NFC traffic over IP. The protocol cannot tell the difference: an APDU stream tunnelled over the internet is structurally indistinguishable from a local tap. The cure that exists is the EMV Relay Resistance Protocol, added in Contactless Kernel 2 v2.6 and later, which binds the round-trip timing into the cryptogram — a real NFC tap returns in 5 milliseconds or less; an internet relay takes 50 milliseconds or more. Apple Pay's eSE architecture sidesteps the problem entirely. If you ship HCE without RRP, your safety net is back-end velocity and geo-anomaly monitoring — not phone-side time bounds.

The fifth, briefly, is the early 2015 Apple Pay yellow-path enrolment fraud. The cryptography was fine. The issuer-side identity-proofing during card digitisation was not — several US banks gated yellow-path with a brief phone call easily defeated by anyone with the cardholder's basic personal details. Q1 2015 fraud rates spiked to about 6 percent on certain issuer portfolios versus about 0.1 percent for plastic. Issuers tightened to multi-factor SMS and banking-app confirmation; EMVCo iterated the tokenisation spec with stronger ID and V requirements. The history-and-context of every one of these incidents lives in the wireless chapter; the protocol blueprint keeps the post-mortem.

## Common pitfalls (for the practitioner)

The single biggest source of "NFC doesn't work" complaints is poor antenna tuning. The reader and the card each present an LC resonant tank around 13.56 MHz; small detuning — a metal sheet within 5 mm of the antenna — collapses the magnetic coupling factor and starves the card's chip and load-modulation amplitude. The rule of thumb on the bench is to target the card's resonant frequency 1 to 3 MHz above 13.56 MHz, typically 14.5 to 16.5 MHz, because the mutual inductance pulls it down to the design point when a reader is brought close. Treat any metal sheet within 5 mm as catastrophic — phones with metal backs (post-2014) need either a ferrite separator 0.1 to 0.3 mm thick or active load modulation in the controller (NXP PN553 onward). On Q factor: readers typically run Q around 20 to 30, cards 25 to 40 — lower Q broadens the peak for interoperability at the cost of peak induced voltage.

HCE on Android has two pitfalls that bite together. The first is AID conflicts: when two installed apps both claim the same AID — say a banking app and a transit app both registering for `A000000003101001` — Android resolves via the apduservice.xml category ('payment' versus 'other') and the user-selected default for that category. Apps declaring a wildcard AID prefix can intercept others; Android tightened the checks but `aid-prefix-filter` is still a footgun. The second is cold-start latency: HCE service activation takes about 70 to 150 milliseconds and EMV terminals time out aggressively. Keep the HostApduService warm by avoiding heavy initialisation in `processCommandApdu`. Inspect routing with `adb shell dumpsys nfc` and look at the AID routing table.

The EMV "fast tap" AIP byte trap. Mastercard's PayPass and Visa's qVSDC contactless flows have two profiles — Mag-Stripe Mode (legacy, deprecated on modern terminals) and EMV Mode with CDA. The card returns an AIP byte that signals whether DDA or CDA is supported. The classic custom-HCE wallet bug is returning an AIP that claims DDA or CDA support but failing to produce a valid signature in `GENERATE AC`. The terminal aborts after about 600 milliseconds with status word `6985`. Match the AIP bits exactly to what your cryptogram code can produce, and test with terminals from at least three networks (Visa, Mastercard, Amex) before launch — the kernels diverge in their corner cases.

HCE relay attacks: the protocol does not know if the phone is in the room. Either turn on EMV Relay Resistance Protocol everywhere your kernel supports it (v2.6 and later in Kernel 2), or rely on back-end velocity and geo-anomaly monitoring. Phone-side time bounds alone are not a defence.

Multi-AID applications and order. For wallets supporting multiple cards, the order in which AIDs come back in the PPSE FCI determines terminal preference. Some terminals select the first matching priority rather than scanning the full list — get the order right.

## Debugging it

The deepest tool is Proxmark3, with the Iceman/RRG firmware. `hf 14a info` identifies a Type A tag — ATQA, UID, SAK, ATS. `hf 14a sniff` captures a reader-and-tag exchange (24-hour buffer). `hf list 14a` decodes the buffered sniff with the ISO 14443-3 and APDU dissectors. `hf mf rdsc 0 A FFFFFFFFFFFF` reads MIFARE Classic sector 0 with a default key. `hf mfdes auth 0 1 0 16 --kdf 0 --ki 0` does MIFARE DESFire EV3 AES auth on app 0, key 1.

Userland on Linux: `nfc-list` enumerates readers and any visible tags via libnfc. `nfc-poll` continuously polls in single-tag mode. `nfc-mfultralight r dump.bin` dumps a Type 2 (MIFARE Ultralight or NTAG) tag.

For HCE on Android: `adb shell dumpsys nfc` shows controller state and the AID routing table. `adb logcat -s NfcAdapter NfcService NfcDispatcher` filters the NFC service logs. For verbose mode, `setprop persist.nfc.debug_enabled 1`.

For Apple, there is no user-facing debug knob. Trigger a sysdiagnose by holding Volume-Up, Volume-Down, and the side button for one second on iPhone, then inspect the system logs archive under the NearField subsystem.

In Wireshark, with PCAPNG captures from TU Darmstadt's NFCGate or a USB-side capture of a Proxmark dump: `nfc.llcp` filters LLCP frames, `nfc.ndef` filters decoded NDEF records, plain `nfc` matches anything the dissector recognises.

Python: `nfcpy` is the canonical cross-platform library. `import nfc; clf = nfc.ContactlessFrontend('usb'); clf.connect(rdwr={'on-connect': lambda t: print(t.ndef)})` is enough to read the NDEF off a tapped tag. Web NFC, on Chromium for Android only, exposes only NDEF read and write — no card emulation, no raw 14443 — through `NDEFReader().scan()`. Apple has not implemented Web NFC.

## What's changing in 2026

In March 2026, the IEC formally adopted two NFC Forum specs as international standards: NFC Wireless Charging (WLC 2.0, up to 1 W) and NDEF, the data record format. NDEF being standardised removes one barrier for regulators integrating NFC tags into product passports under the EU's Ecodesign for Sustainable Products Regulation (ESPR).

On 26 February 2026, the Connectivity Standards Alliance — the same group that runs Matter — finalised Aliro 1.0, a PKI-based access-control credential standard. ECDSA mutual authentication; transports over NFC (tap-to-access), BLE (proximity), and BLE-plus-UWB (ranged hands-free unlock). First certifications: Apple, Allegion, Aqara, Google, HID, Kastle, Kwikset, Last Lock, Nordic Semiconductor, Nuki, NXP, Qorvo, Samsung, STMicro. The Alliance positions Aliro as "Matter for doors." Target verticals: corporate, hospitality, residential, multi-family, university.

In July 2025 the Car Connectivity Consortium announced Digital Key 4.0 and tested it at the 13th Plugfest, hosted by Apple. The headline is cross-version compatibility — a DK3 phone unlocks a DK4 car and vice versa. The 115 vehicle and module products certified in 2025 include the first Chinese OEMs (NIO, XPENG, the Geely group). Devices must support at least one of NFC, BLE, or UWB; NFC remains the dead-battery fallback.

On 17 June 2025 the NFC Forum opened Release 15 to its members. Headline change: the certified operating volume quadrupled from 5 mm to 20 mm — a geometrically harder problem the Forum's chair Preeti Ohri Khemani called the most demanding standardisation effort to date. Digital Protocol moves to v2.4, Activity to v2.3, Analog to v3.0 (which carries the new operating volume). Certification Release 15 is accepting applications by early 2026.

On 17 July 2024 the European Commission's commitments decision IP/24/3706 made Apple's NFC opening legally binding for ten years inside the European Economic Area, monitored by an independent trustee with a dispute-resolution mechanism. iOS 17.4, shipped in March 2024, opens NFC HCE to EEA wallets via the new NFC and Secure Element Platform entitlement. PayPal Germany was the first to ship on it. The watch-items now are the UK CMA, Japan's JFTC, and Australia's ACCC — the first time any regulator has compelled an OEM to open NFC card emulation, the pattern is now templated.

The NFC Forum's 2026 Technology Roadmap (published February 2026) commits to Multi-Purpose Tap — a single tap that simultaneously presents membership, locker key, and payment, disambiguated by the reader's request — and to a higher-power evolution of WLC. NuCurrent joined the Forum board in October 2025 to push the next charging-power class. Production silicon for WLC 2.0 is shipping — Panthronics PTX30W is a 1 W listener IC in a 1.78 by 1.78 mm WL-CSP package, sized for hearing aids, smart rings, earbuds, and styluses.

## Fun facts (host material)

Charles Walton — the IBM disk-drive engineer who founded Proximity Devices in Sunnyvale in 1970 and holds the canonical RFID ancestor patent (US 4,384,288, "Portable Radio Frequency Emitting Identifier", issued 15 May 1983) — earned several million dollars in royalties before the bulk of his patents expired in the mid-1990s, just before Walmart's RFID mandate and the wider boom. He died in Los Gatos on 6 November 2011, three months after Google launched Google Wallet 1.0 on the Nexus S 4G. Two pioneers of the same field, separated by 60 years, in the same calendar year.

FeliCa beat the NFC Forum to commercial deployment by seven years. Sony's FeliCa team began work in the late 1980s; Octopus went live in Hong Kong on 1 September 1997, four years before NFC was even named, seven years before the NFC Forum was founded. By the time Sony, Philips, and Nokia announced the Forum in 2004, FeliCa was already running tens of millions of taps a day on the Hong Kong subway. FeliCa became one of three permitted technologies in ISO/IEC 18092 in 2003 — which is why iPhones sold from the iPhone 7 in September 2016 have a FeliCa stack and the iPhone 6 from September 2014 does not. Japanese visitors with iPhone 6 could not tap through Tokyo gates with Apple Pay Suica; tourists with iPhone 8 could, without changing a single region setting.

The unassuming N logo has no runes. Bluetooth's logo, since 1998, is a bind-rune of the Younger Futhark letters Hagall and Bjarkan — the initials of King Harald Bluetooth. Jim Kardach, who proposed the Bluetooth name at a 1997 Intel SIG meeting after reading Frans G. Bengtsson's Viking novel "The Long Ships" on a flight, has a separate episode in this series. NFC just abbreviated "Near Field Communication" into a single character N, trademarked it, and replaced the older "ContactLess" branding around 2010. No mythology, no medieval Danish kings — just a typographic placeholder that happened to stick.

The "switch off NFC to save battery" myth. Idle NFC controllers draw on the order of single-digit microamps in their lowest poll states — orders of magnitude less than the display, the baseband, or the application processor. Disabling NFC has no measurable battery effect on any modern phone. The option survives in OS settings as a security-and-privacy toggle, not a power one. If you have ever turned NFC off to make your phone last longer, you have done exactly nothing for your battery.

The wire format has not changed in 20 years. NFC is rare among software stacks in that ISO/IEC 18092 was published in December 2003 and the framing on the wire today is the same. Every iteration since has been at the certification, security, and application layer — DESFire EV2 and EV3, EMV tokenisation, ICAO PACE, Aliro, CCC Digital Key, the 20 mm operating volume in Release 15. Three years before the iPhone existed, the protocol your phone uses to pay your barista was already published.

"We are going to start with payments." On 9 September 2014 at Flint Center in Cupertino — the same hall where Steve Jobs unveiled the original Macintosh in 1984 — Tim Cook held up a leather wallet and said: "Our vision is to replace this — we're going to start with payments." Eleven years later, the Apple Wallet holds driver's licences, hotel and home keys, car keys, transit cards, event tickets, vaccine cards, employee badges, and Aliro residential credentials — and every one of them rides the same 13.56 MHz inductive link defined in ISO/IEC 18092 in December 2003.

## Where this connects in the book

- The chapter "NFC — 4 cm of wireless that runs the global payment rails" in the Wireless part of the book — ISO 18092, Tag Types T1 through T5, EMV, transit, Apple Pay, CCC Digital Key, Aliro 1.0, and the 31-year arc from Charles Walton's 1983 patent to Tim Cook's 2014 keynote. That episode is where the historical narrative lives — the Hong Kong subway, the Sony-Philips-Nokia handshake of 2002, Berlin in December 2007, and the Cupertino keynote that bent the curve. The protocol blueprint stays on the wire and on production.

## See also (other protocol episodes)

- The Bluetooth episode is the natural companion. Bluetooth is the protocol you carry with you; NFC is the protocol you tap with. Bluetooth pairing is explicit (PIN, Just Works, OOB) and takes half a second to several seconds; NFC pairing is implicit (tap) and takes under 100 milliseconds. NFC's Connection Handover spec (currently v1.5) is the bridge — an NDEF record with MIME type `application/vnd.bluetooth.le.oob` carries the BLE MAC address, name, and Security Manager OOB key, so a single tap replaces a pairing dialog. Every pair of NFC headphones you have ever tapped to a phone uses this.

- The Wi-Fi episode is the parallel story. Wi-Fi is the protocol you stream from. NFC's Connection Handover for Wi-Fi carries SSID, key, and security mode in an NDEF record — used for tap-to-join on printers and a chunk of smart-plug commissioning. Matter 1.3 and later add NFC as one of three commissioning paths alongside QR and BLE.

- The TLS episode is the cryptographic envelope analogy. EMV contactless puts an offline RSA or ECC signature (DDA, fast DDA, or CDA) and an online MAC (the ARQC) on every transaction; the contactless terminal's role is summarised in EMV Contactless Book A v2.10, and the Mastercard kernel is current at v2.11 from June 2023. Different signatures, same shape.

- The UWB episode is the "what NFC hands off to" story for cars and doors. CCC Digital Key 3.0 uses NFC for identity attestation and key delivery, BLE for proximity, and UWB for centimetre-accurate ranging — so the car can decide whether the keyholder is at the door, in the cabin, or 30 metres away in the supermarket aisle. CCC v4.0 (July 2025) keeps all three transports and adds cross-version interoperability.

- The cellular episode is where the carrier-SIM Secure Element story died. The pre-2014 Trusted Service Manager model — provisioning applets into a UICC Secure Element controlled by the mobile carrier — is essentially extinct in payment. Korea retained it for some transit applications longer than most, and Japan's Mobile FeliCa supported it, but new deployments are HCE plus tokenisation or eSE. The 2014 Apple Pay launch and the 2013-14 Android HCE rollout collectively buried carrier-SE.

## Visual cues for image generation

- A side-by-side range diagram contrasting NFC's tight 4 cm magnetic loop (1/r-cubed falloff, blue) against a Bluetooth pair at 10 m (1/r-squared radiative wavefronts, orange). Annotation: 13.56 MHz, λ/2π ≈ 3.5 m.
- An ISO 14443-3 Type A activation ladder showing eight rungs from REQA 0x26 through ATS, with the SAK byte highlighted (bit 6 set means ISO 14443-4 compliant). Total elapsed time about 50 ms labelled at the right edge.
- An EMV tap APDU sequence between POS terminal and iPhone eSE: SELECT PPSE, SELECT AID Mastercard A0000000041010, GET PROCESSING OPTIONS with PDOL, READ RECORD x3, GENERATE AC returning the 8-byte ARQC. Total time labelled 300-800 ms.
- An NDEF record header dissected at the bit level, with the example URI record bytes D1 01 0F 55 03 ... shown below. Annotate TNF 1 = Well-Known, type byte 0x55 = U for URI, prefix 0x03 = https://.
- A four-mode flower diagram with NFC at 13.56 MHz at the centre and four petals: Reader/Writer, Card Emulation, Peer-to-Peer (greyed out, deprecated 2019), and Wireless Charging. Each petal annotated with a real product example.
- A timeline of the 31-year arc: 1973 Walton transponder patent, 1994 MIFARE Classic, 1997 Hong Kong Octopus, 2001 Suica, 2003 ISO/IEC 18092, 2007 Crypto1 break at 24C3, 2014 Apple Pay launch (highlighted in red), 2024 EU forces iOS HCE open, 2026 Aliro 1.0.

## Sources

Standards bodies and specs

- [ISO/IEC 18092:2013 (NFCIP-1)](https://www.iso.org/standard/56692.html)
- [NFC Forum specifications](https://nfc-forum.org/build/specifications)
- [NFC Forum: NFC Release 15 — the what, why and how](https://nfc-forum.org/news/2025-06-nfc-release-15-the-what-why-and-how/)
- [NFC Forum: two specs adopted by IEC](https://nfc-forum.org/news/2026-03-two-nfc-forum-specifications-adopted-as-iec-standards/)
- [NFC Forum: NDPP candidate spec](https://nfc-forum.org/news/2025-03-nfc-forum-publishes-candidate-specification-for-sustainability-data-management/)
- [NFC Forum: 2026 Technology Roadmap](https://nfc-forum.org/news/2026-02-nfc-forum-publishes-its-latest-technology-roadmap/)
- [Car Connectivity Consortium](https://carconnectivity.org/)
- [CSA: Introducing Aliro 1.0](https://csa-iot.org/newsroom/introducing-aliro-1-0/)

Vendor and engineering blogs

- [Apple newsroom: changes for the EU under DMA, 25 January 2024](https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/)
- [Apple Developer: HCE entitlement and CoreNFC](https://developer.apple.com/documentation/corenfc)
- [Android Developers: NFC and HCE guide](https://developer.android.com/guide/topics/connectivity/nfc)

Regulatory

- [European Commission press release IP/24/3706 — Apple NFC commitments decision](https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3706)

Papers and conference talks

- Karsten Nohl, Henryk Plötz, Starbug — *MIFARE — little security despite obscurity* (24C3, 28 December 2007), [media.ccc.de](https://media.ccc.de/v/24c3-2378-en-mifare_security)
- Garcia, de Koning Gans, Verdult, Hoepman — *A Practical Attack on the MIFARE Classic* (LNCS 5283, 2008)
- Oswald and Paar — *When Reverse-Engineering Meets Side-Channel Analysis — Digital Lock-Picking in Practice* (CHES family, 2011)
- Galloway and Yunusov — *First Contact: Vulnerabilities in Contactless Payments* (Black Hat Europe 2019)
- TU Darmstadt SEEMOO — NFCGate papers (ACSAC 2015 onwards)

Wikipedia and reference

- [Wikipedia: Near-field communication](https://en.wikipedia.org/wiki/Near-field_communication)
- [Wikipedia: Charles Walton (inventor)](https://en.wikipedia.org/wiki/Charles_Walton_(inventor))
- [Wikipedia: Karsten Nohl](https://en.wikipedia.org/wiki/Karsten_Nohl)
- [Wikipedia: Jim Kardach](https://en.wikipedia.org/wiki/Jim_Kardach)
