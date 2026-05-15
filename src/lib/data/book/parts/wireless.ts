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
		'Bits through the air — from ALOHAnet to Wi-Fi 8, from a 1994 Ericsson headset cable to billions of AirPods, and from a 1973 patent to the NFC tap on every payment terminal.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'the-shared-medium',
			title: 'The shared medium',
			synopsis:
				'Why wireless is a fundamentally different problem from wired — the medium is shared, signals fade, and physics actively conspires against you.',
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

[[wifi|Wi-Fi]] calls it DCF (Distributed Coordination Function). Before each frame, a station senses the channel for a DIFS interval (28–34 µs), picks a random slot from a contention window (initial CW = 15, doubled on collision up to 1023), and transmits if still idle. Every successful frame is ACKed after a SIFS gap (~10 µs); no ACK in time is presumed to mean collision and the sender retries from a larger window. The ratio of *protocol overhead* to *payload bytes* on a busy 802.11 channel routinely exceeds 50% — which is why a Wi-Fi 6 access point's nominal 9.6 Gbit/s shows up as 1–2 Gbit/s of real throughput in a crowded room.

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
							text: `Four protocol families share the unlicensed 2.4 GHz **{{ism-band|ISM band}}**: [[wifi|Wi-Fi]] (20 MHz channels centred at 2412 / 2437 / 2462 MHz — the canonical 1/6/11 trio), [[bluetooth|Bluetooth]] BR/EDR (79 × 1 MHz channels hopping 1,600/sec), [[bluetooth|BLE]] (40 × 2 MHz channels), and [[zigbee|Zigbee]] / Thread on {{ieee-802-15-4|IEEE 802.15.4}} (16 × 2 MHz channels at 11–26). Plus microwave ovens, baby monitors, cordless phones, USB-3 hubs, and every other device any regulator ever granted Part 15 to.

They coexist by a series of small accommodations. **Modern combo chips** (Apple H-series, Broadcom, Qualcomm) put Wi-Fi and Bluetooth radios on the same die and arbitrate {{airtime|airtime}} in firmware, time-slicing so one starves the other only briefly. **Zigbee dodges Wi-Fi**: channels 15, 20, 25, and 26 sit in the gaps between Wi-Fi 1/6/11, and the single most common cause of unreliable Zigbee is a coordinator dongle plugged into a Wi-Fi router's USB port whose switched-mode PSU radiates broadband 2.4 GHz noise. **BLE picks its advertising channels carefully** — 37/38/39 sit at 2402, 2426, and 2480 MHz, deliberately outside Wi-Fi 1/6/11; the 37 data channels rely on adaptive frequency hopping to dodge active access points. **The 5/6 GHz escape valve** is where Wi-Fi 5, 6, 6E, 7, and 8 increasingly live, leaving 2.4 GHz to IoT.

[[cellular|Cellular]] bands are **licensed**, which is why your phone's 4G/5G radio does not fight with your Wi-Fi even in the same physical space — different spectrum entirely. The price of that predictability is the billions paid at every national spectrum auction.`
						},
						{
							type: 'narrative',
							title: 'The power–range–throughput triangle',
							text: `Every wireless protocol picks two corners of a three-way trade-off: **transmit power, range, and throughput**. You can have any two cheaply; the third is what the spec is really negotiating, and that triangle is why we have six wireless protocols in this Part instead of one.

[[nfc|NFC]] picks **low power + low range** — passive cards harvest microwatts from the reader's field at ≤10 cm and trade everything for a 13.56 MHz carrier that physics caps at ~424 kbit/s. [[bluetooth|BLE]] picks **low power + medium throughput** — coin-cell devices at 1–2 Mbit/s over 10 m. [[wifi|Wi-Fi]] picks **high throughput + medium range** — gigabit speeds at 30 m, but only because the AP burns hundreds of milliwatts of TX power and runs off mains electricity. [[cellular|Cellular]] picks **range + throughput** at the cost of power and licensed spectrum — 50 km from the right base station, ~1–10 Gbit/s in FR1, but you do not run a base station on a coin cell. [[uwb|UWB]] sits in a corner of its own: **wide bandwidth + low average power** by trading time-of-flight precision for any meaningful data rate. It is a clock, not a data radio.

**Edholm's law of bandwidth** — wireless data rates double roughly every 18 months — is what keeps the table moving. Every protocol in this Part has shipped two or three generation upgrades since 2010 to keep its corner of the triangle in tension.`
						},
						{
							type: 'callout',
							title: 'The bootstrap pattern: no wireless protocol works alone',
							text: 'Almost every consumer wireless interaction in 2026 chains *multiple* radios. **[[uwb|UWB]] ranging** never starts without [[bluetooth|BLE]] first — the lock or car advertises a service UUID over BLE, the phone runs SPAKE2+ authentication and ships the STS_KEY over the encrypted GATT channel, only then does UWB power on for a three-message ranging round. **[[bluetooth|Bluetooth]] / [[wifi|Wi-Fi]] handover** is bootstrapped by [[nfc|NFC]] — a 4 cm tap carries the BLE MAC + SMP OOB key or the Wi-Fi SSID + WPA key in an NDEF record. **[[zigbee|Zigbee]] + Thread** are commissioned over BLE (Zigbee Direct) or Wi-Fi ({{matter|Matter}} setup); once commissioned they run their own mesh. **[[cellular|Cellular]] data** falls back to [[wifi|Wi-Fi]] Calling when the carrier signal is weak — IPsec ePDG tunnel from the UE to the carrier core over any IP link, including the airport Wi-Fi you just joined. The radio with the **best discovery + power profile** does the bootstrap; the radio with the **right property for the workload** (range, throughput, precision, security) does the actual session. Each chapter that follows is one corner of that bigger picture.'
						},
						{
							type: 'narrative',
							title: 'A note on chapter 2 — Wi-Fi appears twice',
							text: `[[wifi|Wi-Fi]] gets a chapter in Part III (Layer 2–3) and another one here. That is on purpose. Part III's chapter is about Wi-Fi as a **layer-2 fabric** — the bit that bridges 802.11 frames to [[ethernet|Ethernet]] and lets [[ip|IP]] forget the medium underneath. This Part's chapter is about Wi-Fi as a **radio** — CSMA/CA, MLO, the 6 GHz politics, the {{krack|KRACK}} → Dragonblood → SSID-Confusion lineage of attacks that only make sense once you understand the shared-medium problem above. Two halves of the same protocol, one from the cable's perspective and one from the airwaves'.`
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
				'The radio side of 802.11 — CSMA/CA in practice, MIMO → OFDMA → MLO, and the KRACK-to-WPA3 arc that finally fixed the wireless handshake.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Wi-Fi 6\'s nominal 9.6 Gbit/s shows up as 1–2 Gbit/s of real throughput in a crowded room, because more than half of the airtime is spent on DIFS gaps, ACK frames, beacons, and back-off. The headline number is a physics fact; the delivered number is an airtime budget.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Part III meets Part V',
							text: `Part III's chapter on Wi-Fi treated 802.11 as a Layer-2 fabric — the bit that bridges wireless frames to [[ethernet|Ethernet]], the regulatory big bang that opened the {{ism-band|ISM}} bands, and the 6 GHz / Wi-Fi 7 / Wi-Fi 8 generational arc. That framing is correct for someone reading bottom-up from the cable.

This chapter reads top-down from the *air*. The frame format and history we leave to Part III; here we look at what actually goes on inside the {{csma-ca|CSMA/CA}} loop, how MIMO and {{ofdma|OFDMA}} turned the original physics problem ({{multipath|multipath}}) into the bandwidth, what the headline "Wi-Fi 7 multi-link" feature really means in shipping silicon, and why every {{wpa3|WPA3}} access point in 2026 exists because Mathy Vanhoef sent three packets in 2017.

If you read Part III's Wi-Fi chapter first, this one is the second pass. If you skipped it, this one will send you back to it for the layer-2 frame mechanics.`
						},
						{
							type: 'narrative',
							title: "The CSMA/CA loop in real time",
							text: `Every 802.11 transmission begins with a station deciding the channel is idle. The procedure (DCF — Distributed Coordination Function) is mechanical: sense the channel for a **DIFS** interval of 28–34 µs, pick a random slot from a contention window starting at CW = 15, count it down (each slot = 9 or 20 µs depending on PHY), and transmit if the channel is still idle when the counter hits zero. If two stations pick the same slot, they collide; both double their CW (up to 1023) and try again.

Every {{unicast|unicast}} frame must be {{ack|ACKed}} after a **SIFS** gap of ~10 µs. No ACK means assumed collision and retransmit from a larger CW. {{ack|ACK}} frames are themselves unprotected by CSMA — they fire SIFS-fast precisely so no other station has time to seize the channel between data and ACK.

The visible cost is **{{airtime|airtime}} overhead**. Add up DIFS + SIFS + ACK frames + beacons + management traffic and you spend ~50% of channel time on protocol housekeeping at typical loads. Real engineers measure Wi-Fi performance in {{airtime|airtime}}, not bits per second — two clients with the *same* throughput target consume very different airtime if one is on a slow MCS at cell edge. Modern access points implement **airtime fairness** so a slow client cannot starve fast ones; classic 802.11 was famous for letting one device at the edge of the cell drag the entire network down to its rate.`
						},
						{
							type: 'callout',
							title: 'RTS/CTS is the hidden-terminal escape hatch',
							text: 'When two stations cannot hear each other but both hear the {{access-point|AP}}, they need the {{hidden-terminal|hidden-terminal}} fix: send a tiny **Request To Send**, wait for the AP\'s **Clear To Send** which every other station within range will also hear, then transmit during the announced duration. RTS/CTS is *optional* and trades latency for airtime certainty — it adds two extra frames to every transmission, so it is on by default only for frames larger than a configurable threshold (often 2,346 bytes — i.e., never in practice). Networks that turn it on aggressively tend to be airport halls and convention centres where dozens of clients are routinely behind a column from each other.'
						},
						{
							type: 'narrative',
							title: 'How MIMO turned multipath from enemy into bandwidth',
							text: `The original 1997 802.11 standard ran at 1–2 Mbit/s and treated {{multipath|multipath}} as a bug: reflections off the floor and ceiling produced rapid fading that you compensated for with painful equalisation circuits. Two ideas reversed the framing.

**MIMO** (multiple-input multiple-output) arrived in 802.11n ([[wifi|Wi-Fi]] 4, 2009). Put two or three antennas at each end and the receiver can treat the reflected paths as *independent spatial streams* — multiplying throughput by the number of streams the channel can support. The same physics that made analog cellular calls stutter now multiplies your bandwidth.

**OFDM**, which 802.11a/g introduced in 1999 and 2003, spreads each symbol across hundreds of orthogonal subcarriers so a deep fade only kills a handful of them — the rest are decoded normally and forward error correction patches the gaps. **{{ofdma|OFDMA}}**, the multi-user upgrade in 802.11ax ([[wifi|Wi-Fi]] 6, 2020), assigns *different subsets of subcarriers* to different clients in the same symbol — the {{access-point|AP}} no longer has to give one client an entire transmission opportunity at a time. The combination of MIMO + OFDMA is what lets a modern AP serve thirty phones in a coffee shop without each one paying the full per-transmission overhead the way Wi-Fi 5 did.

By [[wifi|Wi-Fi]] 7 (802.11be, ratified 22 July 2025) the air interface supports 320 MHz channels, 4096-QAM, and four-stream MIMO routinely — the theoretical peak is around 46 Gbit/s. The same channel, with the same antennas, that carried 11 Mbit/s in 1999.`
						},
						{
							type: 'narrative',
							title: 'Multi-Link Operation — and what really shipped',
							text: `**{{mlo|Multi-Link Operation}}** is the flagship feature of [[wifi|Wi-Fi]] 7. A single client connection spans 2.4 + 5 + 6 GHz radios simultaneously — frames can be sent on whichever band is least congested, and {{tail-latency|tail latency}} on a busy network drops sharply. That is the spec story.

The shipping-silicon story is subtler. Most Wi-Fi 7 client chips implement **eMLSR** (Enhanced Multi-Link Single Radio): one RF chain time-sliced across bands. True simultaneous transmit-receive across bands (STR-MLO) requires multiple full RF chains and shows up only in high-end {{access-point|AP}} hardware. **Throughput does NOT add across bands** for eMLSR clients — what they get is **latency consistency**, not raw aggregate throughput. Marketing material that talks about 46 Gbit/s aggregated across three bands is talking about an AP-side capability that almost no consumer client can use.

The real headline feature of [[wifi|Wi-Fi]] 8 / 802.11bn is more honest about this. **Wi-Fi 8 is not a peak-speed upgrade**: same bands as Wi-Fi 7, same 320 MHz max, same ~46 Gbit/s PHY peak. The PAR objectives are **+25% throughput at given SINR, −25% 95th-percentile latency, −25% MPDU loss across BSS transitions**. The trend across the last two generations is the same — squeeze the existing speed budget for tail latency and reliability, not the headline marketing number.`
						},
						{
							type: 'callout',
							title: 'Power management is the hidden battery story',
							text: '802.11ax introduced **{{target-wake-time|Target Wake Time}}** — a client and {{access-point|AP}} pre-negotiate exact wake-up windows, so the client\'s radio stays deeply asleep between scheduled appointments. Originally aimed at low-power IoT (years on a coin cell), it is now what extends smartphone battery life on busy networks. **{{bss-coloring|BSS Coloring}}** added a 6-bit color field so a station can tell its own AP\'s transmissions from a neighbour\'s on the same channel, and apply a relaxed clear-channel threshold — recovering airtime that classic carrier sense would have forfeited. Both features are why Wi-Fi 6/7 outperforms Wi-Fi 5 in *exactly the apartment buildings and shopping centres* where Wi-Fi 5 used to grind to a halt.'
						},
						{
							type: 'narrative',
							title: 'KRACK, Dragonblood, and the road to WPA3',
							text: `WPA2's four-way {{handshake|handshake}}, specified in 2004, looked solid until 16 October 2017. On that morning, Mathy Vanhoef and Frank Piessens released **{{krack|KRACK}}** — Key Reinstallation AttaCK. The flaw was conceptually small: by replaying message 3 of the handshake, an attacker could trick a client into reinstalling an already-used session key, resetting the per-packet {{iv|nonce}} counter and defeating CCMP integrity. **Every WPA2 client on Earth needed firmware updates.**

KRACK forced the {{wpa3|WPA3}} replacement that had been waiting in the wings. WPA3-Personal uses **{{sae|SAE}}** (Simultaneous Authentication of Equals) — a *dragonfly* {{handshake|handshake}} from RFC 7664 where both sides prove knowledge of the passphrase without ever sending anything an eavesdropper could grind against a dictionary. Each session derives a fresh Pairwise Master Key with {{pfs|forward secrecy}}. WPA3 was announced January 2018 and made mandatory for Wi-Fi CERTIFIED 6 products from July 2020.

The story did not end there. Vanhoef's group at KU Leuven has broken Wi-Fi roughly every two years since: **Dragonblood** (April 2019, side-channels in WPA3-SAE), **FragAttacks** (May 2021, fragmentation/aggregation bugs in 802.11 design itself), **Framing Frames** (March 2023), **SSID Confusion / CVE-2023-52424** (May 2024 — the 802.11 standard does NOT require the SSID to enter PMK or session-key derivation in many config paths). The cadence is so reliable that the field plans security audits around his summer talks.

What Wi-Fi gets right after eight years of public attack is that **the attacks are *not* against the cryptographic primitives** — AES-CCMP and AES-GCMP have held up cleanly. The attacks are against the *protocol mechanics* of negotiation, key reinstallation, and middleware downgrade. The same shape recurs in [[bluetooth|Bluetooth]] ({{knob-attack|KNOB/BIAS/BLUFFS}}) and [[cellular|cellular]] (SS7/Diameter abuse): the cryptographic engine is sound; the **state machine around it** is where the bugs live.`
						},
						{
							type: 'narrative',
							title: 'Wi-Fi as the radio that does not know what it is for',
							text: `Most internet protocols are designed for a workload. [[grpc|gRPC]] is service-to-service RPC; [[mqtt|MQTT]] is sensor telemetry; [[rtp|RTP]] is conversational media. [[wifi|Wi-Fi]] is none of those — it is a *generic radio* underneath everything. The same 2.4 GHz {{frame|frame}} carries a [[tcp|TCP]] segment for an SSH session, a [[udp|UDP]] datagram for a video call, a [[mdns|Bonjour]] multicast for AirPlay discovery, and a {{matter|Matter}} commissioning message.

That genericity is why Wi-Fi has had to evolve so much at the **PHY** and **MAC** layers and so little above them. The IP stack on top is the same one [[ethernet|Ethernet]] uses — the 802.11 driver bridges 802.11 frames to 802.3 frames before [[ip|IP]] ever sees them. Every architectural choice in this chapter ({{ofdma|OFDMA}}, {{mlo|MLO}}, {{target-wake-time|TWT}}, {{wpa3|WPA3}}) is in the service of carrying *somebody else's traffic* across a hostile shared medium without those upper layers having to know.

The single thing the upper layers do notice is **{{tail-latency|tail latency}}** — the 99th-percentile delay that makes video calls stutter and games lag. From Wi-Fi 4 (2009) to Wi-Fi 8 (2028 target), the protocol's main job has been bending the tail latency distribution back toward the median while the headline throughput tripled three times.`
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
				'A 1994 cable-replacement project that became GATT, AirTags, Auracast, and Channel Sounding — plus the KNOB / BIAS / BLUFFS lineage that broke session security three times in five years.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'Bluetooth was supposed to be the wire that replaced the RS-232 cable to a mobile-phone headset. Thirty-two years later it bootstraps Matter, unlocks BMWs, and broadcasts public hearing-loops across Frankfurt Airport. The most over-achieving cable replacement in computing.',
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

The split is why every BLE primer warns readers not to read 2000s-era Bluetooth tutorials: master/slave became Central/Peripheral, A2DP became LE Audio, GATT replaced SDP, and connection setup got an order of magnitude faster. The two protocols are at the *brand-level* one thing and at the *implementation-level* two completely different stacks.

Production silicon hides the seam. Apple's H1/H2 chips, Broadcom's combo dies, Qualcomm's QCAxxxx — all run BR/EDR + BLE + Wi-Fi on the same package and time-slice between them in firmware. Your AirPods Pro charging case implements BR/EDR for the audio (A2DP) and BLE for the *find-my* network, both from the same antenna. You do not notice because you are not supposed to.`
						},
						{
							type: 'callout',
							title: 'GATT is a tiny REST API embedded in every BLE peripheral',
							text: 'A {{gatt|GATT}} server (the Peripheral) exposes a tree of **services → characteristics → descriptors**, each with a 16- or 128-bit UUID and a numeric handle. A {{gatt|GATT}} client (the Central) discovers them, reads/writes/subscribes-to-notifications. It is, structurally, a tiny REST API embedded in every BLE device — services are endpoints, characteristics are the actual values. Every fitness sensor, smart lock, hearing aid, AirTag, electric toothbrush, and smart light bulb speaks this same shape. The 2010 design that makes a wearable battery last a week.'
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

**{{matter|Matter}} commissioning** uses BLE to hand Wi-Fi or [[zigbee|Thread]] credentials to a new device — the QR code on the side of a smart bulb encodes a BLE pairing payload, the phone runs the SPAKE2+ pairing dance over BLE, and only then does the device join the Wi-Fi or Thread network it will actually operate on.

**{{ccc-digital-key|CCC Digital Key 3.0}}** uses BLE for proximity and then bootstraps a {{uwb|UWB}} session — the phone advertises a service UUID over BLE, the car authenticates, the encrypted GATT channel transfers the STS_KEY for the UWB ranging round, and only then does the UWB radio power on for the three-message DS-TWR exchange. **Aliro 1.0**, the access-control credential standard the CSA finalised on 26 February 2026, follows the same pattern for doors.

**Apple AirTags** advertise BLE packets every couple of seconds; nearby iPhones report them through the *Find My* network so the AirTag's owner can locate it without any cellular hardware. **Hue bulbs** (and almost every smart light shipped after 2020) accept Wi-Fi/Thread credentials over BLE during commissioning. **Hearing aids** use BLE for the control plane and {{le-audio|LE Audio}} for the stream.

The pattern is simple: BLE has the **right discovery + power profile** to be the always-on radio. The actual session moves to whichever radio has the right property for the workload — Wi-Fi for throughput, UWB for ranging, Thread for mesh.`
						},
						{
							type: 'narrative',
							title: "LE Audio, Auracast, and the hearing-loop replacement story",
							text: `**{{le-audio|LE Audio}}** is the 2020+ rebuild of Bluetooth audio, defined across Core 5.2+ and a stack of profiles (BAP, PBP, TMAP, HAP). It runs over **Isochronous Channels** — Connected Isochronous Streams (CIS) for {{unicast|unicast}} earbuds and hearing aids, Broadcast Isochronous Streams (BIS) for one-to-many. The mandatory {{codec|codec}} is **{{lc3|LC3}}** (SIG + Fraunhofer IIS + Ericsson, January 2020), roughly 2× more battery-efficient than the 1990s SBC codec at equivalent quality.

The cultural moment is **{{auracast|Auracast}}** — the SIG's brand for **Broadcast Isochronous Streams** (BIS) over LE Audio + LC3, one transmitter to unlimited listeners. Public venues replace analog hearing-loops with an Auracast broadcast; nearby listeners scan, pick a stream, and tune in. **Frankfurt Airport became the first airport in the world to broadcast all gate announcements over Auracast on 28 January 2026**. Cinemas, theatres, gyms, lecture halls, and houses of worship are deploying similar setups through 2026 and 2027.

The Auracast accessibility story is the killer app, not "free wireless audio in the airport." For hard-of-hearing listeners, Auracast turns every public-address system into something their hearing aids can listen to directly — no analog loop, no battery-eating Bluetooth pair with a wall-mounted transmitter, just a scan-and-select. The SIG positions it as the *largest accessibility upgrade in consumer audio history*, and the deployment math (every hearing-aid manufacturer ships LE Audio in 2026 hardware) backs that up.`
						},
						{
							type: 'narrative',
							title: 'Channel Sounding — taking the fight to UWB',
							text: `For the last five years the secure-distance-measurement niche has belonged to [[uwb|UWB]]: BMW, Mercedes, and Apple use UWB for cm-class digital car keys precisely *because* {{ble|BLE}}'s RSSI-based proximity is broken under relay attacks. **{{channel-sounding|Channel Sounding}}**, added in **Bluetooth 6.0** (adopted 3 September 2024), is the SIG's reply.

Two devices in a normal LL connection schedule Channel Sounding events on a new **LE 2M 2BT PHY** specifically designed for ranging. They measure both signal **phase** across many frequencies (Phase-Based Ranging) and **round-trip time** of timestamped packets; the combination yields **centimetre-class distance accuracy up to ~150 m**. The intended use: digital car keys, smart locks, anti-stalking tags, and proximity-aware payment terminals — all of which need to know if the peer is actually *here* and not relayed through a radio.

Whether Channel Sounding actually displaces UWB for digital-key applications is still an open question in 2026. UWB has a five-year head start in CCC Digital Key, a tighter timing precision (~30 cm at the silicon level versus ~5–10 cm cm-claimed for Channel Sounding under good conditions), and dedicated cryptography ({{sts|STS}}) that was designed for adversarial environments from day one. Channel Sounding has the deployment advantage: it ships on every new Bluetooth 6.0 chip, which means every new smartphone. The next two years of car-key product announcements will tell.`
						},
						{
							type: 'callout',
							title: 'The KNOB / BIAS / BLUFFS lineage',
							text: 'Three BR/EDR session-security breaks by the same author (Daniele Antonioli) in five years: **KNOB** (CVE-2019-9506) downgraded the entropy of the negotiated session key to 1 byte. **BIAS** (CVE-2020-10135) impersonated a previously-bonded peer by abusing role-switch in Legacy Secure Connections. **BLUFFS** (CVE-2023-24023) broke forward secrecy by forcing reuse of a session-key derivation across reconnections. Every BR/EDR device shipped before mid-2024 is affected; the Core 5.4 / 6.0 patches add explicit minimum-entropy and key-diversification checks. Each attack hit a different part of the *state machine* around the cryptography — the AES core was fine; the negotiation logic around it was the bug. **The same pattern as {{krack|KRACK}} in Wi-Fi and SS7/Diameter abuse in cellular.** Every wireless protocol in this Part has now had its negotiation logic publicly broken at least once.'
						},
						{
							type: 'narrative',
							title: 'The 2022 Tesla relay attack — and why physics is the only fix',
							text: `On 15 May 2022, Sultan Qasim Khan at NCC Group disclosed a **link-layer relay attack** against Tesla Model 3 phone-as-a-key. Two ~$25 dev boards (one near the phone, one near the car), a few hundred metres of cellular link between them, and ~8 ms of added latency was enough to make the Tesla believe the phone was in proximity when it was actually at the supermarket. The attack worked because **{{ble|BLE}} RSSI is fundamentally untrustworthy** — signal strength can be amplified arbitrarily by a relay, and the link-layer round-trip-time check in classic BLE was too coarse (~30 ms) to catch an 8 ms relay.

The industry conclusion: **proximity-by-radio-signal-strength is unfixable.** A relay with enough TX power and enough patience defeats any RSSI threshold. The only way to verify physical proximity is to measure **time-of-flight**, because *the speed of light is the hard upper bound that no relay can shorten*. That insight pushed the secure-access industry toward UWB (where {{tof-ranging|ToF}} is the entire point) and motivated Bluetooth Channel Sounding's RTT mode to use much tighter timing than legacy BLE.

The 2022 attack is the canonical case study for why every credential standard since — {{ccc-digital-key|CCC Digital Key 3.0}}, {{aliro|Aliro}}, Bluetooth 6.0 ranging — explicitly mandates physics-based proximity, not radio-strength heuristics. RSSI was a workable shortcut for a decade. Then it stopped being one.`
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
				'One chapter for the radio (LTE-Uu, NR-Uu) and the core (EPC → 5GC SBA) because the 3GPP release calendar is one calendar. VoLTE / Wi-Fi calling, NB-IoT / LTE-M, satellite direct-to-cell, and the SS7 / Diameter trust holdover.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The control plane of every modern carrier on Earth is now an HTTP/2 microservice fabric — and every backhaul hop is wrapped in IPsec ESP per 3GPP TS 33.501. The single largest enterprise IPsec deployment on Earth runs inside this layer.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Cooper, Bell Labs, and a phone call from Sixth Avenue',
							text: `On 3 April 1973, **Marty Cooper** of Motorola stood on Sixth Avenue in Manhattan with a 2.5-pound prototype handset called the DynaTAC, and dialled **Joel Engel** at AT&T Bell Labs — his direct competitor in the cellular race. *"Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone."* The DynaTAC gave 35 minutes of talk after 10 hours of charging. The base station was in midtown. The infrastructure to support it commercially did not exist yet.

That call started the **53-year arc** from Cooper's prototype to the ~9 billion {{cellular|cellular}} subscriptions running 4G LTE and 5G NR in 2026. Three generations of analog (1G AMPS / TACS / NMT, ~1983–2000), three generations of digital (2G GSM / IS-95, ~1991; 3G WCDMA / CDMA2000, ~2001; 4G LTE, ~2010), and now 5G NR (~2018) — each one redrawing both the air interface and the core network on roughly a decade's cadence.

The transition that defined the modern era was 2G to 3G. **GSM**, launched commercially in Finland by Radiolinja in 1991, was the European digital standard that became the global one through sheer deployment momentum. **CDMA** (Andrew Viterbi at Qualcomm) was the technically-superior US challenger that won the underlying maths and lost the deployment war: when 3G ratified WCDMA inside UMTS, Viterbi's CDMA principles were what made the *radio* work, but the *system* was built on the GSM operator ecosystem. The pattern is one we have seen elsewhere — SCTP being technically superior to TCP, OSI to TCP/IP — the better protocol that lost on deployment economics.`
						},
						{
							type: 'narrative',
							title: 'Why one chapter for "4G + 5G"',
							text: `Cellular is the only protocol in this book that gets a single chapter for what looks like *two* protocols. The reason is that {{3gpp|3GPP}}, the standards body, ships both on a single Release schedule, and a 5G phone in 2026 is also an LTE phone falling back the moment 5G coverage drops. **LTE** is {{lte|3GPP Release 8}}, frozen December 2008. **5G NR** is {{5g-nr|3GPP Release 15}}, frozen June 2018. Both share the same air-interface design philosophy ({{ofdma|OFDMA}} + flexible numerology + {{harq|HARQ}}), the mandatory [[ipsec|IPsec]] envelope on every backhaul link, and an [[ipv6|IPv6]] mandate that has quietly migrated every major carrier's user-plane to IPv6-only since ~2020.

The 5G *air interface* extended LTE's {{ofdma|OFDMA}} with scalable numerology — five subcarrier spacings (15, 30, 60, 120, 240 kHz) that let the same protocol address sub-6 GHz mid-band (FR1) and {{mmwave|mmWave}} 24–52 GHz (FR2). The 5G *core network* threw out 4G's EPC zoo of monolithic boxes (MME, SGW, PGW, HSS, PCRF) glued by GTP and {{diameter|Diameter}}, and replaced it with **{{sba|Service-Based Architecture}}**: dozens of named network functions ({{aaa|AMF}}, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF) talking to each other over **[[http2|HTTP/2]] with {{json|JSON}} payloads protected by [[tls|TLS]]**.

Read that sentence again. **The control plane of every 5G carrier on Earth is now an [[http2|HTTP/2]] {{service-mesh|microservice fabric}}.** Cloud-native engineers can read the 3GPP TS 23.501 architecture diagrams and recognise their own world — service registry (NRF), API gateway (NEF), policy engine (PCF), token authentication (AUSF). The plumbing under your phone call uses the same patterns as a Kubernetes deployment.`
						},
						{
							type: 'callout',
							title: 'The largest enterprise IPsec deployment on Earth',
							text: 'Every interface between the [[cellular|cellular]] {{ran|radio access network}} and the core (N2/N3 in 5G, S1 in LTE) is wrapped in [[ipsec|IPsec ESP]] per 3GPP TS 33.501. With ~9 billion subscribers and tens of millions of base stations worldwide, the {{cellular|cellular}} backhaul is the single largest production [[ipsec|IPsec]] deployment that exists. Andreas Steffen\'s strongSwan, Cisco IOS, and Juniper Junos run more [[ipsec|IPsec]] tunnels inside one [[cellular|cellular]] operator than the entire enterprise VPN market combined.'
						},
						{
							type: 'narrative',
							title: 'The radio stack, in five layers',
							text: `Every 5G phone runs a five-layer stack inside the modem chip. **PHY** (3GPP TS 38.211–214) carries {{ofdma|OFDMA}} with five numerologies. **MAC** does **{{harq|hybrid ARQ}}** — combining forward error correction with {{retransmission|retransmission}}, where the receiver stores soft-decoded log-likelihood ratios from failed transmissions and combines them with the retransmitted copy. Eight parallel stop-and-wait HARQ processes per UE keep the pipe full. **RLC** handles {{fragmentation|segmentation and reassembly}} across 10- or 16-bit {{sequence-number|sequence numbers}}. **PDCP** above it does ROHC {{header|header compression}} (squashing the 40-byte IPv6+TCP/UDP header to 1–4 bytes), AES-CTR {{encryption|ciphering}}, and 32-bit {{anti-replay|anti-replay}}. **RRC** drives the connection state machine — \`RRC_IDLE → CONNECTED → INACTIVE\` for 5G — and **NAS** carries mobility, {{handshake|authentication}}, and session management end-to-end between the UE and the core.

Above all that, the user plane is just [[ip|IP]] — almost always [[ipv6|IPv6]] now. Above *that*, the application runs whatever ordinary internet applications run. {{harq|HARQ}} is the reason {{cellular|cellular}} reaches ~99.999% link reliability without [[tcp|TCP]]'s retransmit cost on the air. ROHC is the reason a 56-kbps narrowband IoT bearer can carry an IPv6 + TLS 1.3 connection without spending all its bytes on headers.`
						},
						{
							type: 'narrative',
							title: 'Voice as packets — VoLTE, VoNR, Wi-Fi Calling',
							text: `Until the late 2010s, "voice" on a phone meant a circuit-switched call routed through 2G/3G fallback even on an LTE device. **{{volte|VoLTE}}** (Voice over LTE, mass deployments from ~2014) finally packetised carrier voice — every call is a [[sip|SIP]] INVITE inside an {{ims|IMS}} bearer, with audio carried over [[rtp|RTP]] using AMR-WB or EVS {{codec|codecs}}. {{volte|**VoNR**}} (Voice over New Radio, mass deployments from ~2022) does the same over 5G.

GSMA reports **310+ commercial VoLTE operators in 140+ countries** and **45+ commercial VoNR networks** by 2025. Every modern carrier voice call is now a SIP INVITE — the largest [[sip|SIP]] deployment on Earth runs inside the {{cellular|cellular}} {{ims|IMS}} stack.

**Wi-Fi Calling** is the same IMS stack tunnelled to the carrier over [[ipsec|IPsec]] from any IP network. Your phone in the basement, on the hotel Wi-Fi, places calls through the carrier's *ePDG* (Evolved Packet Data Gateway) — an [[ipsec|IPsec]] head-end the size of a small data centre that terminates millions of IKEv2 tunnels and feeds the inner IMS traffic into the EPC. From the network's perspective, your basement phone looks like any other LTE phone; it just happened to attach through Wi-Fi instead of an eNodeB.`
						},
						{
							type: 'narrative',
							title: 'Tunnels and addresses — how your IP follows you',
							text: `The architectural trick that makes {{cellular|cellular}} look like a normal IP network from the application's perspective is **{{gtp-u|GTP-U}}** — the GPRS Tunnelling Protocol — User plane. Every PDU session has a 32-bit **Tunnel Endpoint Identifier (TEID)**. User-plane packets travel from the gNB to the User Plane Function over [[udp|UDP]]/2152, wrapped in GTP-U headers that preserve the UE's inner [[ip|IP]] address regardless of which base station the UE is camping on.

This is the mechanism behind one of {{cellular|cellular}}'s most under-appreciated features: **your phone keeps its [[ip|IP]] address across handovers**. As you drive from one cell tower's coverage to the next, the GTP-U tunnel terminates at a different base station, but the same UPF anchors the same IPv6 prefix to your device. Your YouTube stream does not have to renegotiate; your video call does not drop. The reason TCP-on-cellular works at all is that the network hides the radio handover from the IP layer.

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
							text: `Most {{cellular|cellular}} subscriptions on Earth are phones. The growing minority is **IoT modules** — asset trackers, fleet telematics, smart meters, agricultural sensors, GPS pet collars. These devices are battery-powered, send a few kilobytes a day, and need years of operation per charge. Standard 5G NR is wildly overkill for them; the 3GPP answer is a family of *cat-down* radio profiles inside LTE/NR spectrum.

**NB-IoT** (Cat-NB1, Release 13, 2016) gives ~250 kbit/s peak in a single 200 kHz channel — narrower than a Wi-Fi block, broader than nothing. **LTE-M / Cat-M1** (Release 13, 2016) gives ~1 Mbit/s in 1.4 MHz, enough for voice over LTE for connected wearables. **RedCap** (Reduced Capability NR, Release 17, 2022) is the 5G equivalent — bandwidth-constrained 5G NR for wearables and industrial sensors. **Ambient IoT** ({{ambient-iot|study items in Release 19/20}}) is the next step: battery-less or near-battery-less cellular devices that harvest RF or motion and transmit tiny payloads.

The {{lpwan|LPWAN}} story is broader than cellular — **LoRaWAN** (sub-GHz unlicensed, 125M+ devices by end-2025) and **Sigfox** (slow-modulation 100 bit/s ultra-narrowband) own much of the metering and agriculture market. But cellular's NB-IoT/LTE-M can run on existing carrier infrastructure, which makes deployment trivial for operators and competitive for everyone else.`
						},
						{
							type: 'narrative',
							title: 'Direct-to-cell — when the satellite is the tower',
							text: `In **January 2025**, T-Mobile + SpaceX Starlink launched the first commercial **{{direct-to-cell|Direct-to-Cell}}** service: SMS and emergency messaging from ordinary smartphones, with the satellite acting as a base station in standard {{cellular|cellular}} bands n255/n256. Apple's Globalstar-based Emergency SOS, AT&T's AST SpaceMobile partnership, and Iridium's NTN-ready successors follow similar patterns.

The 3GPP framing is **{{ntn|Non-Terrestrial Networks}}** — added in Release 17 (March 2022) as a first-class radio access type, split into NB-IoT NTN, NR NTN, and the Direct-to-Cell profile. The phone does not need a special radio; it does need to be in line-of-sight of a satellite, which means open sky.

What changes about the {{cellular|cellular}} mental model is the word "coverage." For 50 years, "no signal" meant *no signal*. For most of the next 50, "no signal" will mean *no terrestrial signal — try walking outside*. The implications for emergency services, maritime communications, and the half of the planet that has never had reliable mobile coverage are still being worked out.`
						},
						{
							type: 'narrative',
							title: 'The SS7 / Diameter trust holdover',
							text: `Modern {{cellular|cellular}} security inside one carrier's network is strong. The cryptography is sound, the air interface is encrypted, the IMS signalling runs over TLS. But the **interconnect layer between carriers** — how a roaming visitor authenticates, how SMS routes globally, how location is queried for billing — runs on **{{ss7|SS7}}** (designed 1975) and **{{diameter|Diameter}}** (RFC 6733, 2012), both designed in an era of implicit trust between carrier peers.

Modern surveillance actors exploit this trust. **SS7 routing** can silently track mobile users worldwide — Citizen Lab's 2024–25 disclosures and CISA's 2024 testimony to the {{fcc|FCC}} document active commercial-grade surveillance using exactly this vector. Diameter abuse (DoS, location-tracking, SMS interception) by malicious peers remains a real-world problem. The 5G SBI authenticated interconnect (3GPP TS 33.521) is the long-term fix; it is partially deployed and still has decades of SS7-shaped tail to migrate.

The shape rhymes with the rest of this Part. Every wireless protocol's cryptography has held up. Every wireless protocol's *negotiation logic*, *roaming model*, or *trust assumptions between operators* has been broken at the protocol level by now. The 1990s and 2000s patched the cryptography; the 2020s are patching the architecture around it.`
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
				'ISO 18092, Type 1–5 tags, EMV, transit, Apple Pay, CCC Digital Key, Aliro 1.0, and the Charles Walton-to-Apple-Pay arc that took 31 years.',
			slots: [
				{ kind: 'protocol', id: 'nfc', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'charles-walton' },
				{ kind: 'pioneer', id: 'franz-amtmann' },
				{ kind: 'pioneer', id: 'karsten-nohl' },
				{
					kind: 'pull-quote',
					text: 'Sixteen bytes of ASCII — ZigBeeAlliance09, the default Zigbee Trust Center link key — baked into the specification of one of the most widely deployed wireless protocols on Earth. Generations of Wireshark users have memorised that hex string.',
					attribution: 'Zigbee protocol page — but the moral applies across wireless'
				},
				{ kind: 'simulation', protocolId: 'nfc' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'uwb',
			title: 'UWB — nanosecond pulses for centimetre ranging',
			synopsis:
				'IEEE 802.15.4z, FiRa, CCC Digital Key 3.0, Apple U1 / U2, the 2022 Tesla BLE relay attack that motivated the move to UWB, and the Ghost Peak STS residual.',
			slots: [
				{ kind: 'protocol', id: 'uwb', facets: ['overview', 'header'] },
				{ kind: 'pioneer', id: 'robert-scholtz' },
				{ kind: 'pioneer', id: 'moe-win' },
				{ kind: 'pioneer', id: 'srdjan-capkun' },
				{
					kind: 'pull-quote',
					text: 'UWB is not a data radio — it is a clock. Modern UWB transmits sub-nanosecond impulses across ≥500 MHz of spectrum so two devices can measure the time-of-flight of a radio pulse with 10–30 cm accuracy. The point in 2026 is the security of the measurement, not just the precision.',
					attribution: 'UWB protocol page'
				},
				{ kind: 'simulation', protocolId: 'uwb' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'zigbee',
			title: 'Zigbee, Thread, and the Matter bridge',
			synopsis:
				'IEEE 802.15.4 mesh, Zigbee PRO R23 (Dynamic Link Key, Trust Center Swap-Out), the Hue installed base, and how Matter bridges Zigbee semantics onto IP.',
			slots: [
				{ kind: 'protocol', id: 'zigbee', facets: ['overview', 'header', 'incidents'] },
				{ kind: 'pioneer', id: 'bob-heile' },
				{ kind: 'pioneer', id: 'tobin-richardson' },
				{
					kind: 'pull-quote',
					text: "Philips Hue's 2012 Apple Store launch never said \"Zigbee\" out loud. The press release mentioned ZigBee LightLink exactly once; the in-store materials, packaging, and iOS app strenuously avoided the term. The customer was sold *web-enabled* lighting. The canonical example of a successful protocol whose user-visible brand is the product, not the standard.",
					attribution: 'Zigbee protocol page'
				},
				{ kind: 'simulation', protocolId: 'zigbee' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'security-across-the-wireless-family',
			title: 'Security across the wireless family',
			synopsis:
				'KRACK, BLUFFS, KNOB/BIAS, FragAttacks, SS7 / Diameter abuse, MIFARE Crypto1, the 2022 Tesla BLE relay, and the Ghost Peak UWB STS attack — one chapter tying the wireless attack lineage together.',
			slots: []
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'spectrum-and-the-frontier',
			title: 'Spectrum, regulation, and what comes next',
			synopsis:
				'6 GHz Wi-Fi, mmWave, Ligado/L-band, the 47-day-cert cliff, WRC-27, Ambient IoT, Wi-Fi 8, 6G targets, and Starlink Direct-to-Cell. The wireless frontier through 2030.',
			slots: []
		}
	]
};
