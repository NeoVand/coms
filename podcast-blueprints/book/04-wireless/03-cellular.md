---
id: cellular
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: Cellular — 4G LTE + 5G NR + the 3GPP machine
synopsis: One node for the radio (LTE-Uu, NR-Uu) and the core (EPC to 5GC SBA) because the release calendar is the same.
podcast_target_minutes: 15
position_in_book: 33 of 75
listening_order:
  prev: wireless/bluetooth
  next: wireless/nfc
related_protocols: [cellular]
related_pioneers: [marty-cooper, andrew-viterbi]
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A split-frame illustration: on the left, Marty Cooper on Sixth Avenue in Manhattan in April 1973 holding a 2.5-pound Motorola DynaTAC to his ear; on the right, a 2026 5G smartphone with a tiny silicon die labeled NR-Uu and an antenna pointing at a mmWave panel."
  - "A two-column architecture diagram: left column labeled EPC with five named boxes — MME, SGW, PGW, HSS, PCRF — connected by GTP and Diameter arrows; right column labeled 5GC with a cloud of microservices — AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF — all bus-connected over HTTP/2 with JSON payloads on TLS."
  - "A protocol-stack tower for 5G NR: PHY (TS 38.211–214) at the bottom carrying OFDMA with five subcarrier spacings — 15, 30, 60, 120, 240 kHz — then MAC with 8-process HARQ, then RLC, then PDCP doing ROHC and AES-CTR, then RRC with the IDLE/CONNECTED/INACTIVE state machine, then NAS, then plain IPv6 on top."
  - "An eight-step storyboard of a 5G-SA phone leaving airplane mode: RRC Setup, Registration Request, 5G-AKA, Security Mode, Registration Accept, PDU Session Establishment, UPF programming, user plane up — with each NGAP and GTP-U arrow drawn inside an IPsec ESP envelope labeled '3GPP TS 33.501.'"
  - "A globe with two satellite icons — a Starlink V2 and an AST SpaceMobile BlueBird — beaming directly into a stock smartphone, dated January 2025, with a caption: 'no signal' is now a regulatory question, not a physics one."
---

# Part V, Chapter — Cellular: 4G LTE, 5G NR, and the 3GPP Machine

## The hook

The control plane of every modern carrier on Earth is now an HTTP/2 microservice fabric. Every backhaul hop between a base station and the core is wrapped in IPsec ESP per 3GPP specification TS 33.501. The single largest enterprise IPsec deployment on the planet runs inside cellular networks. About nine billion subscriptions ride this stack — the largest wireless deployment in human history. And it all started with a 2.5-pound handset on a Manhattan sidewalk in 1973.

## The story

### Two protocols, one ecosystem

Cellular in 2026 is two protocols braided into one ecosystem. The first is 4G LTE, frozen as 3GPP Release 8 in December 2008. It is still the universal floor, the thing your phone falls back to when nothing else is reachable. The second is 5G NR, Release 15, frozen in June 2018 and the current normative baseline for new deployments.

Both share the 3GPP standards body. Both share the same air-interface design philosophy: OFDMA, flexible numerology, and hybrid ARQ. Both mandate the same IPsec envelope on every backhaul link, which the IPsec episode covers in detail. And both have been quietly migrating to IPv6-only on the user plane since around 2020, in line with the IPv6 mandate the IPv6 episode picks up. The book treats them as one encyclopedia node — the way Bluetooth Classic and BLE are one node — because the consumer story is unified even when the radio and the SIG diverge.

### The radio stack

The radio stack is the headline. The physical layer is specified across 3GPP TS 38.211 through 38.214. It carries OFDMA with five numerologies — subcarrier spacings of 15, 30, 60, 120, and 240 kilohertz. That single design choice lets the same protocol address sub-6 gigahertz mid-band, which 3GPP calls FR1, and the millimeter-wave bands, FR2, without forking the standard.

Above the physical layer sits MAC, which runs hybrid ARQ over 8-process stop-and-wait retransmission. Above MAC, RLC handles segmentation and reassembly across 10- and 16-bit sequence numbers. Above RLC, PDCP does header compression with ROHC and AES-CTR ciphering. RRC drives the connection state machine — `RRC_IDLE`, `RRC_CONNECTED`, `RRC_INACTIVE` for 5G — and NAS carries mobility, authentication, and session management end to end between the handset and the core.

Above all of that, the user plane is just IP. Almost always IPv6 now. Above IP, the application runs whatever protocols ordinary internet applications run. The cellular stack ends, and the rest of the book begins.

The point worth lingering on, for an audio audience, is that the radio is not the revolutionary part. The revolution between 4G and 5G lives in the core.

### EPC to 5GC: the architectural revolution

The Evolved Packet Core — EPC — was the LTE core. It is a small zoo of named monolithic boxes. The MME handles mobility. The SGW and PGW handle user-plane forwarding. The HSS holds subscriber state. The PCRF does policy. They glue together with two protocols inherited from earlier generations — GTP for the user plane, Diameter for control. If you have ever debugged an LTE network, you have read packet captures of those two.

5GC, the 5G Core, is a different animal. It is a service-based architecture. Dozens of network functions — AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF, more — talk to each other over HTTP/2 with JSON payloads, protected by TLS. Read that again. The control plane of every modern carrier on Earth is now a microservice fabric speaking the same protocol your browser speaks. The HTTP/2 episode covers the multiplexing and header-compression mechanism that makes that work; the TLS episode covers the envelope; the JSON format is what every web API on the planet has been using since the late 2000s.

