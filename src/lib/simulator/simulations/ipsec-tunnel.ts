import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createIKEv2Layer, createESPLayer } from '../layers/ipsec';

export const ipsecTunnel: SimulationConfig = {
	protocolId: 'ipsec',
	title: 'IPsec Tunnel — IKEv2 Negotiation and ESP Traffic',
	description:
		'Watch two gateways (HQ and Branch) negotiate an IPsec tunnel using IKEv2 with a hybrid post-quantum key exchange, then carry encrypted traffic through ESP. The full sequence: IKE_SA_INIT → IKE_INTERMEDIATE (PQ keys) → IKE_AUTH → ESP traffic → CREATE_CHILD_SA rekey.',
	tier: 'server',
	actors: [
		{ id: 'hq', label: 'HQ Gateway', icon: 'router', position: 'left' },
		{ id: 'branch', label: 'Branch Gateway', icon: 'router', position: 'right' }
	],
	userInputs: [
		{
			id: 'cipherSuite',
			label: 'Cipher Suite',
			type: 'select',
			defaultValue: 'AES-GCM-256 + ML-KEM-768',
			options: [
				'AES-GCM-256 + ECDH P-384',
				'AES-GCM-256 + ML-KEM-768',
				'ChaCha20-Poly1305 + X25519',
				'AES-GCM-256 + ML-KEM-1024 + FrodoKEM'
			]
		},
		{
			id: 'rekeyMinutes',
			label: 'Child SA rekey (minutes)',
			type: 'number',
			defaultValue: '480',
			placeholder: '60–1440'
		}
	],
	steps: [
		{
			id: 'ike-sa-init-req',
			label: 'IKE_SA_INIT (req)',
			description:
				"HQ initiates. The first IKEv2 exchange is unencrypted — keys don't exist yet. The initiator proposes a cipher suite, sends its (classical) Diffie-Hellman public key — the large ML-KEM key follows in IKE_INTERMEDIATE — plus a 32-byte Nonce, and NAT_DETECTION hashes that fingerprint the source IP:port for the responder to compare.",
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1400,
			highlight: ['Exchange Type', 'Initiator SPI', 'Payloads'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					initSpi: '0x1122334455667788',
					respSpi: '0x0000000000000000',
					exchangeType: 'IKE_SA_INIT (34)',
					flags: '0x08 (Initiator)',
					messageId: 0,
					payloads:
						'SA (AES-GCM-256 + ECDH P-384 + ML-KEM-768) + KE (ecp384, 96 B) + Nonce + NAT_DETECTION_*'
				})
			]
		},
		{
			id: 'ike-sa-init-resp',
			label: 'IKE_SA_INIT (resp)',
			description:
				'Branch picks one proposal, sends its own KE + Nonce, requests a certificate. Both sides now derive **SKEYSEED** and the IKE SA key material — every subsequent exchange is IKE-encrypted.',
			fromActor: 'branch',
			toActor: 'hq',
			duration: 1400,
			highlight: ['Responder SPI', 'Flags', 'Payloads'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					initSpi: '0x1122334455667788',
					respSpi: '0xAABBCCDDEEFF0011',
					exchangeType: 'IKE_SA_INIT (34)',
					flags: '0x20 (Response)',
					messageId: 0,
					payloads: 'SAr1 (chosen) + KEr + Nr + CERT_REQ'
				})
			]
		},
		{
			id: 'ike-intermediate',
			label: 'IKE_INTERMEDIATE',
			description:
				'RFC 9242. IKE fragmentation (RFC 7383) only works on encrypted exchanges, so the multi-kilobyte PQ public keys ride IKE_INTERMEDIATE — which runs *inside* the IKE SA (encrypted), before identity is revealed. RFC 9370 chains the additional key exchanges negotiated in IKE_SA_INIT; here the ML-KEM-768 keys are exchanged now and mixed into the keys both sides derive.',
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1300,
			highlight: ['Exchange Type', 'Payloads'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					exchangeType: 'IKE_INTERMEDIATE (43)',
					flags: '0x08 + Encrypted',
					messageId: 1,
					payloads: 'SK { KE (ML-KEM-768, 1184 B) }'
				})
			]
		},
		{
			id: 'ike-auth',
			label: 'IKE_AUTH (req)',
			description:
				'HQ proves identity (`IDi`) with its certificate and signs the IKE_SA_INIT messages (`AUTH`). The first **Child SA** — a *pair* of one-direction ESP SAs, one per direction — is negotiated in the same exchange via `SAi2`, `TSi`, `TSr`. ESP can flow only after the response completes the pair.',
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1400,
			highlight: ['Exchange Type', 'Payloads'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					exchangeType: 'IKE_AUTH (35)',
					flags: '0x08 + Encrypted',
					messageId: 2,
					payloads: 'SK { IDi + CERT + AUTH + SAi2 + TSi + TSr + CP(req) }'
				})
			]
		},
		{
			id: 'ike-auth-resp',
			label: 'IKE_AUTH (resp)',
			description:
				'Branch proves *its* identity: `IDr`, its certificate, and an `AUTH` signature over its own IKE_SA_INIT message, plus the chosen Child SA proposal (`SAr2`) and narrowed traffic selectors. IKEv2 is strict request/response — only this response authenticates the responder and completes the Child SA pair. Now the tunnel is up.',
			fromActor: 'branch',
			toActor: 'hq',
			duration: 1400,
			highlight: ['Exchange Type', 'Flags', 'Payloads'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					exchangeType: 'IKE_AUTH (35)',
					flags: '0x20 + Encrypted',
					messageId: 2,
					payloads: 'SK { IDr + CERT + AUTH + SAr2 + TSi + TSr }'
				})
			]
		},
		{
			id: 'esp-traffic-1',
			label: 'ESP (HQ → Branch)',
			description:
				'Child SA up. An inner [[ip|IP]] packet (10.0.0.5 → 10.1.0.42, payload `GET /index.html`) is encrypted with AES-GCM-256 and wrapped in ESP with SPI=0xC0FFEE01. Outer header is the public-internet IP pair. Receiver looks up SA by SPI, validates the 128-bit auth tag, decrypts, and forwards the inner packet.',
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1400,
			highlight: ['SPI', 'Sequence Number', 'Encrypted Payload'],
			data: 'Inner: 10.0.0.5 → 10.1.0.42 (GET /index.html)',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 50 }),
				createESPLayer({
					spi: '0xC0FFEE01',
					seq: 1,
					iv: '0x4F3D2A1B5E7C8901',
					payload: 'inner IP packet encrypted (AES-GCM-256)'
				})
			]
		},
		{
			id: 'esp-traffic-2',
			label: 'ESP (Branch → HQ)',
			description:
				'Reverse direction uses a *different* SA (different SPI, different key — IPsec SAs are unidirectional). The Branch gateway encrypts the response and ships it back. The 32-bit sequence number on each side has its own counter and its own anti-replay window.',
			fromActor: 'branch',
			toActor: 'hq',
			duration: 1300,
			highlight: ['SPI', 'Sequence Number'],
			data: 'Inner: 10.1.0.42 → 10.0.0.5 (HTTP/1.1 200 OK)',
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 50 }),
				createESPLayer({
					spi: '0xDEADBEEF',
					seq: 1,
					iv: '0x9F8E7D6C5B4A3920',
					payload: 'inner IP packet encrypted (AES-GCM-256)'
				})
			]
		},
		{
			id: 'create-child-sa',
			label: 'CREATE_CHILD_SA (rekey)',
			description:
				'~8 hours later, before the Child SA hits its time/byte lifetime, HQ initiates **CREATE_CHILD_SA** with the `REKEY_SA` notify. Branch answers with its own SA + Nonce (+ KE) response; new keys are derived (optionally with fresh DH/ML-KEM for **Perfect Forward Secrecy**) and the old SA is deleted after a brief grace period. Users see nothing.',
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1300,
			highlight: ['Exchange Type', 'Payloads'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					exchangeType: 'CREATE_CHILD_SA (36)',
					flags: '0x08 + Encrypted',
					messageId: 3,
					payloads: 'SK { N(REKEY_SA, 0xC0FFEE01) + SA + Nonce + KE (PFS) + TSi + TSr }'
				})
			]
		},
		{
			id: 'informational-dpd',
			label: 'INFORMATIONAL (DPD)',
			description:
				'Dead-Peer-Detection keepalive — an empty INFORMATIONAL request that Branch answers with an equally empty response (like every IKEv2 exchange, it is a strict request/response pair). If the responder does not reply within MaxRetransmit, the peer is declared dead, the SA is torn down, and (if `dpd_action=restart`) a fresh IKE_SA_INIT is initiated to re-establish the tunnel.',
			fromActor: 'hq',
			toActor: 'branch',
			duration: 1100,
			highlight: ['Exchange Type'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 500, dstPort: 500 }),
				createIKEv2Layer({
					exchangeType: 'INFORMATIONAL (37)',
					flags: '0x08 + Encrypted',
					messageId: 4,
					payloads: 'SK { } (empty — keepalive)'
				})
			]
		}
	]
};
