---
id: spectrum-and-the-frontier
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: Spectrum, regulation, and what comes next
synopsis: 6 GHz Wi-Fi, mmWave, Ligado/L-band, the 47-day-cert cliff, WRC-27, Ambient IoT, Wi-Fi 8, 6G targets, and Starlink Direct-to-Cell. The wireless frontier through 2030.
podcast_target_minutes: 15
position_in_book: 38 of 75
listening_order:
  prev: wireless/security-across-the-wireless-family
  next: web-api/http1
related_protocols: []
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: ""
    caption: "The FCC's 23 April 2020 order freeing 1,200 MHz of 6 GHz spectrum (5.925-7.125 GHz) for unlicensed use — the largest single bandwidth grant the United States has authorised in 20 years."
    credit: "FCC"
visual_cues:
  - "A world map with the same 6 GHz band rendered three different colours by region — green across the Americas (1,200 MHz unlicensed since April 2020), red across the EU upper band (6585-7125 MHz recommended for mobile/5G on 12 November 2025), and yellow over the WRC-27 reserved slice (6425-6585 MHz)."
  - "A cell tower silhouette next to a Starlink satellite at 550 km altitude, both labelled 'base station' and connected to an ordinary unmodified phone — date stamp 27 January 2025, T-Mobile + SpaceX."
  - "A two-panel timeline of the wireless calendar through 2030 — a slow geological-time clock for the World Radiocommunication Conference (WRC-23 Dubai, WRC-27, WRC-31) above a faster ~18-month 3GPP Release wheel (R18, R19, R20)."
  - "A stadium FWA scene: mmWave panel on a rooftop beaming at a window-mounted antenna across the street, with attenuation labels — '~20 dB through a wet leaf, blocked by glass-coated buildings, blocked by human bodies.'"
  - "A battery-less Ambient IoT tag the size of a postage stamp on a pallet, harvesting RF from a base-station carrier overhead and backscattering a kilobit-per-second reply — labelled 3GPP Release 19/20, first commercial trials late 2027."
---

# Part V, Chapter — Spectrum, regulation, and what comes next

## The hook

Spectrum policy moves on a four-year clock. The technology runs ten years faster. Every wireless protocol's deployment is gated by a regulator nobody on the engineering team has met. Apple's iPhone disables Ultra-Wideband Precision Finding in Japan, in Indonesia, in parts of the Middle East — because of regional power-mask differences nobody on the iPhone team voted on. This is the chapter on the layer underneath every other Part V chapter — the one that decides whether any of it can ship.

## The story

### Why spectrum is the protocol everyone forgets about

Every wireless protocol in this Part has a chapter about its radio, its frame format, its security history. Almost none of them have a chapter about the regulator who decides where the radio is allowed to transmit, at what power, with what interference protection, in which country. That regulator is the protocol that decides whether anything else in this Part can ship.

The spectrum layer is allocated globally by the ITU-R, the radio sector of the International Telecommunication Union — about 190 member states — on a treaty schedule called the World Radiocommunication Conference, every three to four years. It is regionally harmonised by CEPT in Europe, APT in Asia-Pacific, and CITEL in the Americas. And it is nationally enforced by regulators like the FCC in the United States, Ofcom in the United Kingdom, the Bundesnetzagentur in Germany, and the MIC in Japan.

The result is that the same physical radio is legal in some countries, restricted in others, and banned outright in a few. The CBRS band that powers Private 5G in the United States does not exist in Europe. The 6 GHz upper band that the FCC opened for Wi-Fi in 2020 may yet be reassigned to mobile carriers in the EU. Every protocol chapter in this Part has a wire-format story. This chapter is about the policy story underneath all of them.

### The 6 GHz fight — the largest single bandwidth grant in 20 years

On 23 April 2020, the FCC freed 1,200 MHz of 6 GHz spectrum — 5.925 to 7.125 GHz — for unlicensed use. The largest single bandwidth grant the United States had authorised in 20 years. Wi-Fi 6E and Wi-Fi 7 were the immediate consumers. The decision essentially tripled the unlicensed spectrum available for Wi-Fi, easing the 2.4 GHz and 5 GHz crowding that had bedevilled apartment buildings and convention centres for two decades.

The lower 6 GHz band, 5.925 to 6.425 GHz, is Low-Power Indoor — license-exempt for indoor use only, up to 30 dBm EIRP. The upper 6 GHz band, 6.525 to 7.125 GHz, is Standard Power — up to 36 dBm EIRP outdoors, but arbitrated by an Automated Frequency Coordination cloud service that checks the access point's location against a database of incumbent licensees, fixed microwave links, satellite services, before granting a channel. The FCC approved seven AFC operators on 23 February 2024. The first AFC-certified Wi-Fi 7 access point, the RUCKUS R770, shipped in April 2024.

