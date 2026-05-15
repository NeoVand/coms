---
id: wireless
type: category
name: Wireless
description: Protocols that move bits through the air. From Wi-Fi hotspots to Bluetooth earbuds — every layer where the physical medium is radio rather than copper or fibre.
podcast_target_minutes: 30
protocols: [wifi, bluetooth, cellular, nfc, zigbee, uwb]
related_pioneers: [marty-cooper, andrew-viterbi, irwin-jacobs, jaap-haartsen, sven-mattisson, jim-kardach, karsten-nohl]
related_book_chapters:
  - wireless/the-shared-medium
  - wireless/wifi
  - wireless/bluetooth
  - wireless/cellular
  - wireless/nfc
  - wireless/uwb
  - wireless/zigbee
  - wireless/security-across-the-wireless-family
  - wireless/spectrum-and-the-frontier
related_outages: []
related_frontier: [wifi-7-ratified]
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bluetooth.svg/250px-Bluetooth.svg.png"
    caption: "The Bluetooth logo is a bind-rune combining Hagall and Bjarkan — the initials of Harald Blaatand, the 10th-century Danish king who united Denmark and Norway. Jim Kardach proposed the name as a placeholder during a 1997 SIG meeting. It was never supposed to ship."
    credit: "Image: Wikimedia Commons / Public Domain (Bluetooth SIG trademark)"
visual_cues:
  - "A tall vertical spectrum ladder. 13.56 megahertz NFC at the bottom, 868 and 915 megahertz LoRa above it, the 2.4 gigahertz ISM band as a crowded shelf labelled with Wi-Fi, Bluetooth, Zigbee, Thread, microwave ovens, and baby monitors, then 5 gigahertz, then a 1200 megahertz block at 6 gigahertz labelled FCC 2020 plus EU 2021, then UWB at 6 to 8.5 gigahertz, then mmWave at 24 to 52 gigahertz, then satellite L and S bands at the very top."
  - "A power-range-throughput triangle with each protocol plotted as a dot. NFC in the low-power, low-range corner. Bluetooth Low Energy nearby. Wi-Fi in the high-throughput, medium-range corner. Cellular in the long-range, high-throughput corner. UWB sitting off to one side labelled 'a clock, not a data radio'."
  - "Side-by-side frame diagrams. Left: Ethernet frame with destination MAC, source MAC, EtherType, payload, FCS — six fields. Right: 802.11 frame with frame control, duration, three MAC addresses (receiver, transmitter, destination), sequence control, encrypted payload, FCS — eight fields. Caption: the cost of a shared medium."
  - "A timeline ribbon running 1971 to 2026 with seven pins. 1971 ALOHAnet on a roof at the University of Hawaii. 1991 first commercial GSM call in Finland. 1994 Bluetooth invented at Ericsson Lund. 1997 IEEE 802.11 ratified. 2008 LTE Release 8 frozen. 2018 5G NR Release 15 frozen. 2025 Wi-Fi 7 published, T-Mobile and Starlink Direct-to-Cell launches commercially."
  - "A single modern smartphone in cutaway, with five concurrent radios labelled. The 5G NR plus LTE plus NB-IoT plus LTE-M plus Direct-to-Cell modem on one chip, the Wi-Fi plus Bluetooth combo chip, the UWB chip, the NFC controller, the GNSS receiver. Caption: pre-2020 phones had three; 2025 phones have five."
  - "The BLE-bootstrap pattern as a sequence diagram. A car key fob and a phone. Step one: BLE advertisement. Step two: BLE connect and authenticate. Step three: STS_KEY transfer over the encrypted BLE channel. Step four: UWB powers up for a three-message ranging round. Caption: UWB has no power-efficient discovery; BLE provides it."
  - "A Sankey diagram of 2.4 gigahertz airtime in a typical apartment. Wi-Fi taking the largest slice on channels 1, 6, and 11. Bluetooth and BLE hopping across the gaps. Zigbee tucked into channel 26 above Wi-Fi 11. A microwave oven labelled '10 to 15 millisecond windows of total loss'. Caption: the 2.4 gigahertz death spiral."
---

# Wireless

## In one breath

Wireless is the category where the physical medium is radio — not copper, not fibre. Six protocols sit here today: Wi-Fi for local broadband, Bluetooth for personal-area, Cellular for wide-area, NFC for the four-centimetre tap, UWB for centimetre-accurate ranging, and Zigbee for the low-power mesh. Together they cover every wireless surface from a hearing aid sipping power from a coin cell to a phone connecting to a Starlink satellite 600 kilometres overhead. Every architectural choice you will hear about today exists because the medium is shared with everything else operating in the same band — including, sometimes, an attacker.

## The pitch

In June 1971, on a roof at the University of Hawaii, Norman Abramson built a network nobody thought would work. Four islands, one IBM 360, a UHF frequency the U.S. military lent him because the FCC refused. The rule was almost insultingly simple: if you have data, send it. If you don't hear an acknowledgment, send it again later, at a random time, so you don't crash into the next station. He called it ALOHA. Fifty-five years later, the descendants of that random-access idea move nine billion mobile subscriptions, 125 million LoRaWAN sensors, and twelve million people who just texted from a place where there's no cell tower because the cell tower is a Starlink satellite traveling at 7.6 kilometres a second. This is the story of how we learned to share the air.

## The arc

### When the air became a wire

Wired networking is a problem with a known solution: run a cable, agree on a frame format, and you're done. Wireless is a problem with no clean solution. The medium is shared, every transmission reaches every receiver in range, and the laws of physics actively conspire against you — echoes, fading, hidden terminals, interference from microwave ovens. Yet wireless is what makes the modern internet feel personal. You don't carry a Cat-6 cable in your pocket.

