/**
 * Part V — Wireless.
 *
 * Bits through the air — from ALOHAnet (1971) to Wi-Fi 8, Bluetooth 6.0,
 * 5G-Advanced, and Starlink Direct-to-Cell. Nine chapters cover the
 * shared-medium foundations, the six member protocols (Wi-Fi, Bluetooth,
 * Cellular, NFC, UWB, Zigbee), the cross-cutting wireless-security
 * lineage, and the spectrum frontier through 2030. The pedagogical arc:
 * a reader who has understood TCP-on-Ethernet now meets a medium that
 * is shared by default, lossy by physics, and adversarial when crowded.
 */

import type { BookPart } from '../types';

export const wireless: BookPart = {
	id: 'wireless',
	title: 'Wireless',
	label: 'V',
	description:
		'Bits through the air — from ALOHAnet to [[wifi|Wi-Fi]] 8, from a 1994 Ericsson [[bluetooth|headset cable]] to billions of AirPods, and from a 1973 patent to the [[nfc|NFC]] tap on every payment terminal.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'the-shared-medium',
			title: 'The shared medium',
			synopsis:
				'Why wireless is a fundamentally different problem from wired — the medium is shared, signals fade, and {{csma-ca|CSMA/CA}} replaces the cable.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Wired networks fail when something breaks. Wireless networks fail because the medium is shared with everything else operating in the same band — including, sometimes, an attacker. Every architectural choice in this part of the book exists to make a hostile medium predictable.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Three problems wired networks never have to solve',
							text: `Plug an [[ethernet|Ethernet]] cable in and the physics is finished. The wire carries your bits, only your bits, with a known impedance and a {{checksum|CRC}} that catches the occasional bit flip. The bottom four bytes of an [[ethernet|Ethernet]] frame have been the same since 1980 for exactly that reason — once the medium is dedicated to you, there is almost nothing left to negotiate.

Wireless never gets that gift. **The medium is shared by everything operating in the same band** — your laptop, your neighbour's laptop, the microwave oven leaking 2.4 GHz energy from the kitchen, the baby monitor down the hall, a [[bluetooth|Bluetooth]] earbud, a [[zigbee|Zigbee]] light bulb, and, on a bad day, a deliberate jammer. **Every transmission radiates outward**, falling off as 1/r² in free space and much faster through walls and water, so the same packet that is perfectly readable at three metres is statistical noise at thirty. **Every receiver gets every signal the antenna can pick up**, then has to figure out which of them is the one you wanted — and which copies of *that* one, bounced off the floor and ceiling and a parked car, arrived a few nanoseconds later and partially cancelled the direct path.

Wired networking is a problem with a known solution. Wireless networking is three intertwined problems — sharing, fading, and {{multipath|multipath}} — that the entire stack from PHY to application has to compensate for at every layer.`
						},
						{
							type: 'narrative',
							title: "CSMA/CA — the bedrock trick",
							text: `Wired [[ethernet|Ethernet]] uses **CSMA/CD** (Collision *Detection*): a station listens while it transmits, and the moment another station's signal collides with its own on the wire, both back off and retry. That trick is **impossible on radio**. Your own transmitter saturates your own receiver — a wireless NIC literally cannot hear another station while it is sending. Every wireless MAC therefore uses **{{csma-ca|CSMA/CA}}** — listen *before* you talk, plus a randomised back-off if the channel was busy, plus a mandatory {{ack|ACK}} after every {{unicast|unicast}} frame so the sender knows whether it got through.

[[wifi|Wi-Fi]] calls it DCF (Distributed Coordination Function). Before each frame, a station senses the channel for a DIFS interval (28–34 µs), picks a random slot from a contention window (initial CW = 15, doubled on collision up to 1023), and transmits if still idle. Every successful frame is ACKed after a SIFS gap (~10 µs); no ACK in time is presumed to mean collision and the sender retries from a larger window. The ratio of *protocol overhead* to *{{payload|payload}} bytes* on a busy [[wifi|802.11]] channel routinely exceeds 50% — which is why a Wi-Fi 6 {{access-point|access point}}'s nominal 9.6 Gbit/s shows up as 1–2 Gbit/s of real throughput in a crowded room.

[[zigbee|Zigbee]] and [[zigbee|Thread]] use a similar unslotted CSMA-CA on {{ieee-802-15-4|IEEE 802.15.4}}. [[bluetooth|Bluetooth]] dodges the problem by **{{frequency-hopping|frequency-hopping}}** — 1,600 hops/sec on BR/EDR — so collisions on any single channel are statistically rare. [[cellular|Cellular]] does not contend at all on the downlink; the base station schedules every slot.`
						},
						{
							type: 'callout',
							title: 'The hidden-terminal problem in one sentence',
							text: 'On a wired bus, every station hears every other station. On a radio, station A and station C may both hear {{access-point|AP}} B but **not each other** — so they both think the channel is clear, both transmit at once, and both collide at B. The **{{hidden-terminal|RTS/CTS}}** option exists because of this; so does [[bluetooth|BLE]]\'s master-clocked frequency hopping; so does every [[cellular|cellular]] RAN\'s centralised uplink scheduler. The same physics ripples through every wireless protocol design.'
						},
						{
							type: 'narrative',
							title: 'The 2.4 GHz coexistence dance',
							text: `Four protocol families share the unlicensed 2.4 GHz **{{ism-band|ISM band}}**: [[wifi|Wi-Fi]] (20 MHz channels centred at 2412 / 2437 / 2462 MHz — the canonical 1/6/11 trio), [[bluetooth|Bluetooth]] BR/EDR (79 × 1 MHz channels hopping 1,600/sec), [[bluetooth|BLE]] (40 × 2 MHz channels), and [[zigbee|Zigbee]] / {{thread|Thread}} on {{ieee-802-15-4|IEEE 802.15.4}} (16 × 2 MHz channels at 11–26). Plus microwave ovens, baby monitors, cordless phones, USB-3 hubs, and every other device any regulator ever granted Part 15 to.

They coexist by a series of small accommodations. **Modern combo chips** (Apple H-series, Broadcom, Qualcomm) put Wi-Fi and Bluetooth radios on the same die and arbitrate {{airtime|airtime}} in firmware, time-slicing so one starves the other only briefly. **Zigbee dodges Wi-Fi**: channels 15, 20, 25, and 26 sit in the gaps between Wi-Fi 1/6/11, and the single most common cause of unreliable Zigbee is a coordinator dongle plugged into a Wi-Fi router's USB port whose switched-mode PSU radiates broadband 2.4 GHz noise. **BLE picks its advertising channels carefully** — 37/38/39 sit at 2402, 2426, and 2480 MHz, deliberately outside Wi-Fi 1/6/11; the 37 data channels rely on adaptive frequency hopping to dodge active access points. **The 5/6 GHz escape valve** is where Wi-Fi 5, 6, 6E, 7, and 8 increasingly live, leaving 2.4 GHz to IoT.

[[cellular|Cellular]] bands are **licensed**, which is why your phone's 4G/5G radio does not fight with your Wi-Fi even in the same physical space — different {{spectrum|spectrum}} entirely. The price of that predictability is the billions paid at every national spectrum auction.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/United_States_Frequency_Allocations_Chart_2003_-_The_Radio_Spectrum.svg/500px-United_States_Frequency_Allocations_Chart_2003_-_The_Radio_Spectrum.svg.png',
							alt: 'The US frequency allocations chart — a dense, multicoloured map of every band from 9 kHz to 300 GHz.',
							caption:
								'The **United States Frequency Allocations Chart**, NTIA. Every coloured stripe is a *service* — {{broadcast|broadcast}}, aeronautical, maritime, mobile, fixed, satellite, radioastronomy — and every wireless protocol in this Part has to fit between them. The 2.4 GHz {{ism-band|ISM}} band where Wi-Fi, Bluetooth, Zigbee, microwave ovens, and baby monitors all live is one small unlicensed sliver near the middle.',
							credit: 'Image: NTIA / public domain, via Wikimedia Commons'
						},
						{
							type: 'narrative',
							title: 'The power–range–throughput triangle',
							text: `Every wireless protocol picks two corners of a three-way trade-off: **transmit power, range, and throughput**. You can have any two cheaply; the third is what the spec is really negotiating, and that triangle is why we have six wireless protocols in this Part instead of one.

[[nfc|NFC]] picks **low power + low range** — passive cards harvest microwatts from the reader's field at ≤10 cm and trade everything for a 13.56 MHz carrier that physics caps at ~424 kbit/s. [[bluetooth|BLE]] picks **low power + medium throughput** — coin-cell devices at 1–2 Mbit/s over 10 m. [[wifi|Wi-Fi]] picks **high throughput + medium range** — gigabit speeds at 30 m, but only because the AP burns hundreds of milliwatts of TX power and runs off mains electricity. [[cellular|Cellular]] picks **range + throughput** at the cost of power and licensed {{spectrum|spectrum}} — 50 km from the right base station, ~1–10 Gbit/s in FR1, but you do not run a base station on a coin cell. [[uwb|UWB]] sits in a corner of its own: **wide {{bandwidth|bandwidth}} + low average power** by trading {{tof-ranging|time-of-flight}} precision for any meaningful data rate. It is a clock, not a data radio.

**Edholm's law of bandwidth** — wireless data rates double roughly every 18 months — is what keeps the table moving. Every protocol in this Part has shipped two or three generation upgrades since 2010 to keep its corner of the triangle in tension.`
						},
						{
							type: 'callout',
							title: 'The bootstrap pattern: no wireless protocol works alone',
							text: 'Almost every consumer wireless interaction in 2026 chains *multiple* radios. **[[uwb|UWB]] ranging** never starts without [[bluetooth|BLE]] first — the lock or car advertises a service UUID over BLE, the phone runs SPAKE2+ authentication and ships the STS_KEY over the encrypted {{gatt|GATT}} channel, only then does [[uwb|UWB]] power on for a three-message ranging round. **[[bluetooth|Bluetooth]] / [[wifi|Wi-Fi]] handover** is bootstrapped by [[nfc|NFC]] — a 4 cm tap carries the BLE MAC + SMP OOB key or the Wi-Fi SSID + WPA key in an {{ndef|NDEF}} record. **[[zigbee|Zigbee]] + {{thread|Thread}}** are commissioned over BLE (Zigbee Direct) or Wi-Fi ({{matter|Matter}} setup); once commissioned they run their own mesh. **[[cellular|Cellular]] data** falls back to [[wifi|Wi-Fi]] Calling when the carrier signal is weak — [[ipsec|IPsec]] ePDG tunnel from the UE to the carrier core over any IP link, including the airport Wi-Fi you just joined. The radio with the **best discovery + power profile** does the bootstrap; the radio with the **right property for the workload** (range, throughput, precision, security) does the actual session. Each chapter that follows is one corner of that bigger picture.'
						},
						{
							type: 'narrative',
							title: 'A note on chapter 2 — Wi-Fi appears twice',
							text: `[[wifi|Wi-Fi]] gets a chapter in Part III (Layer 2–3) and another one here. That is on purpose. Part III's chapter is about Wi-Fi as a **layer-2 fabric** — the bit that bridges [[wifi|802.11]] frames to [[ethernet|Ethernet]] and lets [[ip|IP]] forget the medium underneath. This Part's chapter is about Wi-Fi as a **radio** — {{csma-ca|CSMA/CA}}, MLO, the 6 GHz politics, the {{krack|KRACK}} → Dragonblood → SSID-Confusion lineage of attacks that only make sense once you understand the shared-medium problem above. Two halves of the same protocol, one from the cable's perspective and one from the airwaves'.`
						}
					]
				},
				{ kind: 'category-story', categoryId: 'wireless', sectionIndex: 0 },
				{ kind: 'category-story', categoryId: 'wireless', sectionIndex: 1 }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'wifi',
			title: 'Wi-Fi from the airwaves',
			synopsis:
				'The radio side of [[wifi|802.11]] — {{csma-ca|CSMA/CA}} in practice, MIMO → {{ofdma|OFDMA}} → MLO, and the {{krack|KRACK}}-to-{{wpa3|WPA3}} arc that finally fixed the wireless {{handshake|handshake}}.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Wi-Fi 6\'s nominal 9.6 Gbit/s shows up as 1–2 Gbit/s of real throughput in a crowded room, because more than half of the {{airtime|airtime}} is spent on DIFS gaps, ACK frames, beacons, and back-off. The headline number is a physics fact; the delivered number is an airtime budget.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Part III meets Part V',
							text: `Part III's chapter on Wi-Fi treated [[wifi|802.11]] as a Layer-2 fabric — the bit that bridges wireless frames to [[ethernet|Ethernet]], the regulatory big bang that opened the {{ism-band|ISM}} bands, and the 6 GHz / Wi-Fi 7 / Wi-Fi 8 generational arc. That framing is correct for someone reading bottom-up from the cable.

This chapter reads top-down from the *air*. The frame format and history we leave to Part III; here we look at what actually goes on inside the {{csma-ca|CSMA/CA}} loop, how MIMO and {{ofdma|OFDMA}} turned the original physics problem ({{multipath|multipath}}) into the {{bandwidth|bandwidth}}, what the headline "Wi-Fi 7 multi-link" feature really means in shipping silicon, and why every {{wpa3|WPA3}} {{access-point|access point}} in 2026 exists because Mathy Vanhoef sent three packets in 2017.

If you read Part III's Wi-Fi chapter first, this one is the second pass. If you skipped it, this one will send you back to it for the layer-2 frame mechanics.`
						},
						{
							type: 'narrative',
							title: "The CSMA/CA loop in real time",
							text: `Every [[wifi|802.11]] transmission begins with a station deciding the channel is idle. The procedure (DCF — Distributed Coordination Function) is mechanical: sense the channel for a **DIFS** interval of 28–34 µs, pick a random slot from a contention window starting at CW = 15, count it down (each slot = 9 or 20 µs depending on PHY), and transmit if the channel is still idle when the counter hits zero. If two stations pick the same slot, they collide; both double their CW (up to 1023) and try again.

Every {{unicast|unicast}} frame must be {{ack|ACKed}} after a **SIFS** gap of ~10 µs. No ACK means assumed collision and retransmit from a larger CW. {{ack|ACK}} frames are themselves unprotected by CSMA — they fire SIFS-fast precisely so no other station has time to seize the channel between data and ACK.

The visible cost is **{{airtime|airtime}} overhead**. Add up DIFS + SIFS + ACK frames + beacons + management traffic and you spend ~50% of channel time on protocol housekeeping at typical loads. Real engineers measure Wi-Fi performance in {{airtime|airtime}}, not bits per second — two clients with the *same* throughput target consume very different {{airtime|airtime}} if one is on a slow MCS at cell edge. Modern access points implement **airtime fairness** so a slow client cannot starve fast ones; classic 802.11 was famous for letting one device at the edge of the cell drag the entire network down to its rate.`
						},
						{
							type: 'callout',
							title: 'RTS/CTS is the hidden-terminal escape hatch',
							text: 'When two stations cannot hear each other but both hear the {{access-point|AP}}, they need the {{hidden-terminal|hidden-terminal}} fix: send a tiny **Request To Send**, wait for the AP\'s **Clear To Send** which every other station within range will also hear, then transmit during the announced duration. RTS/CTS is *optional* and trades {{latency|latency}} for {{airtime|airtime}} certainty — it adds two extra frames to every transmission, so it is on by default only for frames larger than a configurable threshold (often 2,346 bytes — i.e., never in practice). Networks that {{turn|turn}} it on aggressively tend to be airport halls and convention centres where dozens of clients are routinely behind a column from each other.'
						},
						{
							type: 'narrative',
							title: 'How MIMO turned multipath from enemy into bandwidth',
							text: `The original 1997 [[wifi|802.11]] standard ran at 1–2 Mbit/s and treated {{multipath|multipath}} as a bug: reflections off the floor and ceiling produced rapid fading that you compensated for with painful equalisation circuits. Two ideas reversed the framing.

**MIMO** (multiple-input multiple-output) arrived in 802.11n ([[wifi|Wi-Fi]] 4, 2009). Put two or three antennas at each end and the receiver can treat the reflected paths as *independent spatial streams* — multiplying throughput by the number of streams the channel can support. The same physics that made analog cellular calls stutter now multiplies your {{bandwidth|bandwidth}}.

**OFDM**, which 802.11a/g introduced in 1999 and 2003, spreads each symbol across hundreds of orthogonal subcarriers so a deep fade only kills a handful of them — the rest are decoded normally and forward error correction patches the gaps. **{{ofdma|OFDMA}}**, the multi-user upgrade in 802.11ax ([[wifi|Wi-Fi]] 6, 2020), assigns *different subsets of subcarriers* to different clients in the same symbol — the {{access-point|AP}} no longer has to give one client an entire transmission opportunity at a time. The combination of MIMO + {{ofdma|OFDMA}} is what lets a modern AP serve thirty phones in a coffee shop without each one paying the full per-transmission overhead the way Wi-Fi 5 did.

By [[wifi|Wi-Fi]] 7 (802.11be, ratified 22 July 2025) the air interface supports 320 MHz channels, 4096-QAM, and four-stream MIMO routinely — the theoretical peak is around 46 Gbit/s. The same channel, with the same antennas, that carried 11 Mbit/s in 1999.`
						},
						{
							type: 'narrative',
							title: 'Multi-Link Operation — and what really shipped',
							text: `**{{mlo|Multi-Link Operation}}** is the flagship feature of [[wifi|Wi-Fi]] 7. A single client connection spans 2.4 + 5 + 6 GHz radios simultaneously — frames can be sent on whichever band is least congested, and {{tail-latency|tail latency}} on a busy network drops sharply. That is the spec story.

The shipping-silicon story is subtler. Most Wi-Fi 7 client chips implement **eMLSR** (Enhanced Multi-Link Single Radio): one RF chain time-sliced across bands. True simultaneous transmit-receive across bands (STR-MLO) requires multiple full RF chains and shows up only in high-end {{access-point|AP}} hardware. **Throughput does NOT add across bands** for eMLSR clients — what they get is **{{latency|latency}} consistency**, not raw aggregate throughput. Marketing material that talks about 46 Gbit/s aggregated across three bands is talking about an AP-side capability that almost no consumer client can use.

The real headline feature of [[wifi|Wi-Fi]] 8 / 802.11bn is more honest about this. **Wi-Fi 8 is not a peak-speed upgrade**: same bands as Wi-Fi 7, same 320 MHz max, same ~46 Gbit/s PHY peak. The PAR objectives are **+25% throughput at given SINR, −25% 95th-percentile latency, −25% MPDU loss across BSS transitions**. The trend across the last two generations is the same — squeeze the existing speed budget for {{tail-latency|tail latency}} and reliability, not the headline marketing number.`
						},
						{
							type: 'callout',
							title: 'Power management is the hidden battery story',
							text: '802.11ax introduced **{{target-wake-time|Target Wake Time}}** — a client and {{access-point|AP}} pre-negotiate exact wake-up windows, so the client\'s radio stays deeply asleep between scheduled appointments. Originally aimed at low-power IoT (years on a coin cell), it is now what extends smartphone battery life on busy networks. **{{bss-coloring|BSS Coloring}}** added a 6-bit color field so a station can tell its own AP\'s transmissions from a neighbour\'s on the same channel, and apply a relaxed clear-channel threshold — recovering {{airtime|airtime}} that classic carrier sense would have forfeited. Both features are why Wi-Fi 6/7 outperforms Wi-Fi 5 in *exactly the apartment buildings and shopping centres* where Wi-Fi 5 used to grind to a halt.'
						},
						{
							type: 'narrative',
							title: 'KRACK, Dragonblood, and the road to WPA3',
							text: `WPA2's four-way {{handshake|handshake}}, specified in 2004, looked solid until 16 October 2017. On that morning, Mathy Vanhoef and Frank Piessens released **{{krack|KRACK}}** — Key Reinstallation AttaCK. The flaw was conceptually small: by replaying message 3 of the {{handshake|handshake}}, an attacker could trick a client into reinstalling an already-used session key, resetting the per-packet {{iv|nonce}} counter and defeating CCMP integrity. **Every WPA2 client on Earth needed firmware updates.**

{{krack|KRACK}} forced the {{wpa3|WPA3}} replacement that had been waiting in the wings. {{wpa3|WPA3}}-Personal uses **{{sae|SAE}}** (Simultaneous Authentication of Equals) — a *dragonfly* {{handshake|handshake}} from RFC 7664 where both sides prove knowledge of the passphrase without ever sending anything an eavesdropper could grind against a dictionary. Each session derives a fresh Pairwise Master Key with {{pfs|forward secrecy}}. WPA3 was announced January 2018 and made mandatory for Wi-Fi CERTIFIED 6 products from July 2020.

The story did not end there. Vanhoef's group at KU Leuven has broken Wi-Fi roughly every two years since: **Dragonblood** (April 2019, side-channels in WPA3-SAE), **FragAttacks** (May 2021, {{fragmentation|fragmentation}}/aggregation bugs in [[wifi|802.11]] design itself), **Framing Frames** (March 2023), **SSID Confusion / CVE-2023-52424** (May 2024 — the 802.11 standard does NOT require the SSID to enter PMK or session-key derivation in many config paths). The cadence is so reliable that the field plans security audits around his summer talks.

What Wi-Fi gets right after eight years of public attack is that **the attacks are *not* against the cryptographic primitives** — AES-CCMP and AES-GCMP have held up cleanly. The attacks are against the *protocol mechanics* of negotiation, key reinstallation, and middleware downgrade. The same shape recurs in [[bluetooth|Bluetooth]] ({{knob-attack|KNOB/BIAS/BLUFFS}}) and [[cellular|cellular]] (SS7/{{diameter|Diameter}} abuse): the cryptographic engine is sound; the **state machine around it** is where the bugs live.`
						},
						{
							type: 'narrative',
							title: 'Wi-Fi as the radio that does not know what it is for',
							text: `Most internet protocols are designed for a workload. [[grpc|gRPC]] is service-to-service RPC; [[mqtt|MQTT]] is sensor telemetry; [[rtp|RTP]] is conversational media. [[wifi|Wi-Fi]] is none of those — it is a *generic radio* underneath everything. The same 2.4 GHz {{frame|frame}} carries a [[tcp|TCP]] segment for an [[ssh|SSH]] session, a [[udp|UDP]] datagram for a video call, a [[mdns|Bonjour]] {{multicast|multicast}} for AirPlay discovery, and a {{matter|Matter}} commissioning message.

That genericity is why Wi-Fi has had to evolve so much at the **PHY** and **MAC** layers and so little above them. The IP stack on top is the same one [[ethernet|Ethernet]] uses — the [[wifi|802.11]] driver bridges 802.11 frames to 802.3 frames before [[ip|IP]] ever sees them. Every architectural choice in this chapter ({{ofdma|OFDMA}}, {{mlo|MLO}}, {{target-wake-time|TWT}}, {{wpa3|WPA3}}) is in the service of carrying *somebody else's traffic* across a hostile shared medium without those upper layers having to know.

The single thing the upper layers do notice is **{{tail-latency|tail latency}}** — the 99th-percentile delay that makes video calls stutter and games lag. From Wi-Fi 4 (2009) to Wi-Fi 8 (2028 target), the protocol's main job has been bending the {{tail-latency|tail latency}} distribution back toward the median while the headline throughput tripled three times.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/802.11_MAC_Frame.svg/500px-802.11_MAC_Frame.svg.png',
							alt: 'The 802.11 Wi-Fi MAC frame format showing frame control, duration, four address fields, sequence control, and FCS.',
							caption:
								'The **[[wifi|802.11]] MAC frame** — *up to four* MAC addresses (receiver / transmitter / destination / source), a 2-byte Duration field that announces how long the medium will be busy, and a Sequence Control field for reordering and {{retransmission|retransmission}}. Compare this to the 14-byte [[ethernet|Ethernet]] header. Almost every extra field is an accommodation to the fact that the medium is shared, the access is contended, and every frame needs an explicit {{ack|ACK}}.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
						}
					]
				},
				{ kind: 'protocol', id: 'wifi', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'frontier', id: 'wifi-7-ratified' },
				{ kind: 'simulation', protocolId: 'wifi' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'bluetooth',
			title: 'Bluetooth — Classic, LE, and the 6.0 ranging future',
			synopsis:
				'[[bluetooth|A 1994 cable-replacement project]] that became {{gatt|GATT}}, AirTags, {{auracast|Auracast}}, and {{channel-sounding|Channel Sounding}} — plus the {{knob-attack|KNOB / BIAS / BLUFFS}} lineage that broke session security three times in five years.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Bluetooth was supposed to be the wire that replaced the RS-232 cable to a mobile-phone headset. Thirty-two years later it bootstraps {{matter|Matter}}, unlocks BMWs, and broadcasts public hearing-loops across Frankfurt Airport. The most over-achieving cable replacement in computing.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A wireless headset cable, 1994',
							text: `In 1989, Nils Rydbeck, the CTO of Ericsson Mobile in Lund, Sweden, asked Tord Wingren to spec a short-range radio that could replace the RS-232 cable between a mobile phone and a headset. Wingren brought in two engineers: a Dutch electrical engineer named [[pioneer:jaap-haartsen|Jaap Haartsen]] (Delft PhD 1990, Ericsson from 1991) and a Swedish RF specialist named [[pioneer:sven-mattisson|Sven Mattisson]]. Haartsen later said it was *"not a eureka moment"* but a methodical search for a radio that would survive in the noisy 2.4 GHz {{ism-band|ISM}} band. He landed on **GFSK modulation** at a fast 1,600 hops per second across 79 narrow channels — designed to ride straight through Wi-Fi spillover and microwave-oven leakage by spending so little time on any one frequency that interference statistically averaged out. Ericsson filed the foundational patent in 1997.

The cross-industry alliance came next. IBM (Adalio Sanchez) and Ericsson (Rydbeck) agreed the radio should be an open standard so neither company could be locked out. Sanchez recruited Stephen Nachtsheim at Intel; Intel pulled in Toshiba and Nokia. On a windy Toronto pub crawl, [[pioneer:jim-kardach|Jim Kardach]] of Intel and Mattisson talked Viking history — Mattisson had been reading *The Longships*, Kardach had brought *The Vikings*. Kardach pitched the name **"Bluetooth"** as a code name after Harald "Blåtand" Gormsson, the 10th-century Danish king who united Denmark and Norway. It was supposed to be a placeholder. It stuck. The **Bluetooth Special Interest Group** launched on 20 May 1998 with five Promoter members: Ericsson, IBM, Intel, Nokia, Toshiba. The logo is a bind-rune combining Hagall (ᚼ = H) and Bjarkan (ᛒ = B) — Harald's initials in Younger Futhark.

The first commercial product — a hands-free headset — shipped in 1999. The first phone was the Ericsson T39 in June 2001.`
						},
						{
							type: 'narrative',
							title: 'Two protocols braided into one brand',
							text: `[[bluetooth|Bluetooth]] in 2026 is **two protocols sharing a logo**. **BR/EDR** ("Classic") is the original 1999 master/{{piconet|peripheral}} wire-replacement system — 79 × 1 MHz channels, 1,600 hops per second, GFSK + DPSK modulation. It still carries A2DP audio, HFP voice, HID (every wireless keyboard and mouse), and RFCOMM serial emulation. {{ble|**BLE (Bluetooth Low Energy)**}} was added in Core 4.0 (December 2009), derived from Nokia Research's *Wibree* project. **Different radio** (40 × 2 MHz channels), **different link layer**, **different framing** ({{l2cap|L2CAP}}), **different security** (SMP), **different application protocol** ({{gatt|GATT}}). Both share the 2.4 GHz {{ism-band|ISM}} band and a SIG, but they share **no bits over the air** — a dual-mode chip runs both stacks side by side.

The split is why every BLE primer warns readers not to read 2000s-era Bluetooth tutorials: master/slave became Central/Peripheral, A2DP became {{le-audio|LE Audio}}, {{gatt|GATT}} replaced [[sdp|SDP]], and connection setup got an order of magnitude faster. The two protocols are at the *brand-level* one thing and at the *implementation-level* two completely different stacks.

Production silicon hides the seam. Apple's H1/H2 chips, Broadcom's combo dies, Qualcomm's QCAxxxx — all run BR/EDR + BLE + Wi-Fi on the same package and time-slice between them in firmware. Your AirPods Pro charging case implements BR/EDR for the audio (A2DP) and BLE for the *find-my* network, both from the same antenna. You do not notice because you are not supposed to.`
						},
						{
							type: 'callout',
							title: 'GATT is a tiny REST API embedded in every BLE peripheral',
							text: 'A {{gatt|GATT}} server (the Peripheral) exposes a tree of **services → characteristics → descriptors**, each with a 16- or 128-bit UUID and a numeric handle. A {{gatt|GATT}} client (the Central) discovers them, reads/writes/subscribes-to-notifications. It is, structurally, a tiny [[rest|REST]] API embedded in every BLE device — services are endpoints, characteristics are the actual values. Every fitness sensor, smart lock, hearing aid, AirTag, electric toothbrush, and smart light bulb speaks this same shape. The 2010 design that makes a wearable battery last a week.'
						},
						{
							type: 'narrative',
							title: 'Why frequency hopping was the right answer',
							text: `[[bluetooth|Bluetooth]]'s **{{frequency-hopping|frequency-hopping spread spectrum}}** is one of those design choices that aged spectacularly well. BR/EDR hops 1,600 times per second across 79 × 1 MHz channels under a pseudo-random sequence keyed to the {{piconet|piconet}} master's clock and BD_ADDR. **AFH** (Adaptive Frequency Hopping, introduced in Core 1.2 in 2003) extends the trick: noisy channels get blacklisted from the hop set, so a microwave oven on its own narrow leakage frequency only knocks out a handful of hops instead of the whole link.

The architectural consequences run deep. **Collision avoidance is statistical** — two piconets in the same room would have to land on the same channel at the same hop instant to collide, and they almost never do. **Sniffing is hard** — to capture a Bluetooth conversation, an attacker must follow the hop pattern, which is keyed to the master's clock and address; off-the-shelf SDRs can do it, but it is much harder than capturing Wi-Fi where everyone sits on a single channel. **Interference resistance is automatic** — even before AFH, a 5% busy channel only drops 5% of hops; FEC handles the rest.

{{ble|BLE}} kept the hopping idea but simplified the channel plan. **40 × 2 MHz channels**. Three of them — 37, 38, 39 — sit at 2402, 2426, and 2480 MHz, deliberately placed between [[wifi|Wi-Fi]] channels 1/6/11, and serve as the **primary advertising channels**. The remaining 37 (numbered 0–36) carry data inside an established connection, hopping once per connection event.`
						},
						{
							type: 'narrative',
							title: 'BLE became the universal IoT bootstrap',
							text: `If [[wifi|Wi-Fi]] is the radio that does not know what it is for, **{{ble|BLE}} is the radio that knows it is a bootstrap**. Almost every consumer wireless interaction in 2026 chains *multiple* radios, and BLE is the one that does the discovery.

**{{matter|Matter}} commissioning** uses BLE to hand Wi-Fi or [[zigbee|Thread]] credentials to a new device — the QR code on the side of a smart bulb encodes a BLE pairing {{payload|payload}}, the phone runs the SPAKE2+ pairing dance over BLE, and only then does the device join the Wi-Fi or {{thread|Thread}} network it will actually operate on.

**{{ccc-digital-key|CCC Digital Key 3.0}}** uses BLE for proximity and then bootstraps a {{uwb|UWB}} session — the phone advertises a service UUID over BLE, the car authenticates, the encrypted {{gatt|GATT}} channel transfers the STS_KEY for the [[uwb|UWB]] ranging round, and only then does the UWB radio power on for the three-message DS-TWR {{exchange|exchange}}. **{{aliro|Aliro}} 1.0**, the access-control credential standard the CSA finalised on 26 February 2026, follows the same pattern for doors.

**Apple AirTags** advertise BLE packets every couple of seconds; nearby iPhones report them through the *Find My* network so the AirTag's owner can locate it without any cellular hardware. **Hue bulbs** (and almost every smart light shipped after 2020) accept Wi-Fi/Thread credentials over BLE during commissioning. **Hearing aids** use BLE for the control plane and {{le-audio|LE Audio}} for the stream.

The pattern is simple: BLE has the **right discovery + power profile** to be the always-on radio. The actual session moves to whichever radio has the right property for the workload — Wi-Fi for throughput, UWB for ranging, Thread for mesh.`
						},
						{
							type: 'narrative',
							title: "LE Audio, Auracast, and the hearing-loop replacement story",
							text: `**{{le-audio|LE Audio}}** is the 2020+ rebuild of Bluetooth audio, defined across Core 5.2+ and a stack of profiles (BAP, PBP, TMAP, HAP). It runs over **Isochronous Channels** — Connected Isochronous Streams (CIS) for {{unicast|unicast}} earbuds and hearing aids, {{broadcast|Broadcast}} Isochronous Streams (BIS) for one-to-many. The mandatory {{codec|codec}} is **{{lc3|LC3}}** (SIG + Fraunhofer IIS + Ericsson, January 2020), roughly 2× more battery-efficient than the 1990s SBC {{codec|codec}} at equivalent quality.

The cultural moment is **{{auracast|Auracast}}** — the SIG's brand for **Broadcast Isochronous Streams** (BIS) over {{le-audio|LE Audio}} + LC3, one transmitter to unlimited listeners. Public venues replace analog hearing-loops with an {{auracast|Auracast}} broadcast; nearby listeners scan, pick a stream, and tune in. **Frankfurt Airport became the first airport in the world to broadcast all gate announcements over Auracast on 28 January 2026**. Cinemas, theatres, gyms, lecture halls, and houses of worship are deploying similar setups through 2026 and 2027.

The Auracast accessibility story is the killer app, not "free wireless audio in the airport." For hard-of-hearing listeners, Auracast turns every public-address system into something their hearing aids can listen to directly — no analog loop, no battery-eating Bluetooth pair with a wall-mounted transmitter, just a scan-and-select. The SIG positions it as the *largest accessibility upgrade in consumer audio history*, and the deployment math (every hearing-aid manufacturer ships LE Audio in 2026 hardware) backs that up.`
						},
						{
							type: 'narrative',
							title: 'Channel Sounding — taking the fight to UWB',
							text: `For the last five years the secure-distance-measurement niche has belonged to [[uwb|UWB]]: BMW, Mercedes, and Apple use [[uwb|UWB]] for cm-class digital car keys precisely *because* {{ble|BLE}}'s {{rssi|RSSI}}-based proximity is broken under relay attacks. **{{channel-sounding|Channel Sounding}}**, added in **Bluetooth 6.0** (adopted 3 September 2024), is the SIG's reply.

Two devices in a normal LL connection schedule {{channel-sounding|Channel Sounding}} events on a new **LE 2M 2BT PHY** specifically designed for ranging. They measure both signal **phase** across many frequencies (Phase-Based Ranging) and **{{rtt|round-trip time}}** of timestamped packets; the combination yields **centimetre-class distance accuracy up to ~150 m**. The intended use: digital car keys, smart locks, anti-stalking tags, and proximity-aware payment terminals — all of which need to know if the {{peer|peer}} is actually *here* and not relayed through a radio.

Whether Channel Sounding actually displaces UWB for digital-key applications is still an open question in 2026. UWB has a five-year head start in {{ccc-digital-key|CCC Digital Key}}, a tighter timing precision (~30 cm at the silicon level versus ~5–10 cm cm-claimed for Channel Sounding under good conditions), and dedicated cryptography ({{sts|STS}}) that was designed for adversarial environments from day one. Channel Sounding has the deployment advantage: it ships on every new Bluetooth 6.0 chip, which means every new smartphone. The next two years of car-key product announcements will tell.`
						},
						{
							type: 'callout',
							title: 'The KNOB / BIAS / BLUFFS lineage',
							text: 'Three BR/EDR session-security breaks by the same author (Daniele Antonioli) in five years: **KNOB** (CVE-2019-9506) downgraded the entropy of the negotiated session key to 1 byte. **BIAS** (CVE-2020-10135) impersonated a previously-bonded {{peer|peer}} by abusing role-switch in Legacy Secure Connections. **BLUFFS** (CVE-2023-24023) broke {{forward-secrecy|forward secrecy}} by forcing reuse of a session-key derivation across reconnections. Every BR/EDR device shipped before mid-2024 is affected; the Core 5.4 / 6.0 patches add explicit minimum-entropy and key-diversification checks. Each attack hit a different part of the *state machine* around the cryptography — the AES core was fine; the negotiation logic around it was the bug. **The same pattern as {{krack|KRACK}} in Wi-Fi and SS7/{{diameter|Diameter}} abuse in cellular.** Every wireless protocol in this Part has now had its negotiation logic publicly broken at least once.'
						},
						{
							type: 'narrative',
							title: 'The 2022 Tesla relay attack — and why physics is the only fix',
							text: `On 15 May 2022, Sultan Qasim Khan at NCC Group disclosed a **link-layer relay attack** against Tesla Model 3 phone-as-a-key. Two ~$25 dev boards (one near the phone, one near the car), a few hundred metres of cellular link between them, and ~8 ms of added {{latency|latency}} was enough to make the Tesla believe the phone was in proximity when it was actually at the supermarket. The attack worked because **{{ble|BLE}} {{rssi|RSSI}} is fundamentally untrustworthy** — signal strength can be amplified arbitrarily by a relay, and the link-layer round-trip-time check in classic BLE was too coarse (~30 ms) to catch an 8 ms relay.

The industry conclusion: **proximity-by-radio-signal-strength is unfixable.** A relay with enough TX power and enough patience defeats any RSSI threshold. The only way to verify physical proximity is to measure **{{tof-ranging|time-of-flight}}**, because *the speed of light is the hard upper bound that no relay can shorten*. That insight pushed the secure-access industry toward [[uwb|UWB]] (where {{tof-ranging|ToF}} is the entire point) and motivated Bluetooth {{channel-sounding|Channel Sounding}}'s RTT mode to use much tighter timing than legacy BLE.

The 2022 attack is the canonical case study for why every credential standard since — {{ccc-digital-key|CCC Digital Key 3.0}}, {{aliro|Aliro}}, Bluetooth 6.0 ranging — explicitly mandates physics-based proximity, not radio-strength heuristics. RSSI was a workable shortcut for a decade. Then it stopped being one.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bluetooth.svg/250px-Bluetooth.svg.png',
							alt: 'The Bluetooth logo — a bind-rune combining Hagall and Bjarkan, the initials of Harald Blåtand.',
							caption:
								'The **[[bluetooth|Bluetooth]]** logo: a bind-rune combining **Hagall** (ᚼ = H) and **Bjarkan** (ᛒ = B) — *Harald Blåtand*\'s initials in Younger Futhark. [[pioneer:jim-kardach|Jim Kardach]] of Intel proposed the name on a Toronto pub crawl in 1997 after the 10th-century Danish king who united Denmark and Norway. It was supposed to be a placeholder.',
							credit: 'Image: Bluetooth SIG trademark, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'bluetooth', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'jaap-haartsen' },
				{ kind: 'pioneer', id: 'sven-mattisson' },
				{ kind: 'pioneer', id: 'jim-kardach' },
				{ kind: 'simulation', protocolId: 'bluetooth' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'cellular',
			title: 'Cellular — 4G LTE + 5G NR + the 3GPP machine',
			synopsis:
				'One chapter for [[cellular|the radio (LTE-Uu, NR-Uu)]] and the core (EPC → 5GC SBA) because the {{3gpp|3GPP}} release calendar is one calendar. VoLTE / [[wifi|Wi-Fi]] calling, NB-IoT / LTE-M, satellite {{direct-to-cell|direct-to-cell}}, and the SS7 / {{diameter|Diameter}} trust holdover.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The control plane of every modern carrier on Earth is now an [[http2|HTTP/2]] microservice fabric — and every backhaul hop is wrapped in [[ipsec|IPsec]] ESP per {{3gpp|3GPP}} TS 33.501. The single largest enterprise IPsec deployment on Earth runs inside this layer.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Cooper, Bell Labs, and a phone call from Sixth Avenue',
							text: `On 3 April 1973, **Marty Cooper** of Motorola stood on Sixth Avenue in Manhattan with a 2.5-pound prototype handset called the DynaTAC, and dialled **Joel Engel** at AT&T Bell Labs — his direct competitor in the cellular race. *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC gave 35 minutes of talk after 10 hours of charging. The base station was in midtown. The infrastructure to support it commercially did not exist yet.

That call started the **53-year arc** from Cooper's prototype to the ~9 billion {{cellular|cellular}} subscriptions running 4G LTE and {{5g-nr|5G NR}} in 2026. Three generations of analog (1G AMPS / TACS / NMT, ~1983–2000), three generations of digital (2G GSM / IS-95, ~1991; 3G WCDMA / CDMA2000, ~2001; 4G LTE, ~2010), and now 5G NR (~2018) — each one redrawing both the air interface and the core network on roughly a decade's cadence.

The transition that defined the modern era was 2G to 3G. **GSM**, launched commercially in Finland by Radiolinja in 1991, was the European digital standard that became the global one through sheer deployment momentum. **CDMA** (Andrew Viterbi at Qualcomm) was the technically-superior US challenger that won the underlying maths and lost the deployment war: when 3G ratified WCDMA inside UMTS, Viterbi's CDMA principles were what made the *radio* work, but the *system* was built on the GSM operator ecosystem. The pattern is one we have seen elsewhere — [[sctp|SCTP]] being technically superior to [[tcp|TCP]], OSI to TCP/IP — the better protocol that lost on deployment economics.`
						},
						{
							type: 'narrative',
							title: 'Why one chapter for "4G + 5G"',
							text: `Cellular is the only protocol in this book that gets a single chapter for what looks like *two* protocols. The reason is that {{3gpp|3GPP}}, the standards body, ships both on a single Release schedule, and a 5G phone in 2026 is also an LTE phone falling back the moment 5G coverage drops. **LTE** is {{lte|3GPP Release 8}}, frozen December 2008. **{{5g-nr|5G NR}}** is {{5g-nr|3GPP Release 15}}, frozen June 2018. Both share the same air-interface design philosophy ({{ofdma|OFDMA}} + flexible numerology + {{harq|HARQ}}), the mandatory [[ipsec|IPsec]] envelope on every backhaul link, and an [[ipv6|IPv6]] mandate that has quietly migrated every major carrier's user-plane to IPv6-only since ~2020.

The 5G *air interface* extended LTE's {{ofdma|OFDMA}} with scalable numerology — five subcarrier spacings (15, 30, 60, 120, 240 kHz) that let the same protocol address sub-6 GHz mid-band (FR1) and {{mmwave|mmWave}} 24–52 GHz (FR2). The 5G *core network* threw out 4G's EPC zoo of monolithic boxes (MME, SGW, PGW, HSS, PCRF) glued by GTP and {{diameter|Diameter}}, and replaced it with **{{sba|Service-Based Architecture}}**: dozens of named network functions ({{aaa|AMF}}, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF) talking to each other over **[[http2|HTTP/2]] with {{json|JSON}} payloads protected by [[tls|TLS]]**.

Read that sentence again. **The control plane of every 5G carrier on Earth is now an [[http2|HTTP/2]] {{service-mesh|microservice fabric}}.** Cloud-native engineers can read the {{3gpp|3GPP}} TS 23.501 architecture diagrams and recognise their own world — service registry (NRF), API gateway (NEF), policy engine (PCF), token authentication (AUSF). The plumbing under your phone call uses the same patterns as a Kubernetes deployment.`
						},
						{
							type: 'callout',
							title: 'The largest enterprise IPsec deployment on Earth',
							text: 'Every interface between the [[cellular|cellular]] {{ran|radio access network}} and the core (N2/N3 in 5G, S1 in LTE) is wrapped in [[ipsec|IPsec ESP]] per {{3gpp|3GPP}} TS 33.501. With ~9 billion subscribers and tens of millions of base stations worldwide, the {{cellular|cellular}} backhaul is the single largest production [[ipsec|IPsec]] deployment that exists. [[pioneer:andreas-steffen|Andreas Steffen]]\'s strongSwan, Cisco IOS, and Juniper Junos run more [[ipsec|IPsec]] tunnels inside one [[cellular|cellular]] operator than the entire enterprise VPN market combined.'
						},
						{
							type: 'narrative',
							title: 'The radio stack, in five layers',
							text: `Every 5G phone runs a five-layer stack inside the modem chip. **PHY** ({{3gpp|3GPP}} TS 38.211–214) carries {{ofdma|OFDMA}} with five numerologies. **MAC** does **{{harq|hybrid ARQ}}** — combining forward error correction with {{retransmission|retransmission}}, where the receiver stores soft-decoded log-likelihood ratios from failed transmissions and combines them with the retransmitted copy. Eight parallel stop-and-wait {{harq|HARQ}} processes per UE keep the pipe full. **RLC** handles {{fragmentation|segmentation and reassembly}} across 10- or 16-bit {{sequence-number|sequence numbers}}. **PDCP** above it does ROHC {{header|header compression}} (squashing the 40-byte [[ipv6|IPv6]]+TCP/UDP header to 1–4 bytes), AES-CTR {{encryption|ciphering}}, and 32-bit {{anti-replay|anti-replay}}. **RRC** drives the connection state machine — \`RRC_IDLE → CONNECTED → INACTIVE\` for 5G — and **NAS** carries mobility, {{handshake|authentication}}, and session management end-to-end between the UE and the core.

Above all that, the user plane is just [[ip|IP]] — almost always [[ipv6|IPv6]] now. Above *that*, the application runs whatever ordinary internet applications run. {{harq|HARQ}} is the reason {{cellular|cellular}} reaches ~99.999% link reliability without [[tcp|TCP]]'s retransmit cost on the air. ROHC is the reason a 56-kbps narrowband IoT bearer can carry an IPv6 + [[tls|TLS]] 1.3 connection without spending all its bytes on headers.`
						},
						{
							type: 'narrative',
							title: 'Voice as packets — VoLTE, VoNR, Wi-Fi Calling',
							text: `Until the late 2010s, "voice" on a phone meant a circuit-switched call routed through 2G/3G fallback even on an LTE device. **{{volte|VoLTE}}** (Voice over LTE, mass deployments from ~2014) finally packetised carrier voice — every call is a [[sip|SIP]] INVITE inside an {{ims|IMS}} bearer, with audio carried over [[rtp|RTP]] using AMR-WB or EVS {{codec|codecs}}. {{volte|**VoNR**}} (Voice over New Radio, mass deployments from ~2022) does the same over 5G.

{{gsma|GSMA}} reports **310+ commercial VoLTE operators in 140+ countries** and **45+ commercial VoNR networks** by 2025. Every modern carrier voice call is now a [[sip|SIP]] INVITE — the largest [[sip|SIP]] deployment on Earth runs inside the {{cellular|cellular}} {{ims|IMS}} stack.

**Wi-Fi Calling** is the same IMS stack tunnelled to the carrier over [[ipsec|IPsec]] from any IP network. Your phone in the basement, on the hotel Wi-Fi, places calls through the carrier's *ePDG* (Evolved Packet Data Gateway) — an [[ipsec|IPsec]] head-end the size of a small data centre that terminates millions of IKEv2 tunnels and feeds the inner IMS traffic into the EPC. From the network's perspective, your basement phone looks like any other LTE phone; it just happened to attach through Wi-Fi instead of an eNodeB.`
						},
						{
							type: 'narrative',
							title: 'Tunnels and addresses — how your IP follows you',
							text: `The architectural trick that makes {{cellular|cellular}} look like a normal IP network from the application's perspective is **{{gtp-u|GTP-U}}** — the GPRS Tunnelling Protocol — User plane. Every PDU session has a 32-bit **Tunnel Endpoint Identifier (TEID)**. User-plane packets travel from the gNB to the User Plane Function over [[udp|UDP]]/2152, wrapped in {{gtp-u|GTP-U}} headers that preserve the UE's inner [[ip|IP]] address regardless of which base station the UE is camping on.

This is the mechanism behind one of {{cellular|cellular}}'s most under-appreciated features: **your phone keeps its [[ip|IP]] address across handovers**. As you drive from one cell tower's coverage to the next, the GTP-U tunnel terminates at a different base station, but the same UPF anchors the same [[ipv6|IPv6]] prefix to your device. Your YouTube stream does not have to renegotiate; your video call does not drop. The reason TCP-on-cellular works at all is that the network hides the radio handover from the IP layer.

**NAS** (Non-Access Stratum) signalling runs end-to-end between the UE and the core through the gNB transparently. **Registration Request** with **SUCI** — the {{public-key|public-key-encrypted}} SUPI ({{sim-usim|Subscription Permanent Identifier}}) — starts the AKA {{handshake|handshake}} after the device powers on. The UDM decrypts to SUPI, generates an authentication vector, and the USIM verifies AUTN and computes RES*. After **Security Mode Command**, all subsequent NAS messages are integrity-protected and ciphered with K_NASint / K_NASenc. The {{sim-usim|SIM}} is the long-term key K; everything else is derived from it for the device's lifetime.`
						},
						{
							type: 'callout',
							title: 'The 2024 AT&T outage — 125 million devices, 25,000 failed 911 calls',
							text: 'On **22 February 2024 at 03:30 ET**, AT&T Mobility customers across the United States lost service for up to twelve hours. A routine network upgrade was misconfigured and pushed simultaneously across the production wireless core. **An estimated 25,000 emergency calls were not connected.** AT&T paid affected customers a $5 service credit (about $625 million in aggregate) and reached a $13 million FCC settlement in November 2024 — the largest single-incident penalty for a US wireless outage. The structural lesson — **never push a config change to the entire fleet at once** — is the same one the industry was supposed to have learned from [[outage:rogers-2022|Rogers 2022]]. Canary deployments are now post-incident table stakes in carrier networks.'
						},
						{
							type: 'narrative',
							title: 'IoT cellular — NB-IoT, LTE-M, RedCap',
							text: `Most {{cellular|cellular}} subscriptions on Earth are phones. The growing minority is **IoT modules** — asset trackers, fleet telematics, smart meters, agricultural sensors, GPS pet collars. These devices are battery-powered, send a few kilobytes a day, and need years of operation per charge. Standard {{5g-nr|5G NR}} is wildly overkill for them; the {{3gpp|3GPP}} answer is a family of *cat-down* radio profiles inside LTE/NR {{spectrum|spectrum}}.

**NB-IoT** (Cat-NB1, Release 13, 2016) gives ~250 kbit/s peak in a single 200 kHz channel — narrower than a Wi-Fi block, broader than nothing. **LTE-M / Cat-M1** (Release 13, 2016) gives ~1 Mbit/s in 1.4 MHz, enough for voice over LTE for connected wearables. **RedCap** (Reduced Capability NR, Release 17, 2022) is the 5G equivalent — {{bandwidth|bandwidth}}-constrained 5G NR for wearables and industrial sensors. **{{ambient-iot|Ambient IoT}}** ({{ambient-iot|study items in Release 19/20}}) is the next step: battery-less or near-battery-less cellular devices that harvest RF or motion and transmit tiny payloads.

The {{lpwan|LPWAN}} story is broader than cellular — **LoRaWAN** (sub-GHz unlicensed, 125M+ devices by end-2025) and **Sigfox** (slow-modulation 100 bit/s ultra-narrowband) own much of the metering and agriculture market. But cellular's NB-IoT/LTE-M can run on existing carrier infrastructure, which makes deployment trivial for operators and competitive for everyone else.`
						},
						{
							type: 'narrative',
							title: 'Direct-to-cell — when the satellite is the tower',
							text: `In **January 2025**, T-Mobile + SpaceX Starlink launched the first commercial **{{direct-to-cell|Direct-to-Cell}}** service: SMS and emergency messaging from ordinary smartphones, with the satellite acting as a base station in standard {{cellular|cellular}} bands n255/n256. Apple's Globalstar-based Emergency SOS, AT&T's AST SpaceMobile partnership, and Iridium's NTN-ready successors follow similar patterns.

The {{3gpp|3GPP}} framing is **{{ntn|Non-Terrestrial Networks}}** — added in Release 17 (March 2022) as a first-class radio access type, split into NB-IoT NTN, NR NTN, and the {{direct-to-cell|Direct-to-Cell}} profile. The phone does not need a special radio; it does need to be in line-of-sight of a satellite, which means open sky.

What changes about the {{cellular|cellular}} mental model is the word "coverage." For 50 years, "no signal" meant *no signal*. For most of the next 50, "no signal" will mean *no terrestrial signal — try walking outside*. The implications for emergency services, maritime communications, and the half of the planet that has never had reliable mobile coverage are still being worked out.`
						},
						{
							type: 'narrative',
							title: 'The SS7 / Diameter trust holdover',
							text: `Modern {{cellular|cellular}} security inside one carrier's network is strong. The cryptography is sound, the air interface is encrypted, the IMS signalling runs over [[tls|TLS]]. But the **interconnect layer between carriers** — how a roaming visitor authenticates, how SMS routes globally, how location is queried for billing — runs on **{{ss7|SS7}}** (designed 1975) and **{{diameter|Diameter}}** (RFC 6733, 2012), both designed in an era of implicit trust between carrier peers.

Modern surveillance actors exploit this trust. **SS7 routing** can silently track mobile users worldwide — Citizen Lab's 2024–25 disclosures and CISA's 2024 testimony to the {{fcc|FCC}} document active commercial-grade surveillance using exactly this vector. {{diameter|Diameter}} abuse (DoS, location-tracking, SMS interception) by malicious peers remains a real-world problem. The 5G SBI authenticated interconnect ({{3gpp|3GPP}} TS 33.521) is the long-term fix; it is partially deployed and still has decades of SS7-shaped tail to migrate.

The shape rhymes with the rest of this Part. Every wireless protocol's cryptography has held up. Every wireless protocol's *negotiation logic*, *roaming model*, or *trust assumptions between operators* has been broken at the protocol level by now. The 1990s and 2000s patched the cryptography; the 2020s are patching the architecture around it.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cellular_network_standards_and_generation_timeline.svg/500px-Cellular_network_standards_and_generation_timeline.svg.png',
							alt: 'Timeline of cellular network standards from 1G through 5G, by generation.',
							caption:
								'**Fifty years of [[cellular|cellular]]** — from 1G analog AMPS / TACS / NMT in the early 1980s through 2G GSM / IS-95, 3G WCDMA / CDMA2000, 4G LTE, and {{5g-nr|5G NR}}. Each generation redrew both the air interface and the core network on roughly a decade\'s cadence, while the {{3gpp|3GPP}} Release calendar kept ticking every ~18 months. **6G** is in pre-standardisation now; first commercial deployments expected around 2030.',
							credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
						}
					]
				},
				{ kind: 'protocol', id: 'cellular', facets: ['overview', 'header'] },
				{ kind: 'pioneer', id: 'marty-cooper' },
				{ kind: 'pioneer', id: 'andrew-viterbi' },
				{ kind: 'pioneer', id: 'irwin-jacobs' },
				{ kind: 'pioneer', id: 'erik-dahlman' },
				{ kind: 'outage', id: 'att-mobility-2024' },
				{ kind: 'simulation', protocolId: 'cellular' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'nfc',
			title: 'NFC — 4 cm of wireless that runs the global payment rails',
			synopsis:
				'[[nfc|13.56 MHz inductive coupling]], ISO 18092, EMV contactless, Apple Pay, {{transit|transit}} cards, {{ccc-digital-key|CCC Digital Key}}, {{aliro|Aliro}} 1.0, and the [[pioneer:charles-walton|Charles Walton]]-to-Apple-Pay arc that took 31 years.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The protocol that runs the British contactless economy was published in 2000. The protocol your phone uses to pay your barista was published as ISO/IEC 18092 in December 2003 — three years before the iPhone existed. [[nfc|NFC]] is one of the rare wireless stacks where the wire format has not changed in 20 years. Every iteration has been at the certification, security, and application-layer level.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: '1973 — a patent, a decade ahead of the band',
							text: `In 1973, an IBM engineer named [[pioneer:charles-walton|Charles Walton]] filed **US Patent 3,752,960** — *"Electronic Identification & Recognition System"*. It described a passive transponder that responded to an interrogator's RF field by modulating its load impedance — the foundational mechanism behind {{rfid|RFID}} and, eventually, every contactless payment terminal on Earth. Walton would file 50 more patents over his career; the 1973 patent is the one historians point to as the parent of [[nfc|NFC]].

Walton received small but steady royalties for thirty years. Then his patent expired in 1993 — eleven years *before* the [[nfc|NFC]] Forum was founded and seventeen years before contactless payments became a consumer phenomenon. The arc from Walton's 1973 patent to **Apple Pay's launch on 9 September 2014** is one of the longest deployment lags in computing: 41 years from the underlying physics to the consumer product that finally made it ubiquitous.

The middle of that arc is the **NXP / Philips / Sony alliance**. Philips Semiconductors (later NXP) and Sony's FeliCa team co-developed the technology that became **ISO/IEC 18092** in December 2003. **[[pioneer:franz-amtmann|Franz Amtmann]]** at NXP and **[[pioneer:philippe-maugars|Philippe Maugars]]** are the names attached to the IEEE-historian record as co-inventors. The **[[nfc|NFC]] Forum** was founded in 2004 by Sony, Philips, and Nokia — Nokia, in particular, championed [[nfc|NFC]] as a feature for its phones a decade before anyone else cared.`
						},
						{
							type: 'narrative',
							title: 'Why 13.56 MHz and 4 cm — physics by design',
							text: `Every [[nfc|NFC]] variant operates at a carrier of **13.56 MHz ± 7 kHz**, the unlicensed {{ism-band|ISM}} allocation that ISO 14443 inherited. The coupling is **{{inductive-coupling|inductive (magnetic)}}**, not radiative — two loop antennas brought close together share their *near field*, and the magnetic component of that field falls off as **1/r³**, vs the 1/r² of normal radio. The {{cubic|cubic}} falloff is why [[nfc|NFC]]'s ≤10 cm range is a *feature*, not a bug: it makes physical proximity an inherent security property.

The reader (the **PCD** — Proximity Coupling Device) energises its loop antenna and transmits the 13.56 MHz carrier. The card (the **PICC** — Proximity Integrated Circuit Card) is passive: it harvests power from the field — microwatts is enough — and communicates back via **{{load-modulation|load modulation}}**, switching a resistor on its own antenna at an 847.5 kHz subcarrier (which is 13.56 MHz / 16). The reader perceives this as small amplitude or phase changes in its *own* resonant loop. The PICC has no battery, no transmitter, and no clock of its own — it borrows all three from the reader.

Modern phones use **active {{load-modulation|load modulation}}** instead, generating a small reflected carrier from a battery-powered transmitter. This is why an iPhone can be read across a metal-backed case where a plain plastic card cannot — the active emission has enough headroom to overcome the metal's eddy-current attenuation.`
						},
						{
							type: 'callout',
							title: 'Three flavours on the air',
							text: '**NFC-A** (ISO 14443-A): PCD→PICC is 100% ASK modified-Miller; PICC→PCD is OOK Manchester on the 847.5 kHz subcarrier. Base rate 106 kbit/s, scaling to 848. **NFC-B** (ISO 14443-B): PCD→PICC is 10% ASK NRZ-L; PICC→PCD is BPSK on the subcarrier — used by some EMV cards and many ICAO e-passports. **NFC-F** (FeliCa / JIS X 6319-4): 212/424 kbit/s Manchester-coded ASK, *no subcarrier* — dominant in Japan {{transit|transit}} (Suica, PASMO) and Hong Kong (Octopus). **NFC-V** (ISO/IEC 15693) is a fourth, longer-range vicinity-coupling mode at lower data rates — used in industrial tagging, library books, and the Apple Vision Pro Light Seal [[nfc|NFC]] tag. All four coexist in the same reader silicon.'
						},
						{
							type: 'narrative',
							title: 'The contactless payment dance, in seven APDUs',
							text: `Once an [[nfc|NFC]] PICC enters the reader's field, the anti-collision dance begins. The reader broadcasts a 7-bit **REQA** (0x26) or **WUPA** (0x52) short frame; the card responds with **ATQA** (2 bytes) declaring its UID size (4/7/10 bytes). The reader then runs the **bit-frame anti-collision** loop with SEL+NVB frames, converging on each byte of the UID one bit at a time when multiple cards are in the field. When the UID is complete, the card answers with **SAK**; if bit 6 of SAK is set, the card supports ISO 14443-4 and the reader proceeds with RATS → ATS to negotiate frame size and timing.

Now the reader speaks **{{apdu|APDUs}}** (ISO 7816-4) — the same command/response unit every smart card has used since the 1980s. The first command is **SELECT {{ppse|PPSE}}** — the Proximity Payment System Environment AID \`2PAY.SYS.DDF01\` — and the card returns an FCI listing all supported payment {{aid|AIDs}} in priority order. The reader picks one (e.g. Mastercard \`A0000000041010\`), SELECTs it, gets back a PDOL listing the parameters the card needs (amount, currency, country, terminal type, unpredictable number), then sends **GET PROCESSING OPTIONS** with those parameters. The card returns AIP+AFL telling the reader which files to read; READ RECORDs pull the PAN, expiry, and public-key {{certificate-chain|certificate chain}}. Finally **GENERATE AC** with CDOL1 data asks the card for an **{{emv-cryptogram|Application Cryptogram}}** — either an ARQC (online) or TC (offline). The cryptogram is signed in the {{ese|Secure Element}} or {{hce|HCE}} app, and is what proves the transaction to the issuer.

Seven APDUs, ~300 ms, and the latte is paid for.`
						},
						{
							type: 'narrative',
							title: "Tokenisation — why your real card number never leaves the bank",
							text: `Apple's 9 September 2014 launch was not just "we added an [[nfc|NFC]] chip to the iPhone." It was a *tokenisation revolution* baked into the architecture. The cardholder's real **Funding PAN (FPAN)** never reaches the device. The bank issues a **Device PAN (DPAN)** instead, provisioned via the Token Service Provider (Visa Token Service or Mastercard Digital Enablement Service) into the {{ese|embedded Secure Element}} or the {{hce|HCE}} keystore.

Every tap generates a per-transaction {{emv-cryptogram|cryptogram}} bound to the DPAN, the **{{atc|ATC}}** (Application Transaction Counter), and the **Unpredictable Number** from the terminal. A stolen DPAN is worthless without the keys in the SE; a stolen cryptogram is worthless because the ATC has already moved on. This is the reason **Apple Pay fraud rates in 2026 are broadly in line with card-not-present rates** — much better than physical-card-present fraud at unattended terminals — despite the initial 2015 *"yellow path"* enrolment disaster where social-engineered phone agents over-approved fraudulent provisioning.

The same tokenisation mechanism powers Google Wallet and Samsung Pay. The hardware varies — Apple uses {{ese|eSE}} exclusively for payment; Google uses a mix of HCE and Android StrongBox; Samsung uses Knox-isolated payment paths. The cryptography and the protocol on the wire are the same EMVCo specification.`
						},
						{
							type: 'narrative',
							title: 'NDEF — the small data format for everything that is not a payment',
							text: `Not every [[nfc|NFC]] interaction is a payment. The other big use is **{{ndef|NDEF}}** — NFC Data {{exchange|Exchange}} Format — the binary record container that lives in passive tags and rides over {{llcp|LLCP}}/{{snep|SNEP}}. Each record begins with a 1-byte header (MB/ME/CF/SR/IL + 3-bit TNF) plus variable type/id/{{payload|payload}}-length fields and a payload.

The **TNF** (Type Name Format) picks the namespace: 1 = Well-Known (URI, Text, Smart Poster), 2 = MIME, 3 = Absolute URI, 4 = External, 5 = Unknown. The URI Well-Known record uses a single-byte prefix shorthand — \`0x03\` for \`https://\` saves eight bytes per record on tags as small as 48 bytes. This is why a tap on a museum exhibit's NFC plaque can fit a URL, a description, and a localised string into ~100 bytes of tag memory.

**{{ndef|NDEF}} was formally adopted as an IEC standard in March 2026**, alongside the NFC Forum Wireless Charging (WLC) extension. The data format is now an international standard 23 years after the underlying radio protocol was standardised.`
						},
						{
							type: 'narrative',
							title: 'Three transports, one tap — bootstrap to BLE / Wi-Fi / Matter',
							text: `For higher-throughput sessions [[nfc|NFC]] is almost always a *bootstrap*. The **Connection Handover** spec (v1.5) defines {{ndef|NDEF}} records of TNF = 0x02 with MIME \`application/vnd.bluetooth.le.oob\` carrying the [[bluetooth|Bluetooth]] {{mac-address|MAC address}}, name, and Security Manager OOB key — a single tap replaces a discovery/pairing dialog on speakers, headphones, printers, and AirPods-class earbuds. The parallel Wi-Fi handover record carries SSID/key/security mode — used for tap-to-join on printers and some smart-plug commissioning.

**{{matter|Matter}} 1.3+** adds [[nfc|NFC]] as one of the three permitted commissioning paths alongside QR code and BLE. Place a {{matter|Matter}}-NFC-capable device near your phone, and it onboards onto your home {{thread|Thread}}/Wi-Fi mesh without ever opening an app. **{{ccc-digital-key|CCC Digital Key 3.0/4.0}}** uses [[nfc|NFC]] to bootstrap a credential into a phone, then BLE for proximity, then [[uwb|UWB]] for centimetre-accurate ranging. **{{aliro|Aliro 1.0}}** likewise spans NFC tap-to-access + BLE proximity + BLE/UWB ranged — three transports, one credential. The Connection Handover pattern is now the *default* on-ramp to nearly every other consumer wireless protocol.

This is why [[nfc|NFC]] survives despite its painful slow data rate. Nobody uses NFC to *carry* a session; everyone uses it to *start* one. The 4 cm physical-presence requirement is exactly the security property the bootstrap needs — you cannot accidentally pair with a device you cannot physically touch.`
						},
						{
							type: 'callout',
							title: 'MIFARE Crypto1 — the security-by-obscurity object lesson',
							text: '**[[pioneer:karsten-nohl|Karsten Nohl]]** and **[[pioneer:henryk-plotz|Henryk Plötz]]** ("Starbug") presented at 24C3 in December 2007: Philips\'s proprietary 48-bit Crypto1 stream cipher on MIFARE Classic cards — "secure" by virtue of being secret — had been dismantled by **decapping a chip and photographing ~10,000 gates with an optical microscope**. The cipher proved weak on inspection; attacks reduced effective security to seconds of cloning time. **The Dutch OV-chipkaart kept shipping affected cards until 2024.** The lesson — *security by obscurity does not scale* — became canonical in wireless silicon design. Every [[nfc|NFC]] standard since has used open, {{peer|peer}}-reviewed cryptography (AES-128 on MIFARE DESFire, ECDSA on {{ccc-digital-key|CCC Digital Key}}, post-quantum primitives in the {{aliro|Aliro}} roadmap).'
						},
						{
							type: 'narrative',
							title: 'Transit, identity, and the niches NFC quietly owns',
							text: `Most of the world's daily [[nfc|NFC]] interactions are not at coffee shops. **{{transit|Transit}} fare media** alone — Suica, PASMO, ICOCA, Octopus, TfL contactless, Korean T-money, Brazilian Bilhete Único — process well over **2 billion taps per year on TfL contactless alone**. Japan's Suica/PASMO system has been running on FeliCa (NFC-F) since 2001. Most of these systems run on stored-value cards or open-loop EMV contactless — the line between "transit card" and "payment card" has blurred almost completely in the last five years.

**Electronic passports (eMRTDs)** under **ICAO Doc 9303 Part 11** put roughly **a billion of them in circulation**. The chip embedded in the cover holds your biographical data, your photograph, fingerprints (optional), and a digital signature chain rooted at the issuing country's {{public-key|Public Key}} Directory at ICAO. The reader at passport control speaks {{apdu|APDUs}} over [[nfc|NFC]]-A or NFC-B to authenticate the chip via BAC/PACE before reading anything — your data is encrypted at rest on the chip, decrypted with a key derived from the MRZ line that the reader scans optically.

**Access control** — corporate building entry, hotel keys, residential and multi-family doors — used to run on cloneable LF and 13.56 MHz proximity cards. The new **{{aliro|Aliro 1.0}}** standard (CSA, finalised 26 February 2026) is "{{matter|Matter}} for doors": ECDSA mutual authentication; [[nfc|NFC]] tap-to-access, BLE proximity, and BLE+[[uwb|UWB]] ranged hands-free, all under one credential. 220+ companies including Apple, Google, Samsung, ASSA ABLOY, HID, Allegion, Kwikset, Nuki are behind it.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NFC_logo.svg/330px-NFC_logo.svg.png',
							alt: 'The Near Field Communication (NFC) logo — a stylised radio-wave symbol.',
							caption:
								'The **[[nfc|NFC]] Forum** logo. The Forum was founded in 2004 by Sony, Philips, and Nokia. Today over a billion taps a day fan out from this symbol on every Apple Pay terminal, Suica turnstile, e-passport reader, hotel-room door, and shelf label. Four centimetres of {{inductive-coupling|inductive coupling}} at 13.56 MHz, behind almost the entire global payment rail.',
							credit: 'Image: NFC Forum trademark, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'nfc', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'charles-walton' },
				{ kind: 'pioneer', id: 'franz-amtmann' },
				{ kind: 'pioneer', id: 'philippe-maugars' },
				{ kind: 'pioneer', id: 'karsten-nohl' },
				{ kind: 'simulation', protocolId: 'nfc' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'uwb',
			title: 'UWB — nanosecond pulses for centimetre ranging',
			synopsis:
				'[[uwb|IEEE 802.15.4z]], FiRa, {{ccc-digital-key|CCC Digital Key}} 3.0, Apple U1 / U2, the 2022 Tesla [[bluetooth|BLE]] relay attack that motivated the move to [[uwb|UWB]], and the Ghost Peak STS residual.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[uwb|UWB]] is not a data radio — it is a clock. Modern UWB transmits sub-nanosecond impulses across ≥500 MHz of {{spectrum|spectrum}} so two devices can measure the {{tof-ranging|time-of-flight}} of a radio pulse with 10–30 cm accuracy. The point in 2026 is the *security* of the measurement, not just the precision.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A radio that is really a stopwatch',
							text: `Every other wireless protocol in this Part is fundamentally a *data radio* — it modulates a carrier to carry bytes. **[[uwb|UWB]] is fundamentally a *stopwatch*.** It transmits sub-nanosecond Gaussian-monocycle impulses across ≥500 MHz of {{bandwidth|bandwidth}}, and the two endpoints measure **{{tof-ranging|the round-trip time}}** of those impulses with picosecond precision. Multiplied by *c* ≈ 0.299 m/ns, that converts to **10–30 cm of distance accuracy** under normal conditions. The data it carries is almost incidental — a few kilobits per second is plenty when the *measurement* is the product.

The bandwidth is the whole game. **A 1 ns timing error is 30 cm of range error.** [[uwb|UWB]] chips routinely timestamp pulse arrival to 15–60 picoseconds, which the rest of the radio bandwidth turns into single-digit centimetre accuracy. [[bluetooth|Bluetooth]] {{rssi|RSSI}} cannot do this; [[wifi|Wi-Fi]] FTM ([[wifi|802.11mc / az]]) gets to ~1–2 m. UWB's 499.2 MHz channel width is the physics that makes single-digit centimetres possible.

The {{spectrum|spectrum}} legacy: **the FCC's First Report and Order on Valentine's Day 2002** authorised UWB under Part 15.519 at **−41.3 dBm/MHz** across **3.1–10.6 GHz** — an *unlicensed underlay* on top of every other service in those bands. The trick is the noise floor. UWB transmits at such a low average power that no incumbent licensee notices, but it spreads its energy across so much bandwidth that the cumulative pulse energy is detectable at the receiver. The two channels everyone actually uses are **Channel 5** (6489.6 MHz) and **Channel 9** (7987.2 MHz), each 499.2 MHz wide.`
						},
						{
							type: 'narrative',
							title: 'From DARPA radar to AirTag — the 70-year lineage',
							text: `Impulse radio is older than most wireless engineers realise. Henry Hertz's original 1887 experiments produced impulses, not modulated carriers. The 1950s–60s saw spread-{{spectrum|spectrum}} impulse work for ground-penetrating radar; **[[pioneer:robert-scholtz|Robert Scholtz]]** at USC wrote the foundational academic papers in the 1990s; **Larry Fullerton** at Time Domain Corporation built the first commercial [[uwb|UWB]] radios in the late 1990s.

The consumer story begins on **10 September 2019**, when Apple shipped the **U1 chip** in the iPhone 11. It went mass-market on **30 April 2021** with the $29 **AirTag**, whose Precision Finding feature swept the world's awareness of UWB into one product. Samsung followed with the **Galaxy SmartTag+** in April 2021. **{{ccc-digital-key|CCC Digital Key 3.0}}** (July 2021) made UWB the fine-ranging leg of phone-as-a-key for vehicles — BMW iX shipped first; Mercedes EQS, Hyundai/Kia, and VW ID.7 followed.

UWB silicon has consolidated to five suppliers: **Apple captive** (U1 16 nm, **U2** 7 nm from iPhone 15), **Qorvo** (acquired Decawave's DW1000/DW3000 line), **NXP** (Trimension SR040/SR150/SR250), **Samsung captive** (Exynos Connect U100), and a long tail (STMicroelectronics, Microchip, Spark Microsystems, Infineon's 2024-acquired 3db Access). ABI projects UWB phone penetration rising from **27% in 2025 to 52% by 2030** — UWB is on the same adoption curve [[nfc|NFC]] followed a decade earlier.`
						},
						{
							type: 'callout',
							title: 'Why time-of-flight cannot be cheated',
							text: 'The speed of light is the upper bound on radio propagation. **Nothing can shorten the apparent distance between two devices** — a relay attack with a satellite uplink can amplify the signal but cannot reduce the time of flight. {{rssi|RSSI}}-based proximity (which {{ble|BLE}}, [[wifi|Wi-Fi]], and {{rfid|RFID}} all use as a proxy) *can* be cheated — a relay with enough TX power makes a distant device look near. {{tof-ranging|Time-of-flight}} is the only physical primitive that gives you a real, cryptographically-defendable distance bound. This is the entire reason [[uwb|UWB]] exists in consumer products in 2026.'
						},
						{
							type: 'narrative',
							title: 'TWR, DS-TWR, TDoA, AoA — four ways to measure distance',
							text: `The simplest ranging method is **{{twr|SS-TWR}}** (Single-Sided Two-Way Ranging): the initiator sends a Poll, the responder sends a Response after a known reply delay, the initiator subtracts the reply delay from the round-trip and divides by 2. The trouble is *clock drift* — a 20 ppm crystal mismatch over a 200 µs reply window adds ~4 ns of timing error, which is ~1.2 m of distance error. Unacceptable.

The production method is **{{twr|DS-TWR}}** (Double-Sided Two-Way Ranging) — three messages: Poll → Response → Final. The cross-product \`(T_round1 × T_round2 − T_reply1 × T_reply2) / (T_round1 + T_round2 + T_reply1 + T_reply2)\` cancels clock drift to first order. This is the method [[uwb|802.15.4z]] standardised and that every consumer product (AirTag, BMW Digital Key, Apple Vision Pro) uses today. Centimetre-accurate without per-device clock calibration.

**TDoA** (Time Difference of Arrival) is the alternative for indoor positioning: a tag chirps once, ≥3 time-synchronised anchors receive the chirp at slightly different moments, and a server computes the difference of arrival to triangulate. Used in warehouse and hospital RTLS where anchors are wired and clock-synchronised. **AoA / PDoA** (Angle of Arrival / Phase Difference of Arrival) uses two antennas spaced ~λ/2 (≈1.9 cm at 8 GHz) on the receiver — the phase difference between the two antennas reveals the direction the pulse came from. AirTag Precision Finding combines DS-TWR distance with PDoA direction to display "1.8 m to your left."

Four primitives, one chip, every ranging product on Earth.`
						},
						{
							type: 'narrative',
							title: 'STS — the cryptographic distance commitment',
							text: `**{{sts|STS}}** (Scrambled Timestamp Sequence) is the cryptographic primitive that makes [[uwb|UWB]] ranging *secure*, not just precise. The reason it had to be invented is sobering.

[[uwb|802.15.4a]] (2007), the original [[uwb|UWB]] standard, used a *public* preamble and SFD pattern for ranging. An attacker watching the radio could predict the next pulse and inject a small early copy that the receiver's correlator would lock onto — shortening the apparent distance by tens of metres. The family of attacks (Cicada, Early-Detect/Late-Commit) made pre-STS UWB unsuitable for any security-critical application. This is the reason the early-2010s "UWB for digital keys" pitches went nowhere — the protocol was not secure enough.

**[[uwb|IEEE 802.15.4z]]** (ratified 31 August 2020) fixed it. The {{sts|STS}} block injects a **32–2048-chip pulse sequence whose positions are generated by AES-128 in Counter mode**, keyed by a per-session **STS_KEY** and a per-frame {{nonce|nonce}}. The receiver, holding the same key, generates the *expected* sequence locally and cross-correlates with a sharp autocorrelation peak. An attacker without the key sees noise. They cannot predict the next chip, cannot reliably early-replay, and cannot shorten the apparent distance.

The STS block is the **distance commitment** that defeats the entire {{ble|BLE}}-{{rssi|RSSI}} {{replay-attack|relay}} class of attack. {{ccc-digital-key|CCC Digital Key 3.0}}, {{aliro|Aliro 1.0}}, AirTag Precision Finding, and every modern UWB product depend on it.`
						},
						{
							type: 'callout',
							title: 'Ghost Peak — even STS is not perfect',
							text: 'At **USENIX Security 2022**, Patrick Leu, Giovanni Camurati, and colleagues at ETH Zürich published **Ghost Peak** — an attack that biased an STS correlator\'s peak earlier with ~4% success using a $65 device. The trick was injecting STS-like-but-random noise that happened to correlate enough to skew the receiver\'s timestamp by a few nanoseconds — enough to falsely shorten the measured distance into the "unlock allowed" zone. **The fix is IEEE 802.15.4ab** (Draft D03 September 2025, ratification expected early 2026), which adds **NBA-MMS** (narrowband-assisted multi-millisecond) ranging and a redesigned STS receiver. The arc is the same one we have seen everywhere in this Part — the cryptography is sound, the negotiation/correlation logic gets patched generation after generation.'
						},
						{
							type: 'narrative',
							title: 'BLE bootstraps every UWB session — the indispensable on-ramp',
							text: `Almost no consumer [[uwb|UWB]] session ever opens *without* {{ble|BLE}} first. The reason is power and discovery: BLE has ubiquitous always-on advertising and standardised pairing; [[uwb|UWB]] has neither. A UWB radio is power-hungry to keep listening, has no advertising channel, and its receiver needs to know exactly when to wake up to catch a sub-nanosecond pulse. The canonical bootstrap pattern in **{{ccc-digital-key|CCC Digital Key 3.0}}** and **{{aliro|Aliro 1.0}}** has five steps:

**(1)** BLE GAP advertising with the application's service UUID (the lock advertises; the phone scans). **(2)** {{gatt|GATT}} {{service-discovery|service discovery}} + authentication — SPAKE2+/PAKE for Digital Key, OOB pairing for AirTag. **(3)** Session-key transport over the BLE encrypted channel — phone and reader {{exchange|exchange}} the **STS_KEY** and ranging parameters via {{apdu|APDU-over-GATT}}. **(4)** BLE-signalled UWB ranging start at a scheduled time slot — both radios power on their UWB stacks. **(5)** Ranging happens (Poll/Response/Final); results returned over BLE for application-layer policy enforcement.

The Schlage FCC waiver (ET Docket 22-248, granted 2023) describes this exact sequence in regulator-vetted form. It is also why BLE {{channel-sounding|Channel Sounding}} — Bluetooth 6.0's cm-class ranging built into the BLE link itself — is interesting: it might collapse the five-step dance into one radio.`
						},
						{
							type: 'narrative',
							title: 'CCC Digital Key — the canonical unlock flow',
							text: `BMW iX shipped the first {{ccc-digital-key|CCC Digital Key 3.0}} vehicle in early 2022. The vehicle has multiple **[[uwb|UWB]] anchors** (typically one in each B-pillar and one per door handle) plus a BLE radio. The phone has Apple U1/U2 or NXP/Qorvo UWB silicon plus its own BLE.

The unlock dance: BLE advertising from the car → BLE pairing + {{gatt|GATT}} authentication → {{apdu|APDU}} {{exchange|exchange}} where the car authenticates the Digital Key applet in the phone's {{ese|Secure Element}} and derives session keys → BLE transfers the **STS_KEY** and ranging schedule → UWB DS-TWR ranging fires across multiple anchors simultaneously → the car computes {{tof-ranging|time-of-flight}} on each anchor, checks the distance is below threshold *and* the credential is valid → BLE returns Unlock granted/denied. The whole exchange takes well under a second. [[nfc|NFC]] remains the fallback when the phone's battery is dead.

**{{ccc-digital-key|CCC Digital Key 4.0}}** (announced July 2025, tested at the 13th Plugfest hosted by Apple) adds cross-platform key sharing — you can send an Android friend a Digital Key to your BMW from an iPhone, and the friend's phone can unlock the car. **115 vehicle / module products were CCC-certified in 2025**: BMW (first, late 2024 4.0), Mercedes, Hyundai/Kia, Audi (2025), Volvo, Porsche, GM, Ford, plus Chinese OEMs (NIO, XPENG, Geely group).`
						},
						{
							type: 'narrative',
							title: "Regional masks, Japan, and the global-product problem",
							text: `FCC Part 15.519 caps average power-spectral-density at **−41.3 dBm/MHz** across 3.1–10.6 GHz. ETSI EN 302 065 in Europe is similar but with stricter Detect-and-Avoid requirements in some sub-bands. **Japan** applies a different mask with restrictions in 7.25–7.75 GHz that overlap Channel 9 — Apple's iPhone reduces or disables [[uwb|UWB]] features (Precision Finding, Find People) in Japan and a handful of other countries.

The practical effect for a global consumer product: **(a)** geo-fence UWB features based on locale, **(b)** default to **Channel 5** in Japan and a handful of other restricted jurisdictions, **(c)** support a *no-UWB* mode entirely for countries where UWB is not permitted (a few small markets). This is one of the underappreciated reasons UWB consumer adoption is slower than {{ble|BLE}} or [[wifi|Wi-Fi]] — *the regulatory map is fragmented*, and every iPhone software release ships a different list of countries where Precision Finding works.

The contrast with [[nfc|NFC]] is instructive: [[nfc|NFC]] operates in the globally-harmonised 13.56 MHz {{ism-band|ISM}} band, and you can ship one product globally. UWB ships into a patchwork of regional masks, regulator opinions, and government-licensing oddities (Russia, China, several Middle Eastern countries) that engineers spend real effort working around. The radio is the easy part; the {{spectrum|spectrum}} policy is the hard part.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Apple_AirTag.svg/330px-Apple_AirTag.svg.png',
							alt: 'An Apple AirTag — a small round white tracker with the Apple logo.',
							caption:
								'The **Apple AirTag**, $29, shipped 30 April 2021. Inside: a battery, a {{ble|BLE}} radio, a speaker, and the **Apple U1 chip** — the {{uwb|UWB}} silicon that gave consumer [[uwb|UWB]] its first mass-market product. Precision Finding\'s arrow-and-distance display swept the world\'s awareness of UWB into one purchase. ABI projects UWB phone penetration rising from 27% in 2025 to 52% by 2030 — the same adoption curve [[nfc|NFC]] followed a decade earlier.',
							credit: 'Image: Apple Inc. trademark / Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'uwb', facets: ['overview', 'header'] },
				{ kind: 'pioneer', id: 'robert-scholtz' },
				{ kind: 'pioneer', id: 'moe-win' },
				{ kind: 'pioneer', id: 'larry-fullerton' },
				{ kind: 'pioneer', id: 'srdjan-capkun' },
				{ kind: 'simulation', protocolId: 'uwb' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'zigbee',
			title: 'Zigbee, Thread, and the Matter bridge',
			synopsis:
				'[[zigbee|IEEE 802.15.4 mesh]], Zigbee PRO R23 ({{dynamic-link-key|Dynamic Link Key}}, {{trust-center|Trust Center}} Swap-Out), the Hue installed base, and how {{matter|Matter}} bridges [[zigbee|Zigbee]] semantics onto [[ip|IP]].',
			slots: [
				{
					kind: 'pull-quote',
					text: "Philips Hue's 2012 Apple Store launch never said \"Zigbee\" out loud. The press release mentioned ZigBee LightLink exactly once; the in-store materials, packaging, and iOS app strenuously avoided the term. The customer was sold *web-enabled* lighting. The canonical example of a successful protocol whose user-visible brand is the product, not the standard.",
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The lighting protocol that became the IoT default',
							text: `[[zigbee|Zigbee]] is the upper-layer protocol stack — NWK, APS, ZDO, {{zcl|ZCL}} — that the Connectivity Standards Alliance (founded August 2002 as the **Zigbee Alliance** by Invensys, Mitsubishi, Motorola, Philips, Samsung, and Honeywell) built on top of the {{ieee-802-15-4|IEEE 802.15.4}} PHY/MAC. The 2.4 GHz {{ism-band|ISM band}} offers 16 channels of 250 kbit/s O-QPSK; sub-GHz PHYs at 868 MHz (Europe) and 902–928 MHz (North America) give longer range at lower bit rates. Topologies are star, tree, and — the one everyone uses — **mesh**: every mains-powered device routes for its sleepy battery-powered neighbours, and the network heals itself when a router drops out. 127-byte PHY {{payload|payloads}}, ~80–100 byte usable APS payloads, AES-128-CCM* security across both network and application layers.

The deployment story is unusually concentrated. **Philips Hue** launched on 29 October 2012 at Apple Stores for $199, branded as *"Web-enabled lighting"* with the word Zigbee deliberately hidden, and grew to roughly **30 million bulbs lifetime** — the largest Zigbee installed base on Earth. **IKEA Trådfri** (2017), **SmartThings**, **Amazon Echo Plus**, **Hubitat**, and most commercial-lighting systems (Acuity nLight AIR, Eaton, Lutron Vive) all run Zigbee. The under-reported giant is **VusionGroup electronic shelf labels** — 350 million units shipped in 2023 alone, with **Walmart's December 2024 announcement** to roll Vusion ESLs out across 4,600 US stores. More Zigbee-family devices in one retailer than Hue has ever sold.`
						},
						{
							type: 'callout',
							title: 'Zigbee is a brand the customer never sees',
							text: 'Hue\'s October 2012 launch is the canonical example of a successful protocol whose user-visible brand is the product, not the standard. Press releases mentioned *ZigBee LightLink* exactly once. In-store displays, packaging, and the iOS app strenuously avoided the term. Consumers bought "Web-enabled lighting", which is what they wanted. The CSA renamed itself away from "Zigbee Alliance" in 2021 partly to acknowledge that the brand had been a marketing liability for a decade. Every successful low-power mesh protocol learned this lesson: name the *product*, not the wireless standard underneath.'
						},
						{
							type: 'narrative',
							title: 'The mesh, the trust center, and the install code',
							text: `A Zigbee network has three classes of device. **The Coordinator** (one per network) starts the mesh, holds the network key, and acts as the {{trust-center|Trust Center}} — the single trust root that authenticates every join. **Routers** are mains-powered devices (light bulbs, plugs, switches) that forward traffic for their neighbours and keep the mesh self-healing. **End devices** are battery-powered (sensors, buttons) that sleep most of the time and wake briefly to send a packet through their parent router.

At commissioning time, a new device joins by exchanging a 16-byte AES-128 **pre-configured link key** with the {{trust-center|Trust Center}}. The Trust Center then sends the **network key** in an APS Transport-Key command encrypted under that link key. So far so good — except that for fifteen years the default link key was a publicly known sixteen-byte string: \`5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39\` = ASCII **ZigBeeAlliance09**. Generations of Wireshark users memorised the hex; any attacker sniffing a join with that default key could read the network key in plaintext.

**{{install-code|Install codes}}** — a per-device 128-bit secret printed on the device's packaging or QR-encoded on the box, mandatory in Zigbee 3.0 commissioning — closed that hole. **{{dynamic-link-key|Dynamic Link Key}}** in **Zigbee PRO 2023 (R23)** went further: a SPEKE-over-Curve25519 {{handshake|handshake}} that derives a unique link key per device with no pre-shared secret at all. Zigbee's equivalent of the {{wpa3|WPA3}}/{{sae|SAE}} replacement of WPA2-PSK.`
						},
						{
							type: 'narrative',
							title: 'ZCL — a tiny REST API for light bulbs',
							text: `What makes [[zigbee|Zigbee]] a *consumer* protocol rather than a generic mesh is the **{{zcl|Zigbee Cluster Library}}** — an object model that gives every device a small, predictable, attribute-and-command vocabulary. Each **cluster** is a tiny object: **OnOff = 0x0006** has the boolean attribute OnOff and the commands On (0x00), Off (0x01), Toggle (0x02). **Level Control = 0x0008** has dim level and the commands Move-to-Level, Step, Stop. **Color Control = 0x0300** has hue, saturation, and the commands Move-to-Color, Move-to-Hue, and so on. **OTA Upgrade = 0x0019** lets the bulb pull a firmware update from the coordinator.

A modern Hue bulb implements roughly a dozen clusters. The Hue Hub turns "set living-room scene to *Concentrate*" into a Color-Control Move-to-Color groupcast that fans out to every bulb in the room. The bulb does not know it is in a living room or that there is a scene — it just runs the cluster commands it was told to run.

The deeper consequence is that {{matter|**Matter**}} reuses {{zcl|ZCL}} as its data model directly. **{{matter|Matter}} is essentially ZCL on [[ipv6|IPv6]].** Every cluster ID, every attribute, every command from Zigbee maps one-to-one to its Matter equivalent. This is the reason the **Hue Bridge Matter firmware** that Signify shipped on 19 September 2023 worked at all — it did not have to re-model Hue's behaviour for Matter; it just had to translate the transport.`
						},
						{
							type: 'narrative',
							title: 'Thread — the IPv6-native successor',
							text: `{{thread|**Thread**}} is the sibling that took a different architectural {{turn|turn}}. Same {{ieee-802-15-4|802.15.4}} radio as Zigbee, same 2.4 GHz channels, same mesh topology — but where Zigbee carries application traffic in its own NWK / APS stack, {{thread|Thread}} carries native **[[ipv6|IPv6]] over 6LoWPAN** {{header|header compression}} and uses **MLE** (Mesh Link Establishment) for routing. Every Thread device gets a real [[ipv6|IPv6]] address and is reachable like any other host on your home network.

The Thread Group was founded in **July 2014** by Nest (then a Google subsidiary), Samsung, ARM, Silicon Labs, NXP, and a few others. The pitch was: "Zigbee is a closed application stack with a non-IP wire format; we want IPv6 mesh." Adoption was slow — the killer app that needed *another* low-power mesh was missing — until {{matter|**Matter**}} arrived in 2022 and made Thread the radio of choice for sensors and switches that should not run Wi-Fi.

**Thread 1.4** (December 2024) made **{{border-router|Thread Border Routers}}** a multi-vendor commodity. Apple's HomePod and Apple TV 4K, Google's Nest Hub, Amazon Echo Hub, Aqara M3, eero 6+, and others all act as Thread Border Routers — bridging the 802.15.4 mesh to your home [[wifi|Wi-Fi]] network. The {{border-router|border router}} runs **{{mdns|DNS-SD}}** for {{service-discovery|service discovery}}, hands out [[ipv6|IPv6]] prefixes via {{slaac|SLAAC}} to the Thread mesh, and forwards packets between the radios. From your phone, a Thread sensor looks like any other IPv6 host — you can ping it.

In 2026, **new device design has bifurcated**. Lighting and sensors are increasingly Thread ({{matter|Matter}}-native, low power, IPv6-addressable). Cameras and high-{{bandwidth|bandwidth}} devices are [[wifi|Wi-Fi]] (Matter 1.5 added camera streaming via RTSP). Zigbee is the *bridged legacy radio* — preserved for the installed base, no longer the default for new designs.`
						},
						{
							type: 'callout',
							title: "Matter's commitment, in three sentences",
							text: 'The CSA launched **{{matter|Matter}} 1.0 on 4 October 2022** as an IP-native smart-home standard, running over [[wifi|Wi-Fi]], [[ethernet|Ethernet]], and {{thread|Thread}}. {{matter|Matter}} does **not** run over [[zigbee|Zigbee]] on the wire — but it reuses Zigbee\'s {{zcl|ZCL}} data model directly, which lets a *Matter Bridge for non-Matter devices* (Hue Bridge, Aqara Hub M3) translate Matter operations to Zigbee one-to-one. Now at **v1.5 (20 November 2025)**, with camera streaming via RTSP, removing the last category that previously required Zigbee bridging.'
						},
						{
							type: 'narrative',
							title: 'The Wi-Fi coexistence headache, and the fixes',
							text: `Zigbee and [[wifi|Wi-Fi]] both live on 2.4 GHz, and Zigbee always loses. Wi-Fi uses 20 MHz channels centred at 2412/2437/2462 MHz (channels 1/6/11). Zigbee channels are 2 MHz wide, centred at 2405 + 5·(k−11) MHz. **Zigbee channels 11–14 sit under Wi-Fi 1; 15 partially clears it; 20 sits in the gap between Wi-Fi 6 and 11; 25 and 26 sit above Wi-Fi 11.** A Wi-Fi network can fill several Zigbee channels with broadband noise loud enough that a Zigbee router cannot win a CSMA-CA back-off.

The standard advice — choose channel 15, 20, 25, or 26 — works when you have one well-placed coordinator and a single Wi-Fi network to dodge. In dense apartment buildings with ~20 Wi-Fi APs visible, no single Zigbee channel is reliably clear. The R23 spec added **frequency-agility** so the coordinator can order the whole mesh to {{hop|hop}} to a new channel when interference exceeds a threshold. Newer multi-radio bridges (Aqara M3, Apple HomePod gen 4, Amazon Echo Hub) put the Zigbee antenna **physically separated from the Wi-Fi antenna** in the case design, which sounds trivial but is the single biggest improvement in real-world reliability over the previous decade of "USB stick plugged into the back of a router."

The single most common cause of unreliable Zigbee in any forum thread you will ever read: **the coordinator dongle is plugged directly into the back of the Wi-Fi router**. Move the dongle to a USB extension cable, three feet away. Half the complaints disappear.`
						},
						{
							type: 'narrative',
							title: 'The 350-million-unit shelf-label deployment nobody talks about',
							text: `Discussion of Zigbee in 2026 is usually about consumer smart-home — Hue, SmartThings, Aqara. The numbers say something else. **VusionGroup** (formerly SES-imagotag) shipped **350 million Zigbee-family ESL units in 2023** alone, and is rolling out an additional 60M+ across Walmart's 4,600 US stores from late 2024 through 2026. Carrefour, Tesco, Auchan, Mercadona, and most European hypermarket chains are also Vusion deployments at planetary scale.

Each ESL is a tiny e-paper display with a Zigbee-family radio (Vusion uses a proprietary variant on {{ieee-802-15-4|802.15.4}}) that updates its price text from a central server multiple times per day. The radio is always on, the display only when content changes — the e-paper holds its image without power. From the protocol's perspective, it is the same NWK + APS + cluster-library shape as a Hue bulb; from the deployment's perspective, it is the largest production {{ieee-802-15-4|802.15.4}} network anywhere on Earth.

The dynamic-pricing implications are still controversial — Walmart's December 2024 announcement was met with consumer-pricing concerns about real-time price changes — but the *protocol* deployment proceeds either way. ESLs are the quiet, planet-scale, never-quite-mentioned-in-tech-press Zigbee success story.`
						},
						{
							type: 'narrative',
							title: 'Where Zigbee goes from here',
							text: `New 2026 device design is not Zigbee — it is {{thread|Thread}} or [[wifi|Wi-Fi]] with {{matter|Matter}} on top. New Hue bulbs and IKEA Trådfri devices continue to ship Zigbee because the installed base is huge and the radios are cheap; **Aqara has been shipping {{thread|Thread}} + Matter-native sensors since 2024**. Most major manufacturer roadmaps treat Zigbee as a *bridged legacy* — the radio that will be supported through 2030+, but not the radio future devices will default to.

The mass-scale exceptions remain commercial: ESLs, industrial lighting controls, and the Walmart-class deployments where Zigbee's per-device cost and zero-router-required architecture still beat anything else. The CSA's R23 work ({{dynamic-link-key|Dynamic Link Key}}, {{trust-center|Trust Center}} Swap-Out, Zigbee Direct, sub-GHz PHYs) is explicitly aimed at *preserving* the installed base, not growing it.

For the home-automation hobbyist, the **{{matter|Matter}} bridge** is the right framing in 2026. A Hue bulb is a Zigbee device; through the Hue Bridge's Matter firmware, it appears as a Matter accessory; from your iPhone or Google Home, it is "a light bulb." The Zigbee protocol is doing its job — exactly the job Hue's 2012 marketing copy promised: *web-enabled lighting*, with the word *Zigbee* still off the box.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zigbee_logo.svg/330px-Zigbee_logo.svg.png',
							alt: 'The Zigbee logo — a stylised zigzag pattern around the word Zigbee.',
							caption:
								'The **[[zigbee|Zigbee]]** logo. The Connectivity Standards Alliance (formerly Zigbee Alliance) was founded in August 2002; the spec sits on top of {{ieee-802-15-4|IEEE 802.15.4}} as NWK + APS + ZDO + {{zcl|ZCL}}. Despite the brand being deliberately hidden from consumers, the same {{zcl|ZCL}} data model now powers {{matter|Matter}} — {{matter|Matter}} is essentially ZCL on [[ipv6|IPv6]].',
							credit: 'Image: Connectivity Standards Alliance trademark, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'zigbee', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'bob-heile' },
				{ kind: 'pioneer', id: 'tobin-richardson' },
				{ kind: 'pioneer', id: 'skip-ashton' },
				{ kind: 'simulation', protocolId: 'zigbee' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'security-across-the-wireless-family',
			title: 'Security across the wireless family',
			synopsis:
				'One arc covering {{krack|KRACK}}, KNOB/BIAS/BLUFFS, FragAttacks, MIFARE Crypto1, the 2022 Tesla [[bluetooth|BLE]] relay, the Ghost Peak [[uwb|UWB]] STS attack, and the SS7 / {{diameter|Diameter}} trust holdover — every wireless protocol\'s negotiation logic, broken on stage at least once.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Every spec that depends on a secret algorithm or a trust assumption between operators eventually gets broken in public. Every spec that depends on cryptographic primitives + open analysis survives the next attack. The pattern is identical across Wi-Fi, Bluetooth, [[nfc|NFC]], [[uwb|UWB]], and cellular — and it has held for thirty years.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'One pattern, six protocols',
							text: `Every wireless protocol in this Part has been broken on stage in public, multiple times, by the same handful of researchers, with strikingly similar shapes of bug. **It is never the cryptography itself.** AES-128, AES-GCM, ECDSA, ChaCha20, Curve25519 — the primitives hold up. What gets broken is the **negotiation logic**, the **state machine**, the **roaming model**, the **trust assumptions between operators** — the *protocol surface around* the cryptography.

The lesson is the central one of this Part. Wireless is the only major networking category where the *physical layer is adversarial by default*. Wired networks fail when something breaks; wireless networks fail because the medium is shared with everything else operating in the same band — including, sometimes, an attacker. Every architectural choice in this category — frequency hopping, {{csma-ca|CSMA/CA}}, scheduled access, STS, cryptographic distance bounds — exists to make a hostile medium predictable. The attacks in this chapter are the unfinished parts of that project.

Reading order: we start with the [[wifi|Wi-Fi]] arc because it is the most public, walk through [[bluetooth|Bluetooth]] BR/EDR because it has been broken three times by the same author, look at [[nfc|NFC]]'s one canonical security-by-obscurity disaster (MIFARE Crypto1), the 2022 [[bluetooth|BLE]] relay attack and the [[uwb|UWB]] STS response, and finish with the {{ss7|SS7}} / {{diameter|Diameter}} trust holdover that runs underneath the cellular network you are using to read this.`
						},
						{
							type: 'narrative',
							title: 'The Wi-Fi arc — KRACK, Dragonblood, FragAttacks, SSID Confusion',
							text: `**WPA2 was published in 2004** and looked solid for thirteen years. On **16 October 2017**, Mathy Vanhoef and Frank Piessens at KU Leuven released **{{krack|KRACK}}** — Key Reinstallation AttaCK. By replaying message 3 of WPA2's four-way {{handshake|handshake}}, an attacker tricked a client into reinstalling an already-used session key, resetting the per-packet {{iv|nonce}} counter and defeating CCMP integrity. **Every WPA2 client on Earth needed firmware updates.** The patches shipped within weeks, but the architectural fix took a full generation — {{wpa3|**WPA3**}} with {{sae|**SAE**}} (Simultaneous Authentication of Equals), which is the *dragonfly* {{handshake|handshake}} that derives a fresh Pairwise Master Key per session with {{pfs|forward secrecy}}.

The Vanhoef cadence has continued biennially since. **Dragonblood** (April 2019) found side channels in {{wpa3|WPA3}}-SAE's password-derivation function — fixed in WPA3-Personal-revision-2. **FragAttacks** (May 2021) broke [[wifi|802.11]] *{{fragmentation|fragmentation}} and aggregation* design itself — not implementation bugs but spec flaws — and affected every Wi-Fi device shipped since 1997. **Framing Frames** (March 2023) abused Wi-Fi's power-save framing to inject malicious frames into a client's queue. **SSID Confusion / CVE-2023-52424** (May 2024) showed the 802.11 standard does *not* require the SSID to enter PMK or session-key derivation in many config paths, enabling a downgrade-style trick against any client OS.

What every Wi-Fi attack since {{krack|KRACK}} has had in common: **the AES primitive is fine**; the *{{handshake|handshake}} state machine around it* is the bug. Replay, downgrade, side channel, framing — variations on a theme. The Wi-Fi WG ships fixes; the next August Vanhoef finds the next attack; the cycle continues. This is the field's most reliable two-year clock.`
						},
						{
							type: 'narrative',
							title: 'Bluetooth — three breaks in five years, by the same author',
							text: `[[bluetooth|Bluetooth]] BR/EDR has been broken at the spec level three times in five years, by the same author, each time on a different piece of the {{handshake|handshake}} state machine.

**KNOB** (CVE-2019-9506, August 2019) downgraded the entropy of the BR/EDR negotiated session key to **1 byte**. The {{encryption|Encryption}} Key Negotiation Protocol allowed a man-in-the-middle to coerce both peers into agreeing on an encryption key of 7 bytes' length (the minimum the spec permitted), then reduce that further during the negotiation. Brute-forceable in real time. Patched by tightening minimum-entropy checks; ~2 billion devices needed firmware updates.

**BIAS** (CVE-2020-10135, May 2020) impersonated a previously-bonded {{peer|peer}} by abusing role-switch in Legacy Secure Connections. An attacker could re-establish the encrypted session of a device they had never bonded with, simply by claiming to be the bonded peer and triggering a role switch that the older link manager did not authenticate. Patched in Core 5.2.

**BLUFFS** (CVE-2023-24023, November 2023) broke {{forward-secrecy|forward secrecy}} by forcing reuse of session-key derivation across reconnections. Two reconnections to the same device produced the same session key — so an attacker who recorded one encrypted session and later compromised the long-term key could replay or decrypt traffic from earlier sessions. Patched by adding key-diversification across reconnections in Core 5.4 and 6.0.

Every BR/EDR device shipped before mid-2024 is affected by at least one of these. {{ble|BLE Secure Connections}} uses different cryptography (ECDH on Curve P-256) and a different pairing flow, and has held up better — but its own pairing-method downgrade (Just Works ↔ Numeric Comparison) has had its share of disclosures. The pattern matches Wi-Fi exactly: **AES is fine; the {{handshake|handshake}} around it is where the bugs live**.`
						},
						{
							type: 'callout',
							title: 'MIFARE Crypto1 — the security-by-obscurity disaster',
							text: 'In December 2007 at 24C3, **[[pioneer:karsten-nohl|Karsten Nohl]]** and **[[pioneer:henryk-plotz|Henryk Plötz]]** ("Starbug") presented a result that became the field\'s textbook case for *why proprietary cryptography fails*. Philips\'s **Crypto1** stream cipher on MIFARE Classic cards — a 48-bit cipher kept secret as the entire security model — had been **decapped, photographed under a microscope, and reverse-engineered from the ~10,000 gates on the silicon die**. The cipher proved cryptographically weak on inspection; attacks reduced effective security to seconds of cloning time. **The Dutch OV-chipkaart kept shipping affected cards until 2024**, the London Oyster card variant was deprecated mid-2010s, but the world had to migrate billions of contactless cards to MIFARE DESFire (open AES-128) over a decade. Every [[nfc|NFC]] standard since uses open {{peer|peer}}-reviewed cryptography. This is the canonical "security by obscurity does not scale" lesson in deployed wireless silicon.'
						},
						{
							type: 'narrative',
							title: 'The 2022 Tesla relay — and the rise of cryptographic distance',
							text: `On **15 May 2022**, Sultan Qasim Khan at NCC Group disclosed a **link-layer relay attack** against Tesla Model 3 phone-as-a-key. Two ~$25 dev boards (one near the phone, one near the car), a few hundred metres of cellular tunnel between them, and ~8 ms of added {{latency|latency}}. The Tesla believed the phone was in BLE proximity when it was actually at the supermarket. CVSS 6.8. The attacker could unlock and drive away a parked Model 3 from 25 metres.

The flaw was not Tesla's. The flaw is that **{{ble|BLE}} {{rssi|RSSI}} is fundamentally untrustworthy** as a proximity primitive — signal strength can be amplified arbitrarily by a relay, and the link-layer round-trip-time check in classic BLE was too coarse (~30 ms) to catch an 8 ms relay. Any BLE-based digital-key product on the market in 2022 was vulnerable to the same class of attack.

The industry conclusion was structural: **proximity-by-radio-signal-strength is unfixable**. A relay with enough TX power and enough patience defeats any {{rssi|RSSI}} threshold. The only way to verify physical proximity is to measure **{{tof-ranging|time-of-flight}}**, because *the speed of light is the hard upper bound that no relay can shorten*. That insight pushed every credential standard since to mandate physics-based proximity: {{ccc-digital-key|CCC Digital Key 3.0}} ([[uwb|UWB]] ranging), {{aliro|Aliro 1.0}} (UWB or {{channel-sounding|Bluetooth Channel Sounding}}), and the Bluetooth 6.0 ranging mode that uses much tighter RTT than legacy BLE.

The 2022 attack is the proximate cause of the entire 2024–2026 wave of UWB silicon, ranging-capable Bluetooth 6.0 chipsets, and the new "physics-as-proof" security architecture across the secure-access industry.`
						},
						{
							type: 'narrative',
							title: 'Ghost Peak — even STS is not perfect',
							text: `If the Tesla BLE relay made the case for [[uwb|UWB]], **Ghost Peak** made the case that [[uwb|UWB]] itself was not finished. At **USENIX Security 2022**, Patrick Leu, Giovanni Camurati, and colleagues at ETH Zürich published a result that bent {{sts|STS}} (the cryptographic distance commitment that 802.15.4z added in 2020) at ~4% success with a $65 device.

The attack injected STS-like-but-random noise into the UWB channel. With enough trials, some of that noise happened to correlate with the legitimate STS sequence well enough to bias the receiver's correlation peak earlier — falsely shortening the measured distance into the "unlock allowed" zone. The fix is **IEEE 802.15.4ab** (Draft D03, September 2025, ratification expected early 2026), which adds **NBA-MMS** (narrowband-assisted multi-millisecond ranging) and a redesigned STS receiver that is much harder to bias.

Ghost Peak's lesson is the same one [[bluetooth|Bluetooth]] taught: **the cryptography is sound; the negotiation/correlation logic is where the bugs live**. AES-128-CTR for STS generation is fine; the receiver's peak-detection algorithm needed work. Every secure-ranging primitive since has been audited specifically for these correlation-bias attacks — and the next wave (802.15.4ab + {{channel-sounding|Channel Sounding}} + 11az) is being designed with those audits in mind from day one.`
						},
						{
							type: 'narrative',
							title: 'The cellular interconnect — SS7 / Diameter still trusts',
							text: `Inside one carrier's network, modern [[cellular|cellular]] security is strong. The cryptography is sound, the air interface is encrypted, the {{ims|IMS}} signalling runs over [[tls|TLS]]. **But the interconnect layer between carriers** — how a roaming visitor authenticates, how SMS routes globally, how location is queried for billing, how voice calls cross borders — runs on **{{ss7|SS7}}** (designed 1975) and **{{diameter|Diameter}}** (RFC 6733, 2012), both designed in an era of implicit trust between carrier peers.

Modern surveillance actors exploit this trust at scale. **Citizen Lab's 2024–25 disclosures** and **CISA's 2024 testimony to the {{fcc|FCC}}** document active commercial-grade surveillance using exactly this vector. Two threat actors (publicly labelled STA1 and STA2) operate SS7-routing services that silently track mobile users worldwide — *no malware on the target's phone is required*. An attacker who can rent access to an SS7 endpoint can issue a routing query for any phone number on the planet and receive the device's approximate cell-tower location in seconds.

The {{cellular|cellular}} industry's response has been the **5GC service-based interconnect** ({{3gpp|3GPP}} TS 33.521) — authenticated SBI between carriers, with cryptographic identity for each network function. It is partially deployed inside 5G core networks but does not yet reach the global interconnect layer. The SS7 layer below is still everywhere underneath, carrying SMS, voice routing, and roaming handshakes for billions of subscribers. **It is the largest, oldest, most deeply-embedded "trust assumption that turned out to be wrong" anywhere on the public internet.**

The shape rhymes with every other story in this chapter. Wi-Fi: {{krack|KRACK}} in 2017, fix shipping by 2020. Bluetooth: KNOB/BIAS/BLUFFS, fixes in 5.4/6.0. [[nfc|NFC]]: Crypto1 in 2007, migration to AES by 2020s. [[uwb|UWB]]: Ghost Peak in 2022, 802.15.4ab in 2026. Cellular: SS7 exploitation public since the early 2010s, 5GC SBI partial fix arriving in the late 2020s. Every wireless protocol's cryptography has held; every wireless protocol's *architecture around the cryptography* has been broken and patched and broken and patched.`
						},
						{
							type: 'callout',
							title: 'The takeaway, in one paragraph',
							text: 'Across every wireless protocol in this Part: the **AES primitives, ECDH key exchanges, and signature algorithms have all held up under twenty years of public attack**. What gets broken on stage every other year is the *negotiation, state machine, roaming model, or trust assumption between operators* — the *protocol surface around* the cryptography. The fix is always the same: **make every negotiation step cryptographically authenticated, every key derivation forward-secret, every proximity claim physics-based, and every inter-operator interface mutually authenticated.** {{wpa3|WPA3}} did it for Wi-Fi; Bluetooth 5.4/6.0 is doing it for BR/EDR; {{ccc-digital-key|CCC Digital Key}} 3.0 did it for proximity; 5GC SBA is doing it for carrier interconnect. The job is half-finished, on a thirty-year clock.'
						},
						{
							type: 'narrative',
							title: 'What the engineering reader should take from this',
							text: `Three rules-of-thumb fall out of the pattern in this chapter, and they apply to *any* protocol with crypto in it, not just wireless.

**Audit the state machine, not the cipher.** The crypto in your protocol is almost certainly fine — AES-128, AES-GCM, ChaCha20-Poly1305, Curve25519, NIST P-256 have all survived two decades of attack. The bugs live in *what your protocol does around the crypto* — key reinstallation, entropy negotiation, role switching, {{session-resumption|session resumption}}, downgrade handling. Spend most of your security review there.

**Treat radio-signal-strength as untrusted.** If your security model depends on "the device is close", measure *{{tof-ranging|time-of-flight}}*, not signal strength. The Tesla 2022 attack is the canonical example. {{rssi|RSSI}} is a routing hint, not a security primitive.

**Public {{peer|peer}}-reviewed cryptography beats proprietary every time.** MIFARE Crypto1 lasted 14 years (1994–2008) before being decapped and broken. Open AES-128 has held up since 1998 without a known practical break. The migration cost is brutal; the survival cost of *not* migrating is brutaler.

Every chapter in this Part has security stories. This chapter ties them together as one arc — and the arc is **roughly the same arc as every other security-critical protocol family in this book**. The pattern is not unique to wireless; it is just *most visible* there, because the medium itself is adversarial.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Wireshark_screenshot.png/500px-Wireshark_screenshot.png',
							alt: 'Wireshark screen capture showing a packet trace with protocol decoder windows.',
							caption:
								'**Wireshark** — every wireless-security disclosure in this chapter started with a researcher running this (or a similar) packet dissector against captured traffic. The cryptographic primitives in [[wifi|Wi-Fi]], [[bluetooth|Bluetooth]], [[nfc|NFC]], [[uwb|UWB]], and [[cellular|cellular]] have held up; the **negotiation logic** around them — visible right here in the protocol-decoder pane — is where {{krack|KRACK}}, {{knob-attack|KNOB/BIAS/BLUFFS}}, MIFARE Crypto1, Ghost Peak, and SS7 abuse all lived.',
							credit: 'Image: Wireshark Foundation / Wikimedia Commons, GPL'
						}
					]
				},
				{ kind: 'protocol', id: 'wifi', facets: ['incidents'] },
				{ kind: 'protocol', id: 'bluetooth', facets: ['incidents'] },
				{ kind: 'protocol', id: 'nfc', facets: ['incidents'] },
				{ kind: 'protocol', id: 'zigbee', facets: ['incidents'] }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'spectrum-and-the-frontier',
			title: 'Spectrum, regulation, and what comes next',
			synopsis:
				'The non-technical layer that decides where every wireless protocol may live — 6 GHz [[wifi|Wi-Fi]], {{mmwave|mmWave}}, {{cbrs|CBRS}}, WRC-27, [[wifi|Wi-Fi]] 8, {{ambient-iot|Ambient IoT}}, 6G targets, and Starlink {{direct-to-cell|Direct-to-Cell}}. The wireless frontier through 2030.',
			slots: [
				{
					kind: 'pull-quote',
					text: '{{spectrum|Spectrum}} policy moves on a four-year clock; the technology runs ten years faster. Every wireless protocol\'s deployment is gated by a regulator nobody on the engineering team has met.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Why spectrum is the protocol everyone forgets about',
							text: `Every wireless protocol in this Part has a chapter about its radio, its frame format, its security history. Almost none of them have a chapter about **the regulator who decides where the radio is allowed to transmit, at what power, with what interference protection, in which country.** That regulator is the protocol that decides whether anything in the rest of this Part can ship.

The {{spectrum|spectrum}} layer is the *real* foundation of wireless. It is allocated globally by the **ITU-R** (the radio sector of the International Telecommunication Union, ~190 member states) on a treaty schedule called the **{{wrc|World Radiocommunication Conference}}** every 3–4 years. It is regionally harmonised by **CEPT** (Europe), **APT** (Asia-Pacific), and **CITEL** (the Americas). And it is *nationally* enforced by regulators like the {{fcc|FCC}} (US), Ofcom (UK), the Bundesnetzagentur (Germany), and the MIC (Japan).

The result is that *the same physical radio* is legal in some countries, restricted in others, and banned outright in a few. **Apple's iPhone disables [[uwb|UWB]] Precision Finding in Japan, Indonesia, parts of the Middle East, and a few smaller markets** because of regional power-mask differences. The {{cbrs|CBRS}} band that powers Private 5G in the United States does not exist in Europe. The 6 GHz upper band that the FCC opened for Wi-Fi in 2020 may yet be reassigned to mobile carriers in the EU. Every protocol chapter has a wire-format story; this chapter is about the *policy* story underneath all of them.`
						},
						{
							type: 'narrative',
							title: 'The 6 GHz fight — the largest single bandwidth grant in 20 years',
							text: `**On 23 April 2020, the {{fcc|FCC}} freed 1,200 MHz of 6 GHz {{spectrum|spectrum}}** (5.925–7.125 GHz) for unlicensed use — the largest single {{bandwidth|bandwidth}} grant the United States has authorised in 20 years. Wi-Fi 6E and Wi-Fi 7 were the immediate consumers. The decision essentially **tripled the unlicensed spectrum available for [[wifi|Wi-Fi]]**, easing the 2.4 GHz and 5 GHz crowding that had bedevilled apartment buildings and convention centres for two decades.

The lower 6 GHz band (5.925–6.425 GHz) is **Low-Power Indoor (LPI)** — license-exempt for indoor use only, up to 30 dBm EIRP. The upper 6 GHz band (6.525–7.125 GHz) is **Standard Power** — up to 36 dBm EIRP outdoors, but arbitrated by an **{{afc|Automated Frequency Coordination}}** cloud service that checks the AP's location against a database of incumbent licensees (fixed microwave links, satellite services) before granting a channel. The FCC approved seven AFC operators on 23 February 2024; the first AFC-certified Wi-Fi 7 {{access-point|access point}} (RUCKUS R770) shipped in April 2024.

**Then the EU went the other way.** On **12 November 2025**, the European Radio Spectrum Policy Group recommended assigning the **upper 6 GHz band (6585–7125 MHz) to mobile/5G**, holding 6425–6585 MHz pending {{wrc|WRC-27}}. The {{wifi|Wi-Fi}} Alliance "strongly disagrees" and is lobbying hard. {{wrc|WRC-23}} (Dubai, November–December 2023) had already added 6 GHz to IMT-2020 (the {{cellular|cellular}} side) on a *co-primary* basis, opening the door to this exact contest.

**This is what spectrum policy actually looks like** — the same physical band, same physical radios, allocated differently by different regional treaty bodies, with billion-dollar industry alignments fighting it out at WRC every four years. Wi-Fi shipping millions of 6 GHz devices in the US is one fact; whether those devices can use the upper-6-GHz band in Europe is a separate fact decided by a different process.`
						},
						{
							type: 'callout',
							title: 'CBRS and the three-tier sharing experiment',
							text: 'The US **{{cbrs|Citizens Broadband Radio Service}}** band — 3.55–3.7 GHz — is the US regulator\'s **experiment in dynamic {{spectrum|spectrum}} sharing**. Three tiers coexist: **Incumbent** (US Navy radars get absolute priority), **Priority Access Licensees** (PALs, auctioned in 2020 for ~$4.5B), and **General Authorized Access** (anyone with a certified device). A cloud service called the **Spectrum Access System** arbitrates in real time — telling each device which channels and power levels it may use right now based on Navy radar activity. Powers Private 4G LTE / 5G deployments at ports (Port of Long Beach), mines, hospitals, manufacturing plants, and stadiums. The largest production use of *database-arbitrated coexistence* anywhere on Earth. Europe has experimented with similar concepts (PMSE in the UK, LSA in some EU pilots) but has not deployed at {{cbrs|CBRS}} scale.'
						},
						{
							type: 'narrative',
							title: 'mmWave — the band that under-delivered',
							text: `**{{mmwave|Millimetre-wave}}** bands — 24–52 GHz for {{5g-nr|5G NR}} FR2, plus 60 GHz for WiGig and 28/39 GHz for fixed wireless — were the *headline feature* of every 5G keynote slide between 2018 and 2021. Hundreds of MHz of contiguous {{bandwidth|bandwidth}}! Gigabit speeds! Sub-millimetre wavelengths! The reality has been more complicated.

{{mmwave|mmWave}} is **line-of-sight only**, attenuates ~20 dB through a wet leaf, and is absorbed by glass-coated buildings, human bodies, and pretty much anything thicker than dry air. Carriers deployed it in dense urban hotspots (Verizon Manhattan, AT&T Manhattan, T-Mobile Stadium of America) but failed to make it the everyday 5G experience anyone advertised. The current honest assessment is that mmWave is **wonderful in a stadium, useful in a dense business district, irrelevant in a suburb, and unworkable in a basement**.

Where mmWave *has* won is **fixed wireless access (FWA)** — Verizon 5G Home, T-Mobile Home Internet, Starry — point-to-point links from a base station to a window-mounted antenna at a specific home or business. No mobility, no body shadowing, line-of-sight by design. FWA is now the fastest-growing residential broadband category in the US, eating into legacy cable and DSL share. The future of mmWave is **fixed access plus dense urban capacity**, not the universal smartphone radio its marketing once promised.

5G's *real* contribution to coverage and capacity has come from mid-band sub-6 GHz NR (FR1) — the 2.5 GHz, 3.7 GHz C-band, 3.55 GHz {{cbrs|CBRS}} {{spectrum|spectrum}} that carriers deployed widely from 2021 onward. That is the band underneath your "5G UC" or "5G+" icon.`
						},
						{
							type: 'narrative',
							title: 'The Wi-Fi 8 reliability turn',
							text: `[[wifi|Wi-Fi]] 7 (802.11be, ratified 22 July 2025) was the last "make Wi-Fi much faster" upgrade. The peak rate hit ~46 Gbit/s, the 320 MHz channels arrived, the {{mlo|Multi-Link Operation}} feature shipped. The question facing the working group from ~2023 onward was: **what comes next?**

The answer is **Wi-Fi 8 / 802.11bn — Ultra High Reliability**. It is explicitly *not* a peak-speed upgrade: same bands as Wi-Fi 7, same 320 MHz max, same ~46 Gbit/s PHY peak. The PAR objectives are quantitative: **+25% throughput at a given SINR, −25% 95th-percentile {{latency|latency}}, −25% MPDU loss across BSS transitions.** Every Wi-Fi 8 feature — **Multi-AP Coordination** (Co-BF, Co-SR, Co-TDMA), **Seamless Roaming Domain** (SMD), **Enhanced Long Range PPDU**, **Distributed Resource Units**, **Non-Primary Channel Access** — is in service of {{tail-latency|tail latency}} and reliability, not headline throughput.

The pattern across the last two generations is the same: squeeze the existing speed budget for *consistency*, not for the marketing-friendly peak. **Wi-Fi 8 is targeted for ratification September 2028**. Broadcom announced a Wi-Fi 8 chipset in October 2025; ASUS demoed a draft router at CES 2026; consumer launches expected mid-to-late 2026. A "Wi-Fi 9" successor study group started January 2026 already.

The takeaway for someone designing on top of Wi-Fi: **the 99th-percentile {{latency|latency}} you can rely on between 2027 and 2030 will be much better than what you have today**, even though the peak number on the box will not change.`
						},
						{
							type: 'narrative',
							title: 'Direct-to-Cell and the redefinition of "coverage"',
							text: `For 50 years, "no signal" on a cell phone meant *no signal*. For most of the next 50, "no signal" will mean *no terrestrial signal — try walking outside.* The protocol family driving that change is **{{ntn|Non-Terrestrial Networks}}**, added to {{3gpp|3GPP}} Release 17 in March 2022 as a first-class radio access type alongside NR-Uu and LTE-Uu.

**On 27 January 2025**, **T-Mobile + SpaceX Starlink launched the first commercial {{direct-to-cell|Direct-to-Cell}} service** in the United States: SMS, MMS, and emergency messaging from ordinary phones, with the satellite acting as a base station in standard {{cellular|cellular}} bands n255/n256. **AT&T's AST SpaceMobile partnership** demonstrated 5G voice from a standard phone in mid-2023 (technical proof) and is rolling out commercial service through 2025–2026. **Apple's Globalstar-based Emergency SOS** has been live since the iPhone 14 (September 2022) — your phone, no special hardware, automatic fallback when terrestrial coverage drops.

The architectural change is the *band*. Older satellite phones (Iridium, Inmarsat) used dedicated satellite bands and required special handsets. {{direct-to-cell|Direct-to-Cell}} uses **standard terrestrial cellular bands**, so any phone with the right modem firmware can connect. The satellite is, from the phone's perspective, just another base station — albeit one orbiting at ~550 km and moving at ~7 km/s. {{harq|HARQ}} on a 5 ms terrestrial round-trip is one engineering problem; {{harq|HARQ}} on a 30 ms satellite round-trip with continuous Doppler shift is another. 3GPP Release 18 + 19 + 20 contain the timing-and-Doppler patches that make it work.

The implications run well beyond emergency messaging. **Maritime communications**, **aviation passenger Wi-Fi**, **rural broadband**, **disaster recovery** — all reshaped by a phone that can fall back to satellite without the user ever knowing. The next decade of {{cellular|cellular}} growth is going to come from the half of the planet that has never had reliable mobile coverage.`
						},
						{
							type: 'narrative',
							title: 'Ambient IoT — when the IoT device has no battery',
							text: `The most experimental piece of the [[cellular|cellular]] frontier is **{{ambient-iot|Ambient IoT}}**: battery-less or near-battery-less {{cellular|cellular}} devices that harvest energy from RF, light, or motion and transmit tiny payloads. Currently {{3gpp|3GPP}} study items in **Release 19** (frozen in flight) and **Release 20** (kicking off in 2025). Target use cases: logistics tagging, retail inventory, agricultural sensors, healthcare patient bands — the niches that **passive {{rfid|RFID}}** currently owns.

The protocol-design problem is hard. A battery-less device cannot wake up on a paging cycle, cannot maintain a clock, cannot run a {{handshake|handshake}}. The Release 19 design uses an *interrogator-driven* model that resembles 13.56 MHz {{nfc|NFC}} (or 900 MHz UHF {{rfid|RFID}}) more than it resembles a normal phone. The base station emits a carrier; the device backscatters a tiny modulated reply when interrogated. The data rates are kilobits per second; the range is metres to tens of metres.

Whether {{cellular|cellular}} {{ambient-iot|Ambient IoT}} actually displaces the UHF RFID and {{lpwan|LPWAN}} ecosystems that already serve those niches is an open commercial question. The technical groundwork is in place. The deployment economics — who pays for the interrogators, who runs the inventory backend — will decide it. Expect first commercial trials in late 2027, mass adoption (if it happens) in the early 2030s.`
						},
						{
							type: 'narrative',
							title: 'The other frontier — Wi-Fi sensing, sub-second media, and 6G',
							text: `Three smaller frontiers are worth naming for completeness.

**{{wifi-sensing|Wi-Fi sensing}}** (IEEE 802.11bf, published 26 September 2025) uses the Channel State Information that [[wifi|Wi-Fi]] radios already compute for {{multipath|multipath}} equalisation to *detect* people, motion, and breathing — radio waves as occupancy sensors. Standardised across 1–7.125 GHz and >45 GHz bands. Lets a home Wi-Fi mesh do presence detection without a camera or PIR sensor. Early consumer deployments through 2026.

**Sub-second live media** is the [[wifi|Wi-Fi]] and {{cellular|cellular}} side of the [[rtp|RTP]]-over-[[quic|QUIC]] / MoQ-Transport story. The {{cellular|cellular}} network has had ~99.999% link reliability via {{harq|HARQ}} for fifteen years; the application layer is finally building on top of it. Cloudflare deployed MoQ relays across 330+ cities in 2025; Twitch's *Warp* QUIC-based live-streaming pilot is the canonical use case. The 2026 Super Bowl, AFC Wild Card, and Paris 2024 Olympics measurements all show OTT streaming still 40–80 seconds behind {{broadcast|broadcast}}. The next five years collapse most of that gap.

**6G** is the next-generation cellular standard, currently in pre-standardisation. {{3gpp|3GPP}}'s **Release 20 study items** for 6G began in 2025. Targets include sub-THz radio (above 100 GHz), AI-native air-interface design, integrated sensing-and-communication (your phone *also* doing radar), and {{ntn|NTN}} as a first-class deployment mode from day one. First commercial 6G expected 2030–2032. Treat any 2026–2027 marketing copy that mentions specific 6G features as speculation; the spec does not exist yet.`
						},
						{
							type: 'callout',
							title: 'The four-year clock and the two-year clock',
							text: 'Two clocks set the pace of wireless. The first is the **{{wrc|World Radiocommunication Conference}}**, every 3–4 years, where the world\'s {{spectrum|spectrum}} allocations are renegotiated by treaty. **{{wrc|WRC-27}}** is the next major event — terahertz bands for 6G, harmonisation of {{direct-to-cell|Direct-to-Cell}} bands, the 6 GHz EU upper-band decision. The second is the **{{3gpp|3GPP}} Release cycle**, every ~18 months — Release 19 in flight, Release 20 (6G study items) kicking off. Together they decide what wireless protocols you can build, where, when. The {{ietf|IETF}} model — *rough consensus and running code, two-week sprints* — does not apply at this layer. Spectrum and cellular standards run on geological time, and that is the constraint every wireless engineer eventually meets.'
						},
						{
							type: 'narrative',
							title: 'Reading the frontier honestly',
							text: `The frontier section of any technical book is the part that ages worst. This one will, too — in five years, three of the deployments named in this chapter will have stalled, two will have shipped widely, and at least one not-yet-named protocol will have emerged from a standards backwater to consumer ubiquity (the pattern that {{ble|BLE}}, {{matter|Matter}}, and {{direct-to-cell|Direct-to-Cell}} all followed).

What can be said confidently about wireless in 2030: **{{wifi|Wi-Fi 8}}** will be shipping in mid-range routers, **{{wpa3|WPA3}}** will be near-universal, **post-quantum crypto** will be running in the [[tls|TLS]] handshakes over every wireless network. **{{cellular|6G}}** will be in *pre-deployment* trials, not yet consumer-available. **{{direct-to-cell|Direct-to-Cell}}** will be the default fallback for any phone in any country with a clear sky. **{{matter|Matter}}** will own the smart-home commissioning story, with {{thread|Thread}} and Wi-Fi underneath. {{uwb|**UWB**}} will be in roughly half of new phones globally, gating digital car keys and hands-free door unlock for hundreds of millions of users.

What cannot be said confidently: which {{cellular|cellular}} bands will be unlicensed by 2030, whether 6 GHz Wi-Fi survives in Europe, whether {{ambient-iot|Ambient IoT}} eats the {{lpwan|LPWAN}} market, whether {{wifi-sensing|Wi-Fi sensing}} becomes a privacy disaster or a useful feature. The answers depend on regulators in Brussels, Geneva, and Washington — not on any wireless engineer.

That is the right note to end Part V on. **Wireless is the only chapter in this book where the protocol stops at the silicon and starts again at the regulator.** Read every other Part top-down from the application. Read this one bottom-up from the {{spectrum|spectrum}} allocation chart — the one nobody on your team has framed on the wall.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Starlink_SpaceX_1584_satellites_72_Planes_22each.png/500px-Starlink_SpaceX_1584_satellites_72_Planes_22each.png',
							alt: 'Diagram of 1,584 Starlink satellites distributed across 72 orbital planes of 22 satellites each, at 53° inclination.',
							caption:
								'The **Starlink constellation** — 1,584 first-shell satellites in 72 orbital planes at 53° inclination. On 27 January 2025, T-Mobile + SpaceX launched the first commercial **{{direct-to-cell|Direct-to-Cell}}** service: SMS and emergency messaging from ordinary phones to satellites acting as base stations in standard {{cellular|cellular}} bands n255/n256. *"No signal"* will increasingly mean *"no terrestrial signal — try walking outside"*. The frontier where the {{cellular|cellular}} network grows is upward.',
							credit: 'Image: SpaceX / Wikimedia Commons, CC0'
						}
					]
				},
				{ kind: 'frontier', id: 'wifi-7-ratified' }
			]
		}
	]
};