Then the EU went the other way. On 12 November 2025, the European Radio Spectrum Policy Group recommended assigning the upper 6 GHz band, 6585 to 7125 MHz, to mobile and 5G — holding the slice from 6425 to 6585 pending WRC-27. The Wi-Fi Alliance "strongly disagrees" and is lobbying hard. WRC-23, in Dubai in November and December 2023, had already added 6 GHz to IMT-2020 — the cellular side — on a co-primary basis, opening the door to this exact contest.

This is what spectrum policy actually looks like. The same physical band, the same physical radios, allocated differently by different regional treaty bodies, with billion-dollar industry alignments fighting it out at WRC every four years. Wi-Fi shipping millions of 6 GHz devices in the United States is one fact. Whether those devices can use the upper 6 GHz band in Europe is a separate fact, decided by a different process.

### CBRS and the three-tier sharing experiment

The US Citizens Broadband Radio Service band — 3.55 to 3.7 GHz — is the US regulator's experiment in dynamic spectrum sharing. Three tiers coexist. Incumbents — US Navy radars — get absolute priority. Priority Access Licensees, the PALs, were auctioned in 2020 for around 4.5 billion dollars. General Authorized Access is anyone with a certified device. A cloud service called the Spectrum Access System arbitrates in real time, telling each device which channels and power levels it may use right now based on Navy radar activity.

CBRS powers Private 4G LTE and 5G deployments at ports — the Port of Long Beach is the canonical example — at mines, hospitals, manufacturing plants, and stadiums. The largest production use of database-arbitrated coexistence anywhere on Earth. Europe has experimented with similar concepts — PMSE in the United Kingdom, LSA in some EU pilots — but has not deployed at CBRS scale.

### mmWave — the band that under-delivered

Millimetre-wave bands — 24 to 52 GHz for 5G NR FR2, plus 60 GHz for WiGig and 28/39 GHz for fixed wireless — were the headline feature of every 5G keynote slide between 2018 and 2021. Hundreds of MHz of contiguous bandwidth. Gigabit speeds. Sub-millimetre wavelengths. The reality has been more complicated.

mmWave is line-of-sight only. It attenuates roughly 20 dB through a wet leaf. It is absorbed by glass-coated buildings, by human bodies, by pretty much anything thicker than dry air. Carriers deployed it in dense urban hotspots — Verizon Manhattan, AT&T Manhattan, T-Mobile Stadium of America — but failed to make it the everyday 5G experience anyone advertised. The current honest assessment is that mmWave is wonderful in a stadium, useful in a dense business district, irrelevant in a suburb, and unworkable in a basement.

Where mmWave has won is fixed wireless access — Verizon 5G Home, T-Mobile Home Internet, Starry — point-to-point links from a base station to a window-mounted antenna at a specific home or business. No mobility, no body shadowing, line-of-sight by design. FWA is now the fastest-growing residential broadband category in the United States, eating into legacy cable and DSL share. The future of mmWave is fixed access plus dense urban capacity, not the universal smartphone radio its marketing once promised.

5G's real contribution to coverage and capacity has come from mid-band sub-6 GHz NR — FR1 — the 2.5 GHz, 3.7 GHz C-band, and 3.55 GHz CBRS spectrum that carriers deployed widely from 2021 onward. That is the band underneath your "5G UC" or "5G+" icon.

### The Wi-Fi 8 reliability turn

Wi-Fi 7 — 802.11be, ratified on 22 July 2025 — was the last "make Wi-Fi much faster" upgrade. The peak rate hit roughly 46 Gbit/s. The 320 MHz channels arrived. The Multi-Link Operation feature shipped. The question facing the working group from about 2023 onward was: what comes next?

The answer is Wi-Fi 8 — 802.11bn, branded Ultra High Reliability. It is explicitly not a peak-speed upgrade. Same bands as Wi-Fi 7. Same 320 MHz max. Same roughly 46 Gbit/s physical-layer peak. The PAR objectives are quantitative: 25% more throughput at a given signal-to-interference-plus-noise ratio, 25% lower 95th-percentile latency, and 25% fewer dropped frames during transitions between basic service sets. Every Wi-Fi 8 feature — Multi-AP Coordination (Co-BF, Co-SR, Co-TDMA), the Seamless Roaming Domain, the Enhanced Long Range PPDU, Distributed Resource Units, Non-Primary Channel Access — is in service of tail latency and reliability, not of headline throughput.

The pattern across the last two generations is the same: squeeze the existing speed budget for consistency, not for the marketing-friendly peak. Wi-Fi 8 is targeted for ratification in September 2028. Broadcom announced a Wi-Fi 8 chipset in October 2025. ASUS demoed a draft router at CES 2026. Consumer launches are expected mid-to-late 2026. A "Wi-Fi 9" successor study group started in January 2026 already.