Two technologies broke through. Wi-Fi, ratified as IEEE 802.11 in 1997, took Ethernet's shared-medium model — the CSMA/CD that ran on coaxial cable — and adapted it for radio. The radio version is CSMA/CA, with collision avoidance instead of detection, because a wireless NIC's own transmitter saturates its own receiver and it literally cannot hear another station while it is sending. Bluetooth, three years later, took the opposite approach: tiny piconets, frequency-hopping 1,600 times per second to dodge interference, master-slave topology, microamp-scale power budgets. Different goals, different design.

And sitting beside both of them, Cellular — 4G LTE and 5G NR, the 3GPP family the rest of the world calls "the phone network." About nine billion subscriptions in 2026. Where Wi-Fi is unlicensed and operated by whoever owns the building, and Bluetooth is a personal-area network you carry in your pocket, cellular is licensed spectrum, carrier-operated, wide-area, mobile — and architecturally it is one of the largest IPsec plus HTTP/2 microservice fabrics on Earth.

### The timeline that made the family

The timeline is dense. ALOHAnet in 1971. The first handheld cellular call on 3 April 1973 — Marty Cooper of Motorola dialling Joel Engel at AT&T Bell Labs from Sixth Avenue in Manhattan: *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC weighed 2.5 pounds and gave 35 minutes of talk after 10 hours of charging. In 1991 Radiolinja launched the world's first commercial GSM network in Finland — the digital 2G standard the rest of the world built on. In 1994 Jaap Haartsen and Sven Mattisson started work on a 2.4 gigahertz frequency-hopping radio at Ericsson Lund to replace the RS-232 cable to a mobile-phone headset. In 1997 IEEE 802.11 ratified its first wireless LAN standard at 2 megabits per second. In 1998 Ericsson, IBM, Intel, Nokia, and Toshiba signed the Bluetooth SIG charter; the first commercial product, a hands-free headset, shipped at COMDEX 1999.

Then the long arc of refinement. 2008: 3GPP froze LTE Release 8, abandoning WCDMA's spreading codes for an OFDMA air interface — the clean-sheet radio every 5G design choice is later evolved from. 2009: Wi-Fi 4, MIMO arrives. 2010: Bluetooth 4.0 brings Low Energy — a completely different radio bolted onto the same brand, and the design that makes AirPods last six hours and AirTags last a year. 2018: 3GPP Release 15 freezes the first 5G NR specification on 14 June. 2020: Wi-Fi 6 brings OFDMA, BSS Coloring, and Target Wake Time — the architecture that finally fits stadium density. 2024: Bluetooth 6.0 adopts Channel Sounding on 3 September, with centimetre-class ranging up to about 150 metres. 2025: IEEE 802.11be — Wi-Fi 7 — is published on 22 July with 320-megahertz channels in 6 gigahertz, 4096-QAM, and Multi-Link Operation. On 23 July, T-Mobile and Starlink launch the first commercial satellite-to-cell service, on standard band n25 and n26 phones. In January 2026, Frankfurt Airport becomes the first airport to broadcast all gate announcements over Auracast — the LC3-based one-to-many LE Audio that finally replaces analog hearing loops.

### What the timeline keeps re-asking

Every generation re-asks the same question: who gets the channel, when, and at what cost? ALOHAnet's random access becomes Ethernet's CSMA/CD, which becomes Wi-Fi's CSMA/CA. CDMA spreads everyone across the same frequency with orthogonal codes; LTE replaces it with OFDMA's per-subcarrier scheduling; 5G NR builds on the same OFDMA foundation. Bluetooth sidesteps the question entirely with frequency hopping. Cellular doesn't contend at all on the downlink — the base station schedules every slot. The chapter on the shared medium walks through these choices end to end, and the per-protocol episodes go deep on the mechanism for each one.

## The people

### Marty Cooper

The Motorola engineer who placed the first public handheld cellular call on 3 April 1973. He led the DynaTAC team and called Joel Engel at AT&T Bell Labs — his direct rival — from Sixth Avenue in Manhattan. The handset weighed 2.5 pounds and gave 35 minutes of talk after 10 hours of charging. Cooper won the 2013 Charles Stark Draper Prize and is widely called the father of the handheld cell phone. There's a separate episode on him.

### Andrew Viterbi

Invented the Viterbi algorithm in 1967 — a dynamic-programming maximum-likelihood decoder for convolutional codes. It is now used in every cellular phone, every disk-drive read channel, every GPS receiver, and every speech recognizer. On the advice of a lawyer, Viterbi did not patent the algorithm. He co-founded Qualcomm in 1985 and led the company through the CDMA-versus-TDMA wars that culminated in CDMA's mathematical foundation becoming WCDMA inside UMTS. IEEE Medal of Honor 2010. The Cellular episode goes deeper.

### Irwin Jacobs

Co-founded Linkabit and then Qualcomm with Viterbi. Drove the commercial productization of CDMA — IS-95, also called cdmaOne — against entrenched industry preference for TDMA and the Ericsson-led GSM. The first commercial CDMA network launched in Hong Kong in 1995. By 2000 CDMA underpinned all 3G; by 2008 about 1.6 billion subscribers. Jacobs and Klein Gilhousen and Viterbi share the IEEE Milestone Award for CDMA. He has his own episode paired with Viterbi.

### Vic Hayes

Chaired the IEEE 802.11 working group from 1990 to 2002, shepherding the wireless LAN standard from concept to global adoption. Known as the "father of Wi-Fi" for his persistence in driving consensus across a fractious vendor ecosystem. The Wi-Fi episode is where his work lives.

### Jaap Haartsen

The Dutch engineer who designed the Bluetooth radio at Ericsson Lund between 1994 and 1997. Tasked with replacing the RS-232 cable to a mobile-phone headset; his frequency-hopping piconet design became the foundation of every Bluetooth chip ever made. European Inventor Award Lifetime Achievement finalist in 2015. The Bluetooth episode covers the design choices.

### Sven Mattisson

The Swedish engineer who owned the analog RF and CMOS implementation work that paired with Haartsen's digital baseband. The IC-level decisions that made Bluetooth manufacturable at consumer price points. He shows up alongside Haartsen in the Bluetooth episode.

