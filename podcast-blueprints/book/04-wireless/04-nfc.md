---
id: nfc
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: NFC — 4 cm of wireless that runs the global payment rails
synopsis: ISO 18092, Type 1–5 tags, EMV, transit, Apple Pay, CCC Digital Key, Aliro 1.0, and the Charles Walton-to-Apple-Pay arc that took 31 years.
podcast_target_minutes: 15
position_in_book: 34 of 75
listening_order:
  prev: wireless/cellular
  next: wireless/uwb
related_protocols: [nfc]
related_pioneers: [charles-walton, franz-amtmann, karsten-nohl]
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A phone hovering 2 cm above a contactless terminal, with a faint magnetic-field loop drawn between them at 13.56 MHz, and a one-line caption: 300 ms, $7.6T per year."
  - "A timeline from 1973 to 2014: Walton's first passive transponder patent, the 1983 RFID patent, ISO/IEC 18092 in December 2003, the NFC Forum founded in 2004, Tim Cook at Flint Center on 9 September 2014."
  - "A nine-step ladder diagram of an Apple Pay tap: REQA, ATQA, SEL, SAK, RATS, ATS, SELECT PPSE, SELECT AID, GPO, READ RECORD, GENERATE AC — labelled by which standard owns each rung."
  - "A 24C3 stage in Berlin on 28 December 2007: a decapped MIFARE Classic chip under an optical microscope, with ~10,000 gates photographed and ~10% highlighted as Crypto1."
  - "A four-square diagram of NFC's operating modes: Reader/Writer, Card Emulation, Peer-to-Peer (greyed out), and Wireless Charging — with eSE and HCE branches under Card Emulation."
---

# Part V, Chapter — NFC — 4 cm of wireless that runs the global payment rails

## The hook

The protocol that runs the British contactless economy was published in 2000. The protocol your phone uses to pay your barista was published as ISO/IEC 18092 in December 2003 — three years before the iPhone existed. NFC is rare among software stacks in that the wire format has not changed in twenty years. Every iteration has been at the certification, security, and application layer. Wi-Fi is the protocol you stream from. Bluetooth is the protocol you carry with you. NFC is the protocol you tap with.

## The story

### The 31-year arc

The story of NFC starts in a small office in Sunnyvale in 1970, in a company called Proximity Devices, founded by a former IBM disk-drive engineer named Charles Walton. Walton spent the next two decades inventing the radio-identification primitives that would later become NFC. His canonical patent — US 4,384,288, *Portable Radio Frequency Emitting Identifier* — issued on 15 May 1983, was the first to use the acronym RFID. He licensed his card-and-reader door-lock to Schlage and earned millions in royalties. Most of his patents expired in the mid-1990s, just before Walmart's 2003 RFID mandate and the wider boom.

Walton died in Los Gatos on 6 November 2011, three months after Google launched Google Wallet 1.0 on the Nexus S 4G, at age 89. He did not live to see Apple Pay. The hinge moment in the modern story came almost three years later: 9 September 2014, Flint Center in Cupertino, Tim Cook on stage. Three pillars: NFC, embedded Secure Element, and Touch ID, all built atop EMVCo Payment Tokenisation so the real card number never leaves the issuer. The arc from Walton's 1983 patent to the Apple Pay launch is 31 years.

### Inductive coupling at 13.56 MHz

NFC is the umbrella name for a tightly defined family of contactless protocols. They all operate in the 13.56 MHz ISM band over inductive coupling, at typically ten centimetres or less. NFC Forum Release 15, in June 2025, extended that to a twenty-millimetre operating volume — twice the previous spec. The exact air-interface details are the second half of the NFC episode, but the headline is: this is not a radio in the way Wi-Fi or Bluetooth are radios. It is a transformer. Two coils, mutual induction, a few centimetres apart.

The family is older than the NFC Forum. ISO/IEC 14443 Type A and Type B cover proximity contactless cards — Type A is the MIFARE lineage, Type B is the lineage that runs French and Russian transit and many e-passports. ISO/IEC 15693 covers vicinity cards out to about a metre. JIS X 6319-4 is FeliCa — Type F — the parallel Asian transit standard, the one that runs Suica in Tokyo and Octopus in Hong Kong. The unifying glue is ISO/IEC 18092, NFCIP-1, published in 2003 and revised in 2013, and ISO/IEC 21481, NFCIP-2, in 2012.

