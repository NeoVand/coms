import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createSTUNLayer } from '../layers/stun';

export const natTraversalIce: SimulationConfig = {
	protocolId: 'nat-traversal',
	title: 'NAT Traversal — ICE with STUN and TURN',
	description:
		'Watch two peers behind home routers find each other. Alice learns her public address via STUN, allocates a TURN relay as a fallback, then runs ICE connectivity checks until one pair works.',
	tier: 'client',
	actors: [
		{ id: 'alice', label: 'Alice', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'STUN / TURN', icon: 'server', position: 'center' },
		{ id: 'bob', label: 'Bob', icon: 'browser', position: 'right' }
	],
	userInputs: [
		{
			id: 'stunHost',
			label: 'STUN server',
			type: 'text',
			defaultValue: 'stun.l.google.com:19302',
			placeholder: 'host:port'
		},
		{
			id: 'turnHost',
			label: 'TURN server',
			type: 'text',
			defaultValue: 'turn.example.com:3478',
			placeholder: 'host:port'
		}
	],
	steps: [
		{
			id: 'stun-bind-req',
			label: 'STUN Binding Request',
			description:
				'Alice asks the STUN server "what address do you see me from?" — the 20-byte STUN header is the smallest useful packet on the modern internet. No attributes; the magic cookie identifies it as STUN; the 96-bit transaction ID will be echoed back.',
			fromActor: 'alice',
			toActor: 'server',
			duration: 1200,
			highlight: ['Type', 'Magic Cookie', 'Transaction ID'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '74.125.250.129', protocol: 17 }),
				createUDPLayer({ srcPort: 54000, dstPort: 19302 }),
				createSTUNLayer({
					type: 'Binding Request',
					length: 0,
					attribute: '(none — empty request)'
				})
			]
		},
		{
			id: 'stun-bind-resp',
			label: 'STUN Binding Success',
			description:
				'STUN replies with what it saw — Alice\'s public ip:port encoded in XOR-MAPPED-ADDRESS (XORed against the magic cookie so middleboxes can\'t rewrite it). That\'s Alice\'s **server-reflexive candidate**.',
			fromActor: 'server',
			toActor: 'alice',
			duration: 1200,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({ srcIp: '74.125.250.129', dstIp: '192.168.1.42', protocol: 17 }),
				createUDPLayer({ srcPort: 19302, dstPort: 54000 }),
				createSTUNLayer({
					type: 'Binding Success',
					length: 12,
					attribute: 'XOR-MAPPED-ADDRESS = 198.51.100.7 : 55432'
				})
			]
		},
		{
			id: 'turn-allocate',
			label: 'TURN Allocate Request',
			description:
				'For symmetric-NAT fallback, Alice reserves a public socket on a TURN server. The request carries USERNAME, REALM, NONCE, and MESSAGE-INTEGRITY-SHA256. TURN messages are STUN-formatted — same 20-byte header.',
			fromActor: 'alice',
			toActor: 'server',
			duration: 1200,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '203.0.113.10', protocol: 17 }),
				createUDPLayer({ srcPort: 54000, dstPort: 3478 }),
				createSTUNLayer({
					type: 'Allocate Request',
					length: 96,
					attribute: 'REQUESTED-TRANSPORT=17 (UDP), LIFETIME=600, USERNAME, REALM, NONCE, MESSAGE-INTEGRITY-256'
				})
			]
		},
		{
			id: 'turn-allocate-resp',
			label: 'TURN Allocate Success',
			description:
				'TURN returns a relayed transport address — a public ip:port Bob can hit. Default lifetime: 600 seconds. Alice will refresh every ~450 s to stay below the timeout.',
			fromActor: 'server',
			toActor: 'alice',
			duration: 1200,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({ srcIp: '203.0.113.10', dstIp: '192.168.1.42', protocol: 17 }),
				createUDPLayer({ srcPort: 3478, dstPort: 54000 }),
				createSTUNLayer({
					type: 'Allocate Success',
					length: 48,
					attribute: 'XOR-RELAYED-ADDRESS = 203.0.113.10 : 62000, LIFETIME = 600'
				})
			]
		},
		{
			id: 'ice-check-alice-bob',
			label: 'ICE Connectivity Check (A → B)',
			description:
				'Alice sends a STUN Binding Request directly to Bob\'s reflexive candidate, using short-term ICE credentials (the ufrag/pwd exchanged via SDP). PRIORITY carries the candidate priority; ICE-CONTROLLING carries a 64-bit tiebreaker.',
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1400,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '198.51.100.250', protocol: 17 }),
				createUDPLayer({ srcPort: 54000, dstPort: 56000 }),
				createSTUNLayer({
					type: 'Binding Request',
					length: 32,
					attribute: 'USERNAME (bob:alice), PRIORITY, ICE-CONTROLLING, MESSAGE-INTEGRITY, FINGERPRINT'
				})
			]
		},
		{
			id: 'ice-check-bob-alice',
			label: 'ICE Check Response (B → A)',
			description:
				"Bob's STUN agent responds — the pair is now a *valid pair*. Both sides do this simultaneously across every candidate combination; the first one to round-trip wins.",
			fromActor: 'bob',
			toActor: 'alice',
			duration: 1400,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer({
					srcMac: '11:22:33:44:55:66',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({ srcIp: '198.51.100.250', dstIp: '192.168.1.42', protocol: 17 }),
				createUDPLayer({ srcPort: 56000, dstPort: 54000 }),
				createSTUNLayer({
					type: 'Binding Success',
					length: 12,
					attribute: 'XOR-MAPPED-ADDRESS (Alice as seen by Bob), MESSAGE-INTEGRITY, FINGERPRINT'
				})
			]
		},
		{
			id: 'use-candidate',
			label: 'USE-CANDIDATE (Nominate)',
			description:
				"Alice is the controlling agent. She picks the highest-priority valid pair (in this case the direct host-to-srflx path — TURN isn't needed) and re-sends a Binding Request with USE-CANDIDATE set. ICE state → completed.",
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1200,
			highlight: ['Type', 'Attribute'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '198.51.100.250', protocol: 17 }),
				createUDPLayer({ srcPort: 54000, dstPort: 56000 }),
				createSTUNLayer({
					type: 'Binding Request',
					length: 36,
					attribute: 'USE-CANDIDATE, PRIORITY, USERNAME, MESSAGE-INTEGRITY, FINGERPRINT'
				})
			]
		},
		{
			id: 'media',
			label: 'Media + Consent Freshness',
			description:
				'Media now flows directly between Alice and Bob — typically DTLS-SRTP for WebRTC. Every ~15 seconds, a STUN Binding Indication keeps the NAT binding alive (RFC 7675 consent freshness). Silence for ~30 s triggers ICE restart.',
			fromActor: 'alice',
			toActor: 'bob',
			duration: 1400,
			highlight: ['Payload'],
			data: 'DTLS-SRTP media frames + STUN keepalives every 15s',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '198.51.100.250', protocol: 17 }),
				createUDPLayer({ srcPort: 54000, dstPort: 56000 }),
				{
					name: 'Media + Keepalive',
					abbreviation: 'SRTP+STUN',
					osiLayer: 7,
					color: '#F59E0B',
					headerFields: [
						{
							name: 'Media',
							bits: 0,
							value: 'DTLS-SRTP audio/video',
							editable: false,
							description: 'Encrypted real-time media on the nominated pair'
						},
						{
							name: 'Keepalive cadence',
							bits: 0,
							value: '~15 s',
							editable: false,
							description: 'Consent-freshness STUN Binding Indication ([[rfc:7675|RFC 7675]])'
						},
						{
							name: 'TURN refresh',
							bits: 0,
							value: '~450 s',
							editable: false,
							description: 'Refresh TURN allocation before 600 s expiry (when relay path in use)'
						}
					]
				}
			]
		}
	]
};
