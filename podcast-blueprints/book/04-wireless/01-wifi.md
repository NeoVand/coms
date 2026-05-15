---
id: wifi
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: Wi-Fi
synopsis: 802.11 from 1997 to Wi-Fi 8 — CSMA/CA, the move to 5 / 6 GHz, OFDMA, MLO, and the KRACK story that put WPA2 on every CTO's radar.
podcast_target_minutes: 12
position_in_book: 31 of 75
listening_order:
  prev: wireless/the-shared-medium
  next: wireless/bluetooth
related_protocols: [wifi, ethernet, bluetooth, zigbee, nfc, uwb, arp, ipv4]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A staircase of Wi-Fi generations from 1997 to 2024 — 802.11 at 2 Mbps, 802.11b at 11, 802.11g at 54, Wi-Fi 4 at 600 Mbps, Wi-Fi 5 at gigabit, Wi-Fi 6 with OFDMA, Wi-Fi 7 at 46 Gbps."
  - "A frequency-band cartoon with three rooms: a packed 2.4 GHz room jammed with Bluetooth headphones, Zigbee bulbs, Thread sensors, and Wi-Fi laptops; a quieter 5 GHz room with a few laptops; an almost-empty 6 GHz room with a single Wi-Fi 7 router."
  - "A Wi-Fi frame next to an Ethernet frame, side by side — Ethernet has two MAC addresses, Wi-Fi has up to four (RA, TA, DA, and the optional WDS fourth)."
  - "An access point as a translator booth: 802.11 frames coming in over the air on one side, 802.3 frames going out over the cable on the other, with ARP and IP packets riding through unchanged."
  - "A combo radio chip cross-section showing a Wi-Fi block and a Bluetooth block sharing one 2.4 GHz antenna with a time-division arbitration scheduler between them."
---

# Part V, Chapter — Wi-Fi

## The hook

Wi-Fi is Ethernet without the cable, plus encryption and airtime management — and that little "plus" is most of the story. The first 802.11 standard shipped in 1997 at two megabits per second. Twenty-seven years later, Wi-Fi 7 hits forty-six gigabits. In between, the standard moved out of the crowded 2.4 gigahertz band into 5 and 6, learned to slice the air into subcarriers with OFDMA, learned to talk on multiple bands at once with Multi-Link Operation, and survived a security paper called KRACK that put WPA2 on every CTO's radar.

## The story

### Ethernet without the cable

Wi-Fi brings Ethernet-style networking to the airwaves. Instead of pushing frames down copper or fiber, 802.11 pushes them through 2.4 gigahertz, 5 gigahertz, and now 6 gigahertz radio. But air is a shared medium — everyone in range hears everything — so the standard had to add three things that wired Ethernet never needed. Encryption, in the form of WPA2 and now WPA3. Collision avoidance — CSMA/CA — instead of Ethernet's CSMA/CD, because a radio cannot listen and transmit at the same time. And a more complicated frame format with up to four MAC addresses: a receiver address, a transmitter address, a destination address, and an optional fourth used in wireless bridging mode.

The differences from Ethernet are deeper than just "no cable." Because wireless stations cannot detect collisions while they are transmitting — the hidden node problem — Wi-Fi uses RTS/CTS handshakes and carrier sensing to dodge them. Every unicast frame must be acknowledged. If the sender does not get an ACK, it retransmits. The exact mechanism — beacons, association, the four-way handshake, the per-frame ACKs, the airtime arbitration — is the Wi-Fi protocol episode. For now, the thing to hold onto is that half-duplex radios, mandatory acknowledgements, and shared spectrum are the three constraints that shape every other design decision in 802.11.

The piece that makes the whole arrangement invisible to the rest of the stack is the access point. It bridges the wireless and wired worlds, translating between 802.11 frames over the air and 802.3 frames on the cable. ARP, IP, TCP, the browser — every layer above sees a normal Ethernet-flavored network on the other side of the AP. The ARP and NDP chapter and the IP chapters cover what runs on top.

### Twenty-seven years of generations

Wi-Fi has evolved more dramatically than almost any other protocol in this book. The original 802.11 in 1997 ran at two megabits. 802.11b in 1999 brought eleven megabits and is the version most listeners first encountered. 802.11g in 2003 hit fifty-four. 802.11n — Wi-Fi 4, 2009 — introduced MIMO and reached six hundred. 802.11ac — Wi-Fi 5, 2014 — pushed past gigabit. 802.11ax — Wi-Fi 6, 2020 — added OFDMA, the trick that lets one access point serve many clients at once by slicing the channel into orthogonal subcarriers, which is what makes Wi-Fi finally usable in a packed coffee shop or a dense apartment building. And 802.11be — Wi-Fi 7, 2024 — delivers up to forty-six gigabits with Multi-Link Operation, the ability to talk on more than one band at the same time.