The NFC Forum, founded in 2004 by Sony, Philips, and Nokia, sits on top of all of that. It owns the application layer: the NDEF data format, the tag types T2T through T5T (T1T was retired in 2021), the LLCP and SNEP peer-to-peer stack that turned out not to matter in production, the Connection Handover specs that hand a tap-to-pair off to Bluetooth or Wi-Fi, the NCI host-controller interface, and NFC Wireless Charging up to one watt.

### Four operating modes

Functionally, NFC supports four operating modes. *Reader/Writer*: the phone reads a passive tag — the smart poster, the museum exhibit, the asset label on a piece of warehouse stock. *Card Emulation*: the phone presents itself as a card to a terminal — the Apple Pay tap, the office-badge tap, the transit-gate tap. On Apple devices that runs through an embedded Secure Element. On Android 4.4 and later, and on iOS 17.4 and later in the European Economic Area, it can also run through Host Card Emulation, where the credentials live in the operating system instead of a dedicated chip. *Peer-to-Peer* mode existed and is largely deprecated in practice. *Wireless Charging* was added in 2020.

What makes NFC strange among modern wireless stacks is what sits *on top* of those four modes. Not one application stack — many. ISO/IEC 7816-4 APDUs and EMVCo Contactless, with Books C-1 through C-7 and Book E, run cards and payments. ICAO Doc 9303 Part 11, with BAC and PACE, runs e-passports. CCC Digital Key runs car unlock and start. Aliro 1.0, finalised in February 2026, runs access control. NFC Forum WLC runs wireless charging up to one watt. Matter 1.3 and later use NFC for commissioning. The wire is one wire. The vertical stacks are everything.

### Why the wire never changed

Most of the protocols this book covers have rewritten themselves at least once. TCP got CUBIC, then BBR. HTTP went from 1.1 to 2 to 3 across two decades. Wi-Fi has gone through seven generations of physical layer. NFC has not. The bytes on the air in 2003 are recognisably the bytes on the air in 2026.

The reason is the install base. The protocol that runs the British contactless economy was published in 2000 and is in every plastic card on the island. The cards do not get over-the-air updates. The terminals at every Pret a Manger and every London Underground gate do not get over-the-air updates. The only place where the stack can evolve is at the certification, security, and application layer — and that is exactly where every iteration of the last twenty years has happened. The simulator chapter shows you why this matters: the same nine beats run roughly $7.6 trillion a year of annualised Apple Pay transactions, and they run every plastic contactless card on Earth.

## The figures

### Charles Walton

Charles Walton was a US engineer — Cornell BSEE in 1943, an MS from Stevens, US Army Signal Corps, ten years at IBM mostly on disk-drive R&D. He founded Proximity Devices in Sunnyvale in 1970 and spent the next twenty years inventing the radio-identification primitives that became the NFC family. His canonical patent is US 4,384,288, *Portable Radio Frequency Emitting Identifier*, issued 15 May 1983 — the first patent to use the acronym RFID. His earliest passive transponder patent, US 3,752,960, dates to August 1973. He held more than fifty patents, licensed his card-and-reader door-lock to Schlage, and earned millions in royalties before most of those patents expired in the mid-1990s. He died in Los Gatos on 6 November 2011, three months after the Nexus S 4G launched Google Wallet 1.0, at age 89. The Lemelson-MIT program recognised him; the VentureBeat and Engadget obituaries the following month are the canonical citations.

### Franz Amtmann

Franz Amtmann is the Austrian electrical engineer who led the physical-layer and IC architecture work behind NFC at Philips Semiconductors, later NXP after the 2006 spinout. He holds about fifty patents, and was instrumental in both the MIFARE family architecture and the NFC physical-layer specification — the side of the standard that turned a paper draft into manufacturable silicon. In 2015 he and Philippe Maugars shared the European Patent Office's European Inventor Award in the Industry category for jointly inventing NFC. NXP's announcement at the time noted twenty-five years at the company. Amtmann and Maugars credited the success, in a contemporary M2M Now interview, to a cooperation between teams with complementary expertise across RFID, applications, and IC design.