### Jim Kardach

The Intel engineer who proposed the name "Bluetooth" at a 1997 SIG meeting. He picked it after Harald Blaatand Gormsson, the 10th-century Danish king who united Denmark and Norway — analogous to the SIG's goal of uniting Ericsson, IBM, Intel, Nokia, and Toshiba behind one short-range wireless standard. The name was supposed to be a placeholder. It stuck. The Bluetooth episode tells the story.

### Karsten Nohl

The security researcher who, with Henryk Plotz and "Starbug," dismantled MIFARE's proprietary 48-bit Crypto1 cipher at the 24th Chaos Communication Congress in December 2007 — by decapping a chip and photographing about 10,000 gates with an optical microscope. The first canonical "security by obscurity does not scale" lesson in deployed wireless silicon. The Dutch OV-chipkaart kept shipping affected cards until 2024. He shows up in the NFC episode.

### Norman Abramson

The University of Hawaii professor who designed and built ALOHAnet — deployed June 1971 as the first random-access wireless packet-switched data network. He mathematically modelled "pure ALOHA" and "slotted ALOHA" channel utilization, showing that maximum throughput on a pure ALOHA channel was about 18.4 percent — a number every networking engineer eventually memorizes. Robert Metcalfe explicitly built Ethernet on this foundation; Vic Hayes built 802.11 on Ethernet's CSMA/CD adapted to wireless. IEEE Alexander Graham Bell Medal in 2007. He died on 1 December 2020.

### Mathy Vanhoef

The KU Leuven security researcher whose KRACK paper at ACM CCS 2017 broke WPA2 by exploiting nonce reuse on key reinstall in the four-way handshake. Universal — every WPA2 client on Earth needed firmware updates. He followed it with Dragonblood against early WPA3 in 2019, then FragAttacks against 802.11 fragmentation in 2021. His work is the reason any modern wireless engineer's default assumption is "the protocol has bugs, not just the implementation." The Wi-Fi episode covers KRACK in detail.

### Daniele Antonioli

The EURECOM researcher who broke Bluetooth Classic session security three times in five years. KNOB in 2019 forced one-byte encryption keys; BIAS in 2020 bypassed pairing entirely; BLUFFS in 2023, CVE-2023-24023, broke forward and future secrecy from versions 4.2 through 5.4 across 17 chipsets. The BLUFFS toolkit is open-sourced. His running theme: Bluetooth's three-decade standards process did not formally verify the session-key derivation against forward-secrecy goals. The Bluetooth episode goes deep.

### Hedy Lamarr and George Antheil

In 1942 the actress Hedy Lamarr and the composer George Antheil patented a frequency-hopping spread-spectrum scheme for radio-controlled torpedoes, US 2,292,387, "Secret Communication System." It used a piano-roll-like synchronisation mechanism. The U.S. Navy did not deploy it during the war, but the technique became foundational to CDMA, to Bluetooth's adaptive frequency hopping, and to military anti-jam systems. Inducted into the National Inventors Hall of Fame in 2014.

## The protocols (a guided tour)

### Wi-Fi — IEEE 802.11

Universal local broadband on unlicensed spectrum. Wi-Fi took Ethernet's shared-medium model and adapted it for the air: CSMA/CA with a DCF backoff window, RTS/CTS handshakes for hidden terminals, encryption built in because the air can't be physically secured. An 802.11 frame carries three or four MAC addresses where Ethernet has two. The access point bridges between worlds — receives encrypted Wi-Fi frames, decrypts and strips the 802.11 header, then wraps the payload in an Ethernet frame for the wired network. From 11 megabits per second in 1999 to a Wi-Fi 7 theoretical peak around 46 gigabits per second, with realistic peak around 23. Wi-Fi 7 was published 22 July 2025 and certified by the Wi-Fi Alliance in January 2024; Wi-Fi 8, IEEE 802.11bn, finalised Draft 1.0 in July 2025 with publication targeted for March 2028. The Wi-Fi episode is where the mechanism story lives.

### Bluetooth — BR/EDR plus BLE

Personal-area radio in the 2.4 gigahertz ISM band. Two stacks under one brand. BR/EDR — "Classic" — hops 1,600 times per second across 79 one-megahertz channels and still carries the A2DP audio in every set of wireless headphones. BLE, added with Bluetooth 4.0 in 2010, is a completely different radio: 40 two-megahertz channels, three primary advertising channels at 37, 38, and 39 chosen specifically to avoid Wi-Fi 1, 6, and 11, GFSK-only modulation, attribute-protocol GATT layered on L2CAP. It's why AirTags last a year on a coin cell. Bluetooth 6.0, adopted on 3 September 2024, added Channel Sounding — phase-based plus round-trip-time ranging on a new LE 2M 2BT PHY, centimetre-class accuracy up to about 150 metres. The Bluetooth episode covers Classic, LE, the 6.0 ranging future, and the BLUFFS arc.

### Cellular — 4G LTE plus 5G NR

The 3GPP family that gets a phone an IP address from a base station up to 50 kilometres away. Treat 4G and 5G as one node — the radio (LTE-Uu, NR-Uu) and the core (EPC, 5GC) co-evolve under one release calendar. About nine billion subscriptions in 2026, the largest wireless deployment on Earth. Release 8 froze in December 2008 with OFDMA on the downlink and SC-FDMA on the uplink. Release 15 froze the first 5G NR spec on 14 June 2018, with service-based 5G Core, flexible numerology, and mmWave (FR2) support. Release 18 — "5G-Advanced" — froze in June 2024 with native AI/ML for the RAN, carrier-phase positioning, and tighter NTN integration. Release 19 closes end-of-2025; Release 20 begins formal 6G study. NB-IoT and LTE-M ride inside the cellular envelope as narrowband IoT bearers. The Cellular episode goes deep on FR1 versus FR2, NSA versus SA, EPC versus 5GC SBA, and the SS7 and Diameter signalling failures still riding the layer below.

