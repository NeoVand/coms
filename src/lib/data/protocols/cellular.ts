import type { Protocol } from '../types';

export const cellular: Protocol = {
	id: 'cellular',
	name: 'Cellular (4G LTE + 5G NR)',
	abbreviation: '4G / 5G',
	categoryId: 'wireless',
	port: undefined,
	year: 2008,
	rfc: '3GPP TS 36.300 / 38.300',
	oneLiner:
		'The {{3gpp|3GPP}} radio family that gets a phone an {{ip-address|IP address}} from a base station 50 km away — every modern smartphone, every IoT cellular module, ~9 billion subscriptions, the largest wireless deployment on Earth.',
	overview: `**Cellular** in 2026 is two protocols braided into one ecosystem: **4G {{lte|LTE}}** ({{3gpp|3GPP}} Release 8, December 2008 — still the universal floor) and **{{5g-nr|5G NR}}** (Release 15, June 2018 — the current normative baseline). Both share the {{3gpp|3GPP}} standards body, the same air-interface design philosophy ({{ofdma|OFDMA}} + flexible numerology + {{harq|HARQ}}), an [[ipsec|IPsec]] envelope on untrusted backhaul links (mandatory to support, required outside trusted transport), and an [[ipv6|IPv6]] mandate that has been quietly migrating every major carrier's user-plane to IPv6-only since ~2020. We treat them as one encyclopedia node the way [[bluetooth|Bluetooth Classic + BLE]] is one node — the {{sig|SIG}} and the radio diverge but the consumer story is unified.

The radio stack is the headline. **{{phy|PHY}}** ({{3gpp|3GPP}} {{ts-3gpp|TS}} 38.211–214) carries {{ofdma|OFDMA}} with scalable numerologies — 15/30/60 kHz subcarrier spacing in FR1, 60/120 kHz in {{mmwave|mmWave}} FR2 (240 kHz is reserved for sync signals; Rel-17 added 480/960 kHz for FR2-2 up to 71 GHz) — letting the same protocol address every band. **{{mac-address|MAC}}** does hybrid ARQ over parallel stop-and-wait {{retransmission|retransmission}} processes (8 in LTE; up to 16 in NR, 32 since Rel-17). **RLC** handles {{fragmentation|segmentation and reassembly}} across 6/12-bit (UM) or 12/18-bit (AM) {{sequence-number|sequence numbers}} in NR. **PDCP** does {{header|header compression}} (ROHC) and {{aes|AES}}-CTR {{encryption|ciphering}}. **{{rrc|RRC}}** drives the connection state machine — \`RRC_IDLE → CONNECTED → INACTIVE\` for 5G — and **{{nas|NAS}}** carries mobility, {{handshake|authentication}}, and session management end-to-end between the {{ue|UE}} and the core. Above all that, the user plane is just [[ip|IP]] (almost always [[ipv6|IPv6]] now); above *that*, the application runs whatever protocols ordinary internet applications run.

The Core Network is where the architectural revolution between 4G and 5G actually lives. **{{epc|EPC}}** (Evolved Packet Core, {{lte|LTE}}) is a small zoo of named monolithic boxes — {{mme|MME}}, {{sgw-acr|SGW}}, {{pgw|PGW}}, HSS, PCRF, all glued together by GTP and {{diameter|Diameter}}. **5GC** ({{5g-core|5G Core}}, NR-{{security-association|SA}}) is a **{{service-mesh|service-based architecture}}** where dozens of network functions ({{amf|AMF}}, {{smf|SMF}}, {{upf|UPF}}, {{ausf|AUSF}}, {{udm|UDM}}, PCF, NRF, NEF, NSSF, AF…) talk to each other over **[[http2|HTTP/2]] with {{json|JSON}} {{payload|payloads}} protected by [[tls|TLS]]**. The control plane of every modern carrier on Earth is now an [[http2|HTTP/2]] microservice fabric. N2/N3 interfaces between the radio access network and the core are protected with [[ipsec|IPsec ESP]] per {{3gpp|3GPP}} {{ts-3gpp|TS}} 33.501 wherever the transport network isn't trusted/physically secured — collectively still one of the largest [[ipsec|IPsec]] deployments on Earth.

The frontier in 2026 is **5G-Advanced** (Release 18, frozen June 2024; Release 19 in progress; Release 20 study items for 6G already kicking off in 2025), **Open {{ran|RAN}}** deployments (Vodafone UK, Deutsche Telekom, Rakuten Symphony, DISH on {{aws|AWS}} Wavelength), and **satellite {{direct-to-cell|direct-to-cell}}** — T-Mobile + SpaceX {{starlink|Starlink}} launched commercial service in July 2025; AT&T's AST SpaceMobile partnership and {{apple|Apple}}'s Globalstar-based Emergency SOS are reshaping what "no signal" means.`,
	howItWorks: [
		{
			title: 'PHY — OFDMA with five numerologies',
			description:
				'{{5g-nr|5G NR}} carries data on **Orthogonal Frequency-Division Multiple Access** subcarriers spaced at 15, 30, or 60 kHz in FR1 and 60 or 120 kHz in FR2 ({{3gpp|3GPP}} {{ts-3gpp|TS}} 38.211; 240 kHz is SSB-only, and Rel-17 added 480/960 kHz for FR2-2). The choice is the *numerology* — smaller spacing = longer symbols = more robust at low frequencies; larger spacing = shorter symbols = required at {{mmwave|mmWave}}. One framework, very different deployment regimes (FR1 sub-6 GHz, FR2 {{mmwave|mmWave}} 24.25–52.6 GHz, FR2-2 to 71 GHz).'
		},
		{
			title: 'MAC — Hybrid ARQ',
			description:
				"**{{harq|HARQ}}** combines forward error correction with {{retransmission|retransmission}}. The receiver stores soft-decoded LLRs from failed transmissions and combines them with the retransmitted copy (chase-combining or incremental-redundancy). Parallel stop-and-wait processes per {{ue|UE}} — 8 in LTE (3-bit {{id-identifier|ID}}), up to 16 in {{5g-nr|5G NR}} Rel-15 and 32 since Rel-17 (4/5-bit field) — keep the pipe full without {{head-of-line-blocking|head-of-line blocking}}. Why cellular gets 99.999% reliability without [[tcp|TCP]]'s retransmit cost on the link."
		},
		{
			title: 'RLC + PDCP — sequence numbers, ciphering, header compression',
			description:
				'**RLC** runs in TM (transparent), UM (unacknowledged), or AM (acknowledged) mode with 6/12-bit (UM) or 12/18-bit (AM) {{sequence-number|sequence numbers}} in NR ({{ts-3gpp|TS}} 38.322; LTE used 10/16-bit, TS 36.322). **PDCP** above it ({{ts-3gpp|TS}} 38.323) does ROHC {{header|header compression}} (squashing the 40-byte [[ipv6|IPv6]]+{{tcp-rst|TCP}}/UDP header to 1–4 bytes), {{aes|AES}}-CTR {{encryption|ciphering}}, and 32-bit {{anti-replay|anti-replay}}. The cipher is keyed off K_gNB, derived from the AKA authentication.'
		},
		{
			title: 'RRC — connection state machine',
			description:
				'The Radio Resource Control state machine ({{ts-3gpp|TS}} 38.331) has three states in 5G: `RRC_IDLE` ({{ue|UE}} sleeps, only listens to {{notification|paging}}), `RRC_INACTIVE` (5G-only; {{ue|UE}} keeps security context for fast resume), `RRC_CONNECTED` (full bearer, scheduled). State transitions cost battery — careful {{rrc|RRC}} tuning is the difference between 6-hour and 24-hour battery life on an IoT module.'
		},
		{
			title: 'NAS — authentication, mobility, session management',
			description:
				"**Non-Access Stratum** signalling ({{ts-3gpp|TS}} 24.501) carries end-to-end between {{ue|UE}} and core, transparently through the gNB. **Registration Request** (with **{{suci|SUCI}}** — the {{public-key|public-key-encrypted}} {{supi|SUPI}}) starts the AKA {{handshake|handshake}}; the {{udm|UDM}} decrypts to {{supi|SUPI}}, generates an authentication vector, and the {{ue|UE}}'s USIM verifies AUTN and computes RES*. After Security Mode Command, {{nas|NAS}} is integrity-protected and ciphered with K_NASint / K_NASenc."
		},
		{
			title: '5GC service-based architecture',
			description:
				'The {{5g-core|5G Core}} is a {{service-mesh|microservice fabric}}. {{amf|AMF}}, {{smf|SMF}}, {{upf|UPF}}, {{ausf|AUSF}}, {{udm|UDM}}, PCF, NRF, NEF, NSSF, AF — each is a **network function** with an [[http2|HTTP/2]]+{{json|JSON}} {{api|API}} protected by [[tls|TLS]]. Service-based interfaces are named Nausf, Nudm, Namf, Nsmf, Npcf, Nnrf, Nnef, Nnssf, Naf. The control plane of every 5G carrier on Earth is now an [[http2|HTTP/2]] microservice fabric — with [[ipsec|IPsec ESP]] wrapping any backhaul {{hop|hop}} that crosses untrusted transport.'
		},
		{
			title: 'GTP-U on N3 — the user-plane tunnel',
			description:
				"User-plane {{packet|packets}} between the gNB and the {{upf|UPF}} travel over **{{gtp-u|GTP-U}}** (GPRS Tunnelling Protocol — User plane) on [[udp|UDP]]/2152. Each {{pdu-session|PDU session}} gets a {{tunnel|Tunnel Endpoint Identifier (TEID)}}. The tunnel preserves the {{ue|UE}}'s [[ip|IP]] {{ip-address|address}} as the inner packet's source/destination regardless of which gNB the {{ue|UE}} is camping on — this is how a phone keeps its [[ip|IP]] across handovers between base stations."
		}
	],
	useCases: [
		'Smartphone internet access on every modern phone (~9 billion subscriptions worldwide)',
		'IoT cellular modules — Cat-M1, NB-IoT, RedCap — for asset tracking, fleet telematics, smart-meter backhaul',
		'Fixed-Wireless Access (FWA) — T-Mobile Home Internet, Verizon 5G Home, Reliance Jio AirFiber',
		'Private 5G networks for ports, mines, manufacturing (3GPP "non-public networks")',
		'VoLTE / VoNR voice + Wi-Fi calling handoff',
		'Satellite direct-to-cell — T-Mobile + Starlink, AT&T + AST SpaceMobile, Apple + Globalstar'
	],
	codeExample: {
		language: 'cli',
		code: `# srsRAN Project — open-source 5G gNodeB (pair it with Open5GS for the core);
# the legacy srsRAN 4G suite provides the eNodeB + EPC.
# The closest you can get to "run your own carrier" on a laptop.

# Install on Ubuntu 24.04+
sudo apt install srsran-project open5gs

# Configure a 5G SA gNB + Open5GS 5GC (single-NIC test setup).
# /etc/srsran/gnb.yml
cu_cp:
  amf:
    addr: 127.0.0.5            # AMF (Open5GS) on loopback
    port: 38412                # NGAP/SCTP
    bind_addr: 127.0.0.1
  inactivity_timer: 7200       # RRC_INACTIVE → RRC_IDLE
ru_sdr:
  device_driver: zmq           # software-radio bridge — no hardware needed
  srate: 23.04
  tx_gain: 75
  rx_gain: 75
cell_cfg:
  dl_arfcn: 368500             # n3 (1800 MHz FDD)
  band: 3
  channel_bandwidth_MHz: 10
  common_scs: 15               # numerology 0 (15 kHz subcarrier)
  pci: 1
  plmn: "00101"                # test PLMN — MCC=001, MNC=01
  tac: 7
log:
  filename: /tmp/gnb.log
  all_level: info

# Run the gNB
sudo srsran_gnb -c /etc/srsran/gnb.yml

# In another shell, run Open5GS (the 5GC: AMF, SMF, UPF, AUSF, UDM, ...).
sudo systemctl start open5gs-amfd open5gs-smfd open5gs-upfd \\
  open5gs-ausfd open5gs-udmd open5gs-pcfd open5gs-nrfd \\
  open5gs-udrd

# Then run a UE in another container (srsUE, OAI, or USIM-emulator).
# Capture NGAP traffic between gNB and AMF:
sudo tshark -i lo -f 'sctp port 38412' -V

# Decode NAS Registration Request, NAS Authentication, Security Mode,
# Registration Accept, PDU Session Establishment Request, all in
# real time. Wireshark NGAP/NAS-5GS dissectors handle the whole thing.`,
		caption:
			'A locally-runnable 5G testbed in three commands — srsRAN gNB + Open5GS 5GC + {{wireshark|Wireshark}}. Used by every cellular-protocol researcher in 2026.',
		alternatives: [
			{
				language: 'python',
				code: `# pycrate — read and write 5G NAS / S1AP / NGAP messages directly.
# Useful for unit-testing baseband stacks and for fuzzing.
from pycrate_mobile.NAS5G import parse_NAS5G

# Decode a Registration Request hex blob captured from a UE.
hex_blob = '7e00410100000000010002F839F800020' \\
           '02f839f80000000010100015c0a0000000'
msg, err = parse_NAS5G(bytes.fromhex(hex_blob))
print(msg.show())

# Build a Registration Request from scratch
from pycrate_mobile.TS24501_FGMM import FGMMRegistrationRequest

req = FGMMRegistrationRequest()
req['5GMMHeader']['EPD'].set_val(126)            # 5GMM (0x7E)
req['5GMMHeader']['SecHdr'].set_val(0)           # no security
req['5GMMHeader']['Type'].set_val(0x41)          # Registration Request
req['5GSRegistrationType']['Value'].set_val(1)   # Initial Registration
req['5GSMobileIdentity'].set_val({'Type': 'SUCI', ...})

print(req.to_bytes().hex())`
			},
			{
				language: 'javascript',
				code: `// JavaScript can't actually drive a baseband, but the 5G core is a
// REST/HTTP/2 microservice fabric — you can talk to the Service-Based
// Interface from a Node.js test harness.

// Talk to a mock NRF (Network Repository Function) — service discovery.
import { request } from 'undici';

// Discover an SMF that supports DNN "internet" and S-NSSAI {sst:1, sd:'010203'}
const { body } = await request(
  'https://nrf.5gc.example.com/nnrf-disc/v1/nf-instances' +
  '?target-nf-type=SMF&requester-nf-type=AMF' +
  '&service-names=nsmf-pdusession' +
  '&dnn=internet&snssais=' +
  encodeURIComponent('[{"sst":1,"sd":"010203"}]'),
  {
    method: 'GET',
    headers: { Accept: 'application/json' },
    // mTLS — every NF-to-NF call is mutual-TLS-authenticated per TS 33.501
    rejectUnauthorized: true,
  }
);

const result = await body.json();
console.log('Available SMFs:', result.nfInstances.map(i => i.fqdn));

// → Direct your subsequent Nsmf_PDUSession_CreateSMContext call to one of them.`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'NGAP Initial UE Message (gNB → AMF on SCTP/38412)',
						code: `SCTP DATA chunk
  TSN: 0x12345678
  Stream: 0
  Payload: NGAP InitialUEMessage

NGAP PDU:
  procedureCode: id-InitialUEMessage (15)
  criticality:   ignore
  RAN-UE-NGAP-ID: 12345         (gNB-assigned)
  NAS-PDU:        <NAS Registration Request bytes>
  User Location Information:
    TAI: PLMN=001/01, TAC=0x000007
    NR Cell Identity: 0x00012345A
  RRC Establishment Cause: mo-Signalling`
					},
					{
						title: 'NAS Registration Request (UE → AMF inside the NAS-PDU)',
						code: `5GS Mobility Management header:
  Security Header Type: 0 (plain NAS, not yet protected)
  Procedure Discriminator: 0x7E (5GMM)
  Message Type: 0x41 (Registration Request)

Information elements:
  5GS Registration Type: 0x01 (Initial)
  ngKSI: 0x07 (no key set yet — first attach)
  5GS Mobile Identity:
    Type: SUCI
    SUPI Format: IMSI
    PLMN: 001/01
    Routing Indicator: 0x0001
    Protection Scheme: ECIES Profile A (Curve25519)
    Home Network Public Key ID: 0x00
    Scheme Output: <ECC point + ciphertext + MAC>
  UE Security Capabilities:
    Supported 5G-EA: 0xF0 (NEA0, NEA1, NEA2, NEA3)
    Supported 5G-IA: 0xF0 (NIA0, NIA1, NIA2, NIA3)
  Requested NSSAI:
    S-NSSAI: SST=1 (eMBB), SD=010203`
					},
					{
						title: 'Authentication Response (UE → AMF, after AKA challenge)',
						code: `5GMM Authentication Response (0x57):
  RES* (16 bytes): derived by the phone (ME) from the USIM's outputs

  The USIM checked:
    1. AUTN.SQN is fresh (anti-replay)
    2. AUTN.MAC matches f1(K, SQN, RAND, AMF)
  Then computed (on the USIM):
    RES = f2(K, RAND)
    CK  = f3(K, RAND)
    IK  = f4(K, RAND)
  And the ME derived (TS 33.501 Annex A.4):
    RES* = KDF(CK || IK, serving-network name, RAND, RES)

AMF/SEAF first checks HRES* against HXRES*, then forwards RES* to
AUSF (Nausf_UEAuthentication_Authenticate), which compares it to XRES*.
On success, AUSF returns K_SEAF to AMF and the NAS Security Mode
Command exchange begins — from this point every NAS message is
integrity-protected and ciphered.`
					},
					{
						title: 'GTP-U user-plane packet on N3 (gNB → UPF, UDP/2152)',
						code: `Outer IP header:    src=gNB_addr  dst=UPF_addr  protocol=17 (UDP)
                    (this hop wrapped in IPsec ESP per TS 33.501)

Outer UDP header:   srcPort=random  dstPort=2152

GTP-U header (8 bytes):
  Version: 1
  PT: 1 (GTP, not GTP')
  Flags: E=1 (extension header present)
  Message Type: 0xFF (G-PDU — user-plane data)
  Length: <inner+ext_len>
  TEID: 0xC0FFEE01                   <- which PDU session

GTP-U Extension Header:
  PDU Session Container (Type 0x85):
    QoS Flow Identifier (QFI): 9   <- which QoS flow

Inner packet:
  IPv6 src: 2001:db8:1234::42       <- UE's address
  IPv6 dst: 2606:4700:4700::1111    <- Cloudflare DNS
  ... whatever the UE is sending ...`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Air-interface RTT: ~1 ms is the URLLC design target; typical mid-band 5G FR1 is ~8–15 ms, ~5–10 ms mmWave with retransmits, ~30–50 ms LTE. Control-plane setup (RRC → Registration → PDU Session): ~200–400 ms on 5G-SA; ~50 ms on 5G-NSA (LTE anchor)',
		throughput:
			'5G NR peak (theoretical, 8×8 MIMO, 256-QAM, 400 MHz mmWave): ~20 Gbps DL / ~10 Gbps UL. Typical FR1 deployment: 500 Mbps–1 Gbps DL. LTE peak (Cat-22): ~3 Gbps DL; typical mid-band 4G: 50–200 Mbps DL. Reliance Jio reported ~170M 5G users by end-2024, carrying roughly 500 PB/day',
		overhead:
			'Air-interface MAC + RLC + PDCP overhead is ~5–15% depending on numerology. On the backhaul, GTP-U adds 8 bytes, plus IPsec ESP wrapping (36–60 bytes) on N3 hops that cross untrusted transport. ROHC header compression brings the 40-byte IPv6+TCP header down to 1–4 bytes on a steady flow'
	},
	connections: [
		'ip',
		'ipv6',
		'tcp',
		'udp',
		'quic',
		'ipsec',
		'http2',
		'http3',
		'tls',
		'dns',
		'sip',
		'rtp',
		'webrtc',
		'wifi',
		'bluetooth',
		'nfc'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/5G_NR',
		official: 'https://www.3gpp.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cellular_network_standards_and_generation_timeline.svg/500px-Cellular_network_standards_and_generation_timeline.svg.png',
		alt: 'Cellular network standards generation timeline — 1G through 5G with milestones',
		caption:
			'The cellular generation timeline — the {{3gpp|3GPP}} release cadence that took us from 1G analog (NTT 1979, AMPS 1983) → {{gsm|GSM}} 2G (1991) → {{umts|UMTS}}/{{wcdma|WCDMA}} 3G (2001) → **[[cellular|LTE 4G]] Release 8 (December 2008)** → **[[cellular|5G NR]] Release 15 (June 2018)** → 5G-Advanced Release 18 (June 2024) → 6G study items now. Every generation roughly doubled spectral efficiency and added a fundamentally new use case.',
		credit: 'Image: Wikimedia Commons / CC BY-SA'
	},

	recentChanges: [
		{
			date: '2024-06',
			title: '5G-Advanced (Release 18) frozen',
			description:
				'On 18 June 2024 {{3gpp|3GPP}} froze **Release 18**, the first 5G-Advanced release. New features: {{ai|AI}}/ML in the air interface (CSI feedback compression, beam management), enhanced Reduced-Capability devices ("eRedCap" — RedCap itself arrived in Rel-17), network energy savings, sidelink enhancements, and further Non-Terrestrial Network ({{ntn|NTN}}) work building on the first NTN spec from Rel-17. Release 19 work began immediately.',
			source: {
				url: 'https://www.3gpp.org/specifications-technologies/releases/release-18',
				label: '3GPP Release 18'
			}
		},
		{
			date: '2025-01',
			title: 'T-Mobile + SpaceX Starlink Direct-to-Cell launches commercially',
			description:
				'After a beta that began in February 2025, **T-Satellite by T-Mobile** opened commercially on 23 July 2025 — modern phones using band 25\'s PCS G-block (1910–1915 / 1990–1995 MHz) connect to a low-Earth-orbit {{starlink|Starlink}} satellite (LTE from space) for {{sms|SMS}} and emergency messaging without any app. AT&T + AST SpaceMobile and {{apple|Apple}}\'s Globalstar Emergency SOS round out the satellite-{{direct-to-cell|direct-to-cell}} story. The first time "no signal" stops meaning *no signal*.',
			source: {
				url: 'https://www.t-mobile.com/coverage/satellite',
				label: 'T-Satellite product page'
			}
		},
		{
			date: '2025-09',
			title: 'Reliance Jio 5G-SA passes 230M users — largest pan-national SA deployment',
			description:
				'Reliance Jio (India) reported ~170M 5G users by end-2024 and ~234M by Q3 2025 on its in-house cloud-native {{5g-core|5G core}}, carrying tens of exabytes per quarter (~500 PB/day). The first proof that a hyperscale cloud-native {{5g-core|5G core}} can run a national-scale carrier without legacy {{epc|EPC}} dependencies.',
			source: {
				url: 'https://www.ril.com/InvestorRelations/FinancialReporting.aspx',
				label: 'Reliance Industries investor reports'
			}
		},
		{
			date: '2024-11',
			title: 'Vodafone UK Open RAN production — Samsung + NEC + Wind River',
			description:
				'Vodafone UK switched on the first commercial Open {{ran|RAN}} site in the UK — Bath, January 2022 — and has been scaling a 2,500-site rollout across Wales and the South-West since, replacing Huawei base stations. Multi-vendor mix: Samsung vRAN baseband software, NEC and Samsung radios, Wind River cloud platform on Dell/Intel hardware. The credibility test for whether Open {{ran|RAN}} is *actually* multi-vendor.',
			source: {
				url: 'https://www.vodafone.co.uk/newscentre/press-release/vodafone-launches-uks-first-open-ran-site-bath/',
				label: 'Vodafone UK newsroom'
			}
		},
		{
			date: '2024-12',
			title: 'NTN (Non-Terrestrial Network) Release 17/18 features hit deployment',
			description:
				'After being specified in Release 17 (2022), the first NR-{{ntn|NTN}} deployments shipped in late 2024 — the radio-layer protocol that lets standard {{5g-nr|5G NR}} talk to a satellite at 600 km without proprietary modulation. With NR-{{ntn|NTN}} support reported for {{apple|Apple}}\'s next-generation C-series modem (2026-era iPhones — the iPhone 17 still uses Globalstar\'s pre-NTN stack), this closes the gap between "phone radio" and "satellite radio" for the first time.',
			source: {
				url: 'https://www.3gpp.org/news-events/3gpp-news/sa-aug21-mtg',
				label: '3GPP SA NTN status'
			}
		}
	],

	realWorldDeployments: [
		{
			org: '3GPP / every mobile carrier on Earth',
			scale: '~9 billion subscriptions (GSMA, 2024)',
			description:
				'The largest wireless protocol family by user count. Specified collectively by {{3gpp|3GPP}} — a partnership of {{etsi|ETSI}} (Europe), ARIB + TTC (Japan), ATIS (North America), CCSA (China), TSDSI (India), TTA (Korea). Every cellular phone on Earth runs {{3gpp|3GPP}} protocols at the radio layer.'
		},
		{
			org: 'Reliance Jio',
			scale: '~24M 5G-SA subscribers (Q3 2025); ~470M total cellular subscribers',
			description:
				"India's Reliance Jio operates the largest single-operator 5G-{{security-association|SA}} deployment on the planet, running a cloud-native, in-house-built {{5g-core|5G core}}. ~500 PB/day average traffic. The economic experiment: can a hyperscale cloud-native core run a national carrier without legacy {{epc|EPC}}?"
		},
		{
			org: 'T-Mobile USA + SpaceX',
			scale: 'T-Satellite commercial since Jan 2025; ~100M+ T-Mobile US subscribers',
			description:
				"The first commercial **satellite {{direct-to-cell|direct-to-cell}}** service. Standard phones on band 25's PCS G-block {{mqtt-connect|connect}} to {{starlink|Starlink}} satellites in low-Earth orbit (LTE from space) for {{sms|SMS}} and emergency. {{apple|Apple}}'s Globalstar partnership and AT&T's AST SpaceMobile follow similar patterns. Reshapes \"coverage\" as a concept."
		},
		{
			org: 'DISH Wireless / EchoStar',
			scale: '5G-SA on public cloud (AWS Wavelength)',
			description:
				'The first commercial 5G-{{security-association|SA}} network running on **public-cloud infrastructure** ({{aws|AWS}} Wavelength + {{aws|AWS}} Local Zones). Proves the cloud-native {{5g-core|5G core}} architecture works in production. Rakuten Symphony (Japan) and Open5GS-based deployments worldwide follow the same pattern.'
		}
	],

	funFacts: [
		{
			title: 'The first cellular call was a troll',
			text: '**3 April 1973, Sixth Avenue, Manhattan.** Marty Cooper of Motorola dialed Joel Engel at AT&T Bell Labs — his direct rival in the cellular-system fight — and said: *"Joel, this is Marty. I\'m calling you from a cell phone, a real handheld portable cell phone."* Engel, by Cooper\'s account, claims not to remember the call.'
		},
		{
			title: 'Viterbi did not patent his most famous algorithm',
			text: '*"On advice of a lawyer, Viterbi did not patent the algorithm."* The **Viterbi algorithm** — convolutional code decoding (1967) — is used in every cellular phone, every disk-drive read channel, every {{gps|GPS}} receiver, and every speech recognizer. It made nothing for Andrew Viterbi directly; it made Qualcomm everything.'
		},
		{
			title: 'MCC tells you where your SIM was issued',
			text: "The Mobile Country Code at the start of your IMSI is the protocol's private numbering plan: 234/235 = UK, 310–316 = USA, 460 = China, 405 = India, 440–441 = Japan, 262 = Germany, 222 = Italy, 208 = France. Your roaming bill itemises calls by MCC/MNC pair."
		},
		{
			title: 'The CDMA-vs-GSM wars were existential',
			text: 'In January 1989 the US CTIA voted for {{tdma|TDMA}}; later that year Irwin Jacobs presented {{cdma|CDMA}} and *"no one found a hole in the technical presentation,"* but the political fight took a decade. Hong Kong (1995), then Korea, then the US were the first to ship cdmaOne. {{cdma|CDMA}}\'s mathematical foundation eventually became the basis of {{wcdma|WCDMA}} in {{umts|UMTS}} — the {{gsm|GSM}} camp ended up adopting it.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'IPv6-only carriers + IPv4-literal apps',
				text: 'On modern carriers (T-Mobile USA, Reliance Jio, parts of Verizon and DT), the {{ue|UE}} receives **only an [[ipv6|IPv6]] prefix**. Legacy [[ip|IPv4]] destinations are reached via **{{four-six-four-xlat|464XLAT}}** ([[rfc:6877|RFC 6877]]) — {{clat-acr|CLAT}} on the {{ue|UE}}, PLAT/{{nat64|NAT64}} at the operator. **Pitfall:** apps with hardcoded [[ip|IPv4]] literals (`socket.{{mqtt-connect|connect}}("8.8.8.8")`) silently fail. **Cure:** always resolve via [[dns|DNS]], always prefer [[ipv6|IPv6]] (`getaddrinfo`, `AF_UNSPEC`); use `IPv4v6` {{pdu-session|PDU session}} type, never `[[ip|IPv4]] only`.'
			},
			{
				title: 'PMTUD black holes on the GTP tunnel',
				text: 'Many cellular networks drop ICMPv4 Type 3 Code 4 (Frag Needed) messages on the SGi/N6 side. The {{mtu|MTU}} on a {{gtp-u|GTP-U}} tunnel is 1500 − 8 ([[udp|UDP]]) − 20/40 ({{ip-address|IP}}) − 8 ({{gtp-u|GTP-U}}) − overhead = typically 1430–1452 inner bytes. **Cure:** [[tcp|TCP]] {{mss|MSS}} clamping at the {{pgw|PGW}}/{{upf|UPF}} saves [[tcp|TCP]]; [[quic|QUIC]] and other UDP-based protocols must implement {{plpmtud|PLPMTUD}} ({{rfc-doc|RFC}} 8899).'
			},
			{
				title: 'IPsec on the backhaul — mandatory to support, easy to skip wrongly',
				text: '{{3gpp|3GPP}} {{ts-3gpp|TS}} 33.401 ({{lte|LTE}}) and {{ts-3gpp|TS}} 33.501 (5G) **mandate support** for [[ipsec|IPsec]] on the S1, X2, N2, N3, Xn, F1, and E1 interfaces, and require its use unless the transport network is trusted/physically secured (TS 33.501 §9.2). Skipping it on untrusted links in a private-5G deployment is the single most common compliance-audit failure. **Cure:** terminate every gNB-to-core hop in [[ipsec|IPsec]] {{esp|ESP}} with {{ikev2|IKEv2}}; do not run plain {{gtp-u|GTP-U}} on any link that leaves the secure perimeter.'
			}
		]
	}
};
