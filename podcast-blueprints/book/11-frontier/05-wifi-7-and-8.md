---
id: wifi-7-and-8
type: chapter
part_id: frontier
part_label: XII
part_title: The Modern Frontier (2024–2026)
title: Wi-Fi 7 and 8
synopsis: 320 MHz, then a 25% better tail-latency target — and the politics of 6 GHz.
podcast_target_minutes: 15
position_in_book: 79 of 75
listening_order:
  prev: frontier/ultra-ethernet
  next: how-to-learn-more/rfcs-to-read
related_protocols: [wifi]
related_pioneers: []
related_outages: []
related_frontier: [wifi-7-ratified]
related_rfcs: []
images: []
visual_cues:
  - "A timeline strip: 8 January 2024 (Wi-Fi 7 certification opens), 23 February 2024 (FCC approves seven AFC operators), 16 April 2024 (RUCKUS R770 first AFC-certified AP), 26 September 2024 (802.11be approved), 22 July 2025 (802.11be published), September 2028 (Wi-Fi 8 target)."
  - "A device drawing three radios stacked — 2.4 GHz, 5 GHz, 6 GHz — with a single Multi-Link Operation association binding all three, and a per-packet selector arrow choosing the least congested band on each frame."
  - "A world map: green Americas with the full 1,200 MHz at 6 GHz unlicensed; red EU upper band (6585-7125 MHz) recommended for mobile/5G on 12 November 2025; yellow strip 6425-6585 MHz held pending WRC-27."
  - "A two-panel chart for Wi-Fi 8: same 320 MHz channel width and same ~46 Gb/s peak as Wi-Fi 7 on the left, three minus-25-percent bars on the right for 95th-percentile latency, MPDU loss across BSS transitions, and a plus-25 throughput-at-given-SINR bar."
  - "A small archive card pinned to the chapter: Phil Belanger's 2005 Boing Boing confession that 'Wi-Fi' is a name from Interbrand, not an acronym for 'Wireless Fidelity', with the yin-yang logo beside it."
---

# Part XII, Chapter — Wi-Fi 7 and 8

## The hook

"Wi-Fi" was chosen by Interbrand from ten candidate names. It does not stand for "Wireless Fidelity" — that was a tagline retrofitted briefly by the WECA board and then dropped. The yin-yang logo is also Interbrand's work. That's Phil Belanger's 2005 Boing Boing confession, and it's the right way into a chapter about a technology where the marketing has always run ten years ahead of the engineering. Wi-Fi 7 just shipped. Wi-Fi 8 is already in draft. And the politics of 6 GHz are about to decide how much of either the rest of the world gets to use.

## The story

### Wi-Fi 7 shipped

The Wi-Fi Alliance launched Wi-Fi CERTIFIED 7 on 8 January 2024. The IEEE 802.11be amendment was approved on 26 September 2024 and published on 22 July 2025. Headline features: 320 MHz channels, 4096-QAM, Multi-Link Operation, preamble puncturing, and Multi-RU. Theoretical peak around 46 Gb/s. The Project Authorization Request only required about 30.

The deployment numbers are the part that surprised people. 583 million Wi-Fi 7 devices shipped in 2025. ABI projects 117.9 million Wi-Fi 7 enterprise access points in 2026, up from 26.3 million in 2024. The Wi-Fi Alliance forecasts 3.9 billion Wi-Fi devices shipping in 2025 across all generations, for a cumulative lifetime install base of 48.8 billion. That is the scale at which a link-layer standard has to land now.

Of all the Wi-Fi 7 features, the one that matters most for ordinary users is Multi-Link Operation. A single connection can use 2.4, 5, and 6 GHz bands simultaneously, switching whichever is least congested per packet. The tail latency on a busy Wi-Fi network — the 99th-percentile delay that made video calls stutter and games lag — used to spike into the hundreds of milliseconds when many devices contended for the same channel. With Multi-Link Operation, a frame can be sent on whichever band happens to be free; the median improves, and the tail improves more.

How Multi-Link Operation actually works on the wire — the per-link block-ack windows, the 4096-QAM constellation, the puncturing of interfered subcarriers — is mechanism. That is the Wi-Fi episode's job. The chapter's job is to notice that this is the generation where Wi-Fi finally got serious about congestion instead of about another peak number on the box.

