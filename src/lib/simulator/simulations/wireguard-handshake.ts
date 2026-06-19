import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createWireGuardLayer } from '../layers/wireguard';

export const wireguardHandshake: SimulationConfig = {
	protocolId: 'wireguard',
	title: 'WireGuard — Noise_IKpsk2 Handshake and Transport',
	description:
		'Watch two WireGuard peers — Alice and Bob — complete a one-round-trip Noise_IKpsk2 handshake and start exchanging encrypted IP packets. Then watch the 120-second rekey, the design that gives WireGuard per-handshake forward secrecy.',
	tier: 'client',
	actors: [
		{ id: 'alice', label: 'Peer A (Alice)', icon: 'client', position: 'left' },
		{ id: 'bob', label: 'Peer B (Bob)', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'cipherSuite',
			label: 'Cipher suite (single choice — no agility)',
			type: 'select',
			defaultValue: 'Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s',
			options: ['Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s']
		},
		{
			id: 'rekeySeconds',
			label: 'REKEY_AFTER_TIME (seconds)',
			type: 'number',
			defaultValue: '120',
			placeholder: '120 is the protocol default'
		}
	],
	steps: [
		{
			id: 'handshake-init',
			label: 'Handshake Initiation (148 B)',
			description:
				"Alice sends type=1. The payload carries her ephemeral Curve25519 pubkey, an AEAD-encrypted copy of her static pubkey (hides her identity from passive observers), and a TAI64N timestamp. MAC1 proves she knows Bob's static pubkey (anti-amplification); MAC2 is a cookie under load.",
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1400,
			highlight: ['Type', 'Sender Index', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '1 (Handshake Init)',
					senderIndex: '0xABCD1234',
					receiverIndex: '0x00000000',
					payload:
						'ephemeral_pub (32 B) + enc_static (32+16 B) + enc_TAI64N (12+16 B) + MAC1 (16 B) + MAC2 (16 B)'
				})
			]
		},
		{
			id: 'handshake-response',
			label: 'Handshake Response (92 B)',
			description:
				'Bob sends type=2. His own ephemeral pubkey, an AEAD-encrypted empty payload (proves key agreement), and the same MAC1/MAC2 pair. Completes the four-DH Noise_IK pattern. From this moment both sides have matching ChaCha20-Poly1305 keys; the chaining key is wiped from memory.',
			fromActor: 'bob',
			toActor: 'alice',
			duration: 1300,
			highlight: ['Type', 'Sender Index', 'Receiver Index', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '2 (Handshake Response)',
					senderIndex: '0xDEAD5678',
					receiverIndex: '0xABCD1234',
					payload: 'ephemeral_pub (32 B) + enc_empty (16 B) + MAC1 (16 B) + MAC2 (16 B)'
				})
			]
		},
		{
			id: 'transport-data-1',
			label: 'Transport Data (A → B)',
			description:
				"Cryptokey routing in action. Alice's inner IP packet (10.0.0.5 → 10.0.0.10, payload `GET /index.html`) is wrapped in a 16-byte WireGuard header (type=4, receiver-index, 64-bit counter) plus the ChaCha20 ciphertext + 16-byte Poly1305 tag. The 64-bit counter is the AEAD nonce *and* the anti-replay sequence.",
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1300,
			highlight: ['Type', 'Receiver Index', 'Payload'],
			data: 'Inner: 10.0.0.5 → 10.0.0.10 (GET /index.html)',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '4 (Transport Data)',
					senderIndex: 'counter=1',
					receiverIndex: '0xDEAD5678',
					payload: 'ChaCha20-Poly1305(inner_ip_packet) + 16-byte tag'
				})
			]
		},
		{
			id: 'transport-data-2',
			label: 'Transport Data (B → A)',
			description:
				'Reverse direction uses a *different* key (WireGuard keys are unidirectional — separate `T_send` and `T_recv` derived from the same chaining key) and a *separate* counter. Each direction has its own anti-replay window.',
			fromActor: 'bob',
			toActor: 'alice',
			duration: 1300,
			highlight: ['Type', 'Receiver Index', 'Payload'],
			data: 'Inner: 10.0.0.10 → 10.0.0.5 (HTTP/1.1 200 OK)',
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '4 (Transport Data)',
					senderIndex: 'counter=1',
					receiverIndex: '0xABCD1234',
					payload: 'ChaCha20-Poly1305(inner_ip_packet) + 16-byte tag'
				})
			]
		},
		{
			id: 'keepalive',
			label: 'PersistentKeepalive (every 25 s)',
			description:
				'When configured with `PersistentKeepalive = 25`, the peer sends a zero-length keepalive every 25 seconds to keep the NAT binding warm. Without it, home routers drop the UDP four-tuple after 30–180 seconds of silence and inbound packets fail until the next outbound packet from the peer behind NAT.',
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1000,
			highlight: ['Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '4 (Transport Data, keepalive)',
					senderIndex: 'counter=N',
					receiverIndex: '0xDEAD5678',
					payload: 'Empty payload + 16-byte Poly1305 tag (zero-length keepalive)'
				})
			]
		},
		{
			id: 'rekey',
			label: 'Rekey at REKEY_AFTER_TIME (120 s)',
			description:
				'At 120 seconds, Alice (whoever sent the first handshake) initiates a fresh handshake. A new pair of ephemeral keys; the chaining key is freshly derived; the old session keys are wiped. **Per-handshake forward secrecy** across sessions, **per-message forward secrecy** within a session.',
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1400,
			highlight: ['Type', 'Sender Index'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '198.51.100.1', dstIp: '203.0.113.5', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '1 (Handshake Init, rekey)',
					senderIndex: '0xFEED9012 (new)',
					receiverIndex: '0x00000000',
					payload: 'fresh ephemeral_pub + enc_static + enc_TAI64N + MAC1 + MAC2'
				})
			]
		},
		{
			id: 'rekey-response',
			label: 'Rekey Response',
			description:
				'Bob responds with a fresh ephemeral too. New session keys installed; old keys wiped at `REJECT_AFTER_TIME = 180 s`. To the application, the rekey is invisible — packets just keep flowing.',
			fromActor: 'bob',
			toActor: 'alice',
			duration: 1300,
			highlight: ['Type', 'Sender Index', 'Receiver Index'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '203.0.113.5', dstIp: '198.51.100.1', protocol: 17 }),
				createUDPLayer({ srcPort: 51820, dstPort: 51820 }),
				createWireGuardLayer({
					type: '2 (Handshake Response, rekey)',
					senderIndex: '0xBABE3456 (new)',
					receiverIndex: '0xFEED9012',
					payload: 'fresh ephemeral_pub + enc_empty + MAC1 + MAC2'
				})
			]
		}
	]
};