### NFC — Near Field Communication

Inductive coupling at 13.56 megahertz. Range is about four centimetres. Throughput is 106, 212, or 424 kilobits per second. Passive tags harvest energy from the reader's field — no battery. Standardised by ISO/IEC 18092 and the NFC Forum. Every reader has used it: Apple Pay, transit cards, hotel keys. Matter 1.4.1 added NFC tap-to-pair commissioning in early 2025; the NFC Forum Wireless Charging Specification was extended in 2024 for small-device charging up to 1 watt. The pedagogical role NFC plays here is the on-ramp to contactless RFID and to the BLE-bootstrap pattern the rest of the category leans on. The NFC episode is the deep dive.

### Zigbee — IEEE 802.15.4 mesh

The 2.4-gigahertz, 250-kilobit, low-power mesh that runs the Philips Hue installed base. Sixteen two-megahertz channels at 11 through 26. Channel 26 sits at 2.480 gigahertz, deliberately above Wi-Fi 11, which is why most Zigbee installs find their feet on 26. More than a billion Zigbee chips have shipped lifetime; the market sat between $4.7 and $5.2 billion in 2025. The trajectory is clearly down for new deployments versus Thread plus Matter, but the installed base for lighting and switches is enormous. The Zigbee episode covers the mesh, the coordinator, and how the whole ecosystem is migrating into Matter.

### UWB — Ultra-Wideband

Sub-nanosecond impulse radio at 6 to 8.5 gigahertz, channels 5 and 9. Throughput up to 27 megabits per second — but it is rarely used for data. UWB is a clock, not a data radio: ranging accuracy around 10 centimetres, ranging power budget under one milliwatt average. IEEE 802.15.4z is the PHY, published 2020. FiRa Consortium Core 4.0 shipped 3 December 2025 with UL-TDoA tag tracking and Aliro UWB digital-lock certification. CCC Digital Key 3.0 — the BLE plus UWB plus NFC standard from BMW, Hyundai-Kia, Mercedes-Benz, and others — drives the next wave. UWB never starts on its own: the lock or car advertises a service over BLE, the phone connects, runs SPAKE2+ authentication, transfers the STS_KEY over the encrypted BLE channel, and only then powers up the UWB radio for a three-message DS-TWR ranging round. The UWB episode covers FiRa, CCC Digital Key, and the Ghost Peak attack that motivated IEEE 802.15.4ab.

## Advanced topics (from the deep-dive)

### The power-range-throughput triangle

Every wireless protocol picks two corners of a three-way trade-off. NFC picks low power and low range — passive cards harvest microwatts from the reader's field at four centimetres and trade everything for a 13.56-megahertz carrier that physics caps at 424 kilobits per second. BLE picks low power and medium throughput — coin-cell devices at 1 to 2 megabits per second over 10 metres. Wi-Fi picks high throughput and medium range — gigabit speeds at 30 metres but with hundreds of milliwatts of transmit power. Cellular picks range and throughput at the cost of power and licensed spectrum — 50 kilometres with the right base station, 1 to 10 gigabits per second in FR1, but you don't run a base station on a coin cell. UWB sits in a corner of its own: wide bandwidth and low average power by trading time-of-flight precision for any meaningful data rate. Pick any two; the third is what the spec is really negotiating.

### CSMA/CA — collision avoidance in a medium you can't monitor

Wired Ethernet uses CSMA/CD: a station listens while it transmits and aborts the moment another station's signal collides. That trick is impossible on radio — your own transmitter saturates your own receiver, so a wireless NIC literally cannot hear another station while it is sending. Every wireless MAC therefore uses CSMA/CA: listen-before-talk, plus a randomised back-off if the channel was busy. Wi-Fi's flavour is DCF. Before each frame, the station senses the channel for a DIFS interval of 28 to 34 microseconds, picks a random slot from a contention window starting at 15 and doubling on collision up to 1023, then transmits if still idle. Every successful frame is ACKed after a SIFS gap of about 10 microseconds. RTS/CTS is the optional defence against hidden terminals — the sender first asks "may I?" with a tiny Request-to-Send, the receiver responds with Clear-to-Send, and every station that heard either falls silent for the negotiated duration. Bluetooth sidesteps the whole problem by frequency hopping. Cellular doesn't contend at all on the downlink — the base station schedules every slot. The cost of CSMA/CA is airtime overhead. At Wi-Fi 6's nominal 9.6 gigabits per second, real throughput on a busy AP is closer to 1 to 2 gigabits because half the airtime is DIFS, SIFS, ACKs, beacons, and back-off.

### The 2.4 gigahertz coexistence dance

Four protocol families share the unlicensed 2.4 gigahertz ISM band: Wi-Fi on 20-megahertz channels centred at 2412, 2437, and 2462 megahertz — the canonical 1, 6, and 11 trio; Bluetooth BR/EDR with 79 one-megahertz channels hopping 1,600 times per second; BLE with 40 two-megahertz channels; and Zigbee plus Thread on IEEE 802.15.4 with 16 two-megahertz channels at 11 through 26. Plus microwave ovens, baby monitors, cordless phones, and every other device the FCC ever granted Part 15 to. Modern combo chips — Apple H-series, Broadcom, Qualcomm — put Wi-Fi and Bluetooth radios on the same die and arbitrate airtime in firmware, time-slicing so one starves the other only briefly. Zigbee channels 11 through 14 sit under Wi-Fi 1; 15, 20, 25, and 26 fit in the gaps between Wi-Fi 1, 6, and 11. The single most common cause of unreliable Zigbee is a coordinator dongle plugged directly into a Wi-Fi router's USB port — the router's switched-mode PSU radiates broadband 2.4-gigahertz noise. BLE picks its primary advertising channels — 37, 38, and 39 — at 2402, 2426, and 2480 megahertz, deliberately outside Wi-Fi 1, 6, and 11. The 5 and 6-gigahertz escape valve helps; modern Wi-Fi increasingly lives up there where it has the spectrum to itself, but 2.4 remains the universal floor because it penetrates walls better at the same power. And there is the 2.4-gigahertz death spiral: as airtime rises, retries rise, which raises airtime, which raises retries. Dense apartment buildings have measurable 2.4-gigahertz collapse — when 20 or more APs share three non-overlapping channels, throughput drops by an order of magnitude.

