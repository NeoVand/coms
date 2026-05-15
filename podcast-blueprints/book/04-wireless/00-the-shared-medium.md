---
id: the-shared-medium
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: The shared medium
synopsis: Why wireless networking is a different problem from wired networking — the medium is shared, signals fade, and physics actively conspires against you.
podcast_target_minutes: 15
position_in_book: 30 of 75
listening_order:
  prev: transport/quic
  next: wireless/wifi
related_protocols: [wifi, ethernet, bluetooth, cellular, ipsec, http2, ip]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A split-screen diagram. Left: a wired Ethernet link — one cable, point-to-point, frame format known. Right: a wireless cell — one antenna at the centre, every device in range hearing every transmission, with arrows for echoes, fading, and a microwave oven jamming the 2.4 GHz band."
  - "Three concentric coverage rings labelled by range: Bluetooth at one to ten metres for personal area, Wi-Fi at tens of metres inside a building, Cellular at fifty kilometres from a tower — and a fourth dotted ring labelled Starlink at six hundred kilometres overhead."
  - "A timeline of the founding moments: 3 April 1973 — Marty Cooper places the first handheld cell call from Sixth Avenue in Manhattan; 1994 — Jaap Haartsen starts the Bluetooth radio in Lund; 1997 — IEEE ratifies 802.11; May 1998 — the Bluetooth SIG forms with Ericsson, IBM, Intel, Nokia, Toshiba; December 2008 — 3GPP Release 8 freezes LTE; June 2018 — Release 15 freezes 5G NR."
  - "An architecture cross-section of a 5G core: a swarm of small services labelled AMF, SMF, UPF, AUSF, UDM, PCF, NRF talking to each other over HTTP/2 with JSON payloads inside TLS, with every N2 and N3 link wrapped in IPsec ESP. Caption: the largest enterprise IPsec deployment on Earth."
  - "A 2.4 GHz spectrum strip showing who lives there: Wi-Fi channels 1, 6, and 11; Bluetooth's 79 one-megahertz hops; Zigbee channels 11–26; a microwave oven leakage band. Caption: the most contested piece of radio real estate in consumer electronics."
---

# Part V, Chapter — The shared medium

## The hook

Wired networking is a problem with a known solution. Run a copper or fibre line, agree on a frame format, and you are done. Wireless is a problem with no clean solution. The medium is shared, every transmission reaches every receiver in range, and the laws of physics actively conspire against you. Echoes, fading, hidden terminals, interference from microwave ovens. And yet wireless is what makes the modern internet feel personal — you do not carry a Cat-6 cable in your pocket.

## The story

### When the Air Became a Wire

The wired story has a clean shape. Bob Metcalfe sketched Ethernet at Xerox PARC in 1973, the DIX consortium published the standard in 1980, and the IEEE ratified 802.3 in 1983. From the beginning the design was permissive. The cable carried a known voltage. Every station could hear every other station. Collisions were detected by listening while transmitting. The bus topology eventually gave way to switches that learned MAC addresses and forwarded frames to a single port, and the speeds went from ten megabits in 1983 to eight hundred gigabits in 2024. The full evolution belongs in the Ethernet episode. What matters here is the contrast. The wire is a controlled environment. You own it. You can put a frame on it and know what comes out the other end.

The air is not a controlled environment. A radio has to share its spectrum with every other radio in range, and it cannot listen while it transmits — the transmitter overwhelms its own receiver. So the entire Ethernet trick of *carrier sense plus collision detection* — CSMA/CD — does not work over a radio. You also get problems that have no analogue in copper. Two stations can both be in range of an access point but out of range of each other, so neither knows the other is transmitting. That is the hidden terminal problem. Signals bounce off walls and arrive at the receiver as overlapping copies of themselves. That is multipath fading. A 2.45 gigahertz microwave oven leaks enough energy to drown out a 2.4 gigahertz Wi-Fi channel three rooms away. The medium is loud, lossy, and adversarial — and it is the same medium that has to carry a 4K video stream to a phone.

### Two Technologies That Broke Through

Two designs made wireless work for ordinary people, and they took opposite roads.