### Wi-Fi 8 — a reliability upgrade, not a speed upgrade

Wi-Fi 8 — 802.11bn, branded Ultra High Reliability — is explicitly not a peak-speed upgrade. Same bands as Wi-Fi 7. Same 320 MHz max. Same roughly 46 Gb/s physical-layer peak. The PAR objectives are quantitative and unusual: 25% more throughput at a given signal-to-interference-plus-noise ratio, 25% lower 95th-percentile latency, and 25% fewer MPDU losses across transitions between basic service sets.

The headline features all serve those goals. Multi-AP Coordination — coordinated beamforming, coordinated spatial reuse, coordinated TDMA. The Seamless Roaming Domain. Enhanced Long Range PPDU. Distributed Resource Units. Non-Primary Channel Access. The pattern across all of them is the same: optimise the existing speed budget for tail latency and reliability instead of headline throughput.

Wi-Fi 8 is targeted for ratification in September 2028. As of the March 2026 plenary, Task Group bn was at Draft 1.3, with Draft 2.0 ballot targeted for May 2026 in Antwerp. Broadcom announced a Wi-Fi 8 chipset in October 2025. ASUS demoed a draft router at CES 2026. Consumer launches are expected mid-to-late 2026. A Wi-Fi 9 successor study group started in January 2026 — already.

If you are designing for the next five years on top of wireless, the takeaway is that the 99th-percentile latency you can rely on between 2027 and 2030 will be much better than what you have today, even though the peak number on the box will not change. The Wi-Fi episode picks up the mechanism story for MLO, preamble puncturing, the 4-way handshake, and the WPA3 changes around it.

### The 6 GHz political fight

Wi-Fi 7 only delivers what it promises if the regulator gives it a place to transmit. The 6 GHz band — 5.925 to 7.125 GHz — is where that fight is happening.

The US FCC freed 1,200 MHz of 6 GHz spectrum on 23 April 2020. The largest single bandwidth grant the United States had authorised in twenty years. On 23 February 2024, the FCC's Office of Engineering and Technology approved seven Automated Frequency Coordination system operators — Qualcomm, Federated Wireless, Sony, Comsearch, Wi-Fi Alliance Services, the Wireless Broadband Alliance, and Broadcom — for commercial Standard-Power AFC operation. The first AFC-certified Wi-Fi 7 access point, the RUCKUS R770, was certified on 16 April 2024. AFC checks an access point's location against a database of incumbent licensees — fixed microwave links, satellite services — before granting a channel. It is the cloud service that lets unlicensed Wi-Fi share the band with licensed users without interference.

Then the EU went the other way. On 12 November 2025, the European Radio Spectrum Policy Group recommended assigning the upper 6 GHz band — 6585 to 7125 MHz — to mobile and 5G, with 6425 to 6585 MHz held pending the World Radiocommunication Conference in 2027. Effectively, that closes the upper 6 GHz band to Wi-Fi in the EU for the medium term. The Wi-Fi Alliance "strongly disagrees." The lobbying continues. The same physical band, the same physical radios, allocated differently by different regional treaty bodies — that is what spectrum policy actually looks like.

### The folklore — Wi-Fi was never an acronym

Two pieces of Wi-Fi history that almost everyone gets wrong, and that this chapter is the right place to set straight.

First, "Wi-Fi" was chosen by Interbrand from ten candidate names. It does not stand for "Wireless Fidelity" — that was a tagline that the WECA board attached briefly and then dropped. Phil Belanger, who was on that board, put the canonical correction on Boing Boing in 2005. The yin-yang logo on every certification sticker since 1999 is also Interbrand's work. It is an industry brand, not an engineering acronym.

Second, the CSIRO patent windfall. Australia's Commonwealth Scientific and Industrial Research Organisation held US Patent 5,487,069 — granted on 23 January 1996 — on a radio-astronomy-derived approach to OFDM with multipath compensation. After Buffalo lost in 2005, CSIRO settled with fourteen majors in 2009 for about US$205 million, and again with AT&T, Verizon, and T-Mobile in 2012 for about US$220 million. Lifetime royalties were reportedly around US$430 million, with industry estimates closer to US$1 billion. The patents expired on 30 November 2013. Most of Wi-Fi's mid-2010s deployment happened in the post-CSIRO-royalty era — which is part of why every laptop and phone you own has Wi-Fi at the silicon level by default.