The takeaway for someone designing on top of Wi-Fi: the 99th-percentile latency you can rely on between 2027 and 2030 will be much better than what you have today, even though the peak number on the box will not change. The exact mechanism of MLO, of preamble puncturing, of the WPA3 handshake — all of that lives in the Wi-Fi protocol episode.

### Direct-to-Cell and the redefinition of "coverage"

For 50 years, "no signal" on a cell phone meant no signal. For most of the next 50, "no signal" will mean no terrestrial signal — try walking outside. The protocol family driving that change is Non-Terrestrial Networks, added to 3GPP Release 17 in March 2022 as a first-class radio access type alongside NR-Uu and LTE-Uu.

On 27 January 2025, T-Mobile and SpaceX Starlink launched the first commercial Direct-to-Cell service in the United States: SMS, MMS, and emergency messaging from ordinary phones, with the satellite acting as a base station in standard cellular bands n255 and n256. AT&T's AST SpaceMobile partnership demonstrated 5G voice from a standard phone in mid-2023 — the technical proof — and is rolling out commercial service through 2025 and 2026. Apple's Globalstar-based Emergency SOS has been live since the iPhone 14 in September 2022 — your phone, no special hardware, automatic fallback when terrestrial coverage drops.

The architectural change is the band. Older satellite phones — Iridium, Inmarsat — used dedicated satellite bands and required special handsets. Direct-to-Cell uses standard terrestrial cellular bands, so any phone with the right modem firmware can connect. The satellite is, from the phone's perspective, just another base station — albeit one orbiting at about 550 km and moving at about 7 km/s. HARQ on a 5 ms terrestrial round-trip is one engineering problem. HARQ on a 30 ms satellite round-trip with continuous Doppler shift is another. 3GPP Releases 18, 19, and 20 contain the timing-and-Doppler patches that make it work. The mechanism story belongs in the cellular episode.

The implications run well beyond emergency messaging. Maritime communications. Aviation passenger Wi-Fi. Rural broadband. Disaster recovery. All reshaped by a phone that can fall back to satellite without the user ever knowing. The next decade of cellular growth is going to come from the half of the planet that has never had reliable mobile coverage.

### Ambient IoT — when the IoT device has no battery

The most experimental piece of the cellular frontier is Ambient IoT: battery-less or near-battery-less cellular devices that harvest energy from RF, light, or motion and transmit tiny payloads. Currently 3GPP study items in Release 19 — frozen in flight — and Release 20, kicking off in 2025. Target use cases are the niches that passive RFID currently owns: logistics tagging, retail inventory, agricultural sensors, healthcare patient bands.

The protocol-design problem is hard. A battery-less device cannot wake up on a paging cycle. It cannot maintain a clock. It cannot run a handshake. The Release 19 design uses an interrogator-driven model that resembles 13.56 MHz NFC — or 900 MHz UHF RFID — more than it resembles a normal phone. The base station emits a carrier. The device backscatters a tiny modulated reply when interrogated. Data rates are kilobits per second. Range is metres to tens of metres.

Whether cellular Ambient IoT actually displaces the UHF RFID and LPWAN ecosystems that already serve those niches is an open commercial question. The technical groundwork is in place. The deployment economics — who pays for the interrogators, who runs the inventory backend — will decide it. Expect first commercial trials in late 2027. Mass adoption, if it happens, in the early 2030s.

### The other frontier — Wi-Fi sensing, sub-second media, and 6G

Three smaller frontiers are worth naming for completeness.

Wi-Fi sensing — IEEE 802.11bf, published on 26 September 2025 — uses the Channel State Information that Wi-Fi radios already compute for multipath equalisation to detect people, motion, and breathing. Radio waves as occupancy sensors. Standardised across the 1 to 7.125 GHz bands and above 45 GHz. It lets a home Wi-Fi mesh do presence detection without a camera or PIR sensor. Early consumer deployments are running through 2026.

Sub-second live media is the Wi-Fi and cellular side of the RTP-over-QUIC and MoQ-Transport story. The cellular network has had roughly 99.999% link reliability via HARQ for fifteen years. The application layer is finally building on top of it. Cloudflare deployed MoQ relays across more than 330 cities in 2025. Twitch's Warp QUIC-based live-streaming pilot is the canonical use case. Measurements at the 2026 Super Bowl, the AFC Wild Card, and the Paris 2024 Olympics all show OTT streaming still 40 to 80 seconds behind broadcast. The next five years collapse most of that gap. The transport mechanism is the QUIC episode.