**Wi-Fi**, standardised as IEEE 802.11 in 1997, is what happens when you take Ethernet's shared-medium model and adapt it for radio. The original 802.11 ran at two megabits per second. 802.11b in 1999 brought eleven, 802.11g in 2003 hit fifty-four, 802.11n — Wi-Fi 4 — added MIMO in 2009 for six hundred, 802.11ac — Wi-Fi 5 — pushed to gigabit speeds in 2014, 802.11ax — Wi-Fi 6 — added OFDMA in 2020 for dense environments, and 802.11be — Wi-Fi 7 — delivers up to forty-six gigabits per second with multi-link operation in 2024. The architectural shift was *avoidance, not detection*. CSMA/CA replaces CSMA/CD. RTS and CTS handshakes prevent two hidden terminals from clobbering each other at the access point. Every frame has to be acknowledged because the sender cannot otherwise know whether the receiver heard it. Encryption is mandatory in any modern deployment, because the air cannot be physically secured the way a cable can — WPA3 is the current baseline. The full mechanism story — the four-way key exchange, the SAE handshake, the airtime fairness work — is the Wi-Fi episode.

**Bluetooth**, finalised in 1999, took the opposite road. Where Wi-Fi tried to extend the LAN, Bluetooth started by trying to replace the RS-232 cable to a mobile-phone headset. The 1994 Ericsson project in Lund led to a design built for personal-area scale — tiny piconets of one master and a handful of peripherals, frequency-hopping across seventy-nine one-megahertz channels at sixteen hundred hops per second to dodge interference, microamp-scale power budgets so the radio could live on a coin cell. Bluetooth Low Energy was added in Core 4.0 in December 2009 — derived from Nokia's Wibree work — and is genuinely a different protocol braided into the same brand. Different radio, forty channels of two megahertz each. Different link layer. Different framing, different security, different application protocol. They share the 2.4 gigahertz ISM band and a SIG, and almost nothing else. Roughly four point seven billion Bluetooth integrated circuits ship every year, the highest unit volume of any wireless protocol on Earth. Mechanism details — the GATT profile, the Channel Sounding ranging that arrived in Bluetooth 6.0 in September 2024, the Auracast LE Audio broadcast that Frankfurt Airport switched on for gate announcements on 28 January 2026 — those belong in the Bluetooth episode.

### The Third Surface — Cellular

Sitting beside Wi-Fi and Bluetooth in this part of the book is the largest wireless deployment on Earth. The 3GPP cellular family — 4G LTE, frozen as Release 8 in December 2008, and 5G NR, frozen as Release 15 in June 2018 — runs roughly nine billion subscriptions in 2026. Where Wi-Fi is unlicensed and operated by whoever owns the building, and Bluetooth is a personal-area network you carry in your pocket, cellular is *licensed spectrum, carrier-operated, wide-area, and mobile*. A phone can hand off between towers at highway speed. A base station can be fifty kilometres away.

The thing that makes cellular feel different from any other wireless system in this book is what sits behind the antenna. The radio stack — OFDMA on the air interface, MAC doing hybrid ARQ over an eight-process retransmission engine, RLC handling segmentation, PDCP doing header compression and AES ciphering, RRC driving the connection state machine, NAS carrying mobility and authentication — is detailed protocol work the Cellular episode unpacks beat by beat. The architectural shock is the core network.

The 4G core, EPC, was a small zoo of named monolithic boxes — MME, SGW, PGW, HSS, PCRF — glued together by GTP and Diameter. The 5G core, 5GC, threw that out. It is a *service-based architecture*. Dozens of network functions — AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF — talk to each other over HTTP/2 with JSON payloads protected by TLS. The control plane of every modern carrier on Earth is now an HTTP/2 microservice fabric. Every N2 and N3 interface between the radio access network and the core is wrapped in IPsec ESP per 3GPP TS 33.501. This is, by some distance, the largest enterprise IPsec deployment on Earth. The full HTTP/2 multiplexing story is the HTTP/2 episode; the IPsec envelope, IKEv2, and its post-quantum work belong to the IPsec episode; the radio and core walkthrough is the Cellular episode. What this chapter wants you to take away is that the modern phone network is, architecturally, an IP fabric on top of an IPsec fabric on top of an HTTP/2 service mesh — and the radio is the easy part.

### One Brand, Three Surfaces

Together — Wi-Fi for local broadband, Bluetooth for personal area, Cellular for wide area — the three cover every wireless surface that matters. From streaming 4K video to a hearing aid sipping power from a coin cell to a phone connecting to a Starlink satellite six hundred kilometres overhead. They share almost no design choices. Wi-Fi and Bluetooth share the 2.4 gigahertz band and have to coexist by silicon-level time-division arbitration in modern combo chips. Wi-Fi and cellular both move IP traffic but from completely different positions in the spectrum-licensing landscape. Bluetooth and cellular do not really overlap at all. What unifies them is the physics of the medium underneath — shared, lossy, and adversarial — and the fact that every one of them had to invent its own answer to the same question. *How do you build a reliable network on top of an unreliable, contested air?*

