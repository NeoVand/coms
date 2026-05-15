---
id: bluetooth
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: Bluetooth — Classic, LE, and the 6.0 ranging future
synopsis: BR/EDR, BLE, GATT, LE Audio + Auracast, and Channel Sounding. Plus the KNOB / BIAS / BLUFFS lineage that broke session security three times in five years.
podcast_target_minutes: 15
position_in_book: 32 of 75
listening_order:
  prev: wireless/wifi
  next: wireless/cellular
related_protocols: [bluetooth]
related_pioneers: [jaap-haartsen, jim-kardach]
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: ""
    caption: "The Bluetooth logo — a bind-rune of Hagall and Bjarkan in Younger Futhark, the initials of Harald Blaatand Gormsson."
    credit: "Bluetooth SIG"
visual_cues:
  - "A split-screen of the two stacks under one brand: on the left, BR/EDR with 79 by 1 MHz channels and 1,600 hops per second carrying A2DP, HFP, HID, RFCOMM; on the right, BLE with 40 by 2 MHz channels carrying GATT and SMP over L2CAP."
  - "A timeline from 1994 Lund to 2026 Frankfurt: Ericsson cable-replacement project, May 1998 SIG founding, COMDEX 1999 first headset, Ericsson T39 in 2001, Core 4.0 BLE in December 2009, Bluetooth 6.0 in September 2024, Frankfurt Auracast on 28 January 2026."
  - "A portrait pairing of Jaap Haartsen at an Ericsson Lund workbench beside Jim Kardach reading The Long Ships on a flight, with Harald Blaatand Gormsson's bind-rune logo bridging them."
  - "A BLE simulation panel: phone Central scanning advertising channels, heart-rate Peripheral broadcasting, then connection, MTU exchange, LE Secure Connections pairing, and a GATT notification subscription."
  - "A Channel Sounding centimetre-class ranging diagram — phase-based plus round-trip-time measurements between a phone and a car door, with a UWB digital-key icon being squeezed out of the frame."
---

# Part V, Chapter — Bluetooth — Classic, LE, and the 6.0 ranging future

## The hook

Bluetooth is the most ubiquitous short-range wireless protocol on Earth — roughly 4.7 billion ICs shipped per year. It started in 1994 as a single Ericsson project to replace one cable. Thirty years later it is two completely different protocols braided into one brand, in every phone, every car, every hearing aid, and as of January 2026, broadcasting every gate announcement at Frankfurt Airport.

## The story

### One cable in Lund, Sweden

In 1994, Ericsson Mobile Communications in Lund, Sweden gave a small team a narrow problem: get rid of the RS-232 cable that ran from a mobile phone to its headset. The Dutch electrical engineer Jaap Haartsen had joined Ericsson in 1991. Together with Sven Mattisson, he produced the original frequency-hopping 2.4 GHz radio design between 1994 and 1997. Haartsen later said the project was not trying to invent a new wireless standard — it was trying to get rid of a cable.

The radio they designed is the foundation of every Bluetooth chip ever made. 79 channels of 1 MHz each in the 2.4 GHz ISM band. 1,600 hops per second. GFSK and DPSK modulation. A piconet with one master and up to seven active slaves. Voice links carried over SCO and eSCO; data over ACL. The mechanism details — how the hopping sequence and the BD_ADDR-derived clock alignment actually work — are the back half of the Bluetooth protocol episode.

### How a Danish king got his name on it

In 1997, Intel engineer Jim Kardach was on a flight reading Frans G. Bengtsson's novel *The Long Ships*, about a 10th-century Danish king named Harald Blaatand Gormsson — Harald Bluetooth — who united Denmark and Norway. At an SIG planning meeting Kardach proposed the name as an analogy: just as Harald united warring tribes, the consortium was trying to unite Ericsson, IBM, Intel, Nokia, and Toshiba behind one wireless standard. It was supposed to be a placeholder until marketing came up with something better. They never did. The logo is a bind-rune of Hagall and Bjarkan in Younger Futhark — the initials of Harald Blaatand.

The Bluetooth Special Interest Group was founded in May 1998 by those five companies. The first commercial product was a hands-free headset shown at COMDEX in 1999. The first Bluetooth phone was the Ericsson T39 in 2001. There are separate episodes for both Jaap Haartsen and Jim Kardach.

### Two protocols, one brand

Bluetooth in 2026 is two completely different protocols sharing a logo and a band. Call them by their real names.

BR/EDR — Basic Rate / Enhanced Data Rate, also known as Classic — is the 1999 frequency-hopping master/slave wire-replacement system Haartsen designed. It still carries the things that need a continuous channel: A2DP for stereo audio, HFP for hands-free voice, HID for every wireless keyboard and mouse, and RFCOMM for serial-port emulation. If you have ever paired headphones or a car kit, you have used Classic.

BLE — Bluetooth Low Energy — was added in Core 4.0, adopted in December 2009. It is derived from a Nokia design called Wibree. Different radio: 40 channels of 2 MHz each instead of 79 of 1 MHz. Different link layer. Different framing on top of the L2CAP adaptation layer. Different security in the SMP pairing protocol. Different application protocol — GATT, the Generic Attribute Profile, which exposes a device as a tree of services and characteristics. The two stacks share the 2.4 GHz ISM band and they share an SIG. They share zero bits over the air.

BLE is what every fitness tracker, AirTag, hearing aid, and Matter device commissioning runs on. Classic is what your headphones still do. The chapter on Wi-Fi sits next to this one because the division of labour is clean: Wi-Fi is the protocol you stream from. Bluetooth is the protocol you carry with you.

### KNOB, BIAS, BLUFFS — three breaks in five years

