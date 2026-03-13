import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';

export const tlsHandshake: SimulationConfig = {
	protocolId: 'tls',
	title: 'TLS 1.3 Handshake',
	description:
		'See how TLS 1.3 establishes an encrypted connection in just one round trip. The handshake negotiates cipher suites, exchanges keys, and verifies the server identity — all before any application data flows.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'browser', position: 'left' },
		{ id: 'server', label: 'Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'cipher',
			label: 'Cipher Suite',
			type: 'select',
			defaultValue: 'AES-256-GCM',
			options: ['AES-256-GCM', 'AES-128-GCM', 'ChaCha20-Poly1305']
		}
	],
	steps: [
		{
			id: 'client-hello',
			label: 'ClientHello',
			description:
				'Client sends its supported cipher suites, a random nonce, and key shares for key exchange. In TLS 1.3, the client speculatively includes key material to enable a 1-RTT handshake.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Handshake Type', 'Cipher Suite'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					handshakeType: 'ClientHello',
					cipherSuite: 'TLS_AES_256_GCM_SHA384',
					extensions: 'SNI, key_share (x25519), supported_versions (1.3)',
					length: 512
				})
			]
		},
		{
			id: 'server-hello',
			label: 'ServerHello',
			description:
				'Server picks the cipher suite and sends its key share. In TLS 1.3, the server bundles ServerHello + EncryptedExtensions + Certificate + CertificateVerify + Finished all at once.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Cipher Suite', 'Handshake Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					handshakeType: 'ServerHello',
					cipherSuite: 'TLS_AES_256_GCM_SHA384',
					extensions: 'key_share (x25519), supported_versions (1.3)',
					length: 128
				})
			]
		},
		{
			id: 'certificate',
			label: 'Certificate',
			description:
				'Server sends its X.509 certificate chain so the client can verify its identity. The CertificateVerify message proves the server owns the private key matching the certificate.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Handshake Type', 'Extensions'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					handshakeType: 'Certificate + Verify',
					cipherSuite: 'TLS_AES_256_GCM_SHA384',
					extensions: 'CN=example.com, Issuer=Let\'s Encrypt',
					length: 2048
				})
			]
		},
		{
			id: 'server-finished',
			label: 'Server Finished',
			description:
				'Server sends Finished message — a MAC over the entire handshake transcript. This proves the handshake was not tampered with. From here, the server can already send encrypted data.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Handshake Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 443, dstPort: 52300, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					handshakeType: 'Finished',
					length: 64,
					extensions: 'verify_data (HMAC of transcript)'
				})
			]
		},
		{
			id: 'client-finished',
			label: 'Client Finished',
			description:
				'Client verifies the server certificate, computes session keys, and sends its own Finished message. The TLS handshake is now complete — all future messages are encrypted with AES-256-GCM.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Handshake Type'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					handshakeType: 'Finished',
					length: 64,
					extensions: 'verify_data (HMAC of transcript)'
				})
			]
		},
		{
			id: 'application-data',
			label: 'Application Data',
			description:
				'The encrypted tunnel is established. Application data (like an HTTP request) now flows inside TLS records. The content is encrypted with the negotiated cipher — only the two endpoints can read it.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Content Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52300, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					extensions: 'GET /index.html (encrypted)',
					length: 256
				})
			]
		}
	]
};
