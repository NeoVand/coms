---
id: cellular
type: protocol
name: Cellular (4G LTE + 5G NR)
abbreviation: 4G / 5G
etymology: "[L]ong-[T]erm [E]volution + 5G [N]ew [R]adio — both from 3GPP, the [3]rd [G]eneration [P]artnership [P]roject"
category: wireless
year: 2008
rfc: 3GPP TS 36.300 / 38.300
standards_body: 3gpp
podcast_target_minutes: 25
related_book_chapters:
  - wireless/the-shared-medium
  - wireless/cellular
related_protocols: [ip, ipv6, tcp, udp, quic, ipsec, http2, http3, tls, dns, sip, rtp, webrtc, wifi, bluetooth, nfc]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cellular_network_standards_and_generation_timeline.svg/500px-Cellular_network_standards_and_generation_timeline.svg.png
    caption: "The 3GPP generation timeline — analog AMPS in 1979, GSM 2G in 1991, UMTS/WCDMA 3G in 2001, LTE 4G in Release 8 (December 2008), 5G NR in Release 15 (June 2018), 5G-Advanced in Release 18 (June 2024), and 6G study items now in Release 20."
    credit: "Image: Wikimedia Commons / CC BY-SA"
visual_cues:
  - "A side-by-side architecture diagram. On the left, the LTE EPC: a fixed set of named boxes (MME, SGW, PGW, HSS, PCRF) connected by labelled point-to-point interfaces (S1-MME, S1-U, S5, S6a, Gx). On the right, the 5GC: a cloud of round nodes (AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF) all wired to a central NRF service registry, every line annotated 'HTTP/2 + JSON over TLS'. Caption: 'Same logical job, totally different shape.'"
  - "A 5G NR resource grid. Time on the x-axis (one 1 ms slot at numerology 0, narrowing to 125 microseconds at numerology 3), frequency on the y-axis (12 subcarriers per resource block). Five overlaid grids show the five numerologies — 15, 30, 60, 120, 240 kHz — with the FR1 cases tinted blue and the FR2 mmWave cases tinted red. Caption: 'One framework, five clocks.'"
  - "A single packet on its way out of a phone, drawn as nested envelopes. Innermost: an IPv6 packet to 2606:4700:4700::1111 (Cloudflare DNS). Around it: a GTP-U header with TEID 0xCAFEF00D and a QoS Flow Identifier of 9. Around that: a UDP header with source and destination port 2152. Around that: an IPsec ESP envelope with SPI 0xC0FFEE02 and a sequence number. Caption: 'Every cellular packet pays an IPsec round on every backhaul hop.'"
  - "The 5G initial-registration sequence diagram, eight columns: UE, gNB, AMF, AUSF, UDM, SMF, UPF, internet. Eight numbered horizontal arrows: RRC Setup; Registration Request carrying SUCI; AKA challenge with RAND/AUTN; NAS Security Mode; Registration Accept with 5G-GUTI; PDU Session Establishment Request; PFCP Session Establishment to UPF; first GTP-U user-plane packet. The N2 and N3 arrows are highlighted in red and labelled 'IPsec ESP'."
  - "A Starlink Direct-to-Cell satellite at 600 km, its beam falling on a stock smartphone in a desert. Annotations: 'Standard band n25/n26 phone. No app. 3GPP NR-NTN profile (Release 17). T-Mobile commercial launch 23 July 2025. 657 satellites in orbit by mid-2025.'"
  - "The SUCI computation: a SUPI (an IMSI like 234150999999999) on the left, the home-network public key (ECIES Profile A, Curve25519) feeding into an ECIES box, and a SUCI ciphertext on the right being sent over the air. Caption: 'The single biggest privacy upgrade of 5G versus LTE: the long-term identifier never travels in cleartext.'"
---

# 4G / 5G — Cellular (4G LTE + 5G NR)

## In one breath

Cellular is the radio family that gets a phone an IP address from a base station fifty kilometres away — about nine billion subscriptions, the largest wireless deployment on Earth. In 2026 it is two protocols braided into one ecosystem: 4G LTE, frozen as 3GPP Release 8 in December 2008 and still the universal floor, and 5G NR, frozen as Release 15 in June 2018 and now the normative baseline through 5G-Advanced (Release 18, June 2024). Both share the OFDMA radio, the same authentication backbone, and a mandatory IPsec wrapper on every backhaul link. Above all of that, the user plane is just IP — almost always IPv6 now — carrying whatever protocols the application happens to run.

## The pitch

On 3 April 1973, on Sixth Avenue in Manhattan, Marty Cooper of Motorola dialled Joel Engel at AT&T Bell Labs from a 2.5-pound prototype and said: "Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone." Engel, by Cooper's account, claims not to remember the call. Fifty-three years later, the descendants of that troll are nine billion radios, the largest enterprise IPsec deployment on Earth, and a control plane that is — quietly, completely — an HTTP/2 microservice fabric. This episode is about how the wire works in 2026: what a 5G phone says to the network when it powers on, where every byte gets encrypted, what breaks, and what is changing as the radio learns to talk to satellites. The history — the CDMA-versus-GSM wars, the 3GPP merger, the long road from AMPS to LTE — lives in the chapter episode "Cellular: 4G LTE plus 5G NR plus the 3GPP machine."

## How it actually works

When a 5G phone leaves airplane mode, it walks an eight-beat sequence that ends with the first user-plane packet flowing to the internet. The simulator on this page steps through every beat. The most important architectural fact about it is that every signalling hop above the radio is wrapped in IPsec ESP, and every control-plane call inside the core is HTTP/2 with JSON.

It starts with **RRC Setup**. The phone — the User Equipment, or UE — picks a cell from the synchronisation signal blocks the gNB is broadcasting, then runs the four-message random-access procedure: a PRACH preamble (Msg1), a Random Access Response carrying timing advance and a temporary C-RNTI (Msg2), an RRCSetupRequest (Msg3), an RRCSetup (Msg4). The UE now has a signalling radio bearer but no security context.

Then the **Registration Request**. The UE sends a NAS Registration Request over that radio bearer. The gNB does not look at the NAS payload — it just stuffs it inside an NGAP Initial UE Message on SCTP port 38412 and forwards it to the AMF, all wrapped in IPsec ESP. The Request carries the SUCI (the encrypted SUPI), the Requested NSSAI for slice selection, and the UE's security capabilities.