### The BLE-bootstrap pattern

Almost every consumer wireless interaction in 2026 chains multiple radios. The pattern is everywhere once you see it. UWB ranging never starts without BLE first — the lock or car advertises a service UUID over BLE, the phone connects, runs PAKE authentication, transfers the STS_KEY for the UWB session over the encrypted BLE channel, and only then powers up its UWB radio for a three-message DS-TWR ranging round. UWB has no power-efficient discovery mechanism of its own — BLE provides it. Bluetooth and Wi-Fi handover is bootstrapped by NFC — the NFC Forum Connection Handover spec defines NDEF records carrying the BLE MAC plus SMP OOB key, or the Wi-Fi SSID plus WPA2 key. A single four-centimetre tap replaces the entire discovery-plus-pairing dialog on Bluetooth speakers, printers, and Matter device commissioning. Cellular data falls back to Wi-Fi calling when the carrier signal is weak — IPsec ePDG tunnel from the UE to the carrier core over any IP link. Zigbee and Thread are commissioned over BLE — Zigbee Direct is mandatory in R23 Coordinators — or over Wi-Fi for Matter setup; once commissioned they run their own mesh and BLE is just the on-ramp. The architectural rule: the radio with the best discovery and power profile does the bootstrap; the radio with the right property for the workload — range, throughput, precision, security — does the actual session. No single protocol does both well.

### The wireless security history in one arc

Every wireless protocol has been broken at the spec level at least once, and the pattern is similar enough that they are best understood as one story. MIFARE Crypto1 fell at 24C3 in December 2007 — Karsten Nohl, Henryk Plotz, and "Starbug" decapped a chip and photographed roughly 10,000 gates under an optical microscope to recover Philips's proprietary 48-bit stream cipher. Dutch transit cards kept shipping affected hardware until 2024. KRACK fell at USENIX Security 2017 — Mathy Vanhoef and Frank Piessens showed the WPA2 four-way handshake permitted nonce reuse on key reinstall, defeating CCMP integrity. Universal. The 802.11 working group's response was WPA3, with the SAE handshake. KNOB, BIAS, and BLUFFS arrived in 2019, 2020, and 2023 — Daniele Antonioli broke Bluetooth BR/EDR session security three times in five years, ending with CVE-2023-24023, which affected Bluetooth Core Spec 4.2 through 5.4 across 17 chipsets and 18 devices. The Tesla Model 3 BLE relay attack in May 2022 was about $50 of dev boards and 8 milliseconds of relay latency, well below Tesla's roughly 30-millisecond GATT threshold — proving that RSSI proximity is fundamentally broken when an attacker can relay. The industry response was UWB cryptographic distance bounds in CCC Digital Key 3.0; the speed of light is the hard upper bound that no relay can shorten. Then Ghost Peak, USENIX Security 2022, attacked even UWB's STS distance commitment at about 4 percent success with a $65 device, motivating IEEE 802.15.4ab Draft D03 in September 2025 with NBA-MMS narrowband-assist. And SS7 and Diameter abuse remains ongoing — Citizen Lab in 2024 and 2025 documented two surveillance threat actors exploiting the cellular signalling plane that was designed in 1975 with implicit trust between carriers; CISA's Kevin Briggs told the FCC in 2024 that SS7 and Diameter attacks had been used in numerous attempts against U.S. targets. The pattern: every spec that depends on a secret algorithm or a trust assumption between operators eventually gets broken in public. Every spec that depends on cryptographic primitives plus open analysis — WPA3, CCMP-256, EMV cryptograms, IEEE 802.15.4z STS as redesigned — survives the next attack.

## Recurring themes

The first theme is that the physical layer is adversarial by default. Wireless is the only major networking category where this is true. Wired networks fail when something breaks. Wireless networks fail because the medium is shared with everything else operating in the same band — including, sometimes, an attacker. Every architectural choice in this category — frequency hopping, CSMA/CA, scheduled access, STS, cryptographic distance bounds — exists to make a hostile medium predictable.

The second theme is the power-range-throughput triangle. You can have any two of long range, high throughput, and low power. There are no protocols in the upper-right-front corner of the cube. Anyone selling you one is selling you marketing.

The third theme is the bootstrap chain. Almost every consumer wireless interaction in 2026 chains multiple radios because no single protocol does both discovery and the heavy session well. NFC bootstraps Wi-Fi or BLE pairing; BLE bootstraps UWB ranging; BLE commissions Zigbee and Thread; cellular falls back to Wi-Fi calling and increasingly the other way around. A modern phone runs five concurrent radios where a 2010 phone ran three, and the orchestration between them is the actual product.

The fourth theme is convergence beating raw speed. Wi-Fi 8 is the first Wi-Fi generation defined by reliability, not throughput — its scope mandates 25 percent improvements in throughput at low SNR, in 95th-percentile latency, and in inter-BSS packet loss, while explicitly keeping the peak rate flat. Bluetooth 6.0's Channel Sounding gives BLE centimetre-class ranging that puts it on collision course with UWB for digital car keys. Matter 1.5 — released 20 November 2025 — added cameras over WebRTC with TCP transport. T-Mobile and Starlink put the cellular base station in space on standard band n25 and n26 phones. The frontier is integration, not gigabits.

## Where this connects in the book

