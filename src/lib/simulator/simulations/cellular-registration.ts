import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createNASLayer, createNGAPLayer, createGTPULayer } from '../layers/cellular';
import { createESPLayer } from '../layers/ipsec';

export const cellularRegistration: SimulationConfig = {
	protocolId: 'cellular',
	title: '5G Initial Registration + First PDU Session',
	description:
		'Watch a phone power on and walk the 8 beats every 5G-SA UE walks every time it leaves airplane mode: RRC Setup → Registration Request → 5G-AKA → Security Mode → Registration Accept → PDU Session Establishment → UPF programming → user plane up. NGAP and GTP-U hops crossing untrusted transport are wrapped in IPsec ESP per 3GPP TS 33.501.',
	tier: 'client',
	actors: [
		{ id: 'ue', label: 'UE (phone)', icon: 'device', position: 'left' },
		{ id: 'gnb', label: 'gNB (base station)', icon: 'router', position: 'center' },
		{ id: 'core', label: 'AMF / SMF / UPF', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'plmn',
			label: 'PLMN (MCC/MNC)',
			type: 'text',
			defaultValue: '001/01',
			placeholder: 'e.g. 310/260 (T-Mobile USA)'
		},
		{
			id: 'snssai',
			label: 'S-NSSAI (slice)',
			type: 'text',
			defaultValue: 'sst=1, sd=010203',
			placeholder: 'sst=1 (eMBB), sst=2 (URLLC), sst=3 (mMTC)'
		},
		{
			id: 'dnn',
			label: 'DNN (Data Network Name)',
			type: 'text',
			defaultValue: 'internet',
			placeholder: 'internet, ims, hipri, ...'
		}
	],
	steps: [
		{
			id: 'rrc-setup',
			label: 'RRC Setup (random access)',
			description:
				'UE selects a cell from SSB measurements and runs random access: PRACH preamble (Msg1) → Random Access Response with timing advance + temporary C-RNTI (Msg2) → RRCSetupRequest (Msg3) → RRCSetup (Msg4). At this point the UE has SRB1 (signalling radio bearer) but no security context.',
			fromActor: 'ue',
			toActor: 'gnb',
			duration: 1300,
			highlight: ['Procedure Discriminator', 'Message Type'],
			data: 'PRACH → RAR → RRCSetupRequest → RRCSetup',
			layers: [
				{
					name: 'RRC',
					abbreviation: 'RRC',
					osiLayer: 3,
					color: '#FBBF24',
					headerFields: [
						{
							name: 'Establishment Cause',
							bits: 0,
							value: 'mo-Signalling',
							editable: false,
							description:
								'Why the UE wants a connection — signalling, data, voice, emergency, etc.'
						},
						{
							name: 'C-RNTI',
							bits: 16,
							value: '0x4A2F',
							editable: false,
							description:
								"Cell Radio Network Temporary Identifier — the UE's short-lived ID in this cell"
						},
						{
							name: 'SRB1',
							bits: 0,
							value: 'up',
							editable: false,
							description: 'Signalling Radio Bearer 1 — carries RRC messages between UE and gNB'
						}
					]
				}
			]
		},
		{
			id: 'reg-req',
			label: 'Registration Request (NAS)',
			description:
				"UE sends a Registration Request over SRB1. The gNB doesn't look at the NAS payload — it just forwards it to the AMF inside an NGAP Initial UE Message on SCTP/38412 (wrapped in IPsec ESP). The Request carries the **SUCI** (public-key-encrypted SUPI), requested NSSAI, and UE security capabilities.",
			fromActor: 'gnb',
			toActor: 'core',
			duration: 1400,
			highlight: ['Procedure Code', 'NAS-PDU'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.10.10.1', dstIp: '10.10.20.1', protocol: 50 }),
				createESPLayer({ spi: '0xC0FFEE01', seq: 1, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '15 (Initial UE Message)',
					ranId: '0x00003039',
					amfId: '0x0000000000',
					nasPdu: 'NAS Registration Request bytes'
				}),
				createNASLayer({
					secHdr: '0 (plain)',
					msgType: '0x41 (Registration Request)',
					payload: 'SUCI (ECIES Profile A, Curve25519) + Requested S-NSSAI + UE security caps'
				})
			]
		},
		{
			id: 'aka',
			label: '5G-AKA Authentication',
			description:
				"AMF asks AUSF → AUSF asks UDM → UDM's SIDF decrypts SUCI to SUPI, generates an authentication vector. RAND/AUTN traverse all the way down to the UE. The USIM checks AUTN.MAC against f1(K, SQN, RAND) and returns RES/CK/IK; the phone derives RES* = KDF(CK ‖ IK, SN-name, RAND, RES). The AMF/SEAF checks HRES* vs HXRES*, then the AUSF checks RES* vs XRES*. Mutual authentication.",
			fromActor: 'core',
			toActor: 'ue',
			duration: 1500,
			highlight: ['Security Header', 'Message Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:01' }),
				createIPv4Layer({ srcIp: '10.10.20.1', dstIp: '10.10.10.1', protocol: 50 }),
				createESPLayer({ spi: '0xDEADBEEF', seq: 1, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '4 (Downlink NAS Transport)',
					nasPdu: 'NAS Authentication Request bytes'
				}),
				createNASLayer({
					secHdr: '0 (plain — AKA runs before security)',
					msgType: '0x56 (Authentication Request)',
					payload: 'RAND (16 B) + AUTN (16 B = SQN⊕AK ‖ AMF ‖ MAC) + ngKSI=0'
				})
			]
		},
		{
			id: 'security-mode',
			label: 'NAS Security Mode Command',
			description:
				'AMF picks ciphering (128-NEA2 = AES-CTR) and integrity (128-NIA2 = AES-CMAC). Sends Security Mode Command integrity-protected with the freshly-derived K_NASint. UE responds with Security Mode Complete ciphered+integrity-protected. From this point every NAS message is wrapped in `(Security Header, MAC, sequence)`.',
			fromActor: 'core',
			toActor: 'ue',
			duration: 1300,
			highlight: ['Security Header', 'Message Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:01' }),
				createIPv4Layer({ srcIp: '10.10.20.1', dstIp: '10.10.10.1', protocol: 50 }),
				createESPLayer({ spi: '0xDEADBEEF', seq: 2, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '4 (Downlink NAS Transport)',
					nasPdu: 'NAS Security Mode Command bytes'
				}),
				createNASLayer({
					secHdr: '3 (SMC, integrity-protected)',
					msgType: '0x5D (Security Mode Command)',
					payload: 'Selected NAS algorithms: 128-NEA2 + 128-NIA2, replayed UE security capabilities'
				})
			]
		},
		{
			id: 'reg-accept',
			label: 'Registration Accept',
			description:
				'AMF returns the assigned **5G-GUTI** (temporary identity for the next ~24h), the allowed NSSAI, the registration area, and timer values. UE responds with Registration Complete. The UE is now attached to the 5GC.',
			fromActor: 'core',
			toActor: 'ue',
			duration: 1200,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:01' }),
				createIPv4Layer({ srcIp: '10.10.20.1', dstIp: '10.10.10.1', protocol: 50 }),
				createESPLayer({ spi: '0xDEADBEEF', seq: 3, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '14 (Initial Context Setup Request)',
					nasPdu: 'NAS Registration Accept bytes'
				}),
				createNASLayer({
					secHdr: '2 (integrity + ciphered)',
					msgType: '0x42 (Registration Accept)',
					payload: '5G-GUTI assignment + Allowed NSSAI + Registration Area + T3512 timer'
				})
			]
		},
		{
			id: 'pdu-session-req',
			label: 'PDU Session Establishment Request',
			description:
				'UE asks for an [[ip|IP]] address — *"give me a tunnel to DNN=internet, IPv4v6, slice sst=1 sd=010203."* AMF picks an SMF via NRF discovery, forwards via `Nsmf_PDUSession_CreateSMContext`. The SMF picks a UPF, programs forwarding rules via N4/PFCP, then returns the allocated [[ip|IP]] address through the AMF back to the UE.',
			fromActor: 'ue',
			toActor: 'core',
			duration: 1400,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.10.10.1', dstIp: '10.10.20.1', protocol: 50 }),
				createESPLayer({ spi: '0xC0FFEE01', seq: 2, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '46 (Uplink NAS Transport)',
					nasPdu: 'NAS PDU Session Establishment Request bytes'
				}),
				createNASLayer({
					secHdr: '2 (integrity + ciphered)',
					epd: '0x2E (5GSM)',
					msgType: '0xC1 (PDU Session Establishment Request)',
					payload: 'PDU Session ID=1, DNN=internet, PDU Type=IPv4v6, S-NSSAI sst=1 sd=010203'
				})
			]
		},
		{
			id: 'pdu-session-accept',
			label: 'PDU Session Establishment Accept',
			description:
				"SMF allocated the UE's [[ipv6|IPv6]] prefix from the pool, programmed PDR/FAR/QER/URR on the UPF, set up the N3 GTP-U tunnel TEID, and returned the allocated address + DNS servers back to the UE through the AMF. The gNB issues an RRCReconfiguration to map the QoS flow → DRB. The DRB is now up.",
			fromActor: 'core',
			toActor: 'ue',
			duration: 1300,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:01' }),
				createIPv4Layer({ srcIp: '10.10.20.1', dstIp: '10.10.10.1', protocol: 50 }),
				createESPLayer({ spi: '0xDEADBEEF', seq: 4, payload: 'encrypted NGAP + NAS' }),
				createNGAPLayer({
					procCode: '29 (PDU Session Resource Setup)',
					nasPdu: 'NAS PDU Session Establishment Accept bytes'
				}),
				createNASLayer({
					secHdr: '2 (integrity + ciphered)',
					epd: '0x2E (5GSM)',
					msgType: '0xC2 (PDU Session Establishment Accept)',
					payload: 'IPv6 prefix: 2001:db8:1234::/64, DNS: 2606:4700:4700::1111, QoS Flow QFI=9'
				})
			]
		},
		{
			id: 'user-plane',
			label: 'First user-plane packet (GTP-U on N3)',
			description:
				'The N3 tunnel is up. First user-plane packet flows. UE sends an HTTPS request to 2606:4700:4700::1111 (Cloudflare DNS). The packet travels: UE → gNB (radio) → gNB wraps in GTP-U + IPsec ESP → N3 to UPF → UPF unwraps → public internet. The encapsulation is *the* lesson of cellular protocol design.',
			fromActor: 'gnb',
			toActor: 'core',
			duration: 1500,
			highlight: ['TEID', 'PDU Session Container', 'Inner IP Packet'],
			data: 'Inner: UE → Cloudflare DNS (DNS-over-HTTPS query)',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.10.10.1', dstIp: '10.10.20.1', protocol: 50 }),
				createESPLayer({ spi: '0xC0FFEE02', seq: 1, payload: 'encrypted GTP-U + inner packet' }),
				createIPv4Layer({ srcIp: '10.20.10.5', dstIp: '10.20.20.5', protocol: 17 }),
				createUDPLayer({ srcPort: 2152, dstPort: 2152 }),
				createGTPULayer({
					length: 1380,
					teid: '0xCAFEF00D',
					qfi: 'QFI=9',
					inner: 'IPv6 2001:db8:1234::42 → 2606:4700:4700::1111 (TLS/QUIC)'
				})
			]
		}
	]
};
