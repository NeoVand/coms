import type { SubcategoryStory } from './types';

export const wlanWanStory: SubcategoryStory = {
	subcategoryId: 'wlan-wan',
	tagline:
		"General-purpose wireless at two scales — unlicensed Wi-Fi for hundreds of meters, licensed cellular for hundreds of kilometers",
	sections: [
		{
			type: 'narrative',
			title: 'Two Approaches, Two Spectrum Models',
			text: `Most wireless networking on the planet runs on one of two technology families. Both push bits through the air. They differ on almost everything else.\n\n**[[wifi|Wi-Fi]]** (the IEEE 802.11 family, 1997–) runs in **unlicensed spectrum** — frequency bands (2.4 GHz, 5 GHz, 6 GHz) that anyone can use without buying the rights. The deal: keep your power below a regulated limit, share the medium with your neighbors, accept interference. Hundreds of meters of range, gigabits per second on the latest standards, no per-device cost, no carrier in the loop. Wi-Fi is *your network*.\n\n**[[cellular|Cellular]]** (GSM through 5G NR) runs in **licensed spectrum** — bands that carriers paid governments billions for at auction. The carrier controls the spectrum, the towers, the subscriber identity (SIM), and the billing. Kilometers of range, gigabits per second on the latest standards, expensive per-device, carrier in the loop. Cellular is *the carrier's network*.\n\nThe two have converged technically. Both use OFDM(A) modulation. Both have MIMO. Both have started using millimeter-wave spectrum for short-range high-bandwidth. Wi-Fi 6E and 5G NR have similar peak speeds. They've diverged operationally. Wi-Fi is essentially free and best-effort; cellular is paid and policy-managed. Your phone uses both, switching seamlessly via {{ttls|EAP-TTLS}} / Passpoint or simple SSID joins; the only thing that differs is who you owe money to.\n\nThis is the broadcast-range family — protocols that move bits *as the primary radio link*, as opposed to short-range PAN protocols (Bluetooth, NFC, Zigbee) that exist for specific device-to-device interaction. WLAN and WAN, side by side, are how almost every Internet-connected device gets its bits today.`
		},
		{
			type: 'pioneers',
			title: 'The Wireless Network Architects',
			people: [
				{
					id: 'marty-cooper',
					name: 'Marty Cooper',
					years: '1928–',
					title: '"Father of the Cell Phone"',
					org: 'Motorola',
					contribution:
						"Led the team at Motorola that built the first handheld cellular phone in 1973 — the DynaTAC prototype, the 2.5-pound brick Cooper used to make the first cellular phone call in April 1973. The call was to Cooper\\'s rival Joel Engel at Bell Labs, just to say \"I\\'m calling you from a real handheld cellular phone.\" It would be ten more years before commercial cellular service launched (1G AMPS in Chicago, 1983), but the architecture — cells, frequency reuse, handover — was Cooper\\'s vision."
				},
				{
					id: 'andrew-viterbi',
					name: 'Andrew Viterbi',
					years: '1935–',
					title: 'Inventor of the Viterbi Algorithm / Co-founder of Qualcomm',
					org: 'UCSD / Qualcomm',
					contribution:
						"Invented the Viterbi algorithm (1967) — the optimal decoder for convolutional codes that underpins essentially every wireless modem since. Co-founded Qualcomm (1985), which bet on CDMA for cellular against the entrenched TDMA standard (GSM). CDMA won the US 2G/3G battle; the underlying spread-spectrum mathematics also drove modern OFDMA and 5G NR. The Viterbi School of Engineering at USC is named for him."
				},
				{
					name: 'Vic Hayes',
					years: '–',
					title: '"Father of Wi-Fi"',
					org: 'NCR / Lucent / IEEE 802.11',
					contribution:
						'Chaired the IEEE 802.11 working group from its founding in 1990 through 2000 — the decade when Wi-Fi went from a proposal to a global standard. Hayes\' particular contribution was shepherding the consensus between vendors with incompatible early designs (NCR\'s WaveLAN, others\') into a single standard that everyone could implement. Without that coordination, Wi-Fi would have fragmented like the early cellular world did.'
				},
				{
					id: 'erik-dahlman',
					name: 'Erik Dahlman',
					years: '–',
					title: '5G NR Architect',
					org: 'Ericsson',
					contribution:
						"Senior expert at Ericsson, key contributor to 3GPP standards from 3G WCDMA through 5G NR. Co-author of the standard reference book *5G NR: The Next Generation Wireless Access Technology* (Academic Press). Dahlman\\'s technical work on 5G\\'s flexible numerology (different subcarrier spacings for different use cases) is what lets 5G serve both broadband and low-latency industrial use cases on the same air interface."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'First Cellular Phone Call',
					description:
						"[[pioneer:marty-cooper|Cooper]] at Motorola makes the first handheld cellular phone call from a Manhattan street to Bell Labs' Joel Engel."
				},
				{
					year: 1983,
					title: 'First Commercial Cellular (1G AMPS)',
					description:
						"Ameritech launches Advanced Mobile Phone System in Chicago. Analog voice; FM modulation; massive cell towers."
				},
				{
					year: 1991,
					title: '2G GSM Launches',
					description:
						"Digital cellular ships in Finland. GSM standardized in Europe; CDMA-based IS-95 in the US. The split between TDMA-based GSM and CDMA-based US carriers defines a decade of incompatibility."
				},
				{
					year: 1997,
					title: 'IEEE 802.11 Published',
					description:
						"The original [[wifi|Wi-Fi]] standard — 1 Mbps and 2 Mbps in 2.4 GHz. Initially marketed as \"WaveLAN.\" The Wi-Fi Alliance forms a couple years later to brand the certified-interop version."
				},
				{
					year: 1999,
					title: '802.11b — Wi-Fi Takes Off',
					description:
						"11 Mbps in 2.4 GHz. Apple ships AirPort base stations and AirPort cards (rebadged Lucent WaveLAN). [[wifi|Wi-Fi]] starts appearing in laptops by default. Cafés and airports become the first public Wi-Fi locations."
				},
				{
					year: 2001,
					title: '3G Launches in Japan (NTT DoCoMo)',
					description:
						"DoCoMo's FOMA network launches the first commercial 3G. Data rates of hundreds of Kbps make mobile internet plausible for the first time."
				},
				{
					year: 2003,
					title: '802.11g — 54 Mbps',
					description:
						"54 Mbps in 2.4 GHz. The version that mainstreams Wi-Fi in homes and offices. WPA replaces the badly-broken WEP for encryption."
				},
				{
					year: 2009,
					title: '802.11n / Wi-Fi 4 — MIMO',
					description:
						"Multiple antennas; up to 600 Mbps theoretical. The first Wi-Fi version that's plausibly competitive with wired Ethernet."
				},
				{
					year: 2009,
					title: '4G LTE Launches',
					description:
						"TeliaSonera deploys the first commercial LTE network in Stockholm and Oslo. Verizon launches LTE in the US in 2010. Smartphones and high-bandwidth mobile internet take off."
				},
				{
					year: 2013,
					title: '802.11ac / Wi-Fi 5 — Gigabit',
					description:
						"Gigabit speeds in 5 GHz. The version that finally made \"wireless = fast\" universal in consumer perception."
				},
				{
					year: 2019,
					title: '5G NR Launches',
					description:
						"Commercial 5G launches in South Korea, the US, and China. Two flavors: sub-6 GHz (longer range, similar to LTE+) and mmWave (very fast, very short range)."
				},
				{
					year: 2019,
					title: '802.11ax / Wi-Fi 6 — OFDMA',
					description:
						"OFDMA borrowed from LTE arrives in Wi-Fi. Better performance with many simultaneous devices, which matters far more in real-world deployments than peak speed."
				},
				{
					year: 2020,
					title: 'Wi-Fi 6E — 6 GHz Spectrum',
					description:
						"Regulators (FCC, Ofcom, EU) open the 6 GHz band for unlicensed use. 1200 MHz of new spectrum; effectively triples Wi-Fi capacity. Wi-Fi 6E devices ship in 2021."
				},
				{
					year: 2024,
					title: '802.11be / Wi-Fi 7',
					description:
						"320 MHz channel width in 6 GHz, 4096-QAM, multi-link operation (use 2.4 and 5 and 6 GHz simultaneously). Theoretical peak ~46 Gbps."
				}
			]
		},
		{
			type: 'comparison',
			title: 'Wi-Fi vs Cellular',
			axes: ['Spectrum', 'Range', 'Cost model', 'Mobility', 'Where it dominates'],
			rows: [
				{
					label: '[[wifi|Wi-Fi]]',
					values: [
						'Unlicensed (2.4 / 5 / 6 GHz)',
						'Tens to hundreds of meters per AP',
						'CapEx only (buy the AP); no per-user fees',
						"Stationary or walking — handover between APs is OS-handled and lossy",
						"Indoor — homes, offices, public hotspots, IoT inside buildings"
					]
				},
				{
					label: '[[cellular|Cellular]]',
					values: [
						'Licensed (various bands per region, billions paid at auction)',
						'Kilometers per tower; mmWave only meters',
						'OpEx (per-month SIM); CapEx is the carrier\'s problem',
						"Designed for fast handover at vehicle speeds — works on bullet trains",
						"Outdoor and mobile — phones, vehicles, fixed-wireless backhaul"
					]
				}
			],
			note: "These aren't competitors so much as complements. A modern smartphone uses both — Wi-Fi at home (cheaper, faster indoor), cellular outside (covers everywhere). Most phone OSes (iOS, Android) hand off transparently between them via Apple's Wi-Fi Calling and similar."
		},
		{
			type: 'animated-sequence',
			title: 'Wi-Fi Association + 4-Way Handshake',
			definition: `sequenceDiagram
    participant C as Client
    participant AP as Access Point
    Note over C,AP: Phase 1 — Discovery
    AP-->>C: Beacon every 100ms, SSID and capabilities
    C->>AP: Probe Request
    AP->>C: Probe Response
    Note over C,AP: Phase 2 — Authentication and Association
    C->>AP: Auth Request
    AP->>C: Auth Response Success
    C->>AP: Association Request with RSN IE
    AP->>C: Association Response Success
    Note over C,AP: Phase 3 — WPA2 4-Way Handshake
    AP->>C: Message 1, AP nonce ANonce
    C->>C: derive PTK from PMK, ANonce, SNonce
    C->>AP: Message 2, SNonce with MIC
    AP->>AP: derive PTK, verify MIC
    AP->>C: Message 3, install PTK and group key
    C->>AP: Message 4, ACK
    Note over C,AP: Encrypted data flows
    Note over C,AP: Phase 4 — DHCP over the encrypted link
    C->>AP: DHCP DISCOVER`,
			caption:
				"Wi-Fi's association + 4-way handshake is one of the most-executed cryptographic protocols on Earth — every laptop, phone, and IoT device runs it every time it joins a network. WPA2-Enterprise replaces the pre-shared key with an 802.1X exchange against a RADIUS server, but the four messages of the handshake itself are the same.",
			steps: {
				0: '**Phase 1 — Discovery.** Before joining a network, the client has to find one. The whole process below is run from the moment the user picks an SSID until the device has an IP address.',
				1: 'The AP **broadcasts a Beacon** roughly every 100 ms advertising its SSID, supported rates, and security capabilities (open, WPA2-PSK, WPA3-SAE, etc.). Phones scan for these passively while idle, which is why your phone "knows" about every nearby Wi-Fi.',
				2: 'The client sends a **Probe Request** — "is the network I want here?" Used both as an active scan and to elicit a fresher beacon than the last passive one.',
				3: 'The AP responds with a **Probe Response** carrying the same info as a beacon but unicast to the asking client.',
				4: '**Phase 2 — Authentication and Association.** The client now formally asks to join. The original 802.11 spec had WEP-based authentication; modern WPA2/3 uses Open System Authentication here and does the real auth in Phase 3.',
				5: '**Auth Request.** A vestigial WEP-era step that always succeeds for WPA2/3.',
				6: '**Auth Response: Success.** The vestigial step completes.',
				7: '**Association Request.** The real "I want to join your BSS" message. Carries the {{rsn|RSN}} Information Element declaring which cipher suite the client wants.',
				8: '**Association Response: Success.** The AP allocates state for this client and tells it the association ID it will use.',
				9: '**Phase 3 — The 4-Way Handshake.** Both sides already know the **Pairwise Master Key** (derived from the Wi-Fi password for WPA2-PSK, from the RADIUS exchange for WPA2-Enterprise). What they need now are *fresh* session keys.',
				10: '**Message 1.** The AP picks a random {{nonce|nonce}} (ANonce) and sends it. No encryption yet — but the nonce alone is harmless.',
				11: '**The client derives the Pairwise Transient Key** by combining the PMK, its own SNonce, the AP\'s ANonce, and both MAC addresses. The PTK is the actual encryption + integrity key for this session.',
				12: '**Message 2.** The client sends its SNonce so the AP can derive the same PTK, plus a Message Integrity Code computed with the new key — proving the client really has the right password.',
				13: '**The AP derives the PTK** with the now-known SNonce and verifies the MIC. A wrong password fails here; this is what makes the password "leak-free" — it never travels over the air.',
				14: '**Message 3.** The AP confirms key installation and ships the **Group Temporal Key** (used for broadcast/multicast frames), encrypted with the new PTK.',
				15: '**Message 4: ACK.** The client confirms it has installed both keys. From this point on, every frame between the two is encrypted.',
				16: 'All subsequent **data frames** are CCMP/AES-encrypted using the PTK. The Wi-Fi link is now safe from passive sniffing.',
				17: '**Phase 4 — DHCP.** The Wi-Fi link is up but the client still has no IP. The same handshake-protected link now carries the normal **DHCP DORA** exchange to get an address.',
				18: '**DHCP DISCOVER** — broadcast on the now-encrypted link. From the application\'s perspective, this is "joining the network is complete."'
			}
		},
		{
			type: 'callout',
			title: 'Why Cellular and Wi-Fi Don\'t Merge',
			text: `For thirty years, people have predicted that Wi-Fi and cellular would converge into a single wireless standard. They haven't. The reasons are economic, not technical.\n\n**Spectrum economics are completely different.** Carriers spent ~$700 billion globally on spectrum licenses over 20 years. They built tower networks on top of that investment. They have to charge for access to recoup it. Wi-Fi spectrum is free. The two pricing models are incompatible: there is no good way to monetize spectrum that is *also* free for anyone to use.\n\n**Coverage area economics differ.** Wi-Fi makes sense indoors (where signals don't travel far and adding APs is cheap). Cellular makes sense outdoors and at vehicle speeds (where tower-scale infrastructure is the only way). Trying to use Wi-Fi outdoors hits propagation limits; trying to use cellular indoors hits coverage gaps and signal absorption.\n\n**Regulatory frameworks differ.** Cellular spectrum is per-operator; Wi-Fi spectrum is shared. The "carrier" model assumes a single accountable operator per spectrum band; the "unlicensed" model assumes everyone competes politely. Bringing them together would either monopolize the unlicensed spectrum or fragment the licensed.\n\n**Practical convergence happens at the application layer.** Your iPhone seamlessly switches between Wi-Fi and 5G based on signal quality; Wi-Fi Calling uses Wi-Fi for cellular calls; Passpoint lets your SIM identity authenticate you to Wi-Fi networks. The user experience is unified; the underlying spectrum and economics are not.\n\nThe most interesting recent convergence is **private 5G** — companies (factories, ports, stadiums) buy small slices of cellular-style spectrum (CBRS in the US) and run their own 5G networks. Same air interface as commercial cellular; same convenience as Wi-Fi; sits in between. It's growing fast but is still a small fraction of either market.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[wifi|Wi-Fi]]'s failure mode is **the crowded channel**. Wi-Fi spectrum is shared. A coffee shop with 50 users on Wi-Fi has 50 devices competing for the same radio channel; throughput per user collapses. Hardware mitigations (band steering, multi-AP roaming, OFDMA in Wi-Fi 6) help but don't eliminate the contention. The other failure mode is **deauth attacks** — anyone can send a deauthentication frame to anyone on the network (the management frames were unencrypted in pre-802.11w spec) and force them off. WPA3 fixes this; deployment is uneven.\n\n[[cellular|Cellular]]'s failure mode is **the dead zone**. Coverage isn't universal; mmWave 5G works for a few hundred meters before falling back to sub-6 GHz. Indoor cellular is often poor — building materials block the signal. The carrier-side fix (femtocells, micro/pico cells, distributed antenna systems) requires significant infrastructure investment. The user-side fix (Wi-Fi calling) hands the problem back to Wi-Fi.\n\nBoth share a third failure mode: **the upgrade cycle**. Wi-Fi has had ~7 major standards in 25 years (b/g/n/ac/ax/6E/be). Cellular has had 5 generations (1G–5G). Each generation requires new hardware on both ends — new APs *and* new client cards. The "router lifespan" in 2025 is effectively the Wi-Fi standard lifespan, ~5–8 years. Cellular operators amortize this over their tower infrastructure; consumers feel it every time they buy a new phone or router.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **Wi-Fi 7** (802.11be) is shipping in flagship devices. Multi-Link Operation lets a device use 2.4 + 5 + 6 GHz simultaneously, dramatically improving roaming and throughput. Reality lags the spec; few APs and clients support all features yet.\n- **6G research** has begun. ITU-R is targeting 2030 for commercial launch. Frequencies will include sub-terahertz; expect 100+ Gbps peak speeds but very short range.\n- **CBRS / private 5G** continues growing for industrial use cases. Factories, ports, mines, stadiums deploying their own 5G is now mainstream rather than experimental.\n- **OpenRAN** — disaggregating cellular base-station hardware from software — slowly moving from political will to commercial deployment. Dish Network in the US is the largest OpenRAN deployment; Rakuten in Japan was first.\n- **Satellite + cellular convergence** — Apple's Emergency SOS, Starlink Direct-to-Cell, AST SpaceMobile all let standard cell phones talk to satellites for SMS and (soon) data in areas with no tower coverage. The boundary between WAN cellular and LEO satellite is dissolving.\n- **Spectrum management automation** — Wi-Fi 6E and 7 in 6 GHz require AFC (Automated Frequency Coordination) to avoid interfering with existing fixed-service users. AFC databases shipped in 2024; standard-power 6 GHz Wi-Fi is finally deployable.\n- **The boring truth**: Wi-Fi and cellular will keep getting faster, eat each other's lunch at the edges, and never merge into one technology. The dual-stack will persist.`
		}
	]
};