6G is the next-generation cellular standard, currently in pre-standardisation. 3GPP's Release 20 study items for 6G began in 2025. Targets include sub-THz radio above 100 GHz, AI-native air-interface design, integrated sensing-and-communication — your phone also doing radar — and Non-Terrestrial Networks as a first-class deployment mode from day one. First commercial 6G is expected 2030 to 2032. Treat any 2026 or 2027 marketing copy that mentions specific 6G features as speculation. The spec does not exist yet.

### The four-year clock and the two-year clock

Two clocks set the pace of wireless. The first is the World Radiocommunication Conference, every three to four years, where the world's spectrum allocations are renegotiated by treaty. WRC-27 is the next major event — terahertz bands for 6G, harmonisation of Direct-to-Cell bands, the 6 GHz EU upper-band decision. The second is the 3GPP Release cycle, every roughly 18 months — Release 19 in flight, Release 20 (6G study items) kicking off. Together they decide what wireless protocols you can build, where, and when.

The IETF model — rough consensus and running code, two-week sprints — does not apply at this layer. Spectrum and cellular standards run on geological time, and that is the constraint every wireless engineer eventually meets.

### Reading the frontier honestly

The frontier section of any technical book is the part that ages worst. This one will, too. In five years, three of the deployments named in this chapter will have stalled, two will have shipped widely, and at least one not-yet-named protocol will have emerged from a standards backwater to consumer ubiquity — the pattern that BLE, Matter, and Direct-to-Cell all followed.

What can be said confidently about wireless in 2030: Wi-Fi 8 will be shipping in mid-range routers. WPA3 will be near-universal. Post-quantum crypto will be running in the TLS handshakes over every wireless network. 6G will be in pre-deployment trials, not yet consumer-available. Direct-to-Cell will be the default fallback for any phone in any country with a clear sky. Matter will own the smart-home commissioning story, with Thread and Wi-Fi underneath. UWB will be in roughly half of new phones globally, gating digital car keys and hands-free door unlock for hundreds of millions of users.

What cannot be said confidently: which cellular bands will be unlicensed by 2030, whether 6 GHz Wi-Fi survives in Europe, whether Ambient IoT eats the LPWAN market, whether Wi-Fi sensing becomes a privacy disaster or a useful feature. The answers depend on regulators in Brussels, Geneva, and Washington — not on any wireless engineer.

That is the right note to end Part V on. Wireless is the only part of this book where the protocol stops at the silicon and starts again at the regulator. Read every other Part top-down from the application. Read this one bottom-up from the spectrum allocation chart — the one nobody on your team has framed on the wall.

## Listening order

- **Before this chapter:** "Security across the wireless family" — the cross-cutting story of WEP, WPA2, WPA3, KRACK, Dragonblood, and pairing-mode flaws across Bluetooth and Zigbee, which sets up why every new band allocation comes with a new key-management debate.
- **After this chapter:** "HTTP/1.1" — Part V closes at the regulator, and Part VI opens at the application layer with the protocol that runs on top of every wireless link in this Part.

## Where to go deeper

- The Wi-Fi episode picks up the mechanism story for 6 GHz, MLO, AFC, and the Wi-Fi 8 reliability features named in this chapter.
- The cellular episode covers the FR1 and FR2 split, HARQ, and the Release 17 NTN additions that make Direct-to-Cell work.
- The UWB episode explains why Apple disables Precision Finding in some countries — the Part 15.519 mask and the regional UWB power rules.
- The NFC episode covers the 13.56 MHz interrogator-driven model that the Ambient IoT design is borrowing from.
- The QUIC episode and the HTTP/3 episode are where the sub-second live-media story finishes — the wireless link is now reliable enough that the transport and the application-layer media stack are the bottleneck.

## Visual cues for image generation

- A world map with the same 6 GHz band rendered three different colours by region — green across the Americas (1,200 MHz unlicensed since 23 April 2020), red across the EU upper band (6585-7125 MHz recommended for mobile/5G on 12 November 2025), and yellow over the WRC-27 reserved slice (6425-6585 MHz).
- A cell tower silhouette next to a Starlink satellite at 550 km altitude, both labelled "base station" and connected to an ordinary unmodified phone — date stamp 27 January 2025, T-Mobile + SpaceX, bands n255/n256.
- A two-panel timeline of the wireless calendar through 2030 — a slow geological-time clock for the World Radiocommunication Conference (WRC-23 Dubai, WRC-27, WRC-31) above a faster ~18-month 3GPP Release wheel (R18, R19, R20).
- A stadium FWA scene: mmWave panel on a rooftop beaming at a window-mounted antenna across the street, with attenuation labels — "~20 dB through a wet leaf, blocked by glass-coated buildings, blocked by human bodies."
- A battery-less Ambient IoT tag the size of a postage stamp on a pallet, harvesting RF from a base-station carrier overhead and backscattering a kilobit-per-second reply — labelled 3GPP Release 19/20, first commercial trials late 2027.