And every N2 and N3 interface — the links between the radio access network and the core — is wrapped in IPsec ESP per 3GPP TS 33.501. There is no exception. The largest enterprise IPsec deployment in the world is the one nobody outside telecom thinks about, sitting under the floor of every 5G network on Earth. That is the pull-quote of the chapter, and it is also the engineering thesis.

### The 2026 frontier

Three things are reshaping the cellular layer in 2026, and the chapter flags all three.

The first is 5G-Advanced. Release 18 was frozen in June 2024. Release 19 is in progress as of writing. Release 20 study items for 6G have already kicked off in 2025. The release cadence — one every roughly eighteen months — is the reason this chapter exists as a single node. Whatever the radio looks like in five years, it will still come out of the same 3GPP machine.

The second is Open RAN. Vodafone UK, Deutsche Telekom, Rakuten Symphony, and DISH on AWS Wavelength are all running production deployments that disaggregate the radio access network into commodity hardware and software interfaces. The classical cellular industry was built on tightly integrated stacks from a small number of vendors. Open RAN is the bet that the industry can run on the same separation-of-concerns playbook that the rest of computing has spent the last twenty years adopting.

The third is satellite direct-to-cell. T-Mobile and SpaceX Starlink launched commercial service in January 2025 — an ordinary smartphone, no special hardware, talking to a satellite in low Earth orbit. AT&T's partnership with AST SpaceMobile is moving in the same direction. Apple's Globalstar-based Emergency SOS, which shipped in 2022, was the consumer-facing prelude. Together, these are reshaping what the phrase "no signal" means. The next generation of users will not assume that a remote valley is a dead zone.

## The figures

### Marty Cooper

Marty Cooper, born 1928, led the Motorola DynaTAC team from 1954 to 1983 and placed the first public handheld cellular call on 3 April 1973, from Sixth Avenue in Manhattan. The call went to Joel Engel at AT&T Bell Labs — his direct rival in the race to invent the cell phone. *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC weighed 2.5 pounds and gave 35 minutes of talk time after a 10-hour charge. As Cooper put it later: *"The battery lifetime wasn't really a problem because you couldn't hold that phone up for that long."* He filed the patent for the radio telephone system on 17 October 1973. He won the Charles Stark Draper Prize in 2013 and the IEEE Masaru Ibuka Consumer Electronics Award in 2015. He is 96 and still active in spectrum-policy advocacy. The Marty Cooper episode in the Pioneers part of the book has more.

### Andrew Viterbi

Andrew Viterbi, born 1935, is an Italian-born American electrical engineer who invented the Viterbi algorithm in 1967 — a method for decoding convolutional codes. On the advice of a lawyer, he did not patent it. Today the algorithm sits inside essentially every digital communications system on Earth: every cellular phone, every disk-drive read channel, every GPS receiver, every speech recognizer. It made nothing for him directly. It made Qualcomm everything. He co-founded Linkabit in 1968 with Irwin Jacobs and Leonard Kleinrock, then co-founded Qualcomm on 1 July 1985 — the company that turned CDMA from a research curiosity into a global cellular standard. He won the Marconi Prize in 1990, the National Medal of Science in 2007, and the IEEE Medal of Honor in 2010. The USC Viterbi School of Engineering is named for him after a 52-million-dollar gift in 2004. The Andrew Viterbi episode in the Pioneers part of the book has more.

## What you'd see in the simulator

Press play on the simulator and a phone leaves airplane mode. There are eight beats, and every 5G-SA handset on Earth walks them every time it powers on.

First, RRC Setup — the radio side comes up and the handset establishes a connection to the base station. Second, the Registration Request — the handset announces itself to the AMF in the core. Third, 5G-AKA — the authentication exchange that proves the SIM is who it says it is. Fourth, Security Mode — the cryptographic context for the session is established. Fifth, Registration Accept — the core acknowledges the handset. Sixth, PDU Session Establishment — the handset asks for an IP-bearing data session. Seventh, UPF programming — the User Plane Function is configured to forward this handset's traffic. Eighth, user plane up — the phone has an IP address, and the rest of the internet is reachable.

Every NGAP control message and every GTP-U user-plane packet on the wire between the radio access network and the core is wrapped in IPsec ESP per 3GPP TS 33.501. Pause the simulator on any frame and you can see the encrypted envelope.

## Listening order

- **Before this chapter:** *Bluetooth — Classic, LE, and the 6.0 ranging future* — the short-range, peer-to-peer wireless story that sets up the contrast with cellular's wide-area, infrastructure-heavy model.
- **After this chapter:** *NFC — 4 cm of wireless that runs the global payment rails* — from the largest wireless deployment on Earth to the smallest, and how 4 centimeters of range turned out to be the most economically consequential radio of the last decade.

## Where to go deeper

- The cellular protocol episode picks up the mechanism story — the OFDMA numerologies, the HARQ loop, the PDCP ciphering, the RRC state machine, and the EPC-to-5GC migration in the kind of detail that only fits in a protocol-specific deep dive.
- The IPsec episode covers the ESP envelope that wraps every N2 and N3 hop in every cellular network on Earth, and explains why TS 33.501 made it mandatory.
- The HTTP/2 episode is the surprise prerequisite for understanding the 5G control plane — the same multiplexing and header-compression mechanism that powers modern web APIs is what carries every Service-Based Interface call between AMF, SMF, UPF, and the rest of the 5GC alphabet.
- The IPv6 episode covers the addressing layer that carriers have been quietly migrating their user plane to since around 2020.
- The TLS episode covers the transport-layer envelope on every Service-Based Interface call inside the 5G core.