### Karsten Nohl

Karsten Nohl is the German cryptographer who ended security-by-obscurity in NFC contactless. With Henryk Plötz and "Starbug" at the Chaos Computer Club, he presented *MIFARE — little security despite obscurity* at 24C3 in Berlin on 28 December 2007. They dismantled the Crypto1 stream cipher used in roughly one billion MIFARE Classic cards worldwide — the Dutch OV-chipkaart, the London Oyster card, the Boston CharlieCard, and innumerable hotel-key, office-badge, and university-canteen systems. Their method was forensic. They decapped the chip, photographed about ten thousand gates with an optical microscope, recognised that only about seventy unique gates were used, and isolated the roughly ten percent of gates dedicated to Crypto1. They also noticed the weak sixteen-bit pseudo-random number generator was seeded from a free-running power-up counter. The follow-on academic paper, *Reverse-Engineering a Cryptographic RFID Tag*, appeared at USENIX Security 2008. Nohl founded SRLabs in Berlin; later work covered SIM-card cloning, SS7 attacks, and contactless banking-app analyses. The Crypto1 story is now textbook material for why open peer review is not optional.

## What you'd see in the simulator

Press play on the NFC Tap simulation and you would watch a phone present an EMV cryptogram to a contactless terminal in about three hundred milliseconds. Nine beats run on the wire. The first six are at the contactless protocol layer — REQA, ATQA, SEL, SAK, RATS, ATS — the terminal asking the phone "are you there?" and the phone identifying itself and negotiating frame size. The last three are at the EMV payment layer — SELECT PPSE to find the payment system environment, SELECT AID to pick a specific application like Visa or Mastercard, GPO to get processing options, READ RECORD for the certificates, and GENERATE AC for the cryptogram the issuer will use to authorise the transaction. The same nine-beat sequence runs roughly $7.6 trillion a year of annualised Apple Pay transactions and every plastic contactless card on Earth. The mechanics of each beat are the second half of the NFC episode.

## What it taught the industry

Three lessons came out of the NFC story and are now part of how wireless engineers think about close-range contactless.

**A wire format that does not change is a feature, not a bug, when the install base is in the billions.** Every plastic contactless card on Earth and every payment terminal in every Pret a Manger is silicon you cannot patch over the air. The only way the stack can evolve is at the layers above the wire — certification, security, application. NFC has run that play for twenty years and the result is one of the most heavily deployed wireless protocols on the planet.

**Security-by-obscurity does not survive contact with a microscope.** Karsten Nohl, Henryk Plötz, and Starbug needed about ten thousand gates' worth of optical photography and the recognition that only seventy unique gates were used. That was enough to break a cipher embedded in roughly a billion cards. The fix was MIFARE DESFire and AES, and the lesson — open peer review of cryptography is not optional — is the one every contactless system designer has had to internalise since 2007.

**One wire, many vertical stacks.** Payments via EMV, identity via ICAO 9303, vehicles via CCC Digital Key, building access via Aliro, commissioning via Matter — all on the same 13.56 MHz transformer. NFC's success is in being the boring shared substrate underneath a dozen industries' security models.

## Listening order

- **Before this chapter:** *Cellular — 4G LTE + 5G NR + the 3GPP machine* — the wide-area wireless story that frames NFC as the very-short-range counterpart to the very-long-range stack on the same phone.
- **After this chapter:** *UWB — nanosecond pulses for centimetre ranging* — the close-range wireless that NFC's tap-to-pair is increasingly handing off to for ranging-aware unlock and key fob use cases.

## Where to go deeper

- The NFC episode picks up the mechanism story — the 13.56 MHz inductive coupling, the ISO/IEC 14443 Type A and Type B and FeliCa Type F variants, the NDEF data format, the four operating modes, the Secure Element versus Host Card Emulation split, and what really happens in those nine beats of an Apple Pay tap.
- The Bluetooth episode is the natural next step for any tap-to-pair flow — NFC's Connection Handover is the spec that hands a paired session off to Bluetooth so the high-bandwidth work can run on a different radio.
- The Wi-Fi episode is the other side of that handover — the same NFC Connection Handover spec can hand commissioning off to Wi-Fi, which is increasingly how Matter accessories get onto a home network.