Each generation brought better throughput, lower latency, and a better answer to crowded airspace. The Wi-Fi protocol episode walks through what each amendment actually changed at the PHY and MAC layer.

### Escaping the 2.4 gigahertz tenement

The pull-quote for this chapter is about the politics of spectrum. Wi-Fi shares the 2.4 gigahertz ISM band with Bluetooth — and Zigbee, and Thread, and a long list of other things that wanted free spectrum. Two and a half gigahertz is the universal coexistence pairing for consumer wireless. Modern combo chips — Apple's H-series, Broadcom, Qualcomm — do time-division arbitration at the silicon level so Wi-Fi and Bluetooth do not starve each other on the same antenna.

The escape to 5 and 6 gigahertz on the Wi-Fi side has eased the crowding considerably. Bluetooth stayed at 2.4 because every battery-powered consumer device already lives there. So do Zigbee, on channels 11 to 26, and Thread — both of which run on IEEE 802.15.4 radios that intentionally dodge Wi-Fi's busy channels 1, 6, and 11. Through the Matter bridge, those low-power meshes appear to your home network as ordinary IP-addressable devices over the same Wi-Fi you are already running. The Bluetooth episode and the Zigbee episode pick up that side of the story; the NFC episode covers the 13.56 megahertz tap that pairs Wi-Fi credentials onto printers and IoT devices via NDEF handover; and the UWB episode covers the 6 to 9 gigahertz radio that sits well above the Wi-Fi bands and never contends with it.

### KRACK and what it cost

The synopsis flags the KRACK story as the moment WPA2 went on every CTO's radar. KRACK — key reinstallation against the WPA2 four-way handshake — is the security paper that forced the industry to take Wi-Fi cryptography seriously after years of treating it as a checkbox. The cryptographic detail and the timeline of the disclosure belong in the Wi-Fi protocol episode and in the Famous Outages and Breaches part of the book. What matters at the chapter level is the lesson the field absorbed: a link layer that runs on every laptop, phone, and thermostat on Earth needs a security model that holds up to the kind of scrutiny only a deployed-everywhere protocol attracts. WPA3, with SAE — the Simultaneous Authentication of Equals exchange — is the answer that came out of that pressure, and it is what the simulator demonstrates.

## What you'd see in the simulator

Press play on the Wi-Fi simulator and you walk the full association lifecycle. First, the access point is broadcasting beacon frames on its channel, advertising the network. The client picks one and starts authentication — in the WPA3 case, that means SAE, the password-derivation exchange that replaced the older pre-shared-key handshake. Once authenticated, the client associates and is handed an Association ID, its short-form identifier on this BSS. Then the four-way handshake runs to derive the encryption keys for the session. With keys in place, real data starts flowing: every frame queued under CSMA/CA, every unicast frame acknowledged, the access point bridging from 802.11 over the air to 802.3 on the wire toward the rest of the network. The cryptographic detail of SAE and the exact frame layout belong in the Wi-Fi protocol episode.

## Listening order

- **Before this chapter:** *The shared medium* — the chapter that sets up why wireless networking is a different problem from wired networking, and why the medium being shared is what forces every design decision that follows.
- **After this chapter:** *Bluetooth — Classic, LE, and the 6.0 ranging future* — the other resident of the 2.4 gigahertz ISM band, and the other half of every combo chip Wi-Fi shares an antenna with.

## Where to go deeper

- The Wi-Fi protocol episode picks up the mechanism story — beacons, the SAE authentication exchange, the four-way handshake, CSMA/CA backoff, RTS/CTS for hidden nodes, and the four-address frame format that makes wireless bridging work.
- The Ethernet episode covers the wired layer that every access point bridges to and from — the framing, the addressing, and the CSMA/CD ancestor that CSMA/CA replaces in the air.
- The Bluetooth episode covers the other 2.4 gigahertz tenant, the time-division arbitration on combo chips, and the LE Audio and Channel Sounding work that is reshaping the band.
- The Zigbee episode covers the IEEE 802.15.4 mesh that hides between Wi-Fi's channels 1, 6, and 11, and how Matter brings it onto your IP network.
- The NFC episode covers the 13.56 megahertz tap that hands Wi-Fi credentials to printers and IoT devices.
- The UWB episode covers the 6 to 9 gigahertz radio that sits above the Wi-Fi bands and never contends with them.
- The ARP episode and the IPv4 episode cover what rides on top of every 802.11 frame once the access point has translated it onto the wire.