**5G-AKA Authentication** is the bit that stops strangers from calling on your number. The AMF asks the AUSF, the AUSF asks the UDM, the UDM's SIDF function decrypts the SUCI back to the SUPI using its ECIES private key, and generates an authentication vector from the long-term key K stored on the SIM and in the UDM. RAND and AUTN travel all the way down to the USIM. The USIM checks AUTN.MAC against f1(K, SQN, RAND), computes RES* via KDF over CK and IK, and sends RES* back. The AUSF compares it to the home-network's HRES*. Mutual authentication, with neither side having sent a long-term identifier in cleartext.

**NAS Security Mode** turns the wire on. The AMF picks ciphering — almost always 128-NEA2, which is AES in counter mode — and integrity, almost always 128-NIA2, which is AES-CMAC. From this point every NAS message is integrity-protected and ciphered.

**Registration Accept** assigns the temporary identity. The AMF returns a 5G-GUTI good for the next twenty-four hours or so, the allowed NSSAI, the registration area, and timer values. The phone is now attached to the 5G core but it does not have an IP address yet.

**PDU Session Establishment** is the IP-address handshake. The UE sends a NAS PDU Session Establishment Request — "give me a tunnel to DNN equals internet, IPv4v6, slice sst equals one." The AMF picks an SMF via NRF discovery and forwards via the Nsmf_PDUSession_CreateSMContext service call. The SMF picks a UPF, programs forwarding rules over the N4 interface using PFCP — Packet Detection Rules, Forwarding Action Rules, QoS Enforcement Rules, Usage Reporting Rules — and returns the allocated address.

The **first user-plane packet** flows. Inside the radio, it is just IP. As soon as it leaves the gNB heading to the UPF on the N3 interface, it is encapsulated in GTP-U — version 1, message type 0xFF, an 8-byte header with a Tunnel Endpoint Identifier picking the PDU session and a PDU Session Container extension stamping the QoS Flow Identifier. GTP-U rides UDP port 2152. That whole thing is then wrapped in IPsec ESP per 3GPP TS 33.501. The encapsulation is the lesson.

### Header at a glance

The headline header is the GTP-U header — eight bytes that make modern cellular work. It carries:

- A version field (1 for GTPv1).
- A protocol-type bit (1 for GTP, 0 for the legacy GTP' charging variant).
- Flag bits for sequence number, N-PDU number, and the extension-header bit.
- A message-type byte. 0xFF is G-PDU — user-plane data.
- A 16-bit length field covering everything after the first eight bytes.
- A 32-bit Tunnel Endpoint Identifier — the TEID — which tells the receiving UPF which PDU session this packet belongs to. This is how a phone keeps its IP across handovers between base stations: the inner packet's source address is preserved while the outer TEID is rewritten.
- An optional PDU Session Container extension that stamps a QoS Flow Identifier (QFI), so the receiver knows which 5G QoS flow the packet rides.

On the air interface the headers that matter most are NAS — a 5GMM or 5GSM header with a Security Header Type (0 for plain, 2 for integrity-and-cipher, 3 for the Security Mode Command itself), a Procedure Discriminator (0x7E for 5GMM), and a Message Type byte (0x41 for Registration Request, 0x42 for Accept, 0x56 for Authentication Request, 0xC1 for PDU Session Establishment Request, 0xC2 for Accept).

### State machine in three sentences

5G NR's RRC has three states: RRC_IDLE (the phone sleeps and only listens to paging), RRC_INACTIVE (5G-only — the gNB caches the access-stratum security context so the phone can resume in about ten milliseconds with an RRC Resume instead of a full setup), and RRC_CONNECTED (an active radio link, network-controlled handover, scheduled traffic). State transitions cost battery, and careful RRC tuning is the difference between a six-hour and a twenty-four-hour battery life on an IoT module. The new INACTIVE state cuts signalling load by fifty to eighty percent for chatty apps.

### Reliability, ciphering, and header compression

Cellular reliability is built on hybrid ARQ in the MAC layer. HARQ combines forward error correction with retransmission: the receiver keeps the soft-decoded log-likelihood ratios from a failed transmission and combines them with the retransmitted copy, either chase-combining or incremental-redundancy. LTE downlink runs eight HARQ processes per UE — three bits of process ID. NR extends this to up to sixteen by default, and Release 17 added optional support for up to thirty-two for high-SCS scenarios. That is why cellular gets its famous reliability without paying TCP's retransmit cost on the link.

Above MAC, RLC adds segmentation and selective-repeat ARQ in three modes — Transparent, Unacknowledged, Acknowledged — with 6, 10, 12, 16, or 18-bit sequence numbers depending on release and mode. PDCP above that does ROHC header compression — squashing a 40-byte IPv4/UDP/RTP header to between one and three bytes, which is what makes voice over LTE and voice over NR practical inside a single RLC slot — plus AES-CTR ciphering keyed off K_gNB derived from the AKA hierarchy. NR adds SDAP above PDCP only on the user plane: it stamps the QoS Flow Identifier on each packet so the gNB can map flows to data radio bearers.

The key hierarchy from authentication is worth saying out loud: K (in the SIM and the UDM) → CK and IK → K_AUSF → K_SEAF → K_AMF → K_NASint, K_NASenc, K_gNB → K_RRCint, K_RRCenc, K_UPint, K_UPenc. Ten keys, all derived from one long-term secret that never leaves the SIM card or the UDM.

## Where it shows up in production

**3GPP and every mobile carrier on Earth.** About nine billion subscriptions per the GSMA's 2024 figures — the largest wireless protocol family by user count. 3GPP itself is a partnership of seven organisational partners: ETSI in Europe, ARIB and TTC in Japan, ATIS in North America, CCSA in China, TSDSI in India, TTA in Korea. Every cellular phone on Earth runs 3GPP at the radio layer.

**Reliance Jio.** India's Jio operates the largest single-operator 5G-SA deployment on the planet — about 23.7 million 5G-SA subscribers on its in-house cloud-native 5G core by Q3 2025, on top of about 470 million total cellular subscribers. The network averages about 6.5 petabytes per day. It launched in October 2022 on 700 MHz, 3.5 GHz, and 26 GHz mmWave; near-complete pan-India coverage by end of 2023; about a million cells operational by December 2023. The economic experiment is whether a hyperscale cloud-native core can run a national-scale carrier without legacy EPC dependencies. So far the answer is yes.

**T-Mobile USA plus SpaceX Starlink.** T-Satellite by T-Mobile opened to the public in January 2025 and launched commercially on 23 July 2025. About 657 Starlink direct-to-cell satellites in orbit by mid-2025, broadcasting cellular-band signals via 3GPP-compliant NTN radio profiles from Release 17. Standard band n25 and n26 phones connect for SMS and emergency messaging without any app. Voice and data added in October 2025. Apps that work over satellite include WhatsApp, Google Maps, AllTrails, X, AccuWeather, plus 911 texting. T-Mobile Experience Beyond customers get it free; Verizon and AT&T users pay ten dollars a month.

**AT&T plus AST SpaceMobile.** Definitive commercial agreement signed 15 May 2024, running through 2030. The first five BlueBird satellites launched 12 September 2024. Commercial beta planned for the first half of 2026 with 45 to 60 satellites by the end of 2026. Verizon also signed for the same constellation; Apple's Globalstar partnership and Apple's own iPhone Emergency SOS round out the satellite-direct-to-cell story.

**DISH Wireless / EchoStar / Boost.** The first commercial 5G-SA network running on a public cloud — Nokia 5G-SA Core on AWS Wavelength and AWS Local Zones, announced June 2021, launched 2022. Proves the cloud-native architecture works in production. Rakuten Symphony in Japan and Open5GS-based deployments worldwide follow the same pattern.

**Vodafone UK.** First commercial Open RAN macro network in the country — Samsung vRAN and radios, NEC massive MIMO, Dell servers, Wind River cloud platform. First site live in Bath in 2022; pushing toward 2,500 sites by 2027. Replaced Huawei base stations across Wales and Scotland in November 2024. Samsung remains the primary Open RAN partner across Vodafone's pan-European Spring 6 tender.

**Rakuten Mobile and Rakuten Symphony.** Japan's first fully cloud-native, Open RAN nationwide network — over 300,000 cells. The world's first nationwide RAN Intelligent Controller went into commercial operation in May 2025. Multi-vendor third-party rApps live in February 2026; the energy-saving rApps cut RAN power 15 to 20 percent.

**China Mobile.** The largest 5G network on Earth — about 2.287 million 5G base stations as of November 2022, per the China Academy of Information and Communications Technology. China Mobile drives much of 3GPP's Release 18 and 19 architecture work via SA2.

**Verizon C-band.** 3.7 to 3.98 GHz on n77, with the long FAA altimeter saga finally closed by the end of September 2023 when the entire US airline fleet had been retrofitted. The full-power coexistence framework runs to at least 1 January 2028.

## Things that go wrong

**T-Mobile USA, 15 June 2020 — VoLTE/IMS overload, 911 outage, $19.5 million fine.** A single failed leased fibre link cascaded because an IMS-registration node had a latent software bug that prevented proper failover, and a routing misconfiguration redirected traffic through the wrong path. The outage lasted twelve hours and thirteen minutes. At least 41 percent of calls failed, including 23,621 failed 911 calls. The FCC fined T-Mobile 19.5 million dollars in November 2021. The lesson the industry took home: VoLTE and VoNR depend on IMS, IMS depends on a chain of stateful nodes, and the failover modes of those nodes matter more than the radio.

**Optus Australia, 8 November 2023 — BGP route flood, 14-hour nationwide outage.** A planned software upgrade on a sibling Singtel router triggered an unexpected flood of BGP announcements — Cloudflare measured the spike from under 3,000 to over 940,000 announcements per hour. Optus routers hit their max-prefix limits and self-isolated to protect their RIB. Because the out-of-band management network shared the same control plane, engineers were locked out and had to physically travel to over 100 sites. About ten million users and 400,000 businesses affected; 228 emergency triple-zero calls failed. Australia later passed a 12 million Australian-dollar ACMA fine and instituted the Bean Review. The lesson: when your management plane shares fate with your data plane, you don't get to fix anything once it breaks.

**FAA versus C-band 5G, 2021 to 2023.** When the FCC auctioned the 3.7–3.98 GHz C-band to Verizon and AT&T, the FAA raised concerns that radar altimeters using 4.2–4.4 GHz could see interference. Initial deployment scheduled for 5 January 2022 was deferred twice, then launched on 19 January 2022 with buffer zones around 50 priority airports. AT&T and Verizon agreed to maintain mitigations until 1 July 2023 to allow altimeter retrofits. By the end of September 2023 the entire US airline fleet was retrofitted and full-power deployment proceeded. The lesson: spectrum auctions assume guard-band assumptions that the receivers may not actually meet, and the regulators in the next band over can be the ones to find out.

**IMSI catchers — Stingrays, Hailstorms, KingFish.** Devices that broadcast a stronger-than-real-tower pilot and force phones to associate, then downgrade 4G or 5G connections to 2G or 3G where mutual authentication was weaker. DHS publicly acknowledged unauthorised IMSI catchers in the Washington DC area in 2018 in congressional testimony. LTE made these harder but did not eliminate them, because IMSI was sent in cleartext during the initial attach. 5G's SUCI plus mandatory mutual auth — and, in Release 16, optional false-base-station detection — close the gap when 2G and 3G fallback is also disabled.

**SS7 and Diameter signalling abuse.** SS7, the 1970s PSTN inter-carrier signalling protocol, still bridges cellular roaming. Tobias Engel at 31C3 in 2014 and Karsten Nohl at the same conference showed that SS7 MAP messages can locate any cell phone globally by IMSI and intercept SMS — including bank two-factor codes — using nothing more than commercial carrier interconnect access. Diameter, the LTE replacement, is theoretically better but has similar trust-based weaknesses. The DHS 2017–18 mobile security report stated US carriers remain vulnerable.

**ASN.1 parser CVEs in baseband stacks.** A recurring class. Project Zero showed in 2023 that Samsung Exynos baseband had several internet-to-baseband ASN.1-handling vulnerabilities exploitable by sending crafted NAS messages.

The chapter episode "Cellular: 4G LTE plus 5G NR plus the 3GPP machine" carries the longer story-form treatment of these incidents.

## Common pitfalls (for the practitioner)

**IPv6-only carriers plus IPv4-literal apps.** On modern carriers — T-Mobile USA, Reliance Jio, parts of Verizon and Deutsche Telekom — the UE receives only an IPv6 prefix. Legacy IPv4 destinations are reached via 464XLAT (RFC 6877): a CLAT on the UE, a PLAT/NAT64 at the operator. Symptom: apps with hardcoded IPv4 literals (`socket.connect("8.8.8.8")`) silently fail. Cure: always resolve via DNS, always prefer IPv6 (`getaddrinfo`, `AF_UNSPEC`); request an IPv4v6 PDU session type, never IPv4-only.

**PMTU black holes on the GTP tunnel.** Many cellular networks drop ICMPv4 Type 3 Code 4 (Fragmentation Needed) on the SGi/N6 side. The MTU on a GTP-U tunnel is 1500 minus 8 (UDP) minus 20 or 40 (IP) minus 8 (GTP-U) minus IPsec overhead — typically 1430 to 1452 inner bytes. Symptom: TCP works but mysteriously stalls on big payloads; QUIC silently degrades. Cure: TCP MSS clamping at the PGW or UPF for TCP; PLPMTUD per RFC 8899 for QUIC and any other UDP-based protocol.

**IPsec is mandatory on every backhaul hop.** 3GPP TS 33.401 (LTE) and TS 33.501 (5G) mandate IPsec on every S1, X2, N2, N3, Xn, F1, and E1 interface. Forgetting this in a private-5G deployment is the single most common compliance-audit failure. Cure: terminate every gNB-to-core hop in IPsec ESP with IKEv2; do not run plain GTP-U on any link that leaves the secure perimeter.

**VoLTE / VoNR codec mismatch.** AMR-NB at 12.2 kbit/s is the universal lowest common denominator. AMR-WB (HD Voice) works between same-vendor handsets but inter-operator roaming often falls back to NB. EVS (Enhanced Voice Services), introduced in Release 12, is the modern default but requires both IMS networks to advertise it in the SDP. Mismatch symptom: one-way audio after handoff.

**eSIM provisioning failures.** SM-DP+ activation codes can fail with non-obvious symptoms when the eUICC is from a different manufacturer than the OEM defaults — RSP profiles have to match — or when the carrier's EID whitelist isn't updated.

**NSA versus SA misconfiguration.** A handset configured for SA on a network that only has NSA will sit on LTE only and never light the 5G icon; the reverse leaves slicing, URLLC, and VoNR inaccessible. Always check the UE capability and APN/DNN configuration when troubleshooting.

**Carrier-grade NAT.** Most cellular UEs sit behind a CGN; inbound connections are impossible without a separate signalling channel. This is why mobile push-notification services exist at all.

## Debugging it

**Wireshark** has first-class dissectors for GTP-U, GTP-C, S1AP, NGAP, NAS-EPS, NAS-5GS, RRC, F1AP, E1AP, PFCP, Diameter, and SCTP. The RRC and NAS dissectors are auto-generated from the ASN.1 spec text and are remarkably complete. Standard incantation for capturing the NGAP control plane on a local testbed:

```sh
sudo tshark -i lo -f 'sctp port 38412' -V
```

That will decode NAS Registration Request, NAS Authentication, Security Mode, Registration Accept, and PDU Session Establishment in real time.

**srsRAN Project** is the open-source 5G gNodeB plus 4G eNodeB plus 5G Core or 4G EPC stack from Software Radio Systems. It is the closest you can get to "run your own carrier" on a laptop. Install on Ubuntu 24.04+:

```sh
sudo apt install srsran-project open5gs
```

A minimal `gnb.yml` points the gNB at the Open5GS AMF on loopback (NGAP/SCTP port 38412), uses the ZMQ device driver instead of real hardware, and configures a single 10 MHz cell on band n3 (1800 MHz FDD) at numerology 0:

```yaml
cu_cp:
  amf:
    addr: 127.0.0.5
    port: 38412
    bind_addr: 127.0.0.1
ru_sdr:
  device_driver: zmq
cell_cfg:
  dl_arfcn: 368500
  band: 3
  channel_bandwidth_MHz: 10
  common_scs: 15
  plmn: "00101"
  tac: 7
```

Then start the Open5GS network functions: `open5gs-amfd`, `open5gs-smfd`, `open5gs-upfd`, `open5gs-ausfd`, `open5gs-udmd`, `open5gs-pcfd`, `open5gs-nrfd`, `open5gs-udrd`. Run a UE in another container — srsUE, OpenAirInterface, or a USIM-emulator — and Wireshark will dissect the whole attach.

**Open5GS** is the open-source 4G EPC plus 5G SA core; pairs cleanly with srsRAN's gNB. **free5GC** is the pure-Go 5G core; great for studying SBA traffic with the Go debugger. **OpenAirInterface (OAI)** from EURECOM has the deepest PHY simulation for research work.

**pycrate** lets you read and write 5G NAS, S1AP, and NGAP messages directly in Python, useful for unit-testing baseband stacks and for fuzzing.

For OEM-level debugging, **QXDM and QCAT** from Qualcomm and **Apple Sysdiagnose** are closed-source but indispensable; for UPF-side visibility on Linux, `lsmod | grep gtp` confirms the GTP kernel module is loaded and PFCP traces between SMF and UPF dissect cleanly in Wireshark.

## What's changing in 2026

**February 2026 — Rakuten Symphony nationwide RIC plus third-party rApps.** Multi-vendor third-party rApps went live across Rakuten Mobile's RAN Intelligent Controller; the energy-saving rApps cut RAN power consumption 15 to 20 percent. First commercial proof point that ML-driven energy management in the RAN actually moves the needle.

**January 2026 — AT&T and AST SpaceMobile move toward commercial beta.** With the BlueBird 6 satellite deployment, AST SpaceMobile is on track for the H1 2026 commercial beta promised in the May 2024 agreement, targeting 45 to 60 satellites by the end of 2026.

**October 2025 — T-Satellite adds data and voice.** T-Mobile and SpaceX added voice and data on top of the SMS/emergency baseline. 34 satellite-ready apps work over the link.

**September 2025 — Reliance Jio crosses 24 million 5G-SA subscribers.** The largest pan-national SA deployment by subscriber count, on an in-house cloud-native 5G core averaging 6.5 petabytes per day.

**July 2025 — T-Satellite goes commercial.** After 18 months of beta, T-Satellite by T-Mobile opened to the public on 23 July 2025. Standard band n25/n26 phones connect to low-Earth-orbit Starlink satellites for SMS and emergency messaging, no app. The first time "no signal" stops meaning no signal.

**May 2025 — Rakuten nationwide RIC live.** Rakuten Mobile and Rakuten Symphony deployed the world's first nationwide RAN Intelligent Controller in commercial operation.

**November 2024 — Vodafone UK Open RAN production.** Vodafone switched on the first commercial Open RAN macro network in the UK, replacing Huawei base stations across Wales and Scotland with Samsung radios, NEC baseband, and Wind River cloud platform.

**June 2024 — 5G-Advanced (Release 18) frozen.** On 18 June 2024 at the 3GPP SA#104 plenary in Shanghai, Release 18 was frozen with ASN.1 and OpenAPI finalised in the same window. New features: AI/ML in the air interface (CSI feedback compression, beam-management prediction), Reduced Capability ("RedCap") devices for wearables, sidelink-based Vehicle-to-Everything, network energy savings, IVAS spatial audio, and the first concrete Non-Terrestrial Network normative work. Release 19 is targeted to complete by end of 2025; Release 20 study items for 6G are already kicking off.

**Looking forward — 6G via Release 20 and ITU-R M.2160.** ITU-R published Recommendation M.2160 in November 2023, defining the IMT-2030 framework with six usage scenarios: immersive communication, hyper-reliable low-latency communication, massive communication, ubiquitous connectivity, AI-and-communication, and integrated sensing-and-communication. Spectrum candidates include 7–24 GHz "FR3" and sub-THz bands above 100 GHz. Commercial 6G is not expected before about 2030.

**Reconfigurable Intelligent Surfaces.** Programmable passive reflector arrays. Heavy 2025 research interest in 3GPP RAN1; not yet a normative work item in Release 19 but expected in Release 20.

**Quantum-safe crypto for SUCI.** ETSI and 3GPP SA3 are studying post-quantum primitives to replace ECIES; nothing normative as of May 2026.

## Fun facts (host material)

**The first cellular call was a troll.** 3 April 1973, Sixth Avenue, Manhattan. Marty Cooper of Motorola dialled Joel Engel at AT&T Bell Labs — his direct rival in the cellular-system fight — and said: "Joel, this is Marty. I'm calling you from a cell phone, a real handheld portable cell phone." Engel, by Cooper's account, claims not to remember the call. The DynaTAC prototype weighed 2.5 pounds and gave 35 minutes of talk time after 10 hours of charging. Cooper himself: "The battery lifetime wasn't really a problem because you couldn't hold that phone up for that long."

**Viterbi did not patent his most famous algorithm.** "On advice of a lawyer, Viterbi did not patent the algorithm." The Viterbi algorithm — convolutional code decoding, 1967 — is used in every cellular phone, every disk-drive read channel, every GPS receiver, and every speech recognizer. It made nothing for Andrew Viterbi directly; it made Qualcomm everything.

**The Mobile Country Code is a private numbering plan you can read on the back of your screen.** The MCC at the start of any IMSI tells you where the SIM was issued. 234 and 235 are the UK; 310 to 316 are the United States; 460 is China; 405 is India; 440 and 441 are Japan; 262 is Germany; 222 is Italy; 208 is France. Roaming bills itemise calls by MCC/MNC pairs — that is what the columns mean.

**The CDMA-versus-GSM wars were existential.** In January 1989 the US CTIA voted for TDMA. Later that year Irwin Jacobs presented CDMA, and "no one found a hole in the technical presentation" — but the political fight took a decade. Hong Kong shipped first in 1995, then Korea, then the US. CDMA's mathematical foundation eventually became the basis of WCDMA in UMTS, which the GSM camp ended up adopting. The fork closed itself.

**Edholm's Law.** Phil Edholm observed that wireless data rates trail wired by about five years but converge. The "Edholm's law of bandwidth" plot from the early 2000s — wireless, nomadic, and wired data rates all on a single log-linear curve heading for the same point — is one of the most quoted slides in cellular engineering.

**The 5G-Advanced logo was approved in April 2021 — three years before the spec was frozen.** 3GPP only allows itself a new marker once a release set materially advances the system. Release 18, the first one to wear the badge, didn't freeze until 18 June 2024.

## Where this connects in the book

- **Wireless / The shared medium** — Why wireless is a different problem from wired networking: the medium is shared, signals fade, and physics actively conspires against you. The chapter that motivates everything OFDMA, beamforming, and HARQ are designed to fight.
- **Wireless / Cellular — 4G LTE plus 5G NR plus the 3GPP machine** — The historical and architectural arc. Why LTE and NR live in one node here, how the 3GPP release calendar drives industry, the VoLTE and Wi-Fi calling story, the NB-IoT and LTE-M/RedCap branch, and the SS7 and Diameter failure case. Defer the long story to that episode and stay on the wire here.

## See also (other protocol episodes)

**The IPsec episode.** Cellular is the single largest IPsec deployment on Earth — every gNB and every ng-eNB is an IPsec endpoint per TS 33.501 §9. If you've heard the IPsec episode and wondered who actually runs all that ESP, the answer is your phone bill.

**The HTTP/2 episode.** Every control-plane call inside a 5G core — AMF to SMF, AMF to AUSF, AUSF to UDM, anything talking to the NRF — is HTTP/2 over TCP with JSON payloads protected by TLS. The 5G core is a microservice fabric with a Kubernetes shape, and the SBI naming scheme (Nausf, Nudm, Namf, Nsmf) is just a reverse-DNS-style namespace on top of HTTP/2.

**The QUIC episode.** Cellular is the perfect case for QUIC's connection migration: a UE keeps its IP across handovers between base stations because GTP-U preserves the inner address, and QUIC's Connection ID survives the IP changes that happen when the radio moves between cells or between cellular and Wi-Fi. 3GPP is studying QUIC as the SBA transport for later releases.

**The TCP and UDP episodes.** Both ride inside GTP-U on the radio leg. Cellular's variable latency and occasional packet drops are the main reason TCP CUBIC and BBR were tuned the way they were.

**The IPv6 episode.** Cellular has been the largest single driver of real-world IPv6 deployment: T-Mobile USA's network has been IPv6-only for the UE-facing leg since 2014, using 464XLAT to reach IPv4 destinations. If you've heard the IPv6 episode, this is where you find out who actually runs IPv6 at scale.

**The TLS episode.** Every SBI hop inside 5GC terminates TLS; SEPP-to-SEPP roaming uses TLS 1.3 with the PRINS protocol layered on top for application-layer protection of the N32-f interface.

**The SIP, RTP, and SDP episodes.** VoLTE and VoNR are SIP signalling and RTP media over IMS, carried in dedicated QoS-flagged bearers — LTE QCI 1, NR 5QI 1.

**The WebRTC episode.** Increasingly the alternative voice path; cellular is the bottom layer that carries it.

**The Wi-Fi episode.** 3GPP defines untrusted non-3GPP access via N3IWF (5G) and ePDG (LTE), letting a UE attach to the 5G core over any Wi-Fi link via IPsec tunnels. ATSSS — Access Traffic Steering, Switching, Splitting — uses MPTCP and MP-QUIC to combine the two radios.

**The DNS episode.** UEs receive DNS servers via NAS in the PDU Session Establishment Accept; the 5GC itself uses DNS internally for NF discovery as a fallback to the NRF.

## Visual cues for image generation

- A side-by-side architecture diagram. On the left, the LTE EPC: a fixed set of named boxes — MME, SGW, PGW, HSS, PCRF — connected by labelled point-to-point interfaces (S1-MME, S1-U, S5, S6a, Gx). On the right, the 5GC: a cloud of round nodes — AMF, SMF, UPF, AUSF, UDM, PCF, NRF, NEF, NSSF, AF — all wired to a central NRF service registry, every line annotated "HTTP/2 + JSON over TLS".
- A 5G NR resource grid. Time on the x-axis (one 1 ms slot at numerology 0, narrowing to 125 microseconds at numerology 3), frequency on the y-axis (12 subcarriers per resource block). Five overlaid grids show the five numerologies — 15, 30, 60, 120, 240 kHz — with the FR1 cases tinted blue and the FR2 mmWave cases tinted red.
- A single packet on its way out of a phone, drawn as nested envelopes. Innermost: an IPv6 packet to 2606:4700:4700::1111. Around it: a GTP-U header with TEID 0xCAFEF00D and QFI 9. Around that: UDP source and destination port 2152. Around that: an IPsec ESP envelope with SPI 0xC0FFEE02 and a sequence number.
- The 5G initial-registration sequence diagram, eight columns: UE, gNB, AMF, AUSF, UDM, SMF, UPF, internet. Eight numbered horizontal arrows for the eight beats. The N2 and N3 arrows are highlighted in red and labelled "IPsec ESP".
- A Starlink Direct-to-Cell satellite at 600 km, beam falling on a stock smartphone in a desert. Annotation: "Standard band n25/n26 phone. No app. 3GPP NR-NTN profile (Release 17). Commercial since 23 July 2025."
- The SUCI computation: a SUPI (an IMSI like 234150999999999) on the left, the home-network public key (ECIES Profile A, Curve25519) feeding into an ECIES box, a SUCI ciphertext on the right being sent over the air. Caption: "The single biggest privacy upgrade of 5G versus LTE."

## Sources

### 3GPP specifications and releases

- [3GPP — Release 18](https://www.3gpp.org/specifications-technologies/releases/release-18)
- [3GPP — Release 15](https://www.3gpp.org/specifications-technologies/releases/release-15)
- [3GPP — System of Parallel Releases](https://www.3gpp.org/specifications-technologies/releases)
- [3GPP — 5G System Overview](https://www.3gpp.org/technologies/5g-system-overview)
- [3GPP — Introducing 3GPP](https://www.3gpp.org/about-us/introducing-3gpp)
- [3GPP main site](https://www.3gpp.org/)
- [Tech-Invite — TS 23.501 (5G System Architecture)](https://www.tech-invite.com/3m23/tinv-3gpp-23-501.html)
- [iTecSpec — TS 23.501 archive](https://itecspec.com/archive/3gpp-specification-ts-23-501/)
- [iTecSpec — TS 33.501 §9 (Security procedures for non-service based interfaces)](https://itecspec.com/spec/3gpp-33-501-9-security-procedures-for-non-service-based-interfaces/)
- [ATIS — About 3GPP](https://atis.org/international-partnerships/3gpp/about/)
- [FirstNet — 3GPP moves Release 18 freeze date](https://firstnet.gov/newsroom/blog/3gpp-moves-release-18-freeze-date-march-2024)

### Vendor and engineering blogs

- [Nokia — First 5G-Advanced specification ready for implementation](https://www.nokia.com/blog/first-5g-advanced-specification-is-ready-for-implementation/)
- [Nokia — 5G-Advanced standards](https://www.nokia.com/standardization/technology-standards/5G-advanced/)
- [Nokia — DISH Wireless 5G-SA Core on AWS public cloud](https://www.nokia.com/about-us/news/releases/2022/06/15/)
- [AWS for Industries — 5G mobile packet core as a cloud workload](https://aws.amazon.com/blogs/industries/the-5g-mobile-network-core-is-now-a-mature-cloud-workload/)
- [AWS for Industries — Deploying DISH's 5G Network in AWS Cloud](https://aws.amazon.com/blogs/industries/telco-meets-aws-cloud-deploying-dishs-5g-network-in-aws-cloud/)
- [Huawei — 5G-Advanced Architecture Evolution (Release 18)](https://www.huawei.com/en/huaweitech/publication/202301/r18-architectural-5g-evolution)
- [Qualcomm — Setting off the 5G-Advanced evolution](https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/setting_off_the_5g_advanced_evolution_web.pdf)
- [Nick vs Networking — 5G Core: the Service-Based Architecture concept](https://nickvsnetworking.com/5g-core-the-service-based-architecture-concept/)
- [A10 Networks — RAN Security Gateway for Evolving 5G Networks](https://www.a10networks.com/wp-content/uploads/A10-SB-19204-EN.pdf)
- [NGMN — Security in LTE Backhauling](https://www.ngmn.org/wp-content/uploads/NGMN_Whitepaper_Backhaul_Security.pdf)
- [Heavy Reading via Juniper — Security Vulnerabilities of LTE](https://www.juniper.net/assets/uk/en/local/pdf/additional-resources/lte-security-wp.pdf)
- [LinkedIn — David Soldani, 5G Security Controls and Assurance](https://www.linkedin.com/pulse/5g-security-controls-assurance-dr-david-soldani)
- [Vodafone — Selects key partners for Open RAN](https://www.vodafone.com/news/newsroom/corporate-and-financial/vodafone-europe-first-commercial-open-ran-network)
- [TelecomTV — Vodafone Open RAN UK vendors](https://www.telecomtv.com/content/open-ran/vodafone-unveils-its-open-ran-vendors-for-uk-rollout-41674/)
- [Telecoms.com — Samsung and NEC win Vodafone OpenRAN](https://www.telecoms.com/open-ran/big-wins-for-samsung-and-nec-as-vodafone-reveals-openran-suppliers)
- [Light Reading — Vodafone UK pushes Open RAN past faulty towers](https://www.lightreading.com/open-ran/vodafone-uk-pushes-open-ran-past-faulty-towers-with-nec-missing)
- [Light Reading — Vodafone site tender delayed](https://www.lightreading.com/open-ran/vodafone-site-tender-looks-badly-delayed-and-diminished)
- [Fierce Network — Vodafone on track with open RAN rollout](https://www.fierce-network.com/wireless/vodafone-says-its-track-open-ran-rollout-plans)
- [SDxCentral — Samsung will keep open RAN alive for Vodafone](https://www.sdxcentral.com/news/samsung-will-keep-open-ran-alive-for-vodafone-despite-uk-5g-snub/)
- [Rakuten Symphony — Nationwide RIC platform deployment](https://symphony.rakuten.com/newsroom/rakuten-mobile-and-rakuten-symphony-deploy-intelligent-ai-powered-ric-platform-in-rakutens-4g-and-5g-open-ran-network-in-japan-setting-the-stage-for-sustainable-mobile-connectivity)
- [Rakuten Symphony — Third-party rApp integration and nationwide RIC](https://symphony.rakuten.com/newsroom/rakuten-mobile-and-rakuten-symphony-advance-open-ran-innovation-with-third-party-rapp-integration-and-nationwide-ric-deployment)
- [T-Mobile — T-Satellite product page](https://www.t-mobile.com/coverage/satellite-phone-service)
- [T-Mobile newsroom — T-Satellite is here, now powering apps](https://www.t-mobile.com/news/network/t-satellite-data-ready-app-expansion)
- [Starlink — Direct to Cell service brief](https://starlink.com/public-files/DIRECT_TO_CELL_SERVICE_FEB_25.pdf)
- [AT&T — AST SpaceMobile commercial agreement](https://about.att.com/story/2024/ast-spacemobile-commercial-agreement.html)
- [AT&T — AST SpaceMobile satellite video call](https://about.att.com/story/2025/ast-spacemobile-video-call.html)

### News

- [Broadband Breakfast — T-Mobile and Starlink launch July 23](https://broadbandbreakfast.com/t-mobile-and-starlink-satellite-service-to-officially-launch-july-23/)
- [Wireless Estimator — T-Mobile launches T-Satellite](https://wirelessestimator.com/articles/2025/t-mobile-to-launch-t-satellite-first-u-s-satellite-to-phone-service-with-spacexs-starlink/)
- [GeekWire — T-Mobile Super Bowl satellite-to-cell beta](https://www.geekwire.com/2025/t-mobile-uses-super-bowl-ad-to-officially-launch-public-beta-of-satellite-to-cell-texting-via-starlink/)
- [Via Satellite — AT&T and AST SpaceMobile commercial agreement](https://www.satellitetoday.com/connectivity/2024/05/16/att-signs-commercial-agreement-with-ast-spacemobile-for-satellite-to-cell-service/)
- [SatNews — AT&T, AST SpaceMobile after BlueBird 6](https://satnews.com/2026/01/01/att-ast-spacemobile-advance-satellite-to-cell-expansion-following-bluebird-6-deployment/)
- [Business Wire — AST SpaceMobile strategic investment from AT&T, Google, Vodafone](https://www.businesswire.com/news/home/20240118463570/en/)
- [FCC — June 15 2020 T-Mobile Network Outage Report](https://docs.fcc.gov/public/attachments/DOC-367699A1.pdf)
- [Fierce Network — T-Mobile $19.5M FCC fine](https://www.fierce-network.com/wireless/t-mobile-pay-195m-fine-related-911-outage-june-2020)
- [TmoNews — FCC says T-Mobile didn't follow best practices](https://www.tmonews.com/2020/10/fcc-t-mobile-outage-not-follow-network-reliability-best-practices/)
- [APNIC — Call the routing police (Optus)](https://blog.apnic.net/2023/11/23/call-the-routing-police/)
- [Kentik — Digging into the Optus Outage](https://www.kentik.com/blog/digging-into-the-optus-outage/)
- [ISOC Pulse — Optus outage exposes Australia's resilience](https://pulse.internetsociety.org/blog/optus-outage-exposes-australias-internet-resilience)
- [Parliament of Australia — Analysis of the Optus National Outage](https://www.aph.gov.au/DocumentStore.ashx?id=1da6a80a-2710-481e-b7b9-720621e528e0&subId=750779)
- [ACS Information Age — Optus reveals cause](https://ia.acs.org.au/article/2023/optus-reveals-cause-of-nationwide-outage.html)
- [FAA — 5G and Aviation Safety](https://www.faa.gov/5g)
- [FAA — Statements on 5G](https://www.faa.gov/newsroom/faa-statements-5g)
- [AAAE — FAA C-Band altimeter retrofit deadline update](https://alerts.aaae.org/latest/regulatory_63023)
- [Aviation Today — Latest C-band 5G delay](https://www.aviationtoday.com/2022/01/04/latest-c-band-5g-delay-allows-att-verizon-address-aircraft-radar-altimeter-concerns/)
- [5G Americas — 5G & Aviation](https://www.5gamericas.org/5g-aviation/)
- [Engadget — AT&T and Verizon give FAA another year](https://www.engadget.com/faa-c-band-5g-verizon-att-airports-altimeters-183206836.html)
- [TelecomTV — Release 15 frozen](https://www.telecomtv.com/content/5g/3gpp-release-15-frozen-first-phase-of-5g-standards-complete-31259/)
- [AnandTech — 3GPP completes first 5G NR specification](https://www.anandtech.com/show/12182/3gpp-completes-first-5g-nr-specification-for-release-15)
- [C114 — 3GPP Rel-18 freeze](https://m.c114.com.cn/w577-1268603.html)
- [IEEE Spectrum — 3GPP Release 15 Overview](https://spectrum.ieee.org/3gpp-release-15-overview)
- [TechTarget — 3GPP 5G releases overview](https://www.techtarget.com/searchnetworking/feature/An-overview-of-3GPP-5G-releases-and-what-each-one-means)
- [The Mobile Network — 4G hype leading to LTE security shortcuts](https://the-mobile-network.com/2013/04/4g-hype-leading-to-lte-security-shortcuts/)
- [Ericsson Mobility Report — 5G SA in India (Jio)](https://www.ericsson.com/en/reports-and-papers/mobility-report/articles/5g-standalone-india-jio)
- [RCR Wireless — Jio pan-India 5G FWA](https://www.rcrwireless.com/20240122/5g/jio-reach-pan-india-coverage-5g-fwa-service-h1-2024)
- [RCR Wireless — Jio to complete national 5G rollout by year-end](https://www.rcrwireless.com/20230829/5g/jio-complete-national-5g-rollout-end-year)
- [Light Reading — India's Jio reveals 5G launch timeline](https://www.lightreading.com/5g/india-s-jio-reveals-5g-launch-timeline-vendors-and-more)
- [CBS News — Cell phone turns 40](https://www.cbsnews.com/news/cell-phone-turns-40-martin-coopers-first-call-on-the-dynatac/)
- [CNN — 50 years ago, he made the first cell phone call](https://www.cnn.com/2023/04/03/tech/cell-phone-turns-50/index.html)
- [Smithsonian Magazine — From "the Brick" to the iPhone](https://www.smithsonianmag.com/innovation/from-the-brick-to-the-iphone-the-cellphone-celebrates-50-years-180981910/)
- [CyberScoop — DHS, SS7, Stingrays, IMSI catchers](https://cyberscoop.com/ss7-stingrays-imsi-catchers-chris-krebs-dhs-ron-wyden/)
- [US Congress — Bolstering Data Privacy and Mobile Security hearing](https://www.congress.gov/115/chrg/CHRG-115hhrg30878/CHRG-115hhrg30878.htm)
- [Cellcrypt — Air-interface threats](https://www.cellcrypt.com/threats/air-interface/)

### Papers and references

- [NIST SP 800-187 — Guide to LTE Security](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-187.pdf)
- [Award Solutions — 5G OFDM Numerologies](https://www.awardsolutions.com/portal/resources/5g-numerologies)
- [Techplayon — 5G Numerology / Subcarrier Spacing](https://www.techplayon.com/5g-nr-numerology-subcarrier-spcaing-scs/)
- [Sharetechnote — Numerology / SCS in detail](https://www.sharetechnote.com/html/5G/5G_Phy_Numerology.html)
- [3glteinfo — 5G Numerology and Subcarrier Spacing](https://www.3glteinfo.com/5g/protocols/phy/numerology-and-subcarrier-spacing/)
- [Telecom Trainer — 5G NR Numerology explained](https://www.telecomtrainer.com/5g-nr-numerology-explained-subcarrier-spacing-symbol-duration-and-scheduling-intervals/)
- [RF Essentials — 5G NR FR2 band definition](https://rfessentials.com/rf-knowledge-base/what-is-the-fr2-band-in-5g-nr-and-what-are-the-defined-operating-bands/)
- [nrexplained — Bandwidth](https://www.nrexplained.com/bandwidth)
- [Wireless History Foundation — Andrew Viterbi](https://wirelesshistoryfoundation.org/andrew-viterbi/)
- [Wireless History Foundation — Irwin Jacobs](https://wirelesshistoryfoundation.org/irwin-jacobs/)
- [ETHW — Oral History: Irwin Jacobs](https://ethw.org/Oral-History:Irwin_Jacobs)
- [USC Viterbi — About Andrew Viterbi](https://viterbischool.usc.edu/about-andrew-viterbi/)
- [National Inventors Hall of Fame — Andrew Viterbi](https://www.invent.org/inductees/andrew-j-viterbi)
- [National Inventors Hall of Fame — Irwin Mark Jacobs](https://www.invent.org/inductees/irwin-mark-jacobs)
- [Quartr — Jacobs and Viterbi: Qualcomm's pioneering founders](https://quartr.com/insights/business-philosophy/irwin-jacobs-andrew-viterbi-qualcomms-pioneering-founders)
- [Britannica — Martin Cooper biography](https://www.britannica.com/biography/Martin-Cooper)
- [Devopedia — 3GPP](https://devopedia.org/3gpp)

### Wikipedia

- [5G NR](https://en.wikipedia.org/wiki/5G_NR)
- [3GPP](https://en.wikipedia.org/wiki/3GPP)
- [Martin Cooper (inventor)](https://en.wikipedia.org/wiki/Martin_Cooper_(inventor))
- [Andrew Viterbi](https://en.wikipedia.org/wiki/Andrew_Viterbi)
- [Irwin M. Jacobs](https://en.wikipedia.org/wiki/Irwin_M._Jacobs)
- [IMSI-catcher](https://en.wikipedia.org/wiki/IMSI-catcher)
- [2023 Optus outage](https://en.wikipedia.org/wiki/2023_Optus_outage)
- [AST SpaceMobile](https://en.wikipedia.org/wiki/AST_SpaceMobile)
- [EFF Street-Level Surveillance — Cell-Site Simulators / IMSI Catchers](https://sls.eff.org/technologies/cell-site-simulators-imsi-catchers)