Two more 2024 footnotes worth keeping in the chapter. SSID Confusion — CVE-2023-52424, disclosed in May 2024 by Gollier and Vanhoef at WiSec 2024 — showed that the SSID is not part of the 4-way-handshake key derivation in many configurations, allowing downgrade-style trickery against any client operating system. The most important new Wi-Fi flaw since FragAttacks. And in November 2024 the FCC's Second Report and Order, FCC 24-106, finalised C-V2X for Intelligent Transportation Systems and mandated the retirement of DSRC by 14 December 2026 — ending the 1999 DSRC monopoly that 802.11p was built on.

## The figures

### Wi-Fi 7 (IEEE 802.11be) ratified

IEEE 802.11be was published on 22 July 2025 after more than five years of drafting. Headline features: 320 MHz channels in the 6 GHz band, 4096-QAM at twelve bits per symbol, Multi-Link Operation across 2.4, 5, and 6 GHz from a single device association, preamble puncturing to skip interfered subcarriers without losing the whole channel, and restricted Target Wake Time. The Wi-Fi Alliance opened certification on 8 January 2024. Peak link rate is 46 Gb/s. By April 2026 the Alliance reports more than 500 million Wi-Fi 7-certified devices shipped, with IDC projecting 120 million Wi-Fi 7 access-point shipments by end-2026. Wi-Fi 8 — Ultra High Reliability — reached Draft 1.0 in July 2025 with final ratification scheduled for September 2028; the targets are 25% better 95th-percentile latency and 25% fewer dropped packets during roaming, not a faster peak.

## Listening order

- **Before this chapter:** "Ultra Ethernet" — the wired side of the same 2024–2026 story, where AI training fabrics drove a new transport on top of Ethernet. Wi-Fi 7 is the link-layer that the wireless edge of those fabrics wants.
- **After this chapter:** "RFCs Worth Reading" — Part XII closes here, and the book hands you the reading list for going further.

## Where to go deeper

- The Wi-Fi episode picks up the mechanism story — the 4-way handshake, WPA3 SAE, CSMA/CA, the access point bridging 802.11 and 802.3 frames, MLO across 2.4, 5, and 6 GHz, and what AFC actually does in the upper band.
- The Bluetooth, Zigbee, NFC, and UWB episodes cover the wireless neighbours that Wi-Fi shares the 2.4 GHz ISM band — and the silicon — with.
- The TLS episode picks up the post-quantum handshake story that will run on top of every wireless link in this Part by the end of the decade.

## Visual cues for image generation

- A timeline strip: 8 January 2024 (Wi-Fi 7 certification opens), 23 February 2024 (FCC approves seven AFC operators), 16 April 2024 (RUCKUS R770 first AFC-certified AP), 26 September 2024 (802.11be approved), 22 July 2025 (802.11be published), September 2028 (Wi-Fi 8 target).
- A device drawing three radios stacked — 2.4 GHz, 5 GHz, 6 GHz — with a single Multi-Link Operation association binding all three, and a per-packet selector arrow choosing the least congested band on each frame.
- A world map: green Americas with the full 1,200 MHz at 6 GHz unlicensed; red EU upper band (6585-7125 MHz) recommended for mobile/5G on 12 November 2025; yellow strip 6425-6585 MHz held pending WRC-27.
- A two-panel chart for Wi-Fi 8: same 320 MHz channel width and same ~46 Gb/s peak as Wi-Fi 7 on the left, three minus-25-percent bars on the right for 95th-percentile latency, MPDU loss across BSS transitions, and a plus-25 throughput-at-given-SINR bar.
- A small archive card pinned to the chapter: Phil Belanger's 2005 Boing Boing confession that "Wi-Fi" is a name from Interbrand, not an acronym for "Wireless Fidelity", with the yin-yang logo beside it.

## Sources

- [IEEE 802.11 working group](https://www.ieee802.org/11/)
- [Wikipedia — Wi-Fi 7](https://en.wikipedia.org/wiki/Wi-Fi_7)