- The chapter on the shared medium is the conceptual prequel to every protocol in this category — spectrum, modulation, the MAC techniques, hidden terminals, the ALOHAnet lineage.
- The Wi-Fi chapter consolidates 802.11 from 1997 to 2026, with the OFDMA, MLO, 6-gigahertz AFC, MU-MIMO, and WPA2/3 story end to end.
- The Bluetooth chapter covers BR/EDR, BLE, mesh, LE Audio plus Auracast, Channel Sounding, and the KNOB-BIAS-BLUFFS arc.
- The Cellular chapter is the single-node treatment — radio, core, VoLTE, Wi-Fi calling, NB-IoT and LTE-M sidebars, the release cadence, and the SS7 and Diameter failure case.
- The NFC chapter covers ISO 18092, the tag types, EMV, transit, Apple Pay, car keys, and Matter 1.4.1 commissioning.
- The UWB chapter covers IEEE 802.15.4z, FiRa Core 4.0, CCC Digital Key 3.0, Apple U1 and U2, Aliro digital locks, and the EU-versus-FCC regulatory split.
- The Zigbee chapter covers the 802.15.4 mesh, 6LoWPAN, and the migration into Matter.
- The chapter on security across the wireless family ties KRACK, FragAttacks, BLUFFS, KNOB and BIAS, SS7 and Diameter, the LoRaWAN replay history, and the post-quantum migration into one arc.
- The chapter on spectrum and the frontier covers 6 gigahertz, mmWave, the Ligado L-band fight, WRC-27, Ambient IoT, Wi-Fi 8, and the 6G targets.

## See also (other category episodes)

The Network Foundations episode is what wireless rides on — the access point bridges 802.11 frames into 802.3 Ethernet frames, and from IP's perspective the wireless hop is invisible. Which is exactly the problem TCP and friends have to solve.

The Transport episode is the layer that has to cope with what radio actually does. TCP was designed for wired loss equals congestion, but on a lossy radio loss equals interference, which is transient. Fast Retransmit, SACK, RACK, F-RTO for spurious timeouts on handover, BBR, and link-layer ARQ all live there. QUIC moves loss recovery into user space, encrypts the entire transport, and uses connection IDs so mobility doesn't break the flow — the single most important protocol-stack change for wireless in the 2020s.

The Real-time A/V episode is the high-level cousin. VoLTE runs SIP and RTP over IMS over the LTE bearer; Wi-Fi calling runs the same SIP and RTP into the same IMS, only the access network differs. Matter 1.5's camera streams use WebRTC with STUN and TURN. Every interesting modern A/V workload eventually has to ride a wireless link.

The Utilities and Security episode is where the cross-cutting story lives. Wi-Fi protects the L2 hop with CCMP under WPA2 and GCMP under WPA3. Bluetooth provides its own pairing-derived link keys. Cellular has IPsec or 5G-AKA-derived keys to the gNB. None of these protects end-to-end — TLS 1.3 still does the heavy lifting on top.

## Visual cues for image generation

- A tall vertical spectrum ladder. 13.56 megahertz NFC at the bottom, 868 and 915 megahertz LoRa above it, the 2.4 gigahertz ISM band as a crowded shelf labelled with Wi-Fi, Bluetooth, Zigbee, Thread, microwave ovens, and baby monitors, then 5 gigahertz, then a 1200-megahertz block at 6 gigahertz labelled FCC 2020 plus EU 2021, then UWB at 6 to 8.5 gigahertz, then mmWave at 24 to 52 gigahertz, then satellite L and S bands at the very top.
- A power-range-throughput triangle with each protocol plotted as a dot. NFC in the low-power, low-range corner. Bluetooth Low Energy nearby. Wi-Fi in the high-throughput, medium-range corner. Cellular in the long-range, high-throughput corner. UWB sitting off to one side labelled "a clock, not a data radio."
- Side-by-side frame diagrams. Left: Ethernet frame with destination MAC, source MAC, EtherType, payload, FCS — six fields. Right: 802.11 frame with frame control, duration, three MAC addresses (receiver, transmitter, destination), sequence control, encrypted payload, FCS — eight fields. Caption: the cost of a shared medium.
- A timeline ribbon running 1971 to 2026 with seven pins. 1971 ALOHAnet on a roof at the University of Hawaii. 1991 first commercial GSM call in Finland. 1994 Bluetooth invented at Ericsson Lund. 1997 IEEE 802.11 ratified. 2008 LTE Release 8 frozen. 2018 5G NR Release 15 frozen. 2025 Wi-Fi 7 published, T-Mobile and Starlink Direct-to-Cell launches commercially.
- A single modern smartphone in cutaway, with five concurrent radios labelled. The 5G NR plus LTE plus NB-IoT plus LTE-M plus Direct-to-Cell modem on one chip, the Wi-Fi plus Bluetooth combo chip, the UWB chip, the NFC controller, the GNSS receiver. Caption: pre-2020 phones had three; 2025 phones have five.
- The BLE-bootstrap pattern as a sequence diagram. A car key fob and a phone. Step one: BLE advertisement. Step two: BLE connect and authenticate. Step three: STS_KEY transfer over the encrypted BLE channel. Step four: UWB powers up for a three-message ranging round. Caption: UWB has no power-efficient discovery; BLE provides it.
- A Sankey diagram of 2.4 gigahertz airtime in a typical apartment. Wi-Fi taking the largest slice on channels 1, 6, and 11. Bluetooth and BLE hopping across the gaps. Zigbee tucked into channel 26 above Wi-Fi 11. A microwave oven labelled "10 to 15 millisecond windows of total loss." Caption: the 2.4 gigahertz death spiral.

## Sources

### RFCs and standards