## The figures

### Marty Cooper

Cooper led the Motorola DynaTAC team and placed the first public handheld cellular call on 3 April 1973, from Sixth Avenue in Manhattan, to Joel Engel at AT&T Bell Labs — his direct rival. *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC weighed two and a half pounds and gave thirty-five minutes of talk after ten hours of charging. Cooper received the Charles Stark Draper Prize in 2013 and is widely called the father of the handheld cell phone.

### Andrew Viterbi

Viterbi invented the Viterbi algorithm in 1967 — the maximum-likelihood decoder used in every cellular phone, every disk-drive read channel, every GPS receiver, and every speech recogniser. On the advice of a lawyer, he did not patent it. He co-founded Qualcomm in 1985 and led the company through the CDMA-vs-TDMA wars, which culminated in CDMA's mathematical foundation being adopted as WCDMA inside UMTS. He received the IEEE Medal of Honor in 2010.

### Vic Hayes

Hayes chaired the IEEE 802.11 working group from 1990 to 2002, shepherding the wireless LAN standard from concept to global adoption. He is known as the father of Wi-Fi for his persistence in driving consensus across a fractious vendor ecosystem.

### Jaap Haartsen

A Dutch engineer at Ericsson Lund, Haartsen designed the Bluetooth radio between 1994 and 1997. He had been tasked with replacing the RS-232 cable to a mobile-phone headset; his frequency-hopping piconet design became the foundation of every Bluetooth chip ever made. He was a European Inventor Award Lifetime Achievement finalist in 2015.

### Sven Mattisson

A Swedish engineer at Ericsson Research, Mattisson owned the analog RF and CMOS implementation work that paired with Jaap Haartsen's digital baseband. He made the integrated-circuit-level decisions that allowed Bluetooth to be manufactured at consumer price points.

### Jim Kardach

Kardach, at Intel, proposed the name Bluetooth at a 1997 SIG meeting after Harald Blåtand Gormsson, the tenth-century Danish king who united Denmark and Norway. The analogy was that the SIG was trying to unite Ericsson, IBM, Intel, Nokia, and Toshiba behind one short-range wireless standard. The name was supposed to be a placeholder. It stuck.

## Listening order

- **Before this chapter:** *QUIC* — the user-space transport story closed out the wired-internet arc by showing how Google moved a new transport into UDP and out of the kernel. Wireless is where the next set of constraints comes from — the medium itself.
- **After this chapter:** *Wi-Fi* — the first of the three deep dives, picking up the 802.11 evolution from two megabits in 1997 to forty-six gigabits in Wi-Fi 7, plus the CSMA/CA, RTS/CTS, and WPA3 mechanism details.

## Where to go deeper

- **The Wi-Fi episode** picks up the IEEE 802.11 mechanism story — beacons, association, the four-way key exchange, the SAE handshake, OFDMA in Wi-Fi 6, multi-link operation in Wi-Fi 7.
- **The Bluetooth episode** unpacks the two-protocol braid — Classic BR/EDR with its master-slave piconets and frequency hopping, and BLE with GATT, Channel Sounding ranging in Bluetooth 6.0, and the Auracast broadcast LE Audio rollout.
- **The Cellular episode** is the long walk from RRC Setup through 5G-AKA, Security Mode, and PDU Session Establishment to the user plane coming up — every NGAP and GTP-U hop wrapped in IPsec ESP per 3GPP TS 33.501.
- **The Ethernet episode** is the wired contrast — Bob Metcalfe at PARC, CSMA/CD on coax, the switch-and-forward evolution that wireless had to imitate without being able to copy.
- **The IPsec episode** explains the cryptographic envelope underneath the cellular core — IKEv2, AES-GCM and ChaCha20-Poly1305 in ESP, and the post-quantum key-mixing work in RFC 8784, RFC 9242, and RFC 9370.
- **The HTTP/2 episode** is the protocol that turned the 5G core into a microservice fabric — binary framing, multiplexed streams, and HPACK header compression on a single TCP connection.
- **The IP episode** is the layer the entire wireless stack ultimately delivers — the cellular user plane is increasingly IPv6-only, and Wi-Fi just bridges 802.11 frames to 802.3 frames so that the IP layer above never has to know.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