The chapter's pull-quote on the protocol record points at the security history that this stack carries. Between 2019 and 2023, three families of attacks broke session security at the link layer: KNOB downgraded the entropy of the encryption key during pairing; BIAS impersonated a previously bonded device; BLUFFS forced a forward-secrecy-breaking session-key reuse. The deep mechanism — what each attack manipulates and how the SIG patched it — is in the Bluetooth protocol episode under incidents. The chapter-level point is that a 1998 link-layer security design has had to be repeatedly retrofitted to survive 2020s adversaries, and the SIG has had to ship those retrofits across billions of already-deployed devices.

### Bluetooth 6.0 and the Channel Sounding turn

The single biggest change in the last twenty-four months is Bluetooth 6.0, adopted on 3 September 2024. Its headline feature is Channel Sounding — a phase-based plus round-trip-time ranging mechanism that delivers centimetre-class accuracy between two BLE radios. That is an explicit play for the secure-access and digital-key niche that Ultra-Wideband had to itself. The chapter on UWB picks up the other side of that fight. For a listener: the next time your car unlocks because your phone is in your pocket, that is Channel Sounding or UWB doing the distance measurement, and after Bluetooth 6.0 the SIG is betting it can be done on the radio that is already in every phone.

### Auracast and the Frankfurt gate announcement

Alongside 6.0, LE Audio shipped the Auracast broadcast profile, built on the LC3 codec. Auracast lets one transmitter broadcast audio to an unlimited number of LE Audio receivers — earbuds, hearing aids, public-address listeners. Spec became real deployment on 28 January 2026, when Frankfurt Airport became the first airport to broadcast every gate announcement over Auracast. A traveller with LE Audio hearing aids no longer asks the gate agent to repeat — the announcement is already in their ears.

### DULT and the anti-stalking standard

The other 2024 to 2026 thread is DULT — Detecting Unwanted Location Trackers — the Apple-Google joint standard that defines how a tracker like an AirTag advertises its presence so that any nearby phone, regardless of operating system, can warn its owner that an unknown tracker is travelling with them. DULT moved into IETF working-group drafts during this period. It is the first time the SIG's deployment scale has had to answer for a privacy externality at the operating-system layer.

## The figures

### Jaap Haartsen

Born 1963. Dutch electrical engineer who invented the Bluetooth radio. Joined Ericsson Mobile Communications in Lund, Sweden in 1991, tasked with replacing the RS-232 cable to a mobile-phone headset. With Sven Mattisson he produced the original frequency-hopping 2.4 GHz radio design between 1994 and 1997 — the foundation of every Bluetooth chip ever made. Authored the core technical work that defined the Bluetooth Baseband: piconets, the 1,600-hops-per-second pattern, master/slave topology, BD_ADDR-derived clock alignment, the SCO/eSCO voice links, and ACL data links. Co-architected the SIG founding in May 1998. European Inventor Award Lifetime Achievement finalist in 2015 — the EPO citation says he made wireless communication ubiquitous. Eduard Rhein Foundation Technology Award in 2009. There is a separate Jaap Haartsen episode.

### Jim Kardach

Born 1958. Intel engineer who proposed the name Bluetooth at a 1997 SIG planning meeting, after Harald Blaatand Gormsson, the 10th-century Danish king who united Denmark and Norway. Kardach was reading Frans G. Bengtsson's novel *The Long Ships* on a flight and made the analogy: just as Harald united warring tribes, the SIG was trying to unite Ericsson, IBM, Intel, Nokia, and Toshiba behind one wireless standard. The name was a placeholder. It stuck. Beyond the name, Kardach drove much of Intel's early Bluetooth silicon strategy and was instrumental in landing the May 1998 SIG founding charter. The bind-rune logo also came out of that branding work. There is a separate Jim Kardach episode.

## What you'd see in the simulator

The Bluetooth simulation in the app is a BLE Connect, Pair, and GATT Read. Press Play and you watch a phone, in the role of Central, scan the BLE advertising channels. A heart-rate sensor, in the role of Peripheral, is broadcasting advertising packets. The Central picks one, sends a connection request, and the two move off the advertising channels onto a connection's data channel. They negotiate the maximum transmission unit so larger payloads can ride a single packet. Then they pair with LE Secure Connections, the modern elliptic-curve-based pairing introduced in Core 4.2. With the link encrypted, the Central subscribes to notifications on the heart-rate measurement characteristic in the GATT server — and from then on the Peripheral pushes a reading every time the value changes. That same flow is under every fitness tracker, AirTag, hearing aid, and Matter device commissioning over Bluetooth.

## Listening order

- **Before this chapter:** *Wi-Fi* — sets up the sibling 2.4 GHz protocol you stream from. Bluetooth is the one you carry with you, and the contrast lands cleanly when the two are heard back to back.
- **After this chapter:** *Cellular — 4G LTE + 5G NR + the 3GPP machine* — moves outdoors and onto licensed spectrum, the only wireless family with strictly more deployed silicon than Bluetooth.

## Where to go deeper

- **The Bluetooth protocol episode** picks up the mechanism story — the BR/EDR hopping pattern and piconet timing, the BLE link layer and advertising channels, GATT services and characteristics, SMP pairing, LE Audio and the LC3 codec, and the KNOB / BIAS / BLUFFS incident timeline.
- **The UWB episode** is the other side of the Channel Sounding story — how Ultra-Wideband already owns secure-access and digital-key, and what changes now that BLE 6.0 can range to centimetre accuracy on the radio already in every phone.
- **The Wi-Fi episode** is the band-mate — same 2.4 GHz ISM spectrum, completely different goals, and the source of most of the interference that BLE has to live with.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