- [IEEE 802.11 Working Group](https://ieee802.org/11/)
- [IEEE 802.11be / Wi-Fi 7 (Wikipedia summary)](https://en.wikipedia.org/wiki/IEEE_802.11be)
- [IEEE 802.11bn / Wi-Fi 8 (Wikipedia summary)](https://en.wikipedia.org/wiki/IEEE_802.11bn)
- [3GPP Release 18 specifications page](https://www.3gpp.org/specifications-technologies/releases/release-18)
- [Bluetooth Core 6.0 feature overview (Bluetooth SIG)](https://www.bluetooth.com/core-specification-6-feature-overview/)
- [ISO/IEC 18092:2023 sample (NFC base spec)](https://cdn.standards.iteh.ai/samples/82095/eddfc4030cb24d4cb193330e81323e54/ISO-IEC-18092-2023.pdf)
- [FiRa Core 4.0 specifications and certification program (Dec 2025)](https://www.firaconsortium.org/news/press-releases/2025/12/fira-consortium-unveils-fira-core-4-0-specifications-and-certification)
- [FiRa to integrate IEEE 802.15.4ab (Oct 2025)](https://www.firaconsortium.org/news/press-releases/2025/10/fira-consortium-to-integrate-ieee-802-15-4ab-advancements-into-future)
- [FCC OET DA-24-166 — Seven 6 GHz AFC systems approved (23 Feb 2024)](https://docs.fcc.gov/public/attachments/DA-24-166A1.pdf)
- [FCC fact sheet — 6 GHz VLP expansion (Nov 2024)](https://docs.fcc.gov/public/attachments/DOC-407628A1.pdf)

### Papers

- [Vanhoef and Piessens — Key Reinstallation Attacks (KRACK), ACM CCS 2017](https://www.krackattacks.com/)
- [Vanhoef and Piessens — Release the Kraken (CCS 2018 follow-up)](https://www.krackattacks.com/followup.html)
- [Antonioli — BLUFFS, ACM CCS 2023, CVE-2023-24023](https://dl.acm.org/doi/10.1145/3576915.3623066)
- [BLUFFS toolkit (GitHub)](https://github.com/francozappa/bluffs)
- [Tiemann et al. — IEEE 802.15.4z UWB Ranging Performance under Interference (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8877371/)
- [5G NR Positioning Enhancements in 3GPP Release 18 (arXiv)](https://arxiv.org/pdf/2401.17594)
- [IEEE 802.11be Feature Summary and Performance Evaluation (arXiv)](https://arxiv.org/html/2309.15951v2)
- [Khorov et al. — A Tutorial on Wi-Fi 8 (Springer)](https://link.springer.com/article/10.1134/S003294602502005X)

### Vendor and engineering blogs

- [Cisco Meraki — Wi-Fi 7 Technical Guide](https://documentation.meraki.com/Wireless/Design_and_Configure/Architecture_and_Best_Practices/Wi-Fi_7_(802.11be)_Technical_Guide)
- [Qualcomm — Wi-Fi 8 advancing wireless through ultra-high reliability (July 2025)](https://www.qualcomm.com/news/onq/2025/07/wi-fi-8-advancing-wireless-through-ultra-high-reliability)
- [Qualcomm — Wi-Fi 8 under the hood (Nov 2025)](https://www.qualcomm.com/news/onq/2025/11/wi-fi-8-technologies-powering-ultra-high-reliability)
- [Samsung Research — IEEE 802.11bn Ultra-High Reliability](https://research.samsung.com/blog/IEEE-802-11bn-Ultra-High-Reliability-UHR-Wi-Fi-8)
- [Samsung Research — FiRa 4.0 Specification Release](https://research.samsung.com/blog/FiRa-4-0-Specification-Release-and-Certification-Program-launching)
- [Samsung Research — CSA Matter 1.5 Release Camera support](https://research.samsung.com/blog/CSA-Matter-1-5-Release-Introducing-support-for-Cameras)
- [Nordic Semiconductor — Bluetooth 6.0 Channel Sounding on nRF54 (Sept 2024)](https://www.nordicsemi.com/Nordic-news/2024/09/Bluetooth-6-Channel-Sounding-supported-by-Nordic-Semiconductors-upcoming-nRF54-Series-SoCs)
- [Silicon Labs — The new and improved Bluetooth 6.0](https://www.silabs.com/blog/the-new-and-improved-bluetooth-6-0)
- [u-blox — Introduction to Bluetooth Channel Sounding](https://www.u-blox.com/en/technologies/bluetooth-channel-sounding)
- [Ericsson — 5G-Advanced positioning in 3GPP Release 18](https://www.ericsson.com/en/blog/2024/11/5g-advanced-positioning-in-3gpp-release-18)
- [Nokia — 5G-Advanced standards](https://www.nokia.com/standardization/technology-standards/5G-advanced/)
- [Ruckus / CommScope — FCC 6 GHz AFC certification for the R770 (April 2024)](https://www.ruckusnetworks.com/blog/2024/fcc-6-ghz-afc-device-certification-opens-new-possibilities-for-the-ruckus-r770-wi-fi-7-ap/)
- [WWT — Automated Frequency Coordination for 6 GHz Wi-Fi](https://www.wwt.com/blog/automated-frequency-coordination-afc-for-6ghz-wi-fi)
- [LoRa Alliance — 125 million devices deployed (Dec 2025)](https://www.globenewswire.com/news-release/2025/12/10/3202982/0/en/LoRa-Alliance-Reports-125-Million-LoRaWAN-End-Devices-Deployed-Globally.html)
- [LoRa Alliance — LoRaWAN enters its next growth phase (Feb 2026)](https://lora-alliance.org/lora-alliance-press-release/lorawan-enters-its-next-growth-phase-as-massive-iot-scales-globally/)
- [Bluetooth SIG — Auracast broadcast audio market impact](https://www.bluetooth.com/blog/how-auracast-broadcast-audio-is-expanding-audio-streaming-and-a-look-at-the-market-impact-it-could-have-in-2026-and-beyond/)
- [Bluetooth SIG — Auracast for hearing aids](https://www.bluetooth.com/blog/auracast-broadcast-audio-will-transform-listening-experiences-for-those-using-hearing-aids/)
- [Silicon Labs — Z-Wave 800 series](https://www.silabs.com/wireless/z-wave/introduction-to-z-wave-800-series)
- [CSA — Matter 1.5 introduces cameras, closures, and energy management (Nov 2025)](https://csa-iot.org/newsroom/matter-1-5-introduces-cameras-closures-and-enhanced-energy-management-capabilities/)
- [P1 Security — SS7, Diameter, GTP, IMS and 5G threats](https://www.p1sec.com/blog/legacy-and-modern-protocols-at-risk-ss7-diameter-gtp-ims-5g-security-threats)
- [STMicroelectronics joins FiRa board (Sept 2025)](https://www.globenewswire.com/news-release/2025/09/22/3153937/0/en/STMicroelectronics-joins-FiRa-board-strengthening-commitment-to-UWB-ecosystem-and-automotive-Digital-Key-adoption.html)
- [Pozyx — The state of UWB in 2025](https://www.pozyx.io/newsroom/the-state-of-uwb)

### News

- [Light Reading — 5G-Advanced arrives with 3GPP Release 18 (June 2024)](https://www.lightreading.com/6g/5g-advanced-arrives-with-3gpp-s-release-18)
- [Lumenci — Advanced 5G, 3GPP Release 18](https://lumenci.com/blogs/advanced-5g-3gpp-release-18/)
- [RCR Wireless — FCC approves seven AFCs for 6 GHz](https://www.rcrwireless.com/20240224/featured/fcc-approves-seven-afcs-for-6-ghz)
- [T-Mobile — T-Satellite with Starlink coverage page](https://www.t-mobile.com/coverage/satellite-phone-service)
- [Broadband Breakfast — T-Mobile and Starlink launch July 23 (June 2025)](https://broadbandbreakfast.com/t-mobile-and-starlink-satellite-service-to-officially-launch-july-23/)
- [Starlink — Direct to Cell service (Feb 2025 PDF)](https://starlink.com/public-files/DIRECT_TO_CELL_SERVICE_FEB_25.pdf)
- [Starlink — Direct to Cell business page](https://starlink.com/business/direct-to-cell)
- [T-Mobile — T-Satellite is here, now powering apps (Oct 2025)](https://www.t-mobile.com/news/network/t-satellite-data-ready-app-expansion)
- [Via Satellite — T-Mobile cuts price on Starlink satellite messaging (April 2025)](https://www.satellitetoday.com/connectivity/2025/04/25/t-mobile-cuts-price-on-starlink-satellite-messaging-service-to-start-in-july/)
- [BleepingComputer — New BLUFFS attack lets attackers hijack Bluetooth connections](https://www.bleepingcomputer.com/news/security/new-bluffs-attack-lets-attackers-hijack-bluetooth-connections/)
- [The Register — Weak session keys let snoops eavesdrop on Bluetooth (Nov 2023)](https://www.theregister.com/2023/11/30/bluetooth_bluffs_attacks_are_no/)
- [SecurityWeek — New BLUFFS Bluetooth attack methods](https://www.securityweek.com/new-bluffs-bluetooth-attacks-have-large-scale-impact-researcher/)
- [CyberSecurityNews — Hackers abuse SS7 and Diameter to track mobile users worldwide](https://cybersecuritynews.com/hackers-abuse-ss7-and-diameter-protocols/)
- [GBHackers — Hackers exploit SS7 and Diameter flaws](https://gbhackers.com/hackers-exploit-ss7-and-diameter-flaws/)
- [CEPro — CSA releases Matter 1.5](https://www.cepro.com/news/connectivity-standards-alliance-releases-matter-1-5-adding-cameras-closures-and-new-energy-features/623552/)
- [AppleInsider — CSA's Chris LaPre on camera support in Matter 1.5](https://appleinsider.com/articles/25/11/20/csas-chris-lapre-gets-candid-about-camera-support-in-matter-15)
- [Aurahear — CES 2026 Auracast webinar (Jan 2026)](https://aurahear.com/2026/01/ces-2026-auracast-future-promise/)
- [RFID Journal — BLE-based Auracast is rolling out](https://www.rfidjournal.com/news/ble-based-auracast-is-rolling-out-for-audio-hearing-impairment-applications/221700/)
- [Hearing Health Foundation — Auracast landscape expands](https://hearinghealthfoundation.org/blogs/auracast-landscape-expands)
- [Embedded — LoRa Alliance 2025 report on LoRaWAN growth](https://www.embedded.com/lora-alliance-2025-report-highlights-lorawan-growth)
- [IoT For All — LoRa Alliance at Enlit Europe 2025](https://www.iotforall.com/news/lo-ra-alliance-highlights-how-lo-ra-wan-technology-is-powering-europe-s-digital-energy-transition)
- [IoT For All — Bluetooth Channel Sounding indoor sensing](https://www.iotforall.com/bluetooth-channel-sounding-indoor-sensing)
- [UH News — In memoriam Norman Abramson (Dec 2020)](https://www.hawaii.edu/news/2020/12/04/in-memoriam-norman-abramson/)
- [ETHW — Milestones, ALOHA Packet Radio Data Network 1971](https://ethw.org/Milestones:Demonstration_of_the_ALOHA_Packet_Radio_Data_Network,_1971)
- [UH College of Engineering — ALOHAnet history](https://www.eng.hawaii.edu/about/history/alohanet/)

### Wikipedia

- [ALOHAnet](https://en.wikipedia.org/wiki/ALOHAnet)
- [Norman Abramson](https://en.wikipedia.org/wiki/Norman_Abramson)
- [Andrew Viterbi](https://en.wikipedia.org/wiki/Andrew_Viterbi)
- [KRACK](https://en.wikipedia.org/wiki/KRACK)
- [Near-field communication](https://en.wikipedia.org/wiki/Near-field_communication)
- [Signalling System No. 7](https://en.wikipedia.org/wiki/Signalling_System_No._7)
- [Automated Frequency Coordination](https://en.wikipedia.org/wiki/Automated_Frequency_Coordination)
- [FiRa Consortium](https://en.wikipedia.org/wiki/FiRa_Consortium)
